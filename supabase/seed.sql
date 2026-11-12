-- ====================================================================
-- KITCHEN COMPANION (EAT THE CLOCK) - SEED DATA SCRIPT
-- PostgreSQL / Supabase Demo Dataset
--
-- This script safely populates:
-- 1. Demo users in auth.users (Priya, Rahul, Ananya, Kabir) with proper auth metadata
-- 2. User profiles with diverse culinary preferences, verification status, and login counts
-- 3. Expanded ingredient catalog (100+ master ingredients with shelf lives)
-- 4. Realistic kitchen inventory items (Fridge, Pantry, Countertop) across freshness tiers
-- 5. Grocery lists and grocery items (Purchased and pending items)
-- 6. Consumption logs (Food consumed, discarded, value saved vs lost)
-- 7. Zero-waste recipes and linked recipe ingredients
--
-- INSTRUCTIONS:
-- Run this in the Supabase Dashboard -> SQL Editor -> New Query -> Run.
-- Safe to re-run: uses ON CONFLICT and idempotent inserts.
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. SEED AUTH USERS (Satisfies foreign key constraint for all child tables)
-- ====================================================================
-- Fixed demo user UUIDs for consistent relationship mapping
DO $$
DECLARE
    u1_id UUID := 'a0000000-0000-0000-0000-000000000001'::uuid;
    u2_id UUID := 'a0000000-0000-0000-0000-000000000002'::uuid;
    u3_id UUID := 'a0000000-0000-0000-0000-000000000003'::uuid;
    u4_id UUID := 'a0000000-0000-0000-0000-000000000004'::uuid;
    demo_password_hash TEXT := crypt('KitchenCompanion2025!', gen_salt('bf'));
BEGIN
    -- User 1: Priya Sharma (Google OAuth, Verified, Active today, 12 logins)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000'::uuid,
        u1_id,
        'authenticated',
        'authenticated',
        'priya.sharma@eattheclock.demo',
        demo_password_hash,
        NOW() - INTERVAL '25 days',
        NOW() - INTERVAL '2 hours',
        '{"provider": "google", "providers": ["google"]}'::jsonb,
        '{"name": "Priya Sharma", "full_name": "Priya Sharma", "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"}'::jsonb,
        NOW() - INTERVAL '30 days',
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        email_confirmed_at = EXCLUDED.email_confirmed_at,
        last_sign_in_at = EXCLUDED.last_sign_in_at;

    -- User 2: Rahul Mehta (Email signup, Verified, Active yesterday, 8 logins)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000'::uuid,
        u2_id,
        'authenticated',
        'authenticated',
        'rahul.mehta@eattheclock.demo',
        demo_password_hash,
        NOW() - INTERVAL '14 days',
        NOW() - INTERVAL '1 day',
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        '{"name": "Rahul Mehta", "full_name": "Rahul Mehta", "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}'::jsonb,
        NOW() - INTERVAL '15 days',
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        email_confirmed_at = EXCLUDED.email_confirmed_at,
        last_sign_in_at = EXCLUDED.last_sign_in_at;

    -- User 3: Ananya Iyer (Apple Login, Verified, Active 3 days ago, 5 logins)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000'::uuid,
        u3_id,
        'authenticated',
        'authenticated',
        'ananya.iyer@eattheclock.demo',
        demo_password_hash,
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '3 days',
        '{"provider": "apple", "providers": ["apple"]}'::jsonb,
        '{"name": "Ananya Iyer", "full_name": "Ananya Iyer", "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}'::jsonb,
        NOW() - INTERVAL '8 days',
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        email_confirmed_at = EXCLUDED.email_confirmed_at,
        last_sign_in_at = EXCLUDED.last_sign_in_at;

    -- User 4: Kabir Sen (Email signup, Unverified email to demo analytics tracking, 1 login)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000'::uuid,
        u4_id,
        'authenticated',
        'authenticated',
        'kabir.sen@eattheclock.demo',
        demo_password_hash,
        NULL, -- Not confirmed yet
        NOW() - INTERVAL '5 hours',
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        '{"name": "Kabir Sen", "full_name": "Kabir Sen", "avatar_url": ""}'::jsonb,
        NOW() - INTERVAL '5 hours',
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        last_sign_in_at = EXCLUDED.last_sign_in_at;

END $$;

