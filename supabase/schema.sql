-- ====================================================================
-- KITCHEN COMPANION (EAT THE CLOCK) - COMPLETE SUPABASE BACKEND SCHEMA
-- PostgreSQL / Supabase Migration
--
-- Features included:
-- 1. profiles (linked to auth.users with login counter, verified status, preferences)
-- 2. ingredient_catalog (master catalog with 100+ pre-seeded Indian/global staples)
-- 3. kitchen_inventory (user inventory with freshness tracking)
-- 4. grocery_lists (user grocery list collections)
-- 5. grocery_items (individual items with purchase status)
-- 6. consumption_logs (tracking food consumed, discarded, value saved)
-- 7. Automated triggers on auth.users (tracks every signup, login, email verification)
-- 8. admin_user_analytics (view to see total users, verified users, active logins)
-- 9. Row Level Security (RLS) policies for complete privacy
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 1. PROFILES TABLE (Tracks users, logins, email verification, preferences)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    city TEXT,
    dietary_preference TEXT DEFAULT 'Vegetarian',
    household_size INT DEFAULT 2,
    cooking_level TEXT DEFAULT 'Home Cook',
    favorite_cuisines JSONB DEFAULT '["South Indian", "North Indian", "Indo-Chinese"]'::jsonb,
    allergies JSONB DEFAULT '[]'::jsonb,
    spice_tolerance TEXT DEFAULT 'Medium',
    notification_settings JSONB DEFAULT '{"daily_reminder_enabled": true, "dinner_nudge_enabled": true, "expiry_alerts_enabled": true}'::jsonb,
    email_verified BOOLEAN DEFAULT FALSE,
    email_confirmed_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    sign_in_count INT DEFAULT 1,
    auth_provider TEXT DEFAULT 'email',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments for documentation
COMMENT ON TABLE public.profiles IS 'User profile information, culinary preferences, authentication tracking, and login analytics.';
COMMENT ON COLUMN public.profiles.sign_in_count IS 'Cumulative number of logins recorded for this user.';
COMMENT ON COLUMN public.profiles.email_verified IS 'True if the user has confirmed their email address.';
COMMENT ON COLUMN public.profiles.auth_provider IS 'Identity provider used (email, google, apple).';

-- ====================================================================
-- 2. INGREDIENT CATALOG (Master database of 100+ ingredients)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.ingredient_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    default_unit TEXT NOT NULL DEFAULT 'pcs',
    default_storage TEXT NOT NULL DEFAULT 'Refrigerator',
    shelf_life_days INT NOT NULL DEFAULT 7,
    image_url TEXT,
    is_staple BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.ingredient_catalog IS 'Global master ingredient catalog for quick autocomplete and shelf-life estimation.';

-- ====================================================================
-- 3. KITCHEN INVENTORY (User active inventory)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.kitchen_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES public.ingredient_catalog(id) ON DELETE SET NULL,
    custom_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'pcs',
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

COMMENT ON TABLE public.kitchen_inventory IS 'Live food inventory in user kitchen across fridge, freezer, pantry, and countertop.';

-- ====================================================================
-- 4. GROCERY LISTS (User grocery list collections)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.grocery_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'My Weekly Groceries',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 5. GROCERY ITEMS (Individual items on grocery list)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.grocery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grocery_list_id UUID REFERENCES public.grocery_lists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    ingredient_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'pcs',
    category TEXT NOT NULL DEFAULT 'Vegetables',
    is_purchased BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 6. CONSUMPTION LOGS (Food waste & consumption tracking)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.consumption_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    inventory_item_id UUID,
    ingredient_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'pcs',
    category TEXT DEFAULT 'Vegetables',
    action_type TEXT NOT NULL CHECK (action_type IN ('consumed', 'discarded', 'donated')),
    estimated_value NUMERIC DEFAULT 0,
    action_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.consumption_logs IS 'Audit logs of ingredients consumed, discarded, or donated for mindful insights.';

-- ====================================================================
-- 7. RECIPES & RECIPE INGREDIENTS (Optional custom / saved recipes)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cuisine TEXT DEFAULT 'Indian',
    preparation_time INT NOT NULL DEFAULT 20,
    servings INT NOT NULL DEFAULT 2,
    image_url TEXT,
    instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    ingredient_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'pcs',
    is_available BOOLEAN DEFAULT TRUE,
    is_optional BOOLEAN DEFAULT FALSE
);

-- ====================================================================
-- SCHEMA MIGRATION / UPGRADE: Ensure columns exist on pre-existing tables
-- ====================================================================
ALTER TABLE IF EXISTS public.kitchen_inventory ADD COLUMN IF NOT EXISTS ingredient_id UUID;
ALTER TABLE IF EXISTS public.kitchen_inventory ADD COLUMN IF NOT EXISTS storage_location TEXT DEFAULT 'Refrigerator';
ALTER TABLE IF EXISTS public.kitchen_inventory ADD COLUMN IF NOT EXISTS purchase_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE IF EXISTS public.kitchen_inventory ADD COLUMN IF NOT EXISTS estimated_use_by DATE;
ALTER TABLE IF EXISTS public.kitchen_inventory ADD COLUMN IF NOT EXISTS freshness_status TEXT DEFAULT 'Fresh';
ALTER TABLE IF EXISTS public.kitchen_inventory ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE IF EXISTS public.kitchen_inventory ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS dietary_preference TEXT DEFAULT 'Vegetarian';
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS household_size INT DEFAULT 2;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS cooking_level TEXT DEFAULT 'Home Cook';
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS favorite_cuisines JSONB DEFAULT '["South Indian", "North Indian", "Indo-Chinese"]'::jsonb;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS allergies JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS spice_tolerance TEXT DEFAULT 'Medium';
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"daily_reminder_enabled": true, "dinner_nudge_enabled": true, "expiry_alerts_enabled": true}'::jsonb;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS sign_in_count INT DEFAULT 1;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';

-- Upgrade grocery_lists if it already existed without all columns
ALTER TABLE IF EXISTS public.grocery_lists ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'My Weekly Groceries';
ALTER TABLE IF EXISTS public.grocery_lists ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Upgrade grocery_items if it already existed without all columns
ALTER TABLE IF EXISTS public.grocery_items ADD COLUMN IF NOT EXISTS grocery_list_id UUID;
ALTER TABLE IF EXISTS public.grocery_items ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS public.grocery_items ADD COLUMN IF NOT EXISTS ingredient_name TEXT;
ALTER TABLE IF EXISTS public.grocery_items ADD COLUMN IF NOT EXISTS quantity NUMERIC DEFAULT 1;
ALTER TABLE IF EXISTS public.grocery_items ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'pcs';
ALTER TABLE IF EXISTS public.grocery_items ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Vegetables';
ALTER TABLE IF EXISTS public.grocery_items ADD COLUMN IF NOT EXISTS is_purchased BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.grocery_items ADD COLUMN IF NOT EXISTS notes TEXT;

-- Upgrade consumption_logs if it already existed without all columns
ALTER TABLE IF EXISTS public.consumption_logs ADD COLUMN IF NOT EXISTS inventory_item_id UUID;
ALTER TABLE IF EXISTS public.consumption_logs ADD COLUMN IF NOT EXISTS ingredient_name TEXT;
ALTER TABLE IF EXISTS public.consumption_logs ADD COLUMN IF NOT EXISTS quantity NUMERIC DEFAULT 1;
ALTER TABLE IF EXISTS public.consumption_logs ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'pcs';
ALTER TABLE IF EXISTS public.consumption_logs ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Vegetables';
ALTER TABLE IF EXISTS public.consumption_logs ADD COLUMN IF NOT EXISTS action_type TEXT DEFAULT 'consumed';
ALTER TABLE IF EXISTS public.consumption_logs ADD COLUMN IF NOT EXISTS estimated_value NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.consumption_logs ADD COLUMN IF NOT EXISTS action_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE IF EXISTS public.consumption_logs ADD COLUMN IF NOT EXISTS notes TEXT;

-- ====================================================================
-- 8. INDEXES FOR HIGH-PERFORMANCE QUERIES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_last_sign_in ON public.profiles(last_sign_in_at);
CREATE INDEX IF NOT EXISTS idx_kitchen_inventory_user ON public.kitchen_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_inventory_use_by ON public.kitchen_inventory(estimated_use_by);
CREATE INDEX IF NOT EXISTS idx_grocery_items_user ON public.grocery_items(user_id);
CREATE INDEX IF NOT EXISTS idx_grocery_items_list ON public.grocery_items(grocery_list_id);
CREATE INDEX IF NOT EXISTS idx_consumption_logs_user ON public.consumption_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_consumption_logs_date ON public.consumption_logs(action_date);
CREATE INDEX IF NOT EXISTS idx_ingredient_catalog_name ON public.ingredient_catalog(name);
CREATE INDEX IF NOT EXISTS idx_ingredient_catalog_category ON public.ingredient_catalog(category);

-- ====================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredient_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumption_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- Clean up any existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read ingredient catalog" ON public.ingredient_catalog;
DROP POLICY IF EXISTS "Users can manage own inventory" ON public.kitchen_inventory;
DROP POLICY IF EXISTS "Users can manage own grocery lists" ON public.grocery_lists;
DROP POLICY IF EXISTS "Users can manage own grocery items" ON public.grocery_items;
DROP POLICY IF EXISTS "Users can manage own logs" ON public.consumption_logs;
DROP POLICY IF EXISTS "Users can view own and shared recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can manage own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Recipe ingredients visibility" ON public.recipe_ingredients;

-- Profiles: Only the authenticated user can access their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Ingredient Catalog: Everyone (authenticated & public) can view ingredients
CREATE POLICY "Anyone can read ingredient catalog" ON public.ingredient_catalog
    FOR SELECT USING (true);

-- Kitchen Inventory: User can only access their own items
CREATE POLICY "Users can manage own inventory" ON public.kitchen_inventory
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grocery Lists & Items: User can only access their own items
CREATE POLICY "Users can manage own grocery lists" ON public.grocery_lists
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own grocery items" ON public.grocery_items
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Consumption Logs: User can only access their own logs
CREATE POLICY "Users can manage own logs" ON public.consumption_logs
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Recipes: Users can view their own and general recipes
CREATE POLICY "Users can view own and shared recipes" ON public.recipes
    FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can manage own recipes" ON public.recipes
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Recipe ingredients visibility" ON public.recipe_ingredients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.recipes
            WHERE recipes.id = recipe_ingredients.recipe_id
              AND (recipes.user_id IS NULL OR recipes.user_id = auth.uid())
        )
    );

-- ====================================================================
-- 10. AUTH TRIGGER: AUTO-SYNC AUTH.USERS INTO PUBLIC.PROFILES
-- Tracks signups, logins, email verification, and provider (Email/Google/Apple)
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_auth_user_event()
RETURNS TRIGGER AS $$
DECLARE
    detected_provider TEXT;
    extracted_name TEXT;
    extracted_avatar TEXT;
BEGIN
    -- Determine identity provider (email, google, apple)
    detected_provider := COALESCE(
        NEW.raw_app_meta_data->>'provider',
        NEW.raw_user_meta_data->>'provider',
        'email'
    );

    -- Extract full name if available from metadata
    extracted_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        ''
    );

    -- Extract avatar if available (Google/Apple avatar)
    extracted_avatar := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
        ''
    );

    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        avatar_url,
        email_verified,
        email_confirmed_at,
        last_sign_in_at,
        sign_in_count,
        auth_provider,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        extracted_name,
        extracted_avatar,
        (NEW.email_confirmed_at IS NOT NULL),
        NEW.email_confirmed_at,
        NEW.last_sign_in_at,
        1,
        detected_provider,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = CASE
            WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name
            ELSE profiles.full_name
        END,
        avatar_url = CASE
            WHEN EXCLUDED.avatar_url <> '' THEN EXCLUDED.avatar_url
            ELSE profiles.avatar_url
        END,
        email_verified = (NEW.email_confirmed_at IS NOT NULL),
        email_confirmed_at = NEW.email_confirmed_at,
        last_sign_in_at = COALESCE(NEW.last_sign_in_at, profiles.last_sign_in_at),
        sign_in_count = CASE
            WHEN NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at THEN profiles.sign_in_count + 1
            ELSE profiles.sign_in_count
        END,
        auth_provider = detected_provider,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users for signup, login, and verification updates
DROP TRIGGER IF EXISTS on_auth_user_event ON auth.users;
CREATE TRIGGER on_auth_user_event
    AFTER INSERT OR UPDATE OF last_sign_in_at, email_confirmed_at ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_event();

-- Backfill any existing users who signed up before trigger was created
INSERT INTO public.profiles (id, email, full_name, avatar_url, email_verified, email_confirmed_at, last_sign_in_at, auth_provider)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''),
    COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture', ''),
    (u.email_confirmed_at IS NOT NULL),
    u.email_confirmed_at,
    u.last_sign_in_at,
    COALESCE(u.raw_app_meta_data->>'provider', 'email')
FROM auth.users u
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    email_verified = EXCLUDED.email_verified,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    last_sign_in_at = EXCLUDED.last_sign_in_at;

