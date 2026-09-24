/**
 * Frontend API Client for StockPredict
 */

const API_BASE = '/api/v1';

export class ApiClient {
  private static getToken(): string | null {
    return localStorage.getItem('stockpredict_token');
  }

  public static setToken(token: string | null) {
    if (token) {
      localStorage.setItem('stockpredict_token', token);
    } else {
      localStorage.removeItem('stockpredict_token');
    }
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      // Clear token on 401 if unauthorized
      this.setToken(null);
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data?.message || data?.error || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return data as T;
  }

  // Auth
  static async login(email: string, password: string) {
    const res = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    return res;
  }

  static async register(payload: any) {
    const res = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    return res;
  }

  static async getMe() {
    return this.request<{ user: any; business: any }>('/auth/me');
  }

  // Products
  static async getProducts(params?: { category?: string; search?: string; stock_status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.stock_status) searchParams.set('stock_status', params.stock_status);
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<any[]>(`/products${qs}`);
  }

  static async getProduct(id: string) {
    return this.request<any>(`/products/${id}`);
  }

  static async createProduct(product: any) {
    return this.request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  static async updateProduct(id: string, updates: any) {
    return this.request<any>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  static async deleteProduct(id: string) {
    return this.request<{ success: boolean; message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Sales
  static async getSales(productId?: string) {
    const qs = productId ? `?product_id=${productId}` : '';
    return this.request<any[]>(`/sales${qs}`);
  }

  static async recordSale(sale: { product_id: string; quantity: number; selling_price?: number; sale_date?: string }) {
    return this.request<{ sale: any; product: any; notification_sent: boolean }>('/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    });
  }

  // Restocks
  static async getRestocks(productId?: string) {
    const qs = productId ? `?product_id=${productId}` : '';
    return this.request<any[]>(`/restocks${qs}`);
  }

  static async recordRestock(restock: {
    product_id: string;
    quantity: number;
    supplier?: string;
    unit_cost?: number;
    restock_date?: string;
  }) {
    return this.request<{ restock: any; product: any }>('/restocks', {
      method: 'POST',
      body: JSON.stringify(restock),
    });
  }

  // Predictions
  static async getPredictions() {
    return this.request<any[]>('/predictions');
  }

  static async getProductPrediction(productId: string) {
    return this.request<any>(`/predictions/${productId}`);
  }

  static async calculatePrediction(productId: string) {
    return this.request<any>(`/predictions/${productId}/calculate`, {
      method: 'POST',
    });
  }

  static async trainModel(productId: string) {
    return this.request<{ message: string; result: any }>(`/predictions/${productId}/train`, {
      method: 'POST',
    });
  }

  // Dashboard
  static async getDashboardSummary() {
    return this.request<{
      kpis: any;
      prediction_breakdown: any;
      attention_required: any[];
    }>('/dashboard/summary');
  }

  static async getInventoryStatus() {
    return this.request<any>('/dashboard/inventory-status');
  }

  static async getSalesSummary(days = 14) {
    return this.request<any[]>(`/dashboard/sales-summary?days=${days}`);
  }

  // Notifications
  static async getNotifications() {
    return this.request<any[]>('/notifications');
  }

  static async sendTestNotification(recipient?: string, message?: string) {
    return this.request<any>('/notifications/test', {
      method: 'POST',
      body: JSON.stringify({ recipient, message }),
    });
  }

  static async retryNotification(id: string) {
    return this.request<any>(`/notifications/${id}/retry`, {
      method: 'POST',
    });
  }

  // Reports
  static async getWeeklyReport() {
    return this.request<any>('/reports/weekly');
  }

  static async generateReport(startDate?: string, endDate?: string) {
    return this.request<any>('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ start_date: startDate, end_date: endDate }),
    });
  }

  // Business & Settings
  static async getBusiness() {
    return this.request<any>('/business');
  }

  static async updateBusiness(updates: any) {
    return this.request<any>('/business', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  static async resetDemo() {
    return this.request<{ message: string }>('/admin/reset-demo', {
      method: 'POST',
    });
  }

  // Academic Benchmark & Evaluation
  static async getAcademicEvaluation() {
    return this.request<any>('/evaluation/academic');
  }
}