-- ====================================================================
-- 2. SEED PUBLIC.PROFILES (Rich user preferences and analytics metrics)
-- ====================================================================
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    phone,
    city,
    dietary_preference,
    household_size,
    cooking_level,
    favorite_cuisines,
    allergies,
    spice_tolerance,
    notification_settings,
    email_verified,
    email_confirmed_at,
    last_sign_in_at,
    sign_in_count,
    auth_provider,
    created_at,
    updated_at
) VALUES
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'priya.sharma@eattheclock.demo',
    'Priya Sharma',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    '+91 98201 44321',
    'Mumbai, Maharashtra',
    'Vegetarian',
    3,
    'Passionate Home Cook',
    '["North Indian", "South Indian", "Gujarati", "Italian"]'::jsonb,
    '["Peanuts"]'::jsonb,
    'Medium',
    '{"daily_reminder_enabled": true, "dinner_nudge_enabled": true, "expiry_alerts_enabled": true}'::jsonb,
    TRUE,
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '2 hours',
    14,
    'google',
    NOW() - INTERVAL '30 days',
    NOW()
),
(
    'a0000000-0000-0000-0000-000000000002'::uuid,
    'rahul.mehta@eattheclock.demo',
    'Rahul Mehta',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    '+91 99870 12345',
    'Bengaluru, Karnataka',
    'Eggetarian',
    2,
    'Beginner Cook',
    '["Indo-Chinese", "South Indian", "Continental"]'::jsonb,
    '[]'::jsonb,
    'High',
    '{"daily_reminder_enabled": true, "dinner_nudge_enabled": false, "expiry_alerts_enabled": true}'::jsonb,
    TRUE,
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '1 day',
    8,
    'email',
    NOW() - INTERVAL '15 days',
    NOW()
),
(
    'a0000000-0000-0000-0000-000000000003'::uuid,
    'ananya.iyer@eattheclock.demo',
    'Ananya Iyer',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    '+91 94440 98765',
    'Chennai, Tamil Nadu',
    'Vegan',
    4,
    'Culinary Explorer',
    '["South Indian", "Mediterranean", "Thai", "Healthy Bowls"]'::jsonb,
    '["Lactose / Dairy", "Shellfish"]'::jsonb,
    'Medium',
    '{"daily_reminder_enabled": true, "dinner_nudge_enabled": true, "expiry_alerts_enabled": true}'::jsonb,
    TRUE,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '3 days',
    5,
    'apple',
    NOW() - INTERVAL '8 days',
    NOW()
),
(
    'a0000000-0000-0000-0000-000000000004'::uuid,
    'kabir.sen@eattheclock.demo',
    'Kabir Sen',
    '',
    '+91 98110 55432',
    'New Delhi',
    'Non-Vegetarian',
    1,
    'Student / Quick Meals',
    '["Mughlai", "Street Food", "Pan-Asian"]'::jsonb,
    '[]'::jsonb,
    'Very High',
    '{"daily_reminder_enabled": false, "dinner_nudge_enabled": true, "expiry_alerts_enabled": true}'::jsonb,
    FALSE,
    NULL,
    NOW() - INTERVAL '5 hours',
    1,
    'email',
    NOW() - INTERVAL '5 hours',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    phone = EXCLUDED.phone,
    city = EXCLUDED.city,
    dietary_preference = EXCLUDED.dietary_preference,
    household_size = EXCLUDED.household_size,
    cooking_level = EXCLUDED.cooking_level,
    favorite_cuisines = EXCLUDED.favorite_cuisines,
    allergies = EXCLUDED.allergies,
    spice_tolerance = EXCLUDED.spice_tolerance,
    notification_settings = EXCLUDED.notification_settings,
    email_verified = EXCLUDED.email_verified,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    last_sign_in_at = EXCLUDED.last_sign_in_at,
    sign_in_count = EXCLUDED.sign_in_count,
    auth_provider = EXCLUDED.auth_provider;

-- ====================================================================
-- 3. EXPAND MASTER INGREDIENT CATALOG (100+ Ingredients with shelf lives)
-- ====================================================================
INSERT INTO public.ingredient_catalog (name, category, default_unit, default_storage, shelf_life_days, is_staple)
VALUES
    -- Fresh Vegetables
    ('Tomatoes', 'Vegetables', 'pcs', 'Countertop', 5, true),
    ('Ripe Hybrid Tomatoes', 'Vegetables', 'pcs', 'Countertop', 3, true),
    ('Cherry Tomatoes', 'Vegetables', 'g', 'Refrigerator', 7, false),
    ('Onions', 'Vegetables', 'kg', 'Pantry', 21, true),
    ('Red Onions', 'Vegetables', 'kg', 'Pantry', 21, true),
    ('Green Onions (Scallions)', 'Vegetables', 'bunch', 'Refrigerator', 5, false),
    ('Potatoes', 'Vegetables', 'kg', 'Pantry', 30, true),
    ('Baby Potatoes', 'Vegetables', 'kg', 'Pantry', 25, true),
    ('Sweet Potatoes', 'Vegetables', 'kg', 'Pantry', 21, false),
    ('Ginger', 'Vegetables', 'g', 'Refrigerator', 21, true),
    ('Garlic', 'Vegetables', 'pcs', 'Pantry', 30, true),
    ('Ginger & Garlic Paste', 'Vegetables', 'g', 'Refrigerator', 20, true),
    ('Fresh Palak (Spinach)', 'Vegetables', 'g', 'Refrigerator', 3, true),
    ('Methi (Fenugreek Leaves)', 'Vegetables', 'bunch', 'Refrigerator', 3, false),
    ('Fresh Coriander', 'Vegetables', 'bunch', 'Refrigerator', 4, true),
    ('Curry Leaves', 'Vegetables', 'bunch', 'Refrigerator', 14, true),
    ('Green Chillies', 'Vegetables', 'g', 'Refrigerator', 14, true),
    ('Red Bell Pepper', 'Vegetables', 'pcs', 'Refrigerator', 7, false),
    ('Green Capsicum', 'Vegetables', 'pcs', 'Refrigerator', 7, true),
    ('Yellow Bell Pepper', 'Vegetables', 'pcs', 'Refrigerator', 7, false),
    ('Cauliflower', 'Vegetables', 'pcs', 'Refrigerator', 7, false),
    ('Cabbage', 'Vegetables', 'pcs', 'Refrigerator', 14, false),
    ('Carrots', 'Vegetables', 'kg', 'Refrigerator', 14, true),
    ('English Cucumber', 'Vegetables', 'pcs', 'Refrigerator', 7, true),
    ('Bottle Gourd (Lauki)', 'Vegetables', 'pcs', 'Refrigerator', 6, false),
    ('Bitter Gourd (Karela)', 'Vegetables', 'pcs', 'Refrigerator', 6, false),
    ('Okra (Bhindi)', 'Vegetables', 'g', 'Refrigerator', 4, true),
    ('French Beans', 'Vegetables', 'g', 'Refrigerator', 6, true),
    ('Fresh Green Peas', 'Vegetables', 'g', 'Refrigerator', 5, true),
    ('Button Mushrooms', 'Vegetables', 'g', 'Refrigerator', 4, false),
    ('Broccoli', 'Vegetables', 'pcs', 'Refrigerator', 5, false),
    ('Beetroot', 'Vegetables', 'kg', 'Refrigerator', 14, false),
    ('Zucchini', 'Vegetables', 'pcs', 'Refrigerator', 6, false),

    -- Dairy & Fresh Proteins
    ('Malai Paneer', 'Dairy', 'g', 'Refrigerator', 4, true),
    ('Curd / Plain Dahi', 'Dairy', 'g', 'Refrigerator', 5, true),
    ('Greek Yogurt', 'Dairy', 'g', 'Refrigerator', 7, false),
    ('Fresh Milk', 'Dairy', 'L', 'Refrigerator', 3, true),
    ('Full-Fat Milk', 'Dairy', 'L', 'Refrigerator', 3, false),
    ('Amul Butter', 'Dairy', 'g', 'Refrigerator', 30, true),
    ('Desi Cow Ghee', 'Dairy', 'g', 'Pantry', 180, true),
    ('Processed Cheese Cubes', 'Dairy', 'g', 'Refrigerator', 21, true),
    ('Mozzarella Cheese', 'Dairy', 'g', 'Refrigerator', 10, false),
    ('Fresh Paneer (Tofu Alternative)', 'Dairy', 'g', 'Refrigerator', 5, false),
    ('Farm Fresh Eggs', 'Dairy', 'pcs', 'Refrigerator', 21, true),

    -- Fruits
    ('Shimla Apples', 'Fruits', 'pcs', 'Countertop', 8, true),
    ('Bananas (Robusta)', 'Fruits', 'pcs', 'Countertop', 4, true),
    ('Alphonso Mangoes', 'Fruits', 'pcs', 'Countertop', 5, false),
    ('Fresh Lemons', 'Fruits', 'pcs', 'Refrigerator', 14, true),
    ('Nagpur Oranges', 'Fruits', 'pcs', 'Refrigerator', 10, false),
    ('Pomegranate', 'Fruits', 'pcs', 'Refrigerator', 14, false),
    ('Ripe Papaya', 'Fruits', 'pcs', 'Countertop', 4, false),
    ('Fresh Strawberries', 'Fruits', 'g', 'Refrigerator', 4, false),
    ('Watermelon', 'Fruits', 'pcs', 'Refrigerator', 6, false),
    ('Green Grapes', 'Fruits', 'g', 'Refrigerator', 7, false),

    -- Grains, Flours & Bakery
    ('Daawat Basmati Rice', 'Grains', 'kg', 'Pantry', 180, true),
    ('Sona Masoori Rice', 'Grains', 'kg', 'Pantry', 180, true),
    ('Aashirvaad Whole Wheat Atta', 'Grains', 'kg', 'Pantry', 90, true),
    ('Maida (All-Purpose Flour)', 'Grains', 'kg', 'Pantry', 90, false),
    ('Semolina (Sooji / Rava)', 'Grains', 'kg', 'Pantry', 90, true),
    ('Poha (Thick Flattened Rice)', 'Grains', 'kg', 'Pantry', 90, true),
    ('Rolled Oats', 'Grains', 'kg', 'Pantry', 90, true),
    ('Besan (Gram Flour)', 'Grains', 'kg', 'Pantry', 90, true),
    ('Whole Wheat Bread', 'Bakery', 'pack', 'Countertop', 4, true),
    ('Artisanal Sourdough Bread', 'Bakery', 'pack', 'Countertop', 4, false),
    ('Pav Buns', 'Bakery', 'pack', 'Countertop', 3, false),

    -- Lentils & Pulses
    ('Toor Dal (Arhar Dal)', 'Pulses', 'kg', 'Pantry', 180, true),
    ('Yellow Moong Dal', 'Pulses', 'kg', 'Pantry', 180, true),
    ('Chana Dal', 'Pulses', 'kg', 'Pantry', 180, true),
    ('Urad Dal (Split)', 'Pulses', 'kg', 'Pantry', 180, true),
    ('Masoor Dal (Red Lentils)', 'Pulses', 'kg', 'Pantry', 180, true),
    ('Kashmiri Rajma', 'Pulses', 'kg', 'Pantry', 180, true),
    ('Kabuli Chana (Chickpeas)', 'Pulses', 'kg', 'Pantry', 180, true),
    ('Brown Chana', 'Pulses', 'kg', 'Pantry', 180, false),

    -- Spices, Oils & Essentials
    ('Turmeric Powder (Haldi)', 'Spices', 'g', 'Pantry', 365, true),
    ('Degi Mirch Powder', 'Spices', 'g', 'Pantry', 365, true),
    ('Coriander Powder (Dhaniya)', 'Spices', 'g', 'Pantry', 365, true),
    ('Cumin Seeds (Jeera)', 'Spices', 'g', 'Pantry', 365, true),
    ('Black Mustard Seeds (Rai)', 'Spices', 'g', 'Pantry', 365, true),
    ('Garam Masala Blend', 'Spices', 'g', 'Pantry', 180, true),
    ('Hing (Asafoetida)', 'Spices', 'g', 'Pantry', 365, true),
    ('Kasoori Methi (Dry Fenugreek)', 'Spices', 'g', 'Pantry', 180, true),
    ('Tata Salt', 'Spices', 'kg', 'Pantry', 730, true),
    ('Organic Sulphurless Sugar', 'Spices', 'kg', 'Pantry', 730, true),
    ('Cold Pressed Mustard Oil', 'Packaged Food', 'L', 'Pantry', 180, true),
    ('Refined Sunflower Oil', 'Packaged Food', 'L', 'Pantry', 180, true),
    ('Extra Virgin Olive Oil', 'Packaged Food', 'L', 'Pantry', 180, false),
    ('Soy Sauce', 'Condiments', 'ml', 'Refrigerator', 180, false),
    ('Tomato Ketchup', 'Condiments', 'g', 'Refrigerator', 90, true)
ON CONFLICT (name) DO NOTHING;

-- ====================================================================
-- 4. SEED KITCHEN INVENTORY (Rich demo items across Freshness Tiers)
-- ====================================================================
-- Delete existing seed items for demo users to maintain a fresh, spotless state
DELETE FROM public.kitchen_inventory
WHERE user_id IN (
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'a0000000-0000-0000-0000-000000000002'::uuid
);

INSERT INTO public.kitchen_inventory (
    user_id,
    custom_name,
    quantity,
    unit,
    category,
    storage_location,
    purchase_date,
    estimated_use_by,
    freshness_status,
    notes
) VALUES
-- PRIYA SHARMA'S INVENTORY
-- 1. USE FIRST (Expiring in 0-2 days - Highlights smart nudges and urgency alerts)
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Fresh Palak (Spinach)',
    250,
    'g',
    'Vegetables',
    'Refrigerator',
    CURRENT_DATE - 2,
    CURRENT_DATE + 1,
    'Use First',
    'Bought from local organic mandi. Needs to be cooked into Palak Paneer or Dal Palak today.'
),
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Malai Paneer',
    200,
    'g',
    'Dairy',
    'Refrigerator',
    CURRENT_DATE - 2,
    CURRENT_DATE + 1,
    'Use First',
    'Unopened packet. Pair with Palak for zero-waste dinner.'
),
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Ripe Hybrid Tomatoes',
    4,
    'pcs',
    'Vegetables',
    'Countertop',
    CURRENT_DATE - 4,
    CURRENT_DATE + 1,
    'Use First',
    'Softening slightly. Perfect for tomato gravy or soup.'
),
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Bananas (Robusta)',
    4,
    'pcs',
    'Fruits',
    'Countertop',
    CURRENT_DATE - 3,
    CURRENT_DATE + 1,
    'Use First',
    'Starting to show sugar spots. Great for banana bread or smoothie.'
),
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Whole Wheat Bread',
    1,
    'pack',
    'Bakery',
    'Countertop',
    CURRENT_DATE - 2,
    CURRENT_DATE + 2,
    'Use First',
    '4 slices remaining. Make French toast or vegetable sandwiches.'
),

-- 2. USE SOON (Expiring in 3-5 days - Highlights meal planning recommendations)
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Fresh Milk',
    1,
    'L',
    'Dairy',
    'Refrigerator',
    CURRENT_DATE - 1,
    CURRENT_DATE + 3,
    'Use Soon',
    'Fresh toned milk pouch.'
),
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Curd / Plain Dahi',
    400,
    'g',
    'Dairy',
    'Refrigerator',
    CURRENT_DATE - 1,
    CURRENT_DATE + 4,
    'Use Soon',
    'Set curd for raita or marination.'
),
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'French Beans',
    250,
    'g',
    'Vegetables',
    'Refrigerator',
    CURRENT_DATE - 2,
    CURRENT_DATE + 4,
    'Use Soon',
    'Trimmed and ready to sauté.'
),
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Button Mushrooms',
    200,
    'g',
    'Vegetables',
    'Refrigerator',
    CURRENT_DATE - 1,
    CURRENT_DATE + 3,
    'Use Soon',
    'Keep dry in paper bag.'
),

-- 3. FRESH (Expiring in 6+ days - Pantry staples and resilient produce)
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Carrots',
    500,
    'g',
    'Vegetables',
    'Refrigerator',
    CURRENT_DATE - 1,
    CURRENT_DATE + 10,
    'Fresh',
    'Crisp orange carrots in crisper drawer.'
),
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Green Chillies',
    100,
    'g',
    'Vegetables',
    'Refrigerator',
    CURRENT_DATE - 2,
    CURRENT_DATE + 12,
    'Fresh',
    'Stems removed for longer shelf life.'
),
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Ginger & Garlic Paste',
    150,
    'g',
    'Vegetables',
    'Refrigerator',
    CURRENT_DATE - 3,
    CURRENT_DATE + 16,
    'Fresh',
    'Homemade jar with mustard oil seal.'
),
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Farm Fresh Eggs',
    6,
    'pcs',
    'Dairy',
    'Refrigerator',
    CURRENT_DATE - 2,
    CURRENT_DATE + 18,
    'Fresh',
    'Stored on middle shelf, not door.'
),
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Red Onions',
    2,
    'kg',
    'Vegetables',
    'Pantry',
    CURRENT_DATE - 5,
    CURRENT_DATE + 16,
    'Fresh',
    'Well ventilated pantry basket.'
),
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Baby Potatoes',
    1,
    'kg',
    'Vegetables',
    'Pantry',
    CURRENT_DATE - 4,
    CURRENT_DATE + 20,
    'Fresh',
    'Stored away from onions in dark dry spot.'
),
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Daawat Basmati Rice',
    5,
    'kg',
    'Grains',
    'Pantry',
    CURRENT_DATE - 15,
    CURRENT_DATE + 165,
    'Fresh',
    'Aged aromatic long grain basmati.'
),
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Toor Dal (Arhar Dal)',
    1,
    'kg',
    'Pulses',
    'Pantry',
    CURRENT_DATE - 10,
    CURRENT_DATE + 150,
    'Fresh',
    'Organic unpolished toor dal.'
),
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Desi Cow Ghee',
    500,
    'g',
    'Dairy',
    'Pantry',
    CURRENT_DATE - 10,
    CURRENT_DATE + 140,
    'Fresh',
    'Bilona churned A2 cow ghee.'
),