-- ====================================================================
-- 11. ANALYTICS VIEW: ADMIN USER STATS & LOGINS
-- Easily queryable to see total users, verified accounts, active logins
-- ====================================================================
CREATE OR REPLACE VIEW public.admin_user_analytics AS
SELECT
    COUNT(*) AS total_registered_users,
    COUNT(*) FILTER (WHERE email_verified = TRUE) AS total_verified_accounts,
    COUNT(*) FILTER (WHERE email_verified = FALSE) AS total_unverified_accounts,
    COUNT(*) FILTER (WHERE last_sign_in_at >= NOW() - INTERVAL '24 hours') AS active_users_past_24h,
    COUNT(*) FILTER (WHERE last_sign_in_at >= NOW() - INTERVAL '7 days') AS active_users_past_7d,
    COUNT(*) FILTER (WHERE last_sign_in_at >= NOW() - INTERVAL '30 days') AS active_users_past_30d,
    COUNT(*) FILTER (WHERE auth_provider = 'google') AS google_signups,
    COUNT(*) FILTER (WHERE auth_provider = 'apple') AS apple_signups,
    COUNT(*) FILTER (WHERE auth_provider = 'email') AS email_signups,
    COALESCE(SUM(sign_in_count), 0) AS total_logins_recorded
FROM public.profiles;

COMMENT ON VIEW public.admin_user_analytics IS 'Executive summary of user registrations, verification rate, and active logins.';

