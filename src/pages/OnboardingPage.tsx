import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKitchen } from '../context/KitchenContext';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { KitchenItem, IngredientCategory, StorageLocation } from '../types';
import {
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Refrigerator,
  UtensilsCrossed,
  ShoppingBag,
  Heart,
  Users,
  Flame,
  ShieldCheck,
  Mail,
  Lock,
  User,
  AlertTriangle
} from 'lucide-react';

// Brand icons (inline SVG to avoid extra dependencies)
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

interface QuickStarterIngredient {
  name: string;
  category: IngredientCategory;
  quantity: number;
  unit: string;
  storage: StorageLocation;
  daysFresh: number;
  imageUrl: string;
  selected: boolean;
}

const STARTER_INGREDIENTS: QuickStarterIngredient[] = [
  {
    name: 'Ripe Tomatoes',
    category: 'Vegetables',
    quantity: 4,
    unit: 'pcs',
    storage: 'Countertop',
    daysFresh: 3,
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80',
    selected: true
  },
  {
    name: 'Red Onions',
    category: 'Vegetables',
    quantity: 1,
    unit: 'kg',
    storage: 'Pantry',
    daysFresh: 14,
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=200&auto=format&fit=crop&q=80',
    selected: true
  },
  {
    name: 'Curd / Plain Dahi',
    category: 'Dairy',
    quantity: 400,
    unit: 'g',
    storage: 'Refrigerator',
    daysFresh: 4,
    imageUrl: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=200&auto=format&fit=crop&q=80',
    selected: true
  },
  {
    name: 'Fresh Palak (Spinach)',
    category: 'Vegetables',
    quantity: 250,
    unit: 'g',
    storage: 'Refrigerator',
    daysFresh: 2,
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&auto=format&fit=crop&q=80',
    selected: true
  },
  {
    name: 'Malai Paneer',
    category: 'Dairy',
    quantity: 200,
    unit: 'g',
    storage: 'Refrigerator',
    daysFresh: 3,
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&auto=format&fit=crop&q=80',
    selected: false
  },
  {
    name: 'Farm Fresh Eggs',
    category: 'Dairy',
    quantity: 6,
    unit: 'pcs',
    storage: 'Refrigerator',
    daysFresh: 10,
    imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&auto=format&fit=crop&q=80',
    selected: false
  },
  {
    name: 'Ginger & Garlic',
    category: 'Spices',
    quantity: 150,
    unit: 'g',
    storage: 'Refrigerator',
    daysFresh: 20,
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=200&auto=format&fit=crop&q=80',
    selected: true
  },
  {
    name: 'Basmati Rice',
    category: 'Grains',
    quantity: 1,
    unit: 'kg',
    storage: 'Pantry',
    daysFresh: 90,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&auto=format&fit=crop&q=80',
    selected: true
  },
  {
    name: 'Shimla Apples',
    category: 'Fruits',
    quantity: 3,
    unit: 'pcs',
    storage: 'Countertop',
    daysFresh: 6,
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&auto=format&fit=crop&q=80',
    selected: false
  },
  {
    name: 'Fresh Coriander',
    category: 'Vegetables',
    quantity: 1,
    unit: 'bunch',
    storage: 'Refrigerator',
    daysFresh: 3,
    imageUrl: 'https://images.unsplash.com/photo-1589135233689-d56d7870f43b?w=200&auto=format&fit=crop&q=80',
    selected: true
  }
];

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, completeOnboarding, showToast, updateUserProfile } = useKitchen();

  // Natural linear progression:
  // 1. Splash Screen: Introduce the app
  // 2. Auth Screen: Login or Sign Up (Optional with 1-click Skip)
  // 3. Onboarding Screens: Introduce key features
  // 4. Personalised screens: Collect optional dietary and meal preferences
  // 5. Kitchen Setup Screen: Guide users to begin adding ingredients
  const [currentStep, setCurrentStep] = useState<'splash' | 'auth' | 'features' | 'personalize' | 'setup'>('splash');
  const [featureIndex, setFeatureIndex] = useState(0);

  // Auth state
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [authFullName, setAuthFullName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Personalization state (starts empty so placeholder shows)
  const [fullName, setFullName] = useState(userProfile.full_name || '');
  const [dietary, setDietary] = useState(userProfile.dietary_preference || 'Vegetarian');
  const [householdSize, setHouseholdSize] = useState(userProfile.household_size || 2);
  const [cookingLevel, setCookingLevel] = useState(userProfile.cooking_level || 'Home Cook');
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(
    userProfile.favorite_cuisines || ['South Indian', 'North Indian', 'Indo-Chinese']
  );
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(userProfile.allergies || []);
  const [spiceTolerance, setSpiceTolerance] = useState(userProfile.spice_tolerance || 'Medium');

  // Kitchen setup state
  const [starterList, setStarterList] = useState<QuickStarterIngredient[]>(STARTER_INGREDIENTS);
  const [isFinishing, setIsFinishing] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);

    const supabase = getSupabase();
    try {
      if (isSupabaseConfigured() && supabase) {
        if (authMode === 'signup') {
          const { error } = await supabase.auth.signUp({
            email: authEmail.trim(),
            password: authPassword,
            options: {
              data: { full_name: authFullName.trim() }
            }
          });
          if (error) throw error;
          if (authFullName.trim()) {
            setFullName(authFullName.trim());
            updateUserProfile({ full_name: authFullName.trim(), email: authEmail.trim() });
          }
          showToast('Account created! Welcome to Kitchen Companion.', 'success');
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: authEmail.trim(),
            password: authPassword
          });
          if (error) throw error;
          const userMeta = data.user?.user_metadata;
          if (userMeta?.full_name) {
            setFullName(userMeta.full_name);
            updateUserProfile({ full_name: userMeta.full_name, email: authEmail.trim() });
          }
          showToast('Welcome back to Kitchen Companion!', 'success');
        }
      } else {
        if (authFullName.trim()) setFullName(authFullName.trim());
        updateUserProfile({
          full_name: authFullName.trim() || 'Mindful Chef',
          email: authEmail.trim() || 'guest@kitchencompanion.app'
        });
        showToast('Signed in successfully (Offline-First Session)', 'info');
      }

      await completeOnboarding({
        full_name: authFullName.trim() || fullName,
        dietary_preference: dietary,
        household_size: Number(householdSize) || 2,
        cooking_level: cookingLevel,
        favorite_cuisines: selectedCuisines,
        allergies: selectedAllergies,
        spice_tolerance: spiceTolerance
      });
      navigate('/');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    if (!isSupabaseConfigured()) {
      showToast('OAuth requires Supabase configuration', 'warning');
      return;
    }
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin }
      });
    } catch (err: any) {
      showToast(err.message || 'OAuth login failed', 'error');
    }
  };

  const features = [
    {
      title: 'Mindful Kitchen Awareness',
      headline: 'Know what you already have.',
      description:
        'Easily track ingredients across your refrigerator, pantry, and countertop. Never lose produce to the back of the crisper drawer again.',
      icon: Refrigerator,
      color: 'bg-sage-100 text-sage-800'
    },
    {
      title: 'Visual Freshness Timelines',
      headline: 'Consume before expiration.',
      description:
        'Prioritize ingredients requiring immediate attention with our transparent "Use First" and "Use Soon" freshness timelines.',
      icon: Clock,
      color: 'bg-tomato-100 text-tomato-800'
    },
    {
      title: 'Eat Now: AI Kitchen Chef',
      headline: 'Cook with what is in your kitchen.',
      description:
        'Generate intentional, zero-waste recipes using ingredients you already own. View exact pantry match percentages and chef substitutions.',
      icon: UtensilsCrossed,
      color: 'bg-sage-100 text-sage-800'
    },
    {
      title: 'Anti-Duplicate Smart Groceries',
      headline: 'Never double-buy groceries.',
      description:
        'Whenever you add an ingredient to your grocery list, Kitchen Companion checks your active kitchen inventory and alerts you if you already have it.',
      icon: ShoppingBag,
      color: 'bg-cream-200 text-ink-primary'
    }
  ];

  const cuisineOptions = [
    'South Indian',
    'North Indian',
    'Indo-Chinese',
    'Bengali',
    'Gujarati',
    'Maharashtrian',
    'Comfort Indian',
    'Mediterranean',
    'Pan-Asian'
  ];

  const allergyOptions = ['Peanuts', 'Dairy / Lactose', 'Gluten', 'Soy', 'Shellfish', 'Eggs', 'None'];

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]
    );
  };

  const toggleAllergy = (allergy: string) => {
    if (allergy === 'None') {
      setSelectedAllergies([]);
      return;
    }
    setSelectedAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev.filter((a) => a !== 'None'), allergy]
    );
  };

  const toggleStarter = (index: number) => {
    setStarterList((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleFinishSetup = async () => {
    setIsFinishing(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const selectedItems = starterList
        .filter((item) => item.selected)
        .map((item) => {
          const useBy = new Date();
          useBy.setDate(useBy.getDate() + item.daysFresh);
          return {
            custom_name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            category: item.category,
            storage_location: item.storage,
            purchase_date: today,
            estimated_use_by: useBy.toISOString().split('T')[0],
            notes: 'Added during Kitchen Setup'
          };
        });

      await completeOnboarding(
        {
          full_name: fullName,
          dietary_preference: dietary,
          household_size: Number(householdSize) || 2,
          cooking_level: cookingLevel,
          favorite_cuisines: selectedCuisines,
          allergies: selectedAllergies,
          spice_tolerance: spiceTolerance
        },
        selectedItems
      );

      navigate('/');
    } finally {
      setIsFinishing(false);
    }
  };

  const handleSkip = async () => {
    await completeOnboarding(
      {
        full_name: fullName,
        dietary_preference: dietary,
        household_size: Number(householdSize) || 2,
        cooking_level: cookingLevel,
        favorite_cuisines: selectedCuisines,
        allergies: selectedAllergies,
        spice_tolerance: spiceTolerance
      },
      undefined,
      true
    );
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-cream-100 text-ink-primary flex flex-col justify-between p-4 sm:p-8 selection:bg-sage-200">
      {/* Top Header with Progress and Top-Right Skip Button */}
      <div className="max-w-2xl w-full mx-auto flex items-center justify-between py-3">
        {currentStep !== 'splash' ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sage-800 text-cream-100 flex items-center justify-center shadow-soft">
              <Clock className="w-4 h-4 text-cream-100" />
            </div>
            <span className="font-editorial text-lg font-normal text-ink-primary">
              Kitchen Companion
            </span>
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          {currentStep !== 'splash' && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-ink-secondary mr-2">
              <span className={currentStep === 'auth' ? 'text-sage-800 font-bold' : ''}>Account</span>
              <span>•</span>
              <span className={currentStep === 'features' ? 'text-sage-800 font-bold' : ''}>Tour</span>
              <span>•</span>
              <span className={currentStep === 'personalize' ? 'text-sage-800 font-bold' : ''}>Preferences</span>
              <span>•</span>
              <span className={currentStep === 'setup' ? 'text-sage-800 font-bold' : ''}>Kitchen</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-2xl w-full mx-auto my-auto py-6">
        {/* ========================================================= */}
        {/* SCREEN 1: SPLASH SCREEN (Introduce the App)               */}
        {/* ========================================================= */}
        {currentStep === 'splash' && (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-500 max-w-lg mx-auto py-12">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-3xl bg-sage-800 text-cream-100 flex items-center justify-center mx-auto shadow-elevated">
                <Clock className="w-12 h-12 text-cream-100" />
              </div>
              <span className="absolute -bottom-2 -right-2 bg-tomato-500 text-white p-2 rounded-full shadow-soft">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-sage-100 text-sage-800 text-xs font-semibold uppercase tracking-wider border border-sage-200">
                Mindful Kitchen Management
              </span>
              <h1 className="font-editorial text-4xl sm:text-5xl text-ink-primary font-normal leading-tight">
                Kitchen Companion
              </h1>
              <p className="font-serif italic text-lg sm:text-xl text-sage-900">
                "Consume with intention. Waste less."
              </p>
            </div>

            <p className="text-sm text-ink-secondary leading-relaxed max-w-md mx-auto">
              Your mindful kitchen companion to manage inventory, prioritize food that needs attention,
              and discover comforting recipes using food you already own.
            </p>

            <div className="pt-4 flex flex-col items-center justify-center gap-3">
              <button
                onClick={() => setCurrentStep('auth')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-sage-800 hover:bg-sage-700 text-white font-medium text-sm transition shadow-elevated flex items-center justify-center gap-2 group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 2: LOGIN / SIGNUP WITH SKIP (Cloud Account)        */}
        {/* ========================================================= */}
        {currentStep === 'auth' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-300 shadow-card animate-in fade-in duration-300 space-y-6 max-w-lg mx-auto">
            <div className="text-center space-y-2">
              <h2 className="font-editorial text-2xl sm:text-3xl text-ink-primary font-normal">
                {authMode === 'login' ? 'Welcome Back' : 'Create Your Kitchen Account'}
              </h2>
              <p className="text-xs sm:text-sm text-ink-secondary">
                {authMode === 'login'
                  ? 'Sign in to access your kitchen inventory and recipes across all devices.'
                  : 'Create an account to sync your kitchen across devices.'}
              </p>
            </div>

            {/* OAuth Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                className="w-full py-2.5 px-4 rounded-xl border border-ink-border hover:bg-cream-50 text-sm font-medium text-ink-primary transition flex items-center justify-center gap-2.5 shadow-soft"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleOAuthLogin('apple')}
                className="w-full py-2.5 px-4 rounded-xl border border-ink-border hover:bg-cream-50 text-sm font-medium text-ink-primary transition flex items-center justify-center gap-2.5 shadow-soft"
              >
                <AppleIcon />
                <span>Continue with Apple</span>
              </button>
              <div className="flex items-center gap-2 my-1">
                <div className="flex-1 h-px bg-cream-200" />
                <span className="text-xs text-ink-secondary">or</span>
                <div className="flex-1 h-px bg-cream-200" />
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-cream-200 text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError('');
                }}
                className={`flex-1 py-2.5 font-medium border-b-2 text-center transition ${
                  authMode === 'signup'
                    ? 'border-sage-800 text-sage-900 font-semibold'
                    : 'border-transparent text-ink-secondary hover:text-ink-primary'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={`flex-1 py-2.5 font-medium border-b-2 text-center transition ${
                  authMode === 'login'
                    ? 'border-sage-800 text-sage-900 font-semibold'
                    : 'border-transparent text-ink-secondary hover:text-ink-primary'
                }`}
              >
                Sign In
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-tomato-50 border border-tomato-200 text-tomato-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-tomato-600" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs sm:text-sm">
              {authMode === 'signup' && (
                <div>
                  <label className="block font-medium text-ink-primary mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sage-700" />
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan or Aditi Rao"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-cream-50 focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block font-medium text-ink-primary mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sage-700" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="e.g. name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-cream-50 focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-ink-primary mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-sage-700" />
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-cream-50 focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full py-3 rounded-xl bg-sage-800 hover:bg-sage-700 text-white font-medium text-sm transition shadow-soft flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAuthLoading ? (
                  <span>Connecting...</span>
                ) : (
                  <>
                    <span>{authMode === 'login' ? 'Sign In to Kitchen' : 'Create Free Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-cream-200 text-center">
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs text-ink-secondary hover:text-ink-primary underline underline-offset-4 transition"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 2: ONBOARDING SCREENS (Introduce Key Features)     */}
        {/* ========================================================= */}
        {currentStep === 'features' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-300 shadow-card animate-in fade-in duration-300">
            {(() => {
              const activeFeature = features[featureIndex];
              const Icon = activeFeature.icon;

              return (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 py-2">
                    <div className="w-20 h-20 rounded-2xl bg-cream-200 flex items-center justify-center text-sage-800 shrink-0 shadow-soft">
                      <Icon className="w-10 h-10" />
                    </div>

                    <div className="text-center sm:text-left space-y-2">
                      <h2 className="font-editorial text-2xl sm:text-3xl text-ink-primary font-normal">
                        {activeFeature.headline}
                      </h2>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-sage-800">
                        {activeFeature.title}
                      </h3>
                      <p className="text-sm text-ink-secondary leading-relaxed pt-1">
                        {activeFeature.description}
                      </p>
                    </div>
                  </div>

                  {/* Feature Progress Dots */}
                  <div className="flex justify-center gap-2 pt-2">
                    {features.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setFeatureIndex(i)}
                        className={`h-2 rounded-full transition-all ${
                          i === featureIndex ? 'w-8 bg-sage-800' : 'w-2 bg-cream-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-cream-200">
                    <button
                      onClick={() => {
                        if (featureIndex > 0) setFeatureIndex(featureIndex - 1);
                        else setCurrentStep('auth');
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-cream-100 transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      onClick={() => {
                        if (featureIndex < features.length - 1) {
                          setFeatureIndex(featureIndex + 1);
                        } else {
                          setCurrentStep('personalize');
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sage-800 hover:bg-sage-700 text-white text-xs sm:text-sm font-medium transition shadow-soft"
                    >
                      <span>
                        {featureIndex === features.length - 1 ? 'Personalize Preferences' : 'Next'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 3: PERSONALISED SCREENS (Dietary & Meal Preferences) */}
        {/* ========================================================= */}
        {currentStep === 'personalize' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-300 shadow-card animate-in fade-in duration-300 space-y-6">
            <div>
              <h2 className="font-editorial text-2xl sm:text-3xl text-ink-primary font-normal">
                Your Dietary & Cooking Preferences
              </h2>
              <p className="text-xs sm:text-sm text-ink-secondary mt-1">
                Kitchen Companion customizes recipe suggestions and grocery alerts to your household.
              </p>
            </div>

            <div className="space-y-5 text-xs sm:text-sm">
              {/* Full Name & Household */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-ink-primary mb-1">Your Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aditi Rao"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-cream-50 focus:outline-none focus:ring-2 focus:ring-sage-400"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-cream-50 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  >
                    <option value="1">1 Person (Solo Living)</option>
                    <option value="2">2 People (Couple / Roommates)</option>
                    <option value="3">3 People</option>
                    <option value="4">4+ People (Family)</option>
                  </select>
                </div>
              </div>

              {/* Dietary Pattern */}
              <div>
                <label className="block font-medium text-ink-primary mb-2 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-tomato-500" />
                  Primary Dietary Preference
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {['Vegetarian', 'Vegan', 'Eggetarian', 'Non-Veg', 'Jain'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setDietary(option)}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-center transition ${
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
                  Favorite Cuisines
                </label>
                <div className="flex flex-wrap gap-2">
                  {cuisineOptions.map((cuisine) => {
                    const isSelected = selectedCuisines.includes(cuisine);
                    return (
                      <button
                        key={cuisine}
                        type="button"
                        onClick={() => toggleCuisine(cuisine)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-sage-800 text-white shadow-soft font-semibold'
                            : 'bg-cream-50 text-ink-primary border border-ink-border hover:bg-cream-100'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-sage-200" />}
                        <span>{cuisine}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Spice Tolerance & Skill Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-ink-primary mb-1 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-tomato-500" />
                    Spice Tolerance
                  </label>
                  <select
                    value={spiceTolerance}
                    onChange={(e) => setSpiceTolerance(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-cream-50 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Medium">Medium</option>
                    <option value="Spicy">Spicy</option>
                    <option value="Fiery">Fiery</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-ink-primary mb-1">
                    Cooking Skill Level
                  </label>
                  <select
                    value={cookingLevel}
                    onChange={(e) => setCookingLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-cream-50 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Home Cook">Home Cook</option>
                    <option value="Passionate Chef">Passionate Chef</option>
                  </select>
                </div>
              </div>

              {/* Allergies / Dislikes */}
              <div>
                <label className="block font-medium text-ink-primary mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sage-700" />
                  Allergies & Intolerances (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {allergyOptions.map((allergy) => {
                    const isSelected = selectedAllergies.includes(allergy);
                    return (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => toggleAllergy(allergy)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                          isSelected
                            ? 'bg-tomato-700 text-white shadow-soft font-semibold'
                            : 'bg-cream-50 text-ink-primary border border-ink-border hover:bg-cream-100'
                        }`}
                      >
                        {allergy}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-cream-200">
              <button
                onClick={() => setCurrentStep('features')}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium text-ink-secondary hover:text-ink-primary transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setCurrentStep('setup')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sage-800 hover:bg-sage-700 text-white text-xs sm:text-sm font-medium transition shadow-soft"
              >
                <span>Continue to Kitchen Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 4: KITCHEN SETUP SCREEN (Guide to add ingredients) */}
        {/* ========================================================= */}
        {currentStep === 'setup' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-300 shadow-card animate-in fade-in duration-300 space-y-6">
            <div>
              <h2 className="font-editorial text-2xl sm:text-3xl text-ink-primary font-normal">
                What do you currently have in your kitchen?
              </h2>
              <p className="text-xs sm:text-sm text-ink-secondary mt-1">
                Select common staples you own to populate your initial inventory so you can start cooking immediately.
              </p>
            </div>

            {/* Quick Starter Ingredient Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {starterList.map((item, idx) => (
                <div
                  key={item.name}
                  onClick={() => toggleStarter(idx)}
                  className={`relative p-3 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center justify-between ${
                    item.selected
                      ? 'bg-sage-50/70 border-sage-400 shadow-soft ring-1 ring-sage-400'
                      : 'bg-cream-50/50 border-ink-border/60 hover:bg-cream-100/70 opacity-70'
                  }`}
                >
                  {/* Selection Checkmark */}
                  <div
                    className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white ${
                      item.selected ? 'bg-sage-800' : 'bg-cream-300 text-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                  </div>

                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover mb-2 shadow-xs"
                  />
                  <h4 className="font-medium text-xs text-ink-primary line-clamp-1">{item.name}</h4>
                  <span className="text-[10px] text-ink-secondary mt-0.5 font-semibold">
                    {item.quantity} {item.unit}
                  </span>
                  <span className="text-[10px] text-sage-700 bg-white/80 px-2 py-0.5 rounded-md mt-1 border border-cream-200">
                    {item.storage}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-cream-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep('personalize')}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium text-ink-secondary hover:text-ink-primary transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  onClick={handleSkip}
                  className="text-xs text-ink-secondary hover:text-ink-primary underline underline-offset-4 hidden sm:inline"
                >
                  Skip & start with empty kitchen
                </button>
              </div>

              <button
                onClick={handleFinishSetup}
                disabled={isFinishing}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-sage-800 hover:bg-sage-700 text-white text-xs sm:text-sm font-semibold transition shadow-elevated disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-cream-200" />
                <span>
                  {isFinishing
                    ? 'Preparing Your Kitchen...'
                    : `Complete Setup & Enter Kitchen (${starterList.filter((i) => i.selected).length} Items)`}
                </span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-2xl w-full mx-auto text-center py-2 text-xs text-ink-secondary">
        Kitchen Companion • Consume with intention. Waste less.
      </footer>
    </div>
  );
};