-- RAHUL MEHTA'S INVENTORY (Quick snapshot for multi-user verification)
(
    'a0000000-0000-0000-0000-000000000002'::uuid,
    'Greek Yogurt',
    200,
    'g',
    'Dairy',
    'Refrigerator',
    CURRENT_DATE - 3,
    CURRENT_DATE + 2,
    'Use First',
    'Breakfast bowl with honey.'
),
(
    'a0000000-0000-0000-0000-000000000002'::uuid,
    'English Cucumber',
    2,
    'pcs',
    'Vegetables',
    'Refrigerator',
    CURRENT_DATE - 1,
    CURRENT_DATE + 5,
    'Use Soon',
    'Salad prep.'
),
(
    'a0000000-0000-0000-0000-000000000002'::uuid,
    'Rolled Oats',
    1,
    'kg',
    'Grains',
    'Pantry',
    CURRENT_DATE - 8,
    CURRENT_DATE + 82,
    'Fresh',
    'Morning porridge staple.'
);

-- Associate ingredient_id from catalog where exact name matches
UPDATE public.kitchen_inventory ki
SET ingredient_id = ic.id
FROM public.ingredient_catalog ic
WHERE ki.custom_name = ic.name;

-- ====================================================================
-- 5. SEED GROCERY LISTS & ITEMS
-- ====================================================================
DELETE FROM public.grocery_lists
WHERE user_id IN (
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'a0000000-0000-0000-0000-000000000002'::uuid
);

-- User 1: Lists
INSERT INTO public.grocery_lists (id, user_id, name, is_active)
VALUES
(
    'b0000000-0000-0000-0000-000000000001'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Weekly Family Essentials',
    TRUE
),
(
    'b0000000-0000-0000-0000-000000000002'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Weekend Feast & Baking',
    TRUE
);

-- User 1: Items for List 1 ("Weekly Family Essentials")
INSERT INTO public.grocery_items (
    grocery_list_id,
    user_id,
    ingredient_name,
    quantity,
    unit,
    category,
    is_purchased,
    notes
) VALUES
-- Already purchased in cart
(
    'b0000000-0000-0000-0000-000000000001'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Cherry Tomatoes',
    250,
    'g',
    'Vegetables',
    TRUE,
    'Picked fresh punnet'
),
(
    'b0000000-0000-0000-0000-000000000001'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Desi Cow Ghee',
    500,
    'g',
    'Dairy',
    TRUE,
    'A2 certified jar'
),
-- Still to buy
(
    'b0000000-0000-0000-0000-000000000001'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Fresh Coriander',
    2,
    'bunch',
    'Vegetables',
    FALSE,
    'Ask vendor for tender green roots'
),
(
    'b0000000-0000-0000-0000-000000000001'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Green Capsicum',
    3,
    'pcs',
    'Vegetables',
    FALSE,
    'For stir fry & pizza'
),
(
    'b0000000-0000-0000-0000-000000000001'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Artisanal Sourdough Bread',
    1,
    'pack',
    'Bakery',
    FALSE,
    'Whole wheat fermented loaf'
),
(
    'b0000000-0000-0000-0000-000000000001'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Alphonso Mangoes',
    6,
    'pcs',
    'Fruits',
    FALSE,
    'Seasonal dessert treat'
);

