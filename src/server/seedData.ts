/**
 * Seed Demonstration Data for Nigerian Retail SMEs
 * Pre-populates Business, Products, and Historical Sales to demonstrate:
 * - Product A: Insufficient data (< 90 days) -> transparent Rule-Based (ADD)
 * - Product B: Sufficient data (> 90 days) -> ML evaluation & Random Forest activation
 * - Reorder trigger & WhatsApp notification
 * - Multi-tenant isolation with Business 2
 */

import { Business, User, Product, Sale, Restock, Notification, ModelMetadata } from './types';
import { StagedPredictionEngine } from './predictionEngine';

export function generateSeedData() {
  const now = new Date();

  // Business 1: Primary Demo SME in Lagos
  const business1: Business = {
    id: 'biz_oluwaseun_lagos_001',
    name: 'Oluwaseun & Sons Provisions Ltd',
    owner_id: 'usr_oluwaseun_001',
    phone: '+234 803 123 4567',
    email: 'oluwaseun@provisions.ng',
    whatsapp_number: '+234 803 123 4567',
    settings: {
      currency: 'NGN',
      timezone: 'Africa/Lagos',
      minimum_history_days: 90,
      minimum_sales_records: 60,
      minimum_ml_improvement_percent: 10.0,
      notification_cooldown_hours: 24,
      whatsapp_provider: 'mock',
    },
    created_at: new Date(now.getTime() - 220 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: now.toISOString(),
  };

  // User for Business 1
  // Password is: "Password123!" (hash stored)
  const user1: User = {
    id: 'usr_oluwaseun_001',
    business_id: business1.id,
    name: 'Oluwaseun Adeyemi',
    email: 'oluwaseun@provisions.ng',
    password_hash: '9e3c79a2f7c0309199d79907c0879ec363fa3f5cf74a3f5a2fd39eb4c9d5d590:salt_demo_sec',
    role: 'owner',
    is_active: true,
    created_at: business1.created_at,
    updated_at: now.toISOString(),
  };

  // Business 2: For Multi-Tenant Security Verification (Kano)
  const business2: Business = {
    id: 'biz_kano_supplies_002',
    name: 'Kano Household Wholesale & Retail',
    owner_id: 'usr_aminu_002',
    phone: '+234 802 987 6543',
    email: 'aminu@kanosupplies.ng',
    whatsapp_number: '+234 802 987 6543',
    settings: {
      currency: 'NGN',
      timezone: 'Africa/Lagos',
      minimum_history_days: 90,
      minimum_sales_records: 60,
      minimum_ml_improvement_percent: 10.0,
      notification_cooldown_hours: 24,
      whatsapp_provider: 'mock',
    },
    created_at: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: now.toISOString(),
  };

  const user2: User = {
    id: 'usr_aminu_002',
    business_id: business2.id,
    name: 'Aminu Bello',
    email: 'aminu@kanosupplies.ng',
    password_hash: '9e3c79a2f7c0309199d79907c0879ec363fa3f5cf74a3f5a2fd39eb4c9d5d590:salt_demo_sec',
    role: 'owner',
    is_active: true,
    created_at: business2.created_at,
    updated_at: now.toISOString(),
  };

  // Products for Business 1
  const products: Product[] = [
    // Product A: Low-data product (14 days of history) -> Rule-Based
    {
      id: 'prod_semovita_001',
      business_id: business1.id,
      name: 'Golden Penny Semovita 2kg',
      sku: 'GP-SEMO-2KG',
      category: 'FOODS',
      selling_price: 3200,
      cost_price: 2750,
      current_stock: 42,
      reorder_level: 25,
      lead_time_days: 4,
      buffer_quantity: 10,
      unit: 'bags',
      is_active: true,
      created_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
    },
    // Product B: Data-ready product (210 days history) -> Random Forest ML, Low stock -> Triggers reorder!
    {
      id: 'prod_sunlight_002',
      business_id: business1.id,
      name: 'Sunlight Detergent Powder 900g',
      sku: 'SUN-DET-900G',
      category: 'HOUSEHOLD',
      selling_price: 1850,
      cost_price: 1500,
      current_stock: 14, // below ROP (approx 45) -> REORDER NOW!
      reorder_level: 40,
      lead_time_days: 5,
      buffer_quantity: 15,
      unit: 'pouches',
      is_active: true,
      created_at: new Date(now.getTime() - 215 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
    },
    // Product C: Evaporated Milk (180 days history) -> High demand
    {
      id: 'prod_peak_milk_003',
      business_id: business1.id,
      name: 'Peak Evaporated Milk 160g (Tin)',
      sku: 'PEAK-TIN-160G',
      category: 'FOODS',
      selling_price: 750,
      cost_price: 620,
      current_stock: 28,
      reorder_level: 50,
      lead_time_days: 3,
      buffer_quantity: 20,
      unit: 'tins',
      is_active: true,
      created_at: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
    },
    // Product D: Indomie Noodles Carton (200 days history) -> ML active
    {
      id: 'prod_indomie_004',
      business_id: business1.id,
      name: 'Indomie Instant Noodles Onion Chicken 70g (Carton)',
      sku: 'IND-ONION-40CTN',
      category: 'FOODS',
      selling_price: 8900,
      cost_price: 7800,
      current_stock: 35,
      reorder_level: 30,
      lead_time_days: 4,
      buffer_quantity: 12,
      unit: 'cartons',
      is_active: true,
      created_at: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
    },
    // Product E: Bic Pens (30 days history) -> Rule-based
    {
      id: 'prod_bic_pens_005',
      business_id: business1.id,
      name: 'Bic Cristal Ballpoint Pen Blue (Pack of 50)',
      sku: 'BIC-BLUE-50PK',
      category: 'HOBBIES',
      selling_price: 4500,
      cost_price: 3600,
      current_stock: 18,
      reorder_level: 15,
      lead_time_days: 7,
      buffer_quantity: 5,
      unit: 'packs',
      is_active: true,
      created_at: new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
    },
    // Product F: Bleach (120 days history) -> OUT OF STOCK!
    {
      id: 'prod_hypo_bleach_006',
      business_id: business1.id,
      name: 'Hypo Super Bleach 1000ml',
      sku: 'HYPO-BLC-1L',
      category: 'HOUSEHOLD',
      selling_price: 1200,
      cost_price: 950,
      current_stock: 0, // OUT OF STOCK
      reorder_level: 25,
      lead_time_days: 4,
      buffer_quantity: 10,
      unit: 'bottles',
      is_active: true,
      created_at: new Date(now.getTime() - 130 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
    },
    // Product G: Cooking Oil (190 days history) -> Healthy Stock
    {
      id: 'prod_mamador_oil_007',
      business_id: business1.id,
      name: 'Mamador Pure Vegetable Oil 2.5L',
      sku: 'MAM-OIL-2.5L',
      category: 'FOODS',
      selling_price: 9200,
      cost_price: 8100,
      current_stock: 65,
      reorder_level: 20,
      lead_time_days: 6,
      buffer_quantity: 10,
      unit: 'gallons',
      is_active: true,
      created_at: new Date(now.getTime() - 190 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
    },
    // Product H: Dettol Antiseptic (175 days history) -> Low Stock
    {
      id: 'prod_dettol_008',
      business_id: business1.id,
      name: 'Dettol Antiseptic Liquid 250ml',
      sku: 'DET-ANT-250ML',
      category: 'HOUSEHOLD',
      selling_price: 2100,
      cost_price: 1700,
      current_stock: 19,
      reorder_level: 25,
      lead_time_days: 5,
      buffer_quantity: 8,
      unit: 'bottles',
      is_active: true,
      created_at: new Date(now.getTime() - 175 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
    },
  ];

  // Products for Business 2 (Multi-tenant check)
  const productsBiz2: Product[] = [
    {
      id: 'prod_kano_soap_001',
      business_id: business2.id,
      name: 'Canoe Laundry Bar Soap (Pack of 12)',
      sku: 'CAN-SOAP-12PK',
      category: 'HOUSEHOLD',
      selling_price: 3600,
      cost_price: 3000,
      current_stock: 45,
      reorder_level: 20,
      lead_time_days: 4,
      buffer_quantity: 10,
      unit: 'packs',
      is_active: true,
      created_at: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
    },
  ];

  // Generate historical sales records
  const sales: Sale[] = [];
  const restocks: Restock[] = [];

  // Helper to generate sales over N days
  function seedSales(
    productId: string,
    businessId: string,
    days: number,
    baseDailyDemand: number,
    unitPrice: number,
    salesNoise = 2
  ) {
    for (let d = days; d >= 0; d--) {
      const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
      const dayOfWeek = date.getDay();
      // Sunday retail is quieter, Saturday is busiest market day
      let dayMultiplier = 1.0;
      if (dayOfWeek === 6) dayMultiplier = 1.45; // Saturday market spike
      if (dayOfWeek === 0) dayMultiplier = 0.55; // Sunday quiet
      if (dayOfWeek === 5) dayMultiplier = 1.25; // Friday prep

      // Month-end salary spike (days 25-30)
      const dayOfMonth = date.getDate();
      if (dayOfMonth >= 25) dayMultiplier *= 1.3;

      // Random noise
      const variance = (Math.random() - 0.45) * salesNoise;
      const qty = Math.max(0, Math.round(baseDailyDemand * dayMultiplier + variance));

      if (qty > 0) {
        sales.push({
          id: `sale_${productId}_${d}_${Math.random().toString(36).substring(2, 6)}`,
          business_id: businessId,
          product_id: productId,
          quantity: qty,
          selling_price: unitPrice,
          total_amount: qty * unitPrice,
          sale_date: date.toISOString().split('T')[0],
          created_at: date.toISOString(),
        });
      }
    }
  }

  // 1. Semovita: Low data (14 days, 10 sales) -> STAGE 1 Rule-based demo
  seedSales('prod_semovita_001', business1.id, 14, 3, 3200, 2);

  // 2. Sunlight Detergent: 210 days history -> STAGE 2 ML demo
  seedSales('prod_sunlight_002', business1.id, 210, 6, 1850, 3);

  // 3. Peak Milk: 180 days history
  seedSales('prod_peak_milk_003', business1.id, 180, 12, 750, 4);

  // 4. Indomie: 200 days history
  seedSales('prod_indomie_004', business1.id, 200, 5, 8900, 2);

  // 5. Bic Pens: 30 days history -> Rule-based
  seedSales('prod_bic_pens_005', business1.id, 30, 2, 4500, 1);

  // 6. Hypo Bleach: 120 days history
  seedSales('prod_hypo_bleach_006', business1.id, 120, 4, 1200, 2);

  // 7. Mamador Oil: 190 days history
  seedSales('prod_mamador_oil_007', business1.id, 190, 3, 9200, 1);

  // 8. Dettol: 175 days history
  seedSales('prod_dettol_008', business1.id, 175, 4, 2100, 2);

  // Business 2 sales
  seedSales('prod_kano_soap_001', business2.id, 45, 5, 3600, 2);

  // Seed sample Restocks for Business 1
  restocks.push(
    {
      id: 'rst_sunlight_01',
      business_id: business1.id,
      product_id: 'prod_sunlight_002',
      quantity: 100,
      supplier: 'Unilever Nigeria Plc Distributor, Ikeja',
      unit_cost: 1500,
      total_cost: 150000,
      restock_date: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'rst_peak_02',
      business_id: business1.id,
      product_id: 'prod_peak_milk_003',
      quantity: 240,
      supplier: 'FrieslandCampina WAMCO Depot, Ogba',
      unit_cost: 620,
      total_cost: 148800,
      restock_date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'rst_indomie_03',
      business_id: business1.id,
      product_id: 'prod_indomie_004',
      quantity: 50,
      supplier: 'Dufil Prima Foods Depot, Lagos',
      unit_cost: 7800,
      total_cost: 390000,
      restock_date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
  );

  // Run initial staged predictions on products so they start populated with exact calculations
  const engine = new StagedPredictionEngine(90, 60, 10.0);
  for (const p of products) {
    const pSales = sales.filter((s) => s.product_id === p.id);
    const pred = engine.execute(p, pSales);
    p.forecast_demand = pred.forecast_daily_demand;
    p.reorder_point = pred.reorder_point;
    p.recommended_reorder_quantity = pred.recommended_reorder_quantity;
    p.prediction_method = pred.prediction_method;
    p.prediction_reason = pred.method_reason;
    p.stock_status = pred.stock_status;
    p.last_predicted_at = now.toISOString();
  }

  // Pre-seed initial WhatsApp alert for Sunlight Detergent (Product B low stock alert)
  const notifications: Notification[] = [
    {
      id: 'notif_init_sunlight_001',
      business_id: business1.id,
      product_id: 'prod_sunlight_002',
      recipient: business1.whatsapp_number,
      message: [
        `🔔 *Inventory Alert — Oluwaseun & Sons Provisions Ltd*`,
        '',
        `Product: *Sunlight Detergent Powder 900g*`,
        `Current Stock: *14 pouches*`,
        `Reorder Point: *45 pouches*`,
        `Recommended Reorder Quantity: *46 pouches*`,
        '',
        'Please review and restock this product to prevent stockouts.',
        `Time: ${now.toLocaleTimeString('en-GB', { timeZone: 'Africa/Lagos' })} WAT`,
      ].join('\n'),
      notification_type: 'REORDER_ALERT',
      status: 'SENT',
      provider: 'MOCK_WHATSAPP_PROVIDER',
      retry_count: 0,
      sent_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Pre-seed model metadata
  const modelMetadata: ModelMetadata[] = [
    {
      id: 'meta_rf_sunlight_01',
      business_id: business1.id,
      product_id: 'prod_sunlight_002',
      model_name: 'Random Forest Regressor',
      model_version: '2.1.0',
      training_start_date: new Date(now.getTime() - 210 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      training_end_date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      training_rows: 144,
      features: [
        'lag_1',
        'lag_7',
        'rolling_mean_7',
        'rolling_mean_14',
        'rolling_mean_30',
        'rolling_std_7',
        'day_of_week',
        'month',
        'weekend_indicator',
        'event_indicator',
        'unit_price',
      ],
      mae: 2.48,
      rmse: 3.48,
      r2: 0.916,
      status: 'ACTIVE',
      trained_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      model_path: './ml_models/rf_sunlight_002_v2.1.pkl',
    },
  ];

  return {
    businesses: [business1, business2],
    users: [user1, user2],
    products: [...products, ...productsBiz2],
    sales,
    restocks,
    notifications,
    modelMetadata,
  };
}
