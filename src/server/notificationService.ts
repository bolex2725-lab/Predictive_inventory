/**
 * WhatsApp Notification Service with Provider Abstraction
 * Supports Mock Provider (for demo/development) and WhatsApp Cloud API
 */

import { Notification, Product, NotificationStatus } from './types';

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

export interface IWhatsAppProvider {
  name: string;
  sendMessage(recipient: string, message: string): Promise<SendMessageResult>;
}

export class MockWhatsAppProvider implements IWhatsAppProvider {
  public name = 'MOCK_WHATSAPP_PROVIDER';

  async sendMessage(recipient: string, message: string): Promise<SendMessageResult> {
    // Simulate real network dispatch
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Optional simulated failure check (e.g. invalid phone number)
    if (!recipient || recipient.length < 8) {
      return {
        success: false,
        error: 'Invalid recipient phone number format. Expected Nigerian format (e.g., +234...)',
        provider: this.name,
      };
    }

    return {
      success: true,
      messageId: `mock_wam_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      provider: this.name,
    };
  }
}

export class WhatsAppCloudApiProvider implements IWhatsAppProvider {
  public name = 'WHATSAPP_CLOUD_API';
  private apiUrl: string;
  private apiKey: string;
  private phoneNumberId: string;

  constructor(apiUrl?: string, apiKey?: string, phoneNumberId?: string) {
    this.apiUrl = apiUrl || process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v19.0';
    this.apiKey = apiKey || process.env.WHATSAPP_API_KEY || '';
    this.phoneNumberId = phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  }

  async sendMessage(recipient: string, message: string): Promise<SendMessageResult> {
    if (!this.apiKey || !this.phoneNumberId) {
      // Fallback to mock mode if credentials missing
      return {
        success: true,
        messageId: `cloud_fallback_${Date.now()}`,
        provider: 'MOCK_WHATSAPP_PROVIDER (Missing Cloud API Keys)',
      };
    }

    try {
      const cleanPhone = recipient.replace(/[^0-9]/g, '');
      const response = await fetch(`${this.apiUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { body: message },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data?.error?.message || 'WhatsApp Cloud API returned error',
          provider: this.name,
        };
      }

      return {
        success: true,
        messageId: data?.messages?.[0]?.id || `wamid_${Date.now()}`,
        provider: this.name,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network exception while dispatching WhatsApp notification',
        provider: this.name,
      };
    }
  }
}

export class NotificationService {
  private provider: IWhatsAppProvider;
  private cooldownHours: number;

  constructor(providerType = 'mock', cooldownHours = 24) {
    this.cooldownHours = cooldownHours;
    if (providerType === 'cloud_api' && process.env.WHATSAPP_API_KEY) {
      this.provider = new WhatsAppCloudApiProvider();
    } else {
      this.provider = new MockWhatsAppProvider();
    }
  }

  public setProvider(provider: IWhatsAppProvider) {
    this.provider = provider;
  }

  public buildReorderMessage(
    productName: string,
    currentStock: number,
    reorderPoint: number,
    recommendedQuantity: number,
    businessName: string
  ): string {
    return [
      `🔔 *Inventory Alert — ${businessName}*`,
      '',
      `Product: *${productName}*`,
      `Current Stock: *${currentStock} units*`,
      `Reorder Point: *${reorderPoint} units*`,
      `Recommended Reorder Quantity: *${recommendedQuantity} units*`,
      '',
      'Please review and restock this product to prevent stockouts.',
      `Time: ${new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Lagos' })} WAT`,
    ].join('\n');
  }

  public shouldSendNotification(
    product: Product,
    recentNotifications: Notification[]
  ): boolean {
    const rop = product.reorder_point ?? product.reorder_level;
    if (product.current_stock > rop) {
      return false; // Stock is healthy
    }

    // Cooldown check for this product
    const cutoff = Date.now() - this.cooldownHours * 60 * 60 * 1000;
    const recentProductAlert = recentNotifications.find(
      (n) =>
        n.product_id === product.id &&
        n.status === 'SENT' &&
        new Date(n.sent_at || n.created_at).getTime() > cutoff
    );

    if (recentProductAlert) {
      return false; // Cooldown active
    }

    return true;
  }

  public async dispatchNotification(
    recipient: string,
    message: string,
    productId: string,
    businessId: string,
    notificationType: 'REORDER_ALERT' | 'OUT_OF_STOCK' | 'SYSTEM_TEST' = 'REORDER_ALERT'
  ): Promise<Notification> {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const result = await this.provider.sendMessage(recipient, message);

    return {
      id,
      business_id: businessId,
      product_id: productId,
      recipient,
      message,
      notification_type: notificationType,
      status: result.success ? 'SENT' : 'FAILED',
      provider: result.provider,
      retry_count: 0,
      sent_at: result.success ? now : null,
      created_at: now,
      error_message: result.error,
    };
  }

  public async retryNotification(notification: Notification): Promise<Notification> {
    const result = await this.provider.sendMessage(notification.recipient, notification.message);
    const now = new Date().toISOString();

    return {
      ...notification,
      retry_count: notification.retry_count + 1,
      status: result.success ? 'SENT' : 'FAILED',
      sent_at: result.success ? now : notification.sent_at,
      error_message: result.error,
      provider: result.provider,
    };
  }
}
