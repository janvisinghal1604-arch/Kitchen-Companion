import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  KitchenItem,
  Recipe,
  GroceryItem,
  ConsumptionLog,
  UserProfile,
  NotificationSettings,
  IngredientCategory,
  StorageLocation,
  DuplicateCheckResult,
  ActionType
} from '../types';
import {
  INITIAL_KITCHEN_ITEMS,
  INITIAL_RECIPES,
  INITIAL_GROCERY_ITEMS,
  INITIAL_CONSUMPTION_LOGS
} from '../lib/defaultData';
import { determineFreshnessStatus } from '../lib/freshness';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  daily_reminder_enabled: true,
  daily_reminder_time: '09:00',
  dinner_nudge_enabled: true,
  dinner_nudge_time: '18:30',
  grocery_reminder_enabled: true,
  grocery_reminder_day: 'Saturday',
  expiry_alerts_enabled: true,
  email_digest_enabled: false,
  sound_enabled: true
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'u1',
  full_name: 'Aditi Rao',
  email: 'aditi.rao@example.com',
  phone: '+91 98765 43210',
  city: 'Bengaluru, India',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  dietary_preference: 'Vegetarian',
  household_size: 2,
  cooking_level: 'Home Cook',
  allergies: ['Peanuts'],
  favorite_cuisines: ['South Indian', 'North Indian', 'Indo-Chinese'],
  spice_tolerance: 'Medium',
  staples: ['Curd / Plain Dahi', 'Tomatoes', 'Paneer', 'Coriander'],
  meal_goals: ['Reduce produce waste', 'Cook 5 nights a week', 'Save money on groceries'],
  notification_settings: DEFAULT_NOTIFICATIONS
};

interface KitchenContextType {
  inventory: KitchenItem[];
  recipes: Recipe[];
  groceryItems: GroceryItem[];
  consumptionLogs: ConsumptionLog[];
  userProfile: UserProfile;
  isLoading: boolean;
  isAuthChecking: boolean;
  toasts: Toast[];
  isOnboarded: boolean;
  isGuest: boolean;
  setIsOnboarded: (val: boolean) => void;
  completeOnboarding: (
    prefs: Partial<UserProfile>,
    initialItems?: Omit<KitchenItem, 'id' | 'freshness_status'>[],
    isGuest?: boolean
  ) => Promise<void>;
  signOut: () => Promise<void>;

  // Inventory Actions
  addKitchenItem: (item: Omit<KitchenItem, 'id' | 'freshness_status'>) => Promise<KitchenItem>;
  addMultipleKitchenItems: (items: Omit<KitchenItem, 'id' | 'freshness_status'>[]) => Promise<void>;
  updateKitchenItem: (id: string, updates: Partial<KitchenItem>) => Promise<void>;
  deleteKitchenItem: (id: string) => Promise<void>;
  markAsConsumed: (id: string, quantityToConsume?: number, notes?: string) => Promise<void>;
  markAsDiscarded: (id: string, reason?: string) => Promise<void>;

  // Groceries Actions
  checkGroceryDuplicate: (name: string, quantity: number, unit: string, category: IngredientCategory) => DuplicateCheckResult;
  addGroceryItem: (item: Omit<GroceryItem, 'id'>) => Promise<void>;
  updateGroceryItem: (id: string, updates: Partial<GroceryItem>) => Promise<void>;
  deleteGroceryItem: (id: string) => Promise<void>;
  toggleGroceryPurchased: (id: string) => Promise<void>;
  movePurchasedToInventory: (item: GroceryItem, shelfLifeDays?: number) => Promise<void>;

  // Recipe Actions
  cookRecipe: (recipe: Recipe) => Promise<void>;
  addCustomRecipe: (recipe: Omit<Recipe, 'id'>) => Promise<void>;
  addMissingToGroceries: (ingredients: { ingredient_name: string; quantity: number | string; unit: string }[]) => Promise<void>;

  // Settings / Profile
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  resetToSampleData: () => void;
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;

  // Computed Metrics
  stats: {
    totalItems: number;
    useFirstCount: number;
    useSoonCount: number;
    freshCount: number;
    needsCheckingCount: number;
    totalConsumed: number;
    totalDiscarded: number;
    foodValueSaved: number;
  };
}