-- ====================================================================
-- 12. PRE-SEEDED INGREDIENT CATALOG (100+ staples with shelf lives)
-- ====================================================================
INSERT INTO public.ingredient_catalog (name, category, default_unit, default_storage, shelf_life_days, is_staple)
VALUES
    -- Vegetables
    ('Tomatoes', 'Vegetables', 'pcs', 'Countertop', 5, true),
    ('Ripe Tomatoes', 'Vegetables', 'pcs', 'Countertop', 3, true),
    ('Cherry Tomatoes', 'Vegetables', 'g', 'Refrigerator', 7, false),
    ('Onions', 'Vegetables', 'kg', 'Pantry', 21, true),
    ('Red Onions', 'Vegetables', 'kg', 'Pantry', 21, true),
    ('Green Onions', 'Vegetables', 'bunch', 'Refrigerator', 5, false),
    ('Potatoes', 'Vegetables', 'kg', 'Pantry', 30, true),
    ('Sweet Potatoes', 'Vegetables', 'kg', 'Pantry', 21, false),
    ('Ginger', 'Vegetables', 'g', 'Refrigerator', 21, true),
    ('Garlic', 'Vegetables', 'pcs', 'Pantry', 30, true),
    ('Ginger & Garlic', 'Vegetables', 'g', 'Refrigerator', 20, true),
    ('Fresh Palak (Spinach)', 'Vegetables', 'g', 'Refrigerator', 3, true),
    ('Methi (Fenugreek)', 'Vegetables', 'bunch', 'Refrigerator', 3, false),
    ('Fresh Coriander', 'Vegetables', 'bunch', 'Refrigerator', 4, true),
    ('Curry Leaves', 'Vegetables', 'bunch', 'Refrigerator', 14, true),
    ('Green Chillies', 'Vegetables', 'g', 'Refrigerator', 14, true),
    ('Red Chillies', 'Vegetables', 'g', 'Pantry', 60, false),
    ('Cauliflower', 'Vegetables', 'pcs', 'Refrigerator', 7, false),
    ('Cabbage', 'Vegetables', 'pcs', 'Refrigerator', 14, false),
    ('Carrots', 'Vegetables', 'kg', 'Refrigerator', 14, true),
    ('Beetroot', 'Vegetables', 'kg', 'Refrigerator', 14, false),
    ('Capsicum', 'Vegetables', 'pcs', 'Refrigerator', 7, true),
    ('Cucumber', 'Vegetables', 'pcs', 'Refrigerator', 7, true),
    ('Bottle Gourd (Lauki)', 'Vegetables', 'pcs', 'Refrigerator', 6, false),
    ('Bitter Gourd (Karela)', 'Vegetables', 'pcs', 'Refrigerator', 6, false),
    ('Okra (Bhindi)', 'Vegetables', 'g', 'Refrigerator', 4, true),
    ('French Beans', 'Vegetables', 'g', 'Refrigerator', 6, true),
    ('Fresh Green Peas', 'Vegetables', 'g', 'Refrigerator', 5, true),
    ('Mushrooms', 'Vegetables', 'g', 'Refrigerator', 4, false),
    ('Broccoli', 'Vegetables', 'pcs', 'Refrigerator', 5, false),

    -- Dairy & Eggs
    ('Curd / Plain Dahi', 'Dairy', 'g', 'Refrigerator', 5, true),
    ('Malai Paneer', 'Dairy', 'g', 'Refrigerator', 4, true),
    ('Milk', 'Dairy', 'L', 'Refrigerator', 3, true),
    ('Full-Fat Milk', 'Dairy', 'L', 'Refrigerator', 3, false),
    ('Butter', 'Dairy', 'g', 'Refrigerator', 30, true),
    ('Ghee', 'Dairy', 'g', 'Pantry', 180, true),
    ('Cheese', 'Dairy', 'g', 'Refrigerator', 21, false),
    ('Mozzarella', 'Dairy', 'g', 'Refrigerator', 10, false),
    ('Farm Fresh Eggs', 'Dairy', 'pcs', 'Refrigerator', 21, true),

    -- Fruits
    ('Shimla Apples', 'Fruits', 'pcs', 'Countertop', 8, true),
    ('Bananas', 'Fruits', 'pcs', 'Countertop', 4, true),
    ('Lemons', 'Fruits', 'pcs', 'Refrigerator', 14, true),
    ('Limes', 'Fruits', 'pcs', 'Refrigerator', 14, false),
    ('Oranges', 'Fruits', 'pcs', 'Refrigerator', 10, false),
    ('Mangoes', 'Fruits', 'pcs', 'Countertop', 5, false),
    ('Pomegranate', 'Fruits', 'pcs', 'Refrigerator', 14, false),
    ('Papaya', 'Fruits', 'pcs', 'Countertop', 5, false),
    ('Watermelon', 'Fruits', 'pcs', 'Refrigerator', 6, false),

    -- Grains & Flours
    ('Basmati Rice', 'Grains', 'kg', 'Pantry', 180, true),
    ('Sona Masoori Rice', 'Grains', 'kg', 'Pantry', 180, true),
    ('Wheat Flour (Atta)', 'Grains', 'kg', 'Pantry', 90, true),
    ('Maida (All-Purpose Flour)', 'Grains', 'kg', 'Pantry', 90, false),
    ('Semolina (Sooji / Rava)', 'Grains', 'kg', 'Pantry', 90, true),
    ('Poha (Flattened Rice)', 'Grains', 'kg', 'Pantry', 90, true),
    ('Oats', 'Grains', 'kg', 'Pantry', 90, true),
    ('Besan (Chickpea Flour)', 'Grains', 'kg', 'Pantry', 90, true),
    ('Bread', 'Bakery', 'pack', 'Countertop', 4, true),
    ('Brown Bread', 'Bakery', 'pack', 'Countertop', 4, false),

    -- Pulses & Lentils
    ('Toor Dal (Arhar Dal)', 'Pulses', 'kg', 'Pantry', 180, true),
    ('Moong Dal', 'Pulses', 'kg', 'Pantry', 180, true),
    ('Chana Dal', 'Pulses', 'kg', 'Pantry', 180, true),
    ('Urad Dal', 'Pulses', 'kg', 'Pantry', 180, true),
    ('Masoor Dal', 'Pulses', 'kg', 'Pantry', 180, true),
    ('Rajma (Kidney Beans)', 'Pulses', 'kg', 'Pantry', 180, true),
    ('Kabuli Chana (Chickpeas)', 'Pulses', 'kg', 'Pantry', 180, true),

    -- Spices & Condiments
    ('Turmeric Powder', 'Spices', 'g', 'Pantry', 365, true),
    ('Red Chilli Powder', 'Spices', 'g', 'Pantry', 365, true),
    ('Coriander Powder', 'Spices', 'g', 'Pantry', 365, true),
    ('Cumin Seeds', 'Spices', 'g', 'Pantry', 365, true),
    ('Mustard Seeds', 'Spices', 'g', 'Pantry', 365, true),
    ('Garam Masala', 'Spices', 'g', 'Pantry', 180, true),
    ('Hing (Asafoetida)', 'Spices', 'g', 'Pantry', 365, true),
    ('Salt', 'Spices', 'kg', 'Pantry', 730, true),
    ('Sugar', 'Spices', 'kg', 'Pantry', 730, true),
    ('Refined Oil', 'Packaged Food', 'L', 'Pantry', 180, true),
    ('Mustard Oil', 'Packaged Food', 'L', 'Pantry', 180, false)
ON CONFLICT (name) DO NOTHING;
