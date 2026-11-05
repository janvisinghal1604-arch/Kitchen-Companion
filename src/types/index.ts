export type IngredientCategory = 
  | 'Vegetables'
  | 'Fruits'
  | 'Dairy'
  | 'Grains'
  | 'Pulses'
  | 'Spices'
  | 'Meat'
  | 'Bakery'
  | 'Packaged Food'
  | 'Others';

export type StorageLocation = 
  | 'Refrigerator'
  | 'Freezer'
  | 'Pantry'
  | 'Countertop';

export type FreshnessStatus = 
  | 'Use First'
  | 'Use Soon'
  | 'Fresh'
  | 'Needs Checking';

export interface KitchenItem {
  id: string;
  user_id?: string;
  ingredient_id?: string;
  custom_name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  storage_location: StorageLocation;
  purchase_date: string; // YYYY-MM-DD
  estimated_use_by: string; // YYYY-MM-DD
  freshness_status: FreshnessStatus;
  image_url?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RecipeIngredient {
  id?: string;
  recipe_id?: string;
  ingredient_id?: string;
  ingredient_name: string;
  quantity: number | string;
  unit: string;
  is_available: boolean;
  is_optional?: boolean;
}

export interface Recipe {
  id: string;
  user_id?: string;
  name: string;
  description: string;
  cuisine: string;
  preparation_time: number; // minutes
  servings: number;
  image_url: string;
  instructions: string[];
  ingredients: RecipeIngredient[];
  matchPercentage?: number;
  substitutions?: string[];
  created_at?: string;
}

export interface GroceryItem {
  id: string;
  grocery_list_id?: string;
  user_id?: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  is_purchased: boolean;
  created_at?: string;
}

export interface GroceryList {
  id: string;
  user_id?: string;
  name: string;
  created_at?: string;
}

export type ActionType = 'consumed' | 'discarded' | 'donated';

export interface ConsumptionLog {
  id: string;
  user_id?: string;
  inventory_item_id?: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  action_type: ActionType;
  estimated_value: number; // in INR
  action_date: string; // YYYY-MM-DD
  notes?: string;
  created_at?: string;
}

export interface NotificationSettings {
  daily_reminder_enabled: boolean;
  daily_reminder_time: string; // "09:00"
  dinner_nudge_enabled: boolean;
  dinner_nudge_time: string; // "18:30"
  grocery_reminder_enabled: boolean;
  grocery_reminder_day: string; // "Saturday"
  expiry_alerts_enabled: boolean;
  email_digest_enabled: boolean;
  sound_enabled: boolean;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  city?: string;
  avatar_url?: string;
  dietary_preference: string;
  household_size: number;
  cooking_level?: string;
  allergies?: string[];
  favorite_cuisines?: string[];
  spice_tolerance?: string;
  staples?: string[];
  meal_goals?: string[];
  notification_settings?: NotificationSettings;
}

export interface AIDetectedItem {
  id: string;
  custom_name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  storage_location: StorageLocation;
  estimated_days_fresh: number;
  confidence: number;
  selected: boolean;
}

export interface DuplicateCheckResult {
  hasDuplicate: boolean;
  existingItem?: KitchenItem;
  enteredQuantity: number;
  enteredUnit: string;
  enteredName: string;
  enteredCategory: IngredientCategory;
}