-- User 1: Items for List 2 ("Weekend Feast & Baking")
INSERT INTO public.grocery_items (
    grocery_list_id,
    user_id,
    ingredient_name,
    quantity,
    unit,
    category,
    is_purchased,
    notes
) VALUES
(
    'b0000000-0000-0000-0000-000000000002'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Garam Masala Blend',
    100,
    'g',
    'Spices',
    FALSE,
    'Fresh stone ground'
),
(
    'b0000000-0000-0000-0000-000000000002'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Amul Butter',
    200,
    'g',
    'Dairy',
    FALSE,
    'Salted table butter'
);

-- ====================================================================
-- 6. SEED CONSUMPTION LOGS (Food Waste Prevention & Savings Analytics)
-- ====================================================================
DELETE FROM public.consumption_logs
WHERE user_id IN (
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'a0000000-0000-0000-0000-000000000002'::uuid
);

INSERT INTO public.consumption_logs (
    user_id,
    ingredient_name,
    quantity,
    unit,
    category,
    action_type,
    estimated_value,
    action_date,
    notes
) VALUES
-- Items Consumed (Money & Food Saved!)
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Fresh Palak (Spinach)',
    250,
    'g',
    'Vegetables',
    'consumed',
    40.00,
    CURRENT_DATE - 4,
    'Used up expiring batch in nourishing Dal Palak.'
),
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Malai Paneer',
    200,
    'g',
    'Dairy',
    'consumed',
    95.00,
    CURRENT_DATE - 3,
    'Cooked into spicy Paneer Bhurji before use-by date.'
),
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Baby Potatoes',
    500,
    'g',
    'Vegetables',
    'consumed',
    30.00,
    CURRENT_DATE - 2,
    'Roasted with cumin and mustard seeds.'
),
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Bananas (Robusta)',
    3,
    'pcs',
    'Fruits',
    'consumed',
    25.00,
    CURRENT_DATE - 1,
    'Blended into morning oats smoothie with cinnamon.'
),
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Fresh Milk',
    500,
    'ml',
    'Dairy',
    'consumed',
    36.00,
    CURRENT_DATE,
    'Used for evening masala chai for 3.'
),

