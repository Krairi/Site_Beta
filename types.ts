export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  category: string;
  quantity: number;
  min_threshold: number;
  unit: string;
  created_at: string;
}

export interface Receipt {
  id: string;
  user_id: string;
  store_name: string;
  total_amount: number;
  purchase_date: string;
  items_json: any; // Storing items as JSONB for simplicity in this demo
  created_at: string;
}

export interface ConsumptionLog {
  id: string;
  user_id: string;
  product_name: string;
  quantity_used: number;
  timestamp: string;
}

export type SubscriptionPlan = 'free' | 'premium1' | 'premium2';