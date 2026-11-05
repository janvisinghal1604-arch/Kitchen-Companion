-- ====================================================================
-- EAT THE CLOCK - DATABASE SCHEMA & RLS POLICIES
-- PostgreSQL / Supabase
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    dietary_preference TEXT DEFAULT 'All',
    household_size INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INGREDIENTS MASTER DATA
CREATE TABLE IF NOT EXISTS public.ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    default_unit TEXT DEFAULT 'units',
    image_url TEXT,
    shelf_life_days INT DEFAULT 7,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. KITCHEN INVENTORY
CREATE TABLE IF NOT EXISTS public.kitchen_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES public.ingredients(id) ON DELETE SET NULL,
    custom_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'units',
    category TEXT NOT NULL,
    storage_location TEXT NOT NULL DEFAULT 'Refrigerator',
    purchase_date DATE DEFAULT CURRENT_DATE,
    estimated_use_by DATE NOT NULL,
    freshness_status TEXT NOT NULL DEFAULT 'Fresh',
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RECIPES
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cuisine TEXT DEFAULT 'Indian',
    preparation_time INT NOT NULL DEFAULT 20, -- in minutes
    servings INT NOT NULL DEFAULT 2,
    image_url TEXT,
    instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RECIPE INGREDIENTS
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES public.ingredients(id) ON DELETE SET NULL,
    ingredient_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'units',
    is_available BOOLEAN DEFAULT TRUE,
    is_optional BOOLEAN DEFAULT FALSE
);

-- 6. GROCERY LISTS
CREATE TABLE IF NOT EXISTS public.grocery_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'My Weekly Groceries',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. GROCERY ITEMS
CREATE TABLE IF NOT EXISTS public.grocery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grocery_list_id UUID REFERENCES public.grocery_lists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ingredient_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'units',
    category TEXT NOT NULL DEFAULT 'Vegetables',
    is_purchased BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CONSUMPTION LOGS
CREATE TABLE IF NOT EXISTS public.consumption_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    inventory_item_id UUID,
    ingredient_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'units',
    category TEXT DEFAULT 'Vegetables',
    action_type TEXT NOT NULL CHECK (action_type IN ('consumed', 'discarded', 'donated')),
    estimated_value NUMERIC DEFAULT 0,
    action_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_kitchen_inventory_user ON public.kitchen_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_inventory_use_by ON public.kitchen_inventory(estimated_use_by);
CREATE INDEX IF NOT EXISTS idx_grocery_items_user ON public.grocery_items(user_id);
CREATE INDEX IF NOT EXISTS idx_consumption_logs_user ON public.consumption_logs(user_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumption_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES
-- Profiles: Users can view and update own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Master Ingredients: Everyone can read
CREATE POLICY "Anyone can read ingredients" ON public.ingredients FOR SELECT USING (true);

-- Kitchen Inventory: User only
CREATE POLICY "Users can manage own inventory" ON public.kitchen_inventory FOR ALL USING (auth.uid() = user_id);

-- Recipes: User can view and manage own recipes or general public ones
CREATE POLICY "Users can view own and shared recipes" ON public.recipes FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can manage own recipes" ON public.recipes FOR ALL USING (auth.uid() = user_id);

-- Recipe Ingredients: Visible if recipe visible
CREATE POLICY "Recipe ingredients visibility" ON public.recipe_ingredients FOR ALL USING (
    EXISTS (SELECT 1 FROM public.recipes WHERE recipes.id = recipe_ingredients.recipe_id AND (recipes.user_id IS NULL OR recipes.user_id = auth.uid()))
);

-- Grocery Lists & Items: User only
CREATE POLICY "Users can manage own grocery lists" ON public.grocery_lists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own grocery items" ON public.grocery_items FOR ALL USING (auth.uid() = user_id);

-- Consumption Logs: User only
CREATE POLICY "Users can manage own logs" ON public.consumption_logs FOR ALL USING (auth.uid() = user_id);
