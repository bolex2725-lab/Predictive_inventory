/**
 * Multi-Tenant Data Store with Business Isolation & Persistence
 */

import fs from 'fs';
import path from 'path';
import {
  Business,
  User,
  Product,
  Sale,
  Restock,
  Prediction,
  Notification,
  Report,
  ModelMetadata,
} from './types';
import { generateSeedData } from './seedData';

interface DatabaseSchema {
  businesses: Business[];
  users: User[];
  products: Product[];
  sales: Sale[];
  restocks: Restock[];
  predictions: Prediction[];
  notifications: Notification[];
  reports: Report[];
  modelMetadata: ModelMetadata[];
}

class Database {
  private data: DatabaseSchema;
  private filePath: string;

  constructor() {
    this.filePath = path.resolve(process.cwd(), 'data', 'inventory_db.json');
    this.data = this.initialize();
  }

  private initialize(): DatabaseSchema {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.businesses && parsed.products && parsed.sales) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed reading persistent DB, generating fresh seed data...', e);
    }

    const seed = generateSeedData();
    const initial: DatabaseSchema = {
      businesses: seed.businesses,
      users: seed.users,
      products: seed.products,
      sales: seed.sales,
      restocks: seed.restocks,
      predictions: [],
      notifications: seed.notifications,
      reports: [],
      modelMetadata: seed.modelMetadata,
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed saving database to file:', e);
    }
  }

  public resetToSeed() {
    const seed = generateSeedData();
    this.data = {
      businesses: seed.businesses,
      users: seed.users,
      products: seed.products,
      sales: seed.sales,
      restocks: seed.restocks,
      predictions: [],
      notifications: seed.notifications,
      reports: [],
      modelMetadata: seed.modelMetadata,
    };
    this.saveData();
    return this.data;
  }

  // --- Multi-Tenant Accessors ---

  // Businesses
  public getBusinessById(id: string): Business | undefined {
    return this.data.businesses.find((b) => b.id === id);
  }

  public updateBusiness(id: string, updates: Partial<Business>): Business | undefined {
    const idx = this.data.businesses.findIndex((b) => b.id === id);
    if (idx === -1) return undefined;
    this.data.businesses[idx] = {
      ...this.data.businesses[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveData();
    return this.data.businesses[idx];
  }

  public createBusiness(b: Business) {
    this.data.businesses.push(b);
    this.saveData();
  }

  // Users
  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(u: User) {
    this.data.users.push(u);
    this.saveData();
  }

  // Products (Tenant-Isolated)
  public getProducts(businessId: string): Product[] {
    return this.data.products.filter((p) => p.business_id === businessId && p.is_active);
  }

  public getAllProducts(businessId: string): Product[] {
    return this.data.products.filter((p) => p.business_id === businessId);
  }

  public getProductById(businessId: string, productId: string): Product | undefined {
    return this.data.products.find((p) => p.business_id === businessId && p.id === productId);
  }

  public createProduct(product: Product) {
    this.data.products.push(product);
    this.saveData();
    return product;
  }

  public updateProduct(businessId: string, productId: string, updates: Partial<Product>): Product | undefined {
    const idx = this.data.products.findIndex((p) => p.business_id === businessId && p.id === productId);
    if (idx === -1) return undefined;
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveData();
    return this.data.products[idx];
  }

  public deleteProduct(businessId: string, productId: string): boolean {
    const idx = this.data.products.findIndex((p) => p.business_id === businessId && p.id === productId);
    if (idx === -1) return false;
    // Soft delete
    this.data.products[idx].is_active = false;
    this.data.products[idx].updated_at = new Date().toISOString();
    this.saveData();
    return true;
  }

  // Sales (Tenant-Isolated)
  public getSales(businessId: string, productId?: string): Sale[] {
    return this.data.sales
      .filter((s) => s.business_id === businessId && (!productId || s.product_id === productId))
      .sort((a, b) => (b.sale_date > a.sale_date ? 1 : -1));
  }

  public getSaleById(businessId: string, saleId: string): Sale | undefined {
    return this.data.sales.find((s) => s.business_id === businessId && s.id === saleId);
  }

  public createSale(sale: Sale) {
    this.data.sales.push(sale);
    this.saveData();
    return sale;
  }

  // Restocks (Tenant-Isolated)
  public getRestocks(businessId: string, productId?: string): Restock[] {
    return this.data.restocks
      .filter((r) => r.business_id === businessId && (!productId || r.product_id === productId))
      .sort((a, b) => (b.restock_date > a.restock_date ? 1 : -1));
  }

  public getRestockById(businessId: string, restockId: string): Restock | undefined {
    return this.data.restocks.find((r) => r.business_id === businessId && r.id === restockId);
  }

  public createRestock(restock: Restock) {
    this.data.restocks.push(restock);
    this.saveData();
    return restock;
  }

  // Predictions
  public getPredictions(businessId: string, productId?: string): Prediction[] {
    return this.data.predictions
      .filter((p) => p.business_id === businessId && (!productId || p.product_id === productId))
      .sort((a, b) => (b.created_at > a.created_at ? 1 : -1));
  }

  public savePrediction(prediction: Prediction) {
    this.data.predictions.unshift(prediction);
    this.saveData();
    return prediction;
  }

  // Notifications
  public getNotifications(businessId: string): Notification[] {
    return this.data.notifications
      .filter((n) => n.business_id === businessId)
      .sort((a, b) => (b.created_at > a.created_at ? 1 : -1));
  }

  public getNotificationById(businessId: string, id: string): Notification | undefined {
    return this.data.notifications.find((n) => n.business_id === businessId && n.id === id);
  }

  public saveNotification(notification: Notification) {
    this.data.notifications.unshift(notification);
    this.saveData();
    return notification;
  }

  public updateNotification(businessId: string, id: string, updates: Partial<Notification>): Notification | undefined {
    const idx = this.data.notifications.findIndex((n) => n.business_id === businessId && n.id === id);
    if (idx === -1) return undefined;
    this.data.notifications[idx] = {
      ...this.data.notifications[idx],
      ...updates,
    };
    this.saveData();
    return this.data.notifications[idx];
  }

  // Reports
  public getReports(businessId: string): Report[] {
    return this.data.reports
      .filter((r) => r.business_id === businessId)
      .sort((a, b) => (b.created_at > a.created_at ? 1 : -1));
  }

  public saveReport(report: Report) {
    this.data.reports.unshift(report);
    this.saveData();
    return report;
  }

  // Model Metadata
  public getModelMetadata(businessId: string, productId?: string): ModelMetadata[] {
    return this.data.modelMetadata
      .filter((m) => m.business_id === businessId && (!productId || m.product_id === productId))
      .sort((a, b) => (b.trained_at > a.trained_at ? 1 : -1));
  }

  public saveModelMetadata(meta: ModelMetadata) {
    this.data.modelMetadata.unshift(meta);
    this.saveData();
    return meta;
  }
}

export const db = new Database();
