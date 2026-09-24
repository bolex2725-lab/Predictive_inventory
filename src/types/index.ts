export type ProductCategory = 'FOODS' | 'HOUSEHOLD' | 'HOBBIES' | 'OTHER';

export type StockStatus = 'HEALTHY' | 'LOW STOCK' | 'REORDER NOW' | 'OUT OF STOCK';

export type PredictionMethod = 'RULE_BASED' | 'LINEAR_REGRESSION' | 'RANDOM_FOREST' | 'INSUFFICIENT_DATA';

export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface User {
  id: string;
  business_id: string;
  name: string;
  email: string;
  role: string;
  business_name?: string;
  whatsapp_number?: string;
}

export interface Business {
  id: string;
  name: string;
  owner_id: string;
  phone: string;
  email: string;
  whatsapp_number: string;
  settings: {
    currency: string;
    timezone: string;
    minimum_history_days: number;
    minimum_sales_records: number;
    minimum_ml_improvement_percent: number;
    notification_cooldown_hours: number;
    whatsapp_provider: 'mock' | 'cloud_api';
  };
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  selling_price: number;
  cost_price: number;
  current_stock: number;
  reorder_level: number;
  lead_time_days: number;
  buffer_quantity: number;
  unit: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  forecast_demand?: number;
  reorder_point?: number;
  recommended_reorder_quantity?: number;
  prediction_method?: PredictionMethod;
  prediction_reason?: string;
  stock_status?: StockStatus;
  last_predicted_at?: string;
}

export interface Sale {
  id: string;
  business_id: string;
  product_id: string;
  quantity: number;
  selling_price: number;
  total_amount: number;
  sale_date: string;
  created_at: string;
}

export interface Restock {
  id: string;
  business_id: string;
  product_id: string;
  quantity: number;
  supplier: string;
  unit_cost: number;
  total_cost: number;
  restock_date: string;
  created_at: string;
}

export interface ModelMetrics {
  mae: number;
  rmse: number;
  r2: number;
}

export interface DataReadinessResult {
  ready: boolean;
  reason: string;
  history_days: number;
  sales_records: number;
  daily_series_length: number;
  required_days: number;
  required_records: number;
}

export interface StagedPredictionResult {
  product_id: string;
  prediction_method: PredictionMethod;
  method_reason: string;
  forecast_daily_demand: number;
  lead_time_demand: number;
  safety_stock: number;
  reorder_point: number;
  recommended_reorder_quantity: number;
  current_stock: number;
  stock_status: StockStatus;
  data_readiness: DataReadinessResult;
  model_name: string;
  model_version: string;
  evaluation?: {
    rule_based: ModelMetrics;
    linear_regression?: ModelMetrics;
    random_forest?: ModelMetrics;
    selected_improvement_percent?: number;
    training_rows?: number;
    test_rows?: number;
  };
  feature_importances?: Array<{ feature: string; importance: number }>;
}

export interface Notification {
  id: string;
  business_id: string;
  product_id: string;
  recipient: string;
  message: string;
  notification_type: 'REORDER_ALERT' | 'OUT_OF_STOCK' | 'SYSTEM_TEST';
  status: NotificationStatus;
  provider: string;
  retry_count: number;
  sent_at: string | null;
  created_at: string;
  error_message?: string;
}

export interface Report {
  id: string;
  business_id: string;
  period_start: string;
  period_end: string;
  inventory_summary: {
    total_products: number;
    healthy_stock: number;
    low_stock: number;
    reorder_required: number;
    out_of_stock: number;
    total_inventory_value: number;
  };
  sales_summary: {
    total_sales_amount: number;
    total_transactions: number;
    total_units_sold: number;
    top_selling_products: Array<{ product_id: string; product_name: string; units: number; revenue: number }>;
  };
  restocking_summary: {
    total_restocked_units: number;
    total_restocking_cost: number;
    frequent_restocks: Array<{ product_id: string; product_name: string; count: number; units: number }>;
  };
  prediction_summary: {
    rule_based_count: number;
    ml_count: number;
    insufficient_data_count: number;
  };
  recommendations: string[];
  created_at: string;
}

export interface AcademicBenchmarkData {
  project_title: string;
  dataset_structure: {
    series_count: number;
    total_days: number;
    training_days: number;
    test_holdout_days: number;
    data_type: string;
  };
  model_comparison: Array<{
    method: string;
    mae: number;
    rmse: number;
    r2: number;
    description: string;
  }>;
  category_comparison: Array<{
    category: string;
    rule_based_mae: number;
    ml_mae: number;
    improvement_percent: number;
    sample_products: string;
  }>;
  feature_importance: Array<{
    feature: string;
    importance: number;
    dominant: boolean;
    description: string;
  }>;
  academic_disclaimer: string;
}
