import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKitchen } from '../context/KitchenContext';
import {
  testSupabaseConnection,
  getSupabaseConfig,
  resetSupabaseClient,
  isSupabaseConfigured
} from '../lib/supabase';
import { getGeminiApiKey, hasGeminiApiKey } from '../lib/ai';
import { NotificationSettings, UserProfile } from '../types';
import {
  User,
  Heart,
  Bell,
  Settings as SettingsIcon,
  Database,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Camera,
  MapPin,
  Mail,
  Phone,
  Users,
  Flame,
  Volume2,
  Calendar,
  LogOut,
  RotateCcw,
  Download,
  Utensils
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80'
];

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    userProfile,
    updateUserProfile,
    resetToSampleData,
    inventory,
    consumptionLogs,
    showToast,
    signOut
  } = useKitchen();

  // Active Screen/Tab:
  // 1. User Profile: Manage User Information
  // 2. Dietary Preferences: Manage Food Preferences
  // 3. Notification Settings: Configure Reminders
  // 4. App Settings: Manage Application Preferences
  const [activeTab, setActiveTab] = useState<'profile' | 'dietary' | 'notifications' | 'app'>('profile');

  // --- 1. USER PROFILE STATE ---
  const [fullName, setFullName] = useState(userProfile.full_name || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [city, setCity] = useState(userProfile.city || '');
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatar_url || AVATAR_PRESETS[0]);
  const [householdSize, setHouseholdSize] = useState(userProfile.household_size || 2);
  const [cookingLevel, setCookingLevel] = useState(userProfile.cooking_level || 'Home Cook');

  // --- 2. DIETARY PREFERENCES STATE ---
  const [dietary, setDietary] = useState(userProfile.dietary_preference || 'Vegetarian');
  const [spiceTolerance, setSpiceTolerance] = useState(userProfile.spice_tolerance || 'Medium');
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(
    userProfile.favorite_cuisines || ['South Indian', 'North Indian', 'Indo-Chinese']
  );
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(
    userProfile.allergies || ['Peanuts']
  );
  const [mealGoals, setMealGoals] = useState<string[]>(
    userProfile.meal_goals || ['Reduce produce waste', 'Cook 5 nights a week', 'Save money on groceries']
  );

  // --- 3. NOTIFICATION SETTINGS STATE ---
  const [notifications, setNotifications] = useState<NotificationSettings>(
    userProfile.notification_settings || {
      daily_reminder_enabled: true,
      daily_reminder_time: '09:00',
      dinner_nudge_enabled: true,
      dinner_nudge_time: '18:30',
      grocery_reminder_enabled: true,
      grocery_reminder_day: 'Saturday',
      expiry_alerts_enabled: true,
      email_digest_enabled: false,
      sound_enabled: true
    }
  );

  // --- 4. APP SETTINGS STATE ---
  const config = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(config.supabaseUrl);
  const [supabaseKey, setSupabaseKey] = useState(config.supabaseAnonKey);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [geminiKey, setGeminiKey] = useState(getGeminiApiKey());
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Handlers for User Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      full_name: fullName,
      email,
      phone,
      city,
      avatar_url: avatarUrl,
      household_size: Number(householdSize) || 2,
      cooking_level: cookingLevel
    });
  };

  // Handlers for Dietary Preferences
  const handleSaveDietary = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      dietary_preference: dietary,
      spice_tolerance: spiceTolerance,
      favorite_cuisines: selectedCuisines,
      allergies: selectedAllergies,
      meal_goals: mealGoals
    });
  };

  const toggleCuisine = (c: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const toggleAllergy = (a: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(a) ? prev.filter((item) => item !== a) : [...prev, a]
    );
  };

  const toggleGoal = (g: string) => {
    setMealGoals((prev) =>
      prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g]
    );
  };

  // Handlers for Notifications
  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      notification_settings: notifications
    });
    showToast('Notification reminder schedule updated', 'success');
  };

  const handleTestNotification = () => {
    showToast(
      `🔔 [Kitchen Reminder]: Check your kitchen! You have ingredients needing attention today.`,
      'info'
    );
  };

  // Handlers for App Settings (Supabase & AI)
  const handleSaveSupabase = () => {
    if (supabaseUrl) localStorage.setItem('etc_supabase_url', supabaseUrl.trim());
    else localStorage.removeItem('etc_supabase_url');

    if (supabaseKey) localStorage.setItem('etc_supabase_key', supabaseKey.trim());
    else localStorage.removeItem('etc_supabase_key');

    resetSupabaseClient();
    showToast('Supabase credentials saved', 'success');
  };

  const handleTestSupabase = async () => {
    handleSaveSupabase();
    setIsTesting(true);
    setConnectionStatus(null);
    try {
      const result = await testSupabaseConnection();
      setConnectionStatus({ tested: true, ...result });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveGeminiKey = () => {
    if (geminiKey.trim()) {
      localStorage.setItem('etc_gemini_api_key', geminiKey.trim());
      showToast('Gemini 1.5 Flash API Key saved! Live multimodal vision active.', 'success');
    } else {
      localStorage.removeItem('etc_gemini_api_key');
      showToast('Switched to built-in culinary engine', 'info');
    }
  };

  const handleExportData = () => {
    const data = {
      profile: userProfile,
      inventory,
      consumptionLogs,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kitchen-companion-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Kitchen inventory and profile exported successfully!', 'success');
  };

  const completeSchemaSql = `-- KITCHEN COMPANION - SUPABASE POSTGRESQL SCHEMA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  dietary_preference TEXT DEFAULT 'Vegetarian',
  household_size INT DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kitchen_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS public.grocery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'units',
  category TEXT NOT NULL DEFAULT 'Vegetables',
  is_purchased BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.consumption_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

ALTER TABLE public.kitchen_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumption_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own inventory" ON public.kitchen_inventory FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NULL);
CREATE POLICY "Users can manage own grocery items" ON public.grocery_items FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NULL);
CREATE POLICY "Users can manage own logs" ON public.consumption_logs FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NULL);
`;

  const handleCopySchema = () => {
    navigator.clipboard.writeText(completeSchemaSql);
    setCopiedSchema(true);
    showToast('Schema SQL copied to clipboard!', 'success');
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const tabs = [
    {
      id: 'profile' as const,
      name: 'User Profile',
      purpose: 'Manage User Information',
      icon: User
    },
    {
      id: 'dietary' as const,
      name: 'Dietary Preferences',
      purpose: 'Manage Food Preferences',
      icon: Heart
    },
    {
      id: 'notifications' as const,
      name: 'Notification Settings',
      purpose: 'Configure Reminders',
      icon: Bell
    },
    {
      id: 'app' as const,
      name: 'App Settings',
      purpose: 'Manage Application Preferences',
      icon: SettingsIcon
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-editorial text-3xl md:text-4xl text-ink-primary font-normal leading-tight">
            Profile & Settings
          </h2>
          <p className="text-xs md:text-sm text-ink-secondary mt-1">
            Manage your personal profile, culinary preferences, reminders, and database connections.
          </p>
        </div>

        <button
          onClick={() => navigate('/onboarding')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-cream-100 text-ink-primary border border-ink-border text-xs font-semibold shadow-soft transition self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-sage-800" />
          <span>Replay Onboarding Tour</span>
        </button>
      </div>

      {/* Primary Navigation Tabs with explicit Screen & Purpose labels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-sage-800 text-white border-sage-800 shadow-soft'
                  : 'bg-white text-ink-primary border-cream-300 hover:border-sage-300 hover:bg-cream-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${isActive ? 'text-cream-100' : 'text-sage-800'}`} />
                {isActive && <span className="w-2 h-2 rounded-full bg-cream-100 animate-pulse" />}
              </div>
              <div>
                <span className="font-semibold text-xs md:text-sm block leading-tight">{tab.name}</span>
                <span className={`text-[11px] block mt-1 line-clamp-1 ${isActive ? 'text-cream-200' : 'text-ink-secondary'}`}>
                  {tab.purpose}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. SCREEN: USER PROFILE (Purpose: Manage User Information)               */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-soft space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-cream-200">
            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800">
                User Profile
              </span>
              <h3 className="font-editorial text-2xl text-ink-primary font-normal mt-1">
                Manage User Information
              </h3>
              <p className="text-xs text-ink-secondary mt-0.5">
                Personal details, cooking identity, and household management.
              </p>
            </div>

            <button
              onClick={async () => {
                await signOut();
                navigate('/');
              }}
              className="flex items-center gap-1.5 text-xs text-tomato-600 hover:text-tomato-700 bg-tomato-50 hover:bg-tomato-100 px-3 py-1.5 rounded-xl border border-tomato-200 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch / Sign Out</span>
            </button>
          </div>

          {/* Avatar Selector */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-cream-50/70 border border-cream-200">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-sage-600 shadow-soft"
              />
              <span className="absolute -bottom-1 -right-1 bg-sage-800 text-white p-1 rounded-full shadow-xs">
                <Camera className="w-3 h-3" />
              </span>
            </div>

            <div className="space-y-1.5 text-center sm:text-left">
              <h4 className="font-semibold text-xs text-ink-primary">Choose Profile Avatar</h4>
              <p className="text-[11px] text-ink-secondary">Select from mindful chef presets:</p>
              <div className="flex gap-2 pt-1 justify-center sm:justify-start">
                {AVATAR_PRESETS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition ${
                      avatarUrl === url ? 'border-sage-800 ring-2 ring-sage-400' : 'border-cream-300 opacity-70'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs md:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-ink-primary mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sage-700" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-cream-50 focus:ring-2 focus:ring-sage-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-ink-primary mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sage-700" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-cream-50 focus:ring-2 focus:ring-sage-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-ink-primary mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-sage-700" />
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-cream-50 focus:ring-2 focus:ring-sage-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-ink-primary mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sage-700" />
                  Location / Household Context
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bengaluru, India"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-cream-50 focus:ring-2 focus:ring-sage-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-ink-primary mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sage-700" />
                  Household Size
                </label>
                <select
                  value={householdSize}
                  onChange={(e) => setHouseholdSize(parseInt(e.target.value) || 2)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-cream-50 focus:ring-2 focus:ring-sage-400 focus:outline-none"
                >
                  <option value="1">1 Person (Living Independently)</option>
                  <option value="2">2 People (Roommates / Couple)</option>
                  <option value="3">3 People</option>
                  <option value="4">4 People</option>
                  <option value="5">5+ People</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-ink-primary mb-1 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-sage-700" />
                  Cooking Persona / Skill
                </label>
                <select
                  value={cookingLevel}
                  onChange={(e) => setCookingLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-cream-50 focus:ring-2 focus:ring-sage-400 focus:outline-none"
                >
                  <option value="Beginner">Beginner (Prefers simple 1-pot recipes)</option>
                  <option value="Home Cook">Home Cook (Cooks traditional everyday meals)</option>
                  <option value="Passionate Chef">Passionate Chef (Loves experimenting)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-sage-800 hover:bg-sage-700 text-white font-semibold text-xs md:text-sm shadow-soft transition"
              >
                Save User Profile
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. SCREEN: DIETARY PREFERENCES (Purpose: Manage Food Preferences)        */}
      {/* ========================================================================= */}
      {activeTab === 'dietary' && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-soft space-y-6 animate-in fade-in duration-200">
          <div className="pb-4 border-b border-cream-200">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800">
              Dietary Preferences
            </span>
            <h3 className="font-editorial text-2xl text-ink-primary font-normal mt-1">
              Manage Food Preferences
            </h3>
            <p className="text-xs text-ink-secondary mt-0.5">
              Customize cuisines, dietary restrictions, and spice levels used by the AI Chef.
            </p>
          </div>

          <form onSubmit={handleSaveDietary} className="space-y-6 text-xs md:text-sm">
            {/* Primary Dietary Type */}
            <div>
              <label className="block font-medium text-ink-primary mb-2 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-tomato-500" />
                Primary Dietary Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {['Vegetarian', 'Vegan', 'Eggetarian', 'Non-Veg', 'Jain'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setDietary(option)}
                    className={`p-3 rounded-xl border text-xs font-medium text-center transition ${
                      dietary === option
                        ? 'bg-sage-800 text-white border-sage-800 shadow-soft font-semibold'
                        : 'bg-cream-50 text-ink-primary border-ink-border hover:bg-cream-100'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Favorite Cuisines */}
            <div>
              <label className="block font-medium text-ink-primary mb-2">
                Preferred Regional & Global Cuisines
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'South Indian',
                  'North Indian',
                  'Indo-Chinese',
                  'Bengali',
                  'Gujarati',
                  'Maharashtrian',
                  'Comfort Indian',
                  'Mediterranean',
                  'Pan-Asian',
                  'Continental'
                ].map((c) => {
                  const isSelected = selectedCuisines.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCuisine(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-sage-800 text-white shadow-soft font-semibold'
                          : 'bg-cream-50 text-ink-primary border border-ink-border hover:bg-cream-100'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-sage-200" />}
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spice Tolerance */}
            <div>
              <label className="block font-medium text-ink-primary mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-tomato-500" />
                Spice Tolerance Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { level: 'Mild', desc: 'Little to no chili heat' },
                  { level: 'Medium', desc: 'Standard home balance' },
                  { level: 'Spicy', desc: 'Noticeable chili kick' },
                  { level: 'Fiery', desc: 'Traditional spicy recipes' }
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setSpiceTolerance(item.level)}
                    className={`p-3 rounded-xl border text-left transition ${
                      spiceTolerance === item.level
                        ? 'bg-sage-800 text-white border-sage-800 shadow-soft'
                        : 'bg-cream-50 text-ink-primary border-ink-border hover:bg-cream-100'
                    }`}
                  >
                    <span className="font-semibold block text-xs">{item.level}</span>
                    <span className={`text-[10px] block mt-0.5 ${spiceTolerance === item.level ? 'text-cream-200' : 'text-ink-secondary'}`}>
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block font-medium text-ink-primary mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sage-700" />
                Allergies & Ingredients to Avoid
              </label>
              <div className="flex flex-wrap gap-2">
                {['Peanuts', 'Tree Nuts', 'Dairy / Lactose', 'Gluten', 'Soy', 'Shellfish', 'Eggs'].map((a) => {
                  const isSelected = selectedAllergies.includes(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAllergy(a)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                        isSelected
                          ? 'bg-tomato-700 text-white shadow-soft font-semibold'
                          : 'bg-cream-50 text-ink-primary border border-ink-border hover:bg-cream-100'
                      }`}
                    >
                      {isSelected ? `Avoid: ${a}` : a}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Household Goals */}
            <div>
              <label className="block font-medium text-ink-primary mb-2">
                Mindful Kitchen Goals
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  'Reduce produce waste',
                  'Cook 5 nights a week',
                  'Save money on groceries',
                  'Eat more whole grains',
                  'Cook quick 20-min meals',
                  'Avoid duplicate purchases'
                ].map((goal) => {
                  const isSelected = mealGoals.includes(goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`p-3 rounded-xl border text-xs text-left transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-sage-50 border-sage-500 text-sage-900 font-semibold'
                          : 'bg-cream-50 border-ink-border text-ink-secondary hover:bg-cream-100'
                      }`}
                    >
                      <span>{goal}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sage-700" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-sage-800 hover:bg-sage-700 text-white font-semibold text-xs md:text-sm shadow-soft transition"
              >
                Save Dietary Preferences
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. SCREEN: NOTIFICATION SETTINGS (Purpose: Configure Reminders)          */}
      {/* ========================================================================= */}
      {activeTab === 'notifications' && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-soft space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cream-200">
            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800">
                Notification Settings
              </span>
              <h3 className="font-editorial text-2xl text-ink-primary font-normal mt-1">
                Configure Reminders
              </h3>
              <p className="text-xs text-ink-secondary mt-0.5">
                Set up gentle nudges to check expiring food and dinner ideas.
              </p>
            </div>

            <button
              onClick={handleTestNotification}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-ink-primary text-xs font-medium border border-ink-border transition self-start sm:self-auto"
            >
              <Bell className="w-3.5 h-3.5 text-sage-800" />
              <span>Send Test Reminder</span>
            </button>
          </div>

          <form onSubmit={handleSaveNotifications} className="space-y-4 text-xs md:text-sm">
            {/* Reminder 1: Daily Expiry Check */}
            <div className="p-4 rounded-2xl bg-cream-50/70 border border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-semibold text-ink-primary block">
                  Morning Freshness Check-In
                </span>
                <p className="text-xs text-ink-secondary">
                  Notifies you about ingredients requiring immediate attention ("Use First").
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={notifications.daily_reminder_time}
                  onChange={(e) =>
                    setNotifications({ ...notifications, daily_reminder_time: e.target.value })
                  }
                  className="px-2.5 py-1.5 rounded-lg border border-ink-border bg-white text-xs font-mono"
                />
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.daily_reminder_enabled}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        daily_reminder_enabled: e.target.checked
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-cream-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage-800"></div>
                </label>
              </div>
            </div>

            {/* Reminder 2: Evening Dinner Nudge */}
            <div className="p-4 rounded-2xl bg-cream-50/70 border border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-semibold text-ink-primary block">
                  Evening "What to Cook Tonight" Nudge
                </span>
                <p className="text-xs text-ink-secondary">
                  Suggests recipes based on what's already waiting in your kitchen.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={notifications.dinner_nudge_time}
                  onChange={(e) =>
                    setNotifications({ ...notifications, dinner_nudge_time: e.target.value })
                  }
                  className="px-2.5 py-1.5 rounded-lg border border-ink-border bg-white text-xs font-mono"
                />
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.dinner_nudge_enabled}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        dinner_nudge_enabled: e.target.checked
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-cream-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage-800"></div>
                </label>
              </div>
            </div>

            {/* Reminder 3: Weekend Grocery List Alert */}
            <div className="p-4 rounded-2xl bg-cream-50/70 border border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-semibold text-ink-primary block">
                  Smart Grocery Day Check
                </span>
                <p className="text-xs text-ink-secondary">
                  Reminds you to check inventory before grocery shopping to avoid duplicates.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={notifications.grocery_reminder_day}
                  onChange={(e) =>
                    setNotifications({ ...notifications, grocery_reminder_day: e.target.value })
                  }
                  className="px-2.5 py-1.5 rounded-lg border border-ink-border bg-white text-xs"
                >
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                  <option value="Monday">Monday</option>
                </select>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.grocery_reminder_enabled}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        grocery_reminder_enabled: e.target.checked
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-cream-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage-800"></div>
                </label>
              </div>
            </div>

            {/* Reminder 4: Audio & Digest */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-cream-50/70 border border-cream-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-ink-primary block text-xs">
                    In-App Audio Feedback
                  </span>
                  <span className="text-[11px] text-ink-secondary">
                    Pleasant sound when ingredients are consumed
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.sound_enabled}
                  onChange={(e) =>
                    setNotifications({ ...notifications, sound_enabled: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-sage-800 border-ink-border focus:ring-sage-400"
                />
              </div>

              <div className="p-4 rounded-2xl bg-cream-50/70 border border-cream-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-ink-primary block text-xs">
                    Weekly Waste & Savings Digest
                  </span>
                  <span className="text-[11px] text-ink-secondary">
                    Weekly summary of food consumed and ₹ saved
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.email_digest_enabled}
                  onChange={(e) =>
                    setNotifications({ ...notifications, email_digest_enabled: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-sage-800 border-ink-border focus:ring-sage-400"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-sage-800 hover:bg-sage-700 text-white font-semibold text-xs md:text-sm shadow-soft transition"
              >
                Save Notification Settings
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. SCREEN: APP SETTINGS (Purpose: Manage Application Preferences)       */}
      {/* ========================================================================= */}
      {activeTab === 'app' && (
        <section className="space-y-6 animate-in fade-in duration-200">
          {/* Supabase PostgreSQL Backend */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-sage-800" />
                <h3 className="font-editorial text-xl text-ink-primary font-normal">
                  Supabase PostgreSQL Backend
                </h3>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                  isSupabaseConfigured()
                    ? 'bg-sage-100 text-sage-800 border-sage-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {isSupabaseConfigured() ? 'Cloud Sync Connected' : 'Local Fallback Storage Active'}
              </span>
            </div>

            <p className="text-xs text-ink-secondary leading-relaxed">
              Kitchen Companion operates with resilient offline-first persistence in browser storage,
              and synchronizes with your cloud Supabase database when configured.
            </p>

            <div className="space-y-3 text-xs md:text-sm">
              <div>
                <label className="block font-medium text-ink-primary mb-1">Supabase Project URL</label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-ink-border bg-cream-50 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-ink-primary mb-1">Supabase Anon Key</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-ink-border bg-cream-50 font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleTestSupabase}
                  disabled={isTesting}
                  className="px-4 py-2 rounded-xl bg-sage-800 hover:bg-sage-700 text-white font-medium text-xs transition shadow-soft disabled:opacity-50"
                >
                  {isTesting ? 'Testing Connection...' : 'Save & Test Supabase Connection'}
                </button>
              </div>

              {connectionStatus && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                    connectionStatus.success
                      ? 'bg-sage-50 border-sage-200 text-sage-900'
                      : 'bg-tomato-50 border-tomato-200 text-tomato-800'
                  }`}
                >
                  {connectionStatus.success ? (
                    <ShieldCheck className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-tomato-500 shrink-0 mt-0.5" />
                  )}
                  <p>{connectionStatus.message}</p>
                </div>
              )}
            </div>

            {/* SQL Schema helper */}
            <div className="pt-4 border-t border-cream-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-ink-primary">
                  PostgreSQL Tables & Row Level Security Schema
                </span>
                <button
                  onClick={handleCopySchema}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cream-200 hover:bg-cream-300 text-ink-primary text-xs font-medium transition"
                >
                  {copiedSchema ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-sage-700" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy SQL Schema</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 bg-cream-100 rounded-xl text-[11px] font-mono text-ink-secondary overflow-x-auto max-h-36 border border-cream-200">
                {completeSchemaSql}
              </pre>
            </div>
          </div>

          {/* AI Configuration (Gemini API) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sage-800" />
                <h3 className="font-editorial text-xl text-ink-primary font-normal">
                  Multimodal AI Configuration (Gemini API)
                </h3>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                  hasGeminiApiKey()
                    ? 'bg-sage-100 text-sage-800 border-sage-300'
                    : 'bg-cream-200 text-ink-secondary border-ink-border'
                }`}
              >
                {hasGeminiApiKey() ? 'Live Gemini Vision Active' : 'Culinary Engine Active'}
              </span>
            </div>

            <p className="text-xs text-ink-secondary leading-relaxed">
              Kitchen Companion supports Google Gemini 1.5 Flash for camera photo ingredient recognition
              and custom AI zero-waste recipes. Obtain a free key at{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sage-800 underline inline-flex items-center gap-0.5 font-medium"
              >
                Google AI Studio <ExternalLink className="w-3 h-3" />
              </a>
              .
            </p>

            <div className="space-y-3 text-xs md:text-sm">
              <div>
                <label className="block font-medium text-ink-primary mb-1">Gemini API Key</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-ink-border bg-cream-50 font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveGeminiKey}
                  className="px-4 py-2 rounded-xl bg-sage-800 hover:bg-sage-700 text-white font-medium text-xs transition shadow-soft"
                >
                  Save AI Key
                </button>
              </div>
            </div>
          </div>

          {/* Data Backup & Reset */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-soft flex flex-col justify-between">
              <div>
                <h4 className="font-editorial text-lg text-ink-primary font-normal mb-1">
                  Export Kitchen Data
                </h4>
                <p className="text-xs text-ink-secondary leading-relaxed mb-4">
                  Download a backup copy of your ingredients, consumption history, and settings as JSON.
                </p>
              </div>
              <button
                onClick={handleExportData}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-xs font-semibold text-ink-primary transition border border-ink-border"
              >
                <Download className="w-3.5 h-3.5 text-sage-800" />
                <span>Export JSON Backup</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-soft flex flex-col justify-between">
              <div>
                <h4 className="font-editorial text-lg text-ink-primary font-normal mb-1">
                  Reset Demo Data
                </h4>
                <p className="text-xs text-ink-secondary leading-relaxed mb-4">
                  Restores fresh sample produce, Bengaluru household recipes, and initial logs.
                </p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Reset all kitchen items, recipes, and preferences to sample data?')) {
                    resetToSampleData();
                  }
                }}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-ink-border hover:bg-cream-100 text-xs font-semibold text-tomato-700 transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-tomato-600" />
                <span>Reset Kitchen Data</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-soft flex flex-col justify-between">
              <div>
                <h4 className="font-editorial text-lg text-ink-primary font-normal mb-1">
                  Replay Onboarding
                </h4>
                <p className="text-xs text-ink-secondary leading-relaxed mb-4">
                  Experience the initial first-time landing splash, feature tour, and kitchen setup.
                </p>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('kc_onboarding_completed');
                  window.location.href = '/';
                }}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-sage-50 border border-sage-200 hover:bg-sage-100 text-xs font-semibold text-sage-900 transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sage-800" />
                <span>Re-run Onboarding Flow</span>
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