-- Items Discarded (Teaches user where waste happens)
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Whole Wheat Bread',
    100,
    'g',
    'Bakery',
    'discarded',
    18.00,
    CURRENT_DATE - 6,
    'Forgot open packet on countertop during humid weather.'
),
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Fresh Coriander',
    50,
    'g',
    'Vegetables',
    'discarded',
    15.00,
    CURRENT_DATE - 5,
    'High moisture accumulation at bottom of crisper.'
),

-- Items Donated (Community impact)
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Rolled Oats',
    500,
    'g',
    'Grains',
    'donated',
    60.00,
    CURRENT_DATE - 10,
    'Surplus pantry stock shared with local community kitchen.'
);

-- ====================================================================
-- 7. SEED ZERO-WASTE RECIPES & INGREDIENT MAPPINGS
-- ====================================================================
DELETE FROM public.recipes
WHERE user_id = 'a0000000-0000-0000-0000-000000000001'::uuid;

INSERT INTO public.recipes (
    id,
    user_id,
    name,
    description,
    cuisine,
    preparation_time,
    servings,
    image_url,
    instructions
) VALUES
(
    'c0000000-0000-0000-0000-000000000001'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Quick Zero-Waste Palak Paneer',
    'Wholesome vibrant green curry crafted to immediately rescue expiring palak and fresh malai paneer before their use-by timer runs out.',
    'North Indian',
    25,
    3,
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600',
    '[
        "Wash the 250g Palak thoroughly and blanch in boiling salted water for 90 seconds. Immediately transfer to an ice bath to retain deep emerald green color.",
        "Blend the blanched spinach leaves with 2 green chillies and 1 inch fresh ginger into a velvety puree.",
        "Heat 1 tbsp cow ghee in a kadai. Add cumin seeds and finely chopped red onions until golden brown.",
        "Add ginger-garlic paste, pureed ripe tomatoes, turmeric, and coriander powder. Sauté until ghee separates.",
        "Pour in the spinach puree and simmer gently for 4 minutes on low heat.",
        "Gently slide in 200g cubed Malai Paneer, 1/2 tsp garam masala, and 1 tbsp fresh cream or curd. Simmer for 2 minutes and serve steaming hot with roti or jeera rice."
    ]'::jsonb
),
(
    'c0000000-0000-0000-0000-000000000002'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Golden Crispy Jeera Aloo',
    'Savory, cumin-scented potato toss utilizing pantry baby potatoes and simple everyday Indian spices in under 15 minutes.',
    'North Indian',
    15,
    2,
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600',
    '[
        "Parboil 500g baby potatoes in salted water until knife tender. Peel or keep skins on for rustic texture, then halve.",
        "Heat 2 tbsp mustard oil in a heavy bottom skillet until smoking point, then lower flame.",
        "Add 1 tbsp cumin seeds (jeera) and let crackle until fragrant and deeply golden.",
        "Toss in the potatoes, turmeric, red chilli powder, amchur (dry mango powder), and salt.",
        "Roast on medium flame undisturbed for 3-4 minutes to achieve a golden crispy crust.",
        "Garnish with chopped fresh coriander and a squeeze of fresh lemon juice."
    ]'::jsonb
),
(
    'c0000000-0000-0000-0000-000000000003'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Overripe Banana & Oat Pancakes',
    'Naturally sweet zero-sugar breakfast hotcakes made entirely from spotted overripe bananas, rolled oats, and fresh milk.',
    'Healthy Fusion',
    15,
    2,
    'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600',
    '[
        "Peel 3 overripe bananas into a mixing bowl and thoroughly mash with a fork until smooth.",
        "Whisk in 1 cup rolled oats (ground into flour), 1/2 cup fresh milk, a pinch of cinnamon, and 1 egg (or 2 tbsp curd).",
        "Let batter rest for 5 minutes to allow oats to absorb moisture.",
        "Heat a non-stick tawa with 1/2 tsp desi ghee. Pour small 3-inch ladles of batter.",
        "Cook on medium-low heat until bubbles appear on the surface (approx 2 mins). Flip gently and cook the other side until golden brown.",
        "Serve with sliced fresh apples, chopped walnuts, or a drizzle of raw honey."
    ]'::jsonb
);

