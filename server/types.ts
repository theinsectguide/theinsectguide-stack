export interface UserDoc {
  _id: string;
  email: string;
  password?: string;
  name: string;
  region: 'UK' | 'US' | 'CA' | 'AU' | 'EU' | 'Other';
  level: 'Beginner' | 'Amateur' | 'Expert' | 'Master';
  tier: 'free' | 'pro';
  subscription_id?: string;
  subscription_status: 'active' | 'cancelled' | 'refunded' | 'none';
  subscription_plan?: 'monthly' | 'annual';
  subscription_start?: string;
  last_payment_date?: string;
  role: 'user' | 'admin';
  created_at: string;
  scans_count: number;
  species_found: number;
  refund_requested?: boolean;
  is_banned?: boolean;
  banned_reason?: string;
  banned_at?: string;
}

export interface ScanResult {
  common_name: string;
  latin_name: string;
  status: 'safe' | 'dangerous' | 'venomous' | 'pest' | 'protected';
  danger_level: number; // 0 to 10
  can_sting: boolean;
  can_bite: boolean;
  dangerous_to_children: boolean;
  dangerous_to_pets: boolean;
  description: string;
  habitat: string;
  active_season: string;
  geographic_regions: string[];
  look_alikes: string[];
  first_aid: string;
  when_to_call_emergency: string;
  pest_control?: {
    is_pest: boolean;
    urgency: 'Low' | 'Medium' | 'High' | 'Critical';
    diy_possible: boolean;
    treatment_method: string;
    natural_solutions: string;
    prevention: string;
    estimated_exterminator_cost: string;
  } | null;
  interesting_facts: string;
  is_uncertain?: boolean;
}

export interface ScanDoc {
  _id: string;
  user_id: string;
  image_url: string;
  result: ScanResult;
  insect_name: string;
  latin_name: string;
  danger_level: number;
  timestamp: string;
  location?: {
    lat: number;
    lng: number;
    city?: string;
    country?: string;
    address?: string;
  };
  notes?: string;
}

export interface JournalEntryDoc {
  _id: string;
  user_id: string;
  scan_id?: string;
  photo_url: string;
  insect_name: string;
  latin_name?: string;
  danger_level?: number;
  status_type?: 'safe' | 'dangerous' | 'venomous' | 'pest' | 'protected';
  date: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  notes?: string;
  status: 'found' | 'observed' | 'reported' | 'photographed';
  scan_result?: ScanResult;
}

export interface AlertDoc {
  _id: string;
  user_id?: string; // If general, null/all
  region: string;
  type: 'seasonal' | 'outbreak' | 'weather_risk' | 'pest_surge';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'danger';
  sent_at: string;
  read: boolean;
}

export interface SpeciesEntry {
  id: string;
  common_name: string;
  latin_name: string;
  category: 'Venomous' | 'Dangerous' | 'Harmless' | 'Pest' | 'Protected' | 'Useful';
  danger_level: number; // 0-10
  can_sting: boolean;
  can_bite: boolean;
  dangerous_to_children: boolean;
  dangerous_to_pets: boolean;
  regions: ('UK' | 'US' | 'CA' | 'AU' | 'EU' | 'Other')[];
  active_seasons: ('Spring' | 'Summer' | 'Autumn' | 'Winter')[];
  habitat: string;
  description: string;
  first_aid: string;
  when_to_call_emergency: string;
  photo_url: string;
  look_alikes: string[];
  fun_fact: string;
  country_top_ten?: {
    country: 'UK' | 'US' | 'CA' | 'AU' | 'EU';
    rank: number;
    danger_summary: string;
  }[];
}

export interface TransactionDoc {
  _id: string;
  user_id: string;
  order_id: string;
  capture_id: string;
  payer_email?: string;
  payer_id?: string;
  amount: string;
  currency: string;
  plan: 'monthly' | 'annual';
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  created_at: string;
  raw_details?: any;
}