const KitchenContext = createContext<KitchenContextType | undefined>(undefined);

export const KitchenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local state with localStorage persistence fallback
  const [inventory, setInventory] = useState<KitchenItem[]>(() => {
    const saved = localStorage.getItem('etc_inventory');
    if (saved) {
      try {
        const parsed: KitchenItem[] = JSON.parse(saved);
        // Refresh dynamic freshness status based on today's date
        return parsed.map((item) => ({
          ...item,
          freshness_status: determineFreshnessStatus(item.estimated_use_by)
        }));
      } catch (e) {
        console.error('Failed to parse inventory from localStorage', e);
      }
    }
    return INITIAL_KITCHEN_ITEMS;
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('etc_recipes');
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });

  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>(() => {
    const saved = localStorage.getItem('etc_groceries');
    return saved ? JSON.parse(saved) : INITIAL_GROCERY_ITEMS;
  });

  const [consumptionLogs, setConsumptionLogs] = useState<ConsumptionLog[]>(() => {
    const saved = localStorage.getItem('etc_consumption_logs');
    return saved ? JSON.parse(saved) : INITIAL_CONSUMPTION_LOGS;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('etc_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          notification_settings: {
            ...DEFAULT_NOTIFICATIONS,
            ...(parsed.notification_settings || {})
          }
        };
      } catch (e) {
        console.error('Failed to parse profile', e);
      }
    }
    return DEFAULT_PROFILE;
  });

  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('kc_onboarding_completed') === 'true';
  });

  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('kc_is_guest') === 'true';
  });

  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // On mount: check for an existing Supabase session.
  // If a valid session exists AND onboarding was not already marked complete,
  // mark the user as onboarded so they land directly on the dashboard.
  // This handles returning authenticated users across browser sessions.
  useEffect(() => {
    const checkSession = async () => {
      if (!isSupabaseConfigured()) {
        setIsAuthChecking(false);
        return;
      }
      const supabase = getSupabase();
      if (!supabase) {
        setIsAuthChecking(false);
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          // Authenticated returning user — ensure they bypass onboarding
          if (localStorage.getItem('kc_onboarding_completed') !== 'true') {
            localStorage.setItem('kc_onboarding_completed', 'true');
            localStorage.removeItem('kc_is_guest');
            setIsGuest(false);
            setIsOnboarded(true);
          }
          // Update profile from session metadata
          const meta = session.user.user_metadata;
          if (meta?.full_name || session.user.email) {
            setUserProfile((prev) => ({
              ...prev,
              full_name: meta?.full_name || prev.full_name,
              email: session.user!.email || prev.email
            }));
          }
        }
      } catch (e) {
        console.warn('Session check failed:', e);
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkSession();

    // Listen for auth state changes (login/logout in other tabs, OAuth callback)
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session && session.user) {
            // User just signed in (including OAuth callback)
            if (localStorage.getItem('kc_onboarding_completed') !== 'true') {
              localStorage.setItem('kc_onboarding_completed', 'true');
              localStorage.removeItem('kc_is_guest');
              setIsGuest(false);
              setIsOnboarded(true);
            }
            const meta = session.user.user_metadata;
            if (meta?.full_name || session.user.email) {
              setUserProfile((prev) => ({
                ...prev,
                full_name: meta?.full_name || prev.full_name,
                email: session.user!.email || prev.email
              }));
            }
          }
        });
        return () => subscription.unsubscribe();
      }
    }
    setIsAuthChecking(false);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('etc_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('etc_recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('etc_groceries', JSON.stringify(groceryItems));
  }, [groceryItems]);

  useEffect(() => {
    localStorage.setItem('etc_consumption_logs', JSON.stringify(consumptionLogs));
  }, [consumptionLogs]);

  useEffect(() => {
    localStorage.setItem('etc_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Toast Helper
  const showToast = (message: string, type: Toast['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync with Supabase on mount if configured
  useEffect(() => {
    const syncFromSupabase = async () => {
      if (!isSupabaseConfigured()) return;
      const supabase = getSupabase();
      if (!supabase) return;

      try {
        setIsLoading(true);
        const { data: invData, error: invErr } = await supabase
          .from('kitchen_inventory')
          .select('*')
          .order('estimated_use_by', { ascending: true });

        if (!invErr && invData && invData.length > 0) {
          setInventory(
            invData.map((item: any) => ({
              ...item,
              freshness_status: determineFreshnessStatus(item.estimated_use_by)
            }))
          );
        }

        const { data: grocData, error: grocErr } = await supabase
          .from('grocery_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (!grocErr && grocData && grocData.length > 0) {
          setGroceryItems(grocData);
        }

        const { data: logData, error: logErr } = await supabase
          .from('consumption_logs')
          .select('*')
          .order('action_date', { ascending: false });

        if (!logErr && logData && logData.length > 0) {
          setConsumptionLogs(logData);
        }
      } catch (err) {
        console.warn('Supabase remote sync skipped or tables empty:', err);
      } finally {
        setIsLoading(false);
      }
    };

    syncFromSupabase();
  }, []);

  // Compute metrics
  const stats = {
    totalItems: inventory.length,
    useFirstCount: inventory.filter((i) => i.freshness_status === 'Use First').length,
    useSoonCount: inventory.filter((i) => i.freshness_status === 'Use Soon').length,
    freshCount: inventory.filter((i) => i.freshness_status === 'Fresh').length,
    needsCheckingCount: inventory.filter((i) => i.freshness_status === 'Needs Checking').length,
    totalConsumed: consumptionLogs.filter((l) => l.action_type === 'consumed').length,
    totalDiscarded: consumptionLogs.filter((l) => l.action_type === 'discarded').length,
    foodValueSaved: consumptionLogs
      .filter((l) => l.action_type === 'consumed')
      .reduce((sum, item) => sum + (Number(item.estimated_value) || 30), 0)
  };

  // 1. Add Kitchen Item
  const addKitchenItem = async (
    item: Omit<KitchenItem, 'id' | 'freshness_status'>
  ): Promise<KitchenItem> => {
    const newItem: KitchenItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      freshness_status: determineFreshnessStatus(item.estimated_use_by),
      created_at: new Date().toISOString()
    };

    setInventory((prev) => [newItem, ...prev]);
    showToast(`Added ${newItem.custom_name} to your kitchen`, 'success');

    // Supabase push if configured
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          await supabase.from('kitchen_inventory').insert([
            {
              custom_name: newItem.custom_name,
              quantity: newItem.quantity,
              unit: newItem.unit,
              category: newItem.category,
              storage_location: newItem.storage_location,
              purchase_date: newItem.purchase_date,
              estimated_use_by: newItem.estimated_use_by,
              freshness_status: newItem.freshness_status,
              notes: newItem.notes,
              image_url: newItem.image_url
            }
          ]);
        } catch (e) {
          console.warn('Supabase insert failed:', e);
        }
      }
    }

    return newItem;
  };

  const addMultipleKitchenItems = async (
    items: Omit<KitchenItem, 'id' | 'freshness_status'>[]
  ): Promise<void> => {
    const newItems: KitchenItem[] = items.map((item, idx) => ({
      ...item,
      id: `item-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      freshness_status: determineFreshnessStatus(item.estimated_use_by),
      created_at: new Date().toISOString()
    }));

    setInventory((prev) => [...newItems, ...prev]);
    showToast(`Added ${newItems.length} ingredients to kitchen!`, 'success');
  };

  // 2. Update Kitchen Item
  const updateKitchenItem = async (id: string, updates: Partial<KitchenItem>) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates, updated_at: new Date().toISOString() };
          if (updates.estimated_use_by) {
            updated.freshness_status = determineFreshnessStatus(updates.estimated_use_by);
          }
          return updated;
        }
        return item;
      })
    );
    showToast('Ingredient updated', 'info');

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          await supabase.from('kitchen_inventory').update(updates).eq('id', id);
        } catch (e) {
          console.warn('Supabase update failed:', e);
        }
      }
    }
  };

  // 3. Delete Kitchen Item
  const deleteKitchenItem = async (id: string) => {
    const item = inventory.find((i) => i.id === id);
    setInventory((prev) => prev.filter((i) => i.id !== id));
    showToast(`Removed ${item?.custom_name || 'item'} from kitchen`, 'info');

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          await supabase.from('kitchen_inventory').delete().eq('id', id);
        } catch (e) {
          console.warn('Supabase delete failed:', e);
        }
      }
    }
  };

  // 4. Mark as Consumed
  const markAsConsumed = async (id: string, quantityToConsume?: number, notes?: string) => {
    const item = inventory.find((i) => i.id === id);
    if (!item) return;

    const qty = quantityToConsume !== undefined ? quantityToConsume : item.quantity;
    const remainingQty = item.quantity - qty;

    // Log consumption
    const newLog: ConsumptionLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      inventory_item_id: item.id,
      ingredient_name: item.custom_name,
      quantity: qty,
      unit: item.unit,
      category: item.category,
      action_type: 'consumed',
      estimated_value: Math.round(qty * 25),
      action_date: new Date().toISOString().split('T')[0],
      notes: notes || 'Cooked & consumed'
    };

    setConsumptionLogs((prev) => [newLog, ...prev]);

    if (remainingQty <= 0) {
      setInventory((prev) => prev.filter((i) => i.id !== id));
    } else {
      setInventory((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: remainingQty } : i))
      );
    }

    showToast(`Delicious! Marked ${item.custom_name} as consumed.`, 'success');
  };

  // 5. Mark as Discarded
  const markAsDiscarded = async (id: string, reason?: string) => {
    const item = inventory.find((i) => i.id === id);
    if (!item) return;

    const newLog: ConsumptionLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      inventory_item_id: item.id,
      ingredient_name: item.custom_name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      action_type: 'discarded',
      estimated_value: Math.round(item.quantity * 25),
      action_date: new Date().toISOString().split('T')[0],
      notes: reason || 'Expired or spoiled'
    };

    setConsumptionLogs((prev) => [newLog, ...prev]);
    setInventory((prev) => prev.filter((i) => i.id !== id));
    showToast(`Logged discarded item for learning and reflection.`, 'info');
  };

  // 6. Check Duplicate Grocery Item against Kitchen Inventory
  const checkGroceryDuplicate = (
    name: string,
    quantity: number,
    unit: string,
    category: IngredientCategory
  ): DuplicateCheckResult => {
    const cleanName = name.trim().toLowerCase();
    const existing = inventory.find(
      (item) =>
        item.custom_name.toLowerCase().includes(cleanName) ||
        cleanName.includes(item.custom_name.toLowerCase())
    );

    return {
      hasDuplicate: Boolean(existing),
      existingItem: existing,
      enteredName: name,
      enteredQuantity: quantity,
      enteredUnit: unit,
      enteredCategory: category
    };
  };

  // 7. Add Grocery Item
  const addGroceryItem = async (item: Omit<GroceryItem, 'id'>) => {
    const newItem: GroceryItem = {
      ...item,
      id: `groc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString()
    };

    setGroceryItems((prev) => [newItem, ...prev]);
    showToast(`Added ${newItem.ingredient_name} to grocery list`, 'success');
  };

  const updateGroceryItem = async (id: string, updates: Partial<GroceryItem>) => {
    setGroceryItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deleteGroceryItem = async (id: string) => {
    setGroceryItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Grocery item removed', 'info');
  };

  const toggleGroceryPurchased = async (id: string) => {
    setGroceryItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_purchased: !item.is_purchased } : item
      )
    );
  };

  const movePurchasedToInventory = async (item: GroceryItem, shelfLifeDays: number = 7) => {
    const today = new Date();
    const useBy = new Date(today);
    useBy.setDate(useBy.getDate() + shelfLifeDays);

    await addKitchenItem({
      custom_name: item.ingredient_name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      storage_location: item.category === 'Vegetables' || item.category === 'Dairy' ? 'Refrigerator' : 'Pantry',
      purchase_date: today.toISOString().split('T')[0],
      estimated_use_by: useBy.toISOString().split('T')[0],
      notes: 'Added from completed grocery shopping'
    });

    // Remove from grocery list
    setGroceryItems((prev) => prev.filter((g) => g.id !== item.id));
  };

  // 8. Recipe Actions
  const cookRecipe = async (recipe: Recipe) => {
    let consumedCount = 0;
    for (const ing of recipe.ingredients) {
      if (ing.is_available) {
        const match = inventory.find(
          (inv) =>
            inv.custom_name.toLowerCase().includes(ing.ingredient_name.toLowerCase()) ||
            ing.ingredient_name.toLowerCase().includes(inv.custom_name.toLowerCase())
        );

        if (match) {
          const qty = typeof ing.quantity === 'number' ? ing.quantity : 1;
          await markAsConsumed(match.id, Math.min(match.quantity, qty), `Cooked in ${recipe.name}`);
          consumedCount++;
        }
      }
    }

    showToast(`Bon appétit! Cooked ${recipe.name}. Updated ${consumedCount} kitchen ingredients!`, 'success');
  };

  const addCustomRecipe = async (recipe: Omit<Recipe, 'id'>) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: `custom-recipe-${Date.now()}`
    };
    setRecipes((prev) => [newRecipe, ...prev]);
    showToast(`Saved recipe: ${recipe.name}`, 'success');
  };

  const addMissingToGroceries = async (
    ingredients: { ingredient_name: string; quantity: number | string; unit: string }[]
  ) => {
    const newItems: GroceryItem[] = ingredients.map((ing) => ({
      id: `groc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ingredient_name: ing.ingredient_name,
      quantity: typeof ing.quantity === 'number' ? ing.quantity : 1,
      unit: ing.unit || 'units',
      category: 'Vegetables',
      is_purchased: false,
      created_at: new Date().toISOString()
    }));

    setGroceryItems((prev) => [...newItems, ...prev]);
    showToast(`Added ${ingredients.length} missing items to grocery list!`, 'success');
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
    showToast('Profile updated', 'success');
  };

  const completeOnboarding = async (
    prefs: Partial<UserProfile>,
    initialItems?: Omit<KitchenItem, 'id' | 'freshness_status'>[],
    isGuestUser: boolean = false
  ) => {
    setUserProfile((prev) => ({ ...prev, ...prefs }));
    if (initialItems && initialItems.length > 0) {
      await addMultipleKitchenItems(initialItems);
    }
    localStorage.setItem('kc_onboarding_completed', 'true');
    if (isGuestUser) {
      localStorage.setItem('kc_is_guest', 'true');
      setIsGuest(true);
    } else {
      localStorage.removeItem('kc_is_guest');
      setIsGuest(false);
    }
    setIsOnboarded(true);
    showToast('Welcome to Kitchen Companion! Your kitchen is ready.', 'success');
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.warn('Supabase signOut failed:', e);
        }
      }
    }
    localStorage.setItem('kc_onboarding_completed', 'false');
    localStorage.removeItem('kc_is_guest');
    setIsGuest(false);
    setIsOnboarded(false);
  };

  const resetToSampleData = () => {
    setInventory(INITIAL_KITCHEN_ITEMS);
    setRecipes(INITIAL_RECIPES);
    setGroceryItems(INITIAL_GROCERY_ITEMS);
    setConsumptionLogs(INITIAL_CONSUMPTION_LOGS);
    setUserProfile(DEFAULT_PROFILE);
    localStorage.removeItem('etc_inventory');
    localStorage.removeItem('etc_recipes');
    localStorage.removeItem('etc_groceries');
    localStorage.removeItem('etc_consumption_logs');
    localStorage.removeItem('etc_user_profile');
    showToast('Reset to Kitchen Companion starter data!', 'info');
  };

  return (
    <KitchenContext.Provider
      value={{
        inventory,
        recipes,
        groceryItems,
        consumptionLogs,
        userProfile,
        isLoading,
        isAuthChecking,
        toasts,
        isOnboarded,
        isGuest,
        setIsOnboarded,
        completeOnboarding,
        signOut,
        addKitchenItem,
        addMultipleKitchenItems,
        updateKitchenItem,
        deleteKitchenItem,
        markAsConsumed,
        markAsDiscarded,
        checkGroceryDuplicate,
        addGroceryItem,
        updateGroceryItem,
        deleteGroceryItem,
        toggleGroceryPurchased,
        movePurchasedToInventory,
        cookRecipe,
        addCustomRecipe,
        addMissingToGroceries,
        updateUserProfile,
        resetToSampleData,
        showToast,
        removeToast,
        stats
      }}
    >
      {children}
    </KitchenContext.Provider>
  );
};

export const useKitchen = () => {
  const context = useContext(KitchenContext);
  if (!context) {
    throw new Error('useKitchen must be used within a KitchenProvider');
  }
  return context;
};