-- Linked Recipe Ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_available, is_optional)
VALUES
-- Palak Paneer ingredients
('c0000000-0000-0000-0000-000000000001'::uuid, 'Fresh Palak (Spinach)', 250, 'g', true, false),
('c0000000-0000-0000-0000-000000000001'::uuid, 'Malai Paneer', 200, 'g', true, false),
('c0000000-0000-0000-0000-000000000001'::uuid, 'Ripe Hybrid Tomatoes', 2, 'pcs', true, false),
('c0000000-0000-0000-0000-000000000001'::uuid, 'Red Onions', 1, 'pcs', true, false),
('c0000000-0000-0000-0000-000000000001'::uuid, 'Ginger & Garlic Paste', 1, 'tbsp', true, false),
('c0000000-0000-0000-0000-000000000001'::uuid, 'Desi Cow Ghee', 1, 'tbsp', true, false),
('c0000000-0000-0000-0000-000000000001'::uuid, 'Garam Masala Blend', 0.5, 'tsp', true, false),

-- Jeera Aloo ingredients
('c0000000-0000-0000-0000-000000000002'::uuid, 'Baby Potatoes', 500, 'g', true, false),
('c0000000-0000-0000-0000-000000000002'::uuid, 'Cumin Seeds (Jeera)', 1, 'tbsp', true, false),
('c0000000-0000-0000-0000-000000000002'::uuid, 'Cold Pressed Mustard Oil', 2, 'tbsp', true, false),
('c0000000-0000-0000-0000-000000000002'::uuid, 'Turmeric Powder (Haldi)', 0.5, 'tsp', true, false),
('c0000000-0000-0000-0000-000000000002'::uuid, 'Fresh Coriander', 1, 'bunch', true, true),

-- Banana Pancakes ingredients
('c0000000-0000-0000-0000-000000000003'::uuid, 'Bananas (Robusta)', 3, 'pcs', true, false),
('c0000000-0000-0000-0000-000000000003'::uuid, 'Rolled Oats', 1, 'cup', true, false),
('c0000000-0000-0000-0000-000000000003'::uuid, 'Fresh Milk', 0.5, 'cup', true, false),
('c0000000-0000-0000-0000-000000000003'::uuid, 'Farm Fresh Eggs', 1, 'pcs', true, true),
('c0000000-0000-0000-0000-000000000003'::uuid, 'Desi Cow Ghee', 1, 'tsp', true, false);

-- ====================================================================
-- 8. DYNAMIC ADAPTATION FOR ANY EXISTING REAL LOGGED-IN USERS
-- If you have logged in with your own real account, this automatically
-- attaches sample inventory, grocery lists, and logs to YOUR user ID!
-- ====================================================================
DO $$
DECLARE
    real_user RECORD;
BEGIN
    FOR real_user IN
        SELECT id, email FROM auth.users
        WHERE id NOT IN (
            'a0000000-0000-0000-0000-000000000001'::uuid,
            'a0000000-0000-0000-0000-000000000002'::uuid,
            'a0000000-0000-0000-0000-000000000003'::uuid,
            'a0000000-0000-0000-0000-000000000004'::uuid
        )
    LOOP
        -- Only seed if the real user doesn't already have kitchen inventory
        IF NOT EXISTS (SELECT 1 FROM public.kitchen_inventory WHERE user_id = real_user.id) THEN
            RAISE NOTICE 'Populating starter kitchen inventory for registered user % (%)', real_user.id, real_user.email;

            -- Copy starter items
            INSERT INTO public.kitchen_inventory (
                user_id,
                custom_name,
                quantity,
                unit,
                category,
                storage_location,
                purchase_date,
                estimated_use_by,
                freshness_status,
                notes
            )
            SELECT
                real_user.id,
                custom_name,
                quantity,
                unit,
                category,
                storage_location,
                purchase_date,
                estimated_use_by,
                freshness_status,
                notes
            FROM public.kitchen_inventory
            WHERE user_id = 'a0000000-0000-0000-0000-000000000001'::uuid;

            -- Create grocery list
            INSERT INTO public.grocery_lists (user_id, name, is_active)
            VALUES (real_user.id, 'My Weekly Groceries', TRUE);
        END IF;
    END LOOP;
END $$;

-- ====================================================================
-- 9. VERIFICATION AND EXECUTIVE SUMMARY QUERY
-- ====================================================================
SELECT
    (SELECT COUNT(*) FROM auth.users) AS total_auth_users,
    (SELECT COUNT(*) FROM public.profiles) AS total_profiles,
    (SELECT COUNT(*) FROM public.profiles WHERE email_verified = true) AS verified_users,
    (SELECT COUNT(*) FROM public.ingredient_catalog) AS total_master_ingredients,
    (SELECT COUNT(*) FROM public.kitchen_inventory) AS total_inventory_items,
    (SELECT COUNT(*) FROM public.grocery_lists) AS total_grocery_lists,
    (SELECT COUNT(*) FROM public.grocery_items) AS total_grocery_items,
    (SELECT COUNT(*) FROM public.consumption_logs) AS total_consumption_logs,
    (SELECT COUNT(*) FROM public.recipes) AS total_zero_waste_recipes;
