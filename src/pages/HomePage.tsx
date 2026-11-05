import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKitchen } from '../context/KitchenContext';
import { IngredientCard } from '../components/inventory/IngredientCard';
import { RecipeCard } from '../components/recipes/RecipeCard';
import { RecipeDetailModal } from '../components/recipes/RecipeDetailModal';
import { IngredientFormModal } from '../components/inventory/IngredientFormModal';
import { ScanGroceriesModal } from '../components/inventory/ScanGroceriesModal';
import { QuickAddBar } from '../components/inventory/QuickAddBar';
import { Recipe, KitchenItem } from '../types';
import {
  Clock,
  Sparkles,
  Plus,
  ShoppingBag,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ChefHat,
  Leaf,
  Compass
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { inventory, recipes, stats, userProfile, isOnboarded } = useKitchen();

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editingItem, setEditingItem] = useState<KitchenItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  // Prioritize "Use First" items, then "Use Soon"
  const useFirstItems = inventory.filter((i) => i.freshness_status === 'Use First');
  const useSoonItems = inventory.filter((i) => i.freshness_status === 'Use Soon');
  const prioritizedItems = useFirstItems.length > 0 ? useFirstItems : useSoonItems.slice(0, 4);

  // Recommend recipes that use available ingredients and prioritize expiring ones
  const recommendedRecipes = recipes.slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Onboarding Banner if not completed */}
      {!isOnboarded && (
        <div className="bg-sage-800 text-white p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-elevated">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sage-700 text-cream-100 shrink-0">
              <Compass className="w-6 h-6 text-cream-100" />
            </div>
            <div>
              <p className="font-editorial text-xl font-normal text-cream-50">
                Welcome to Kitchen Companion!
              </p>
              <p className="text-xs text-cream-200 mt-0.5 leading-relaxed">
                Take our 2-minute setup tour to personalize dietary preferences & add your kitchen staples.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/onboarding')}
            className="w-full sm:w-auto px-5 py-2.5 bg-cream-100 hover:bg-cream-200 text-sage-900 rounded-xl text-xs font-semibold shrink-0 transition shadow-soft flex items-center justify-center gap-1.5"
          >
            <span>Start Setup Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SECTION A: Greeting & Contextual Header */}
      <section className="bg-gradient-to-r from-cream-200/80 via-cream-100 to-sage-50 rounded-3xl p-6 md:p-8 border border-cream-300 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sage-800 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
            <h2 className="font-editorial text-3xl md:text-4xl text-ink-primary font-normal leading-tight">
              {userProfile.full_name?.trim()
                ? `${getGreeting()}, ${userProfile.full_name.trim().split(' ')[0]}!`
                : `${getGreeting()}!`}
            </h2>
            <p className="text-sm md:text-base text-ink-secondary mt-2 leading-relaxed">
              Let's make the most of what you have. Instead of buying more groceries, your kitchen is
              ready for mindful meals today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsScanOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-cream-50 text-ink-primary text-xs md:text-sm font-semibold border border-ink-border shadow-soft transition"
            >
              <Sparkles className="w-4 h-4 text-sage-700" />
              <span>Scan Produce</span>
            </button>
            <button
              onClick={() => navigate('/eat-now')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sage-800 hover:bg-sage-700 text-white text-xs md:text-sm font-medium shadow-soft transition"
            >
              <ChefHat className="w-4 h-4 text-cream-200" />
              <span>Cook from Kitchen</span>
            </button>
          </div>
        </div>

        {/* Inline Quick Add Bar */}
        <div className="mt-6 pt-5 border-t border-cream-300/80 max-w-xl">
          <label className="block text-xs font-semibold text-ink-secondary mb-2">
            Add an ingredient to your kitchen in seconds:
          </label>
          <QuickAddBar />
        </div>
      </section>

      {/* SECTION B: Kitchen Overview Metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div
          onClick={() => navigate('/kitchen')}
          className="bg-white rounded-2xl p-4 md:p-5 border border-cream-300 shadow-soft cursor-pointer hover:border-sage-300 transition"
        >
          <span className="text-xs font-medium text-ink-secondary block">Total Ingredients</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-editorial text-3xl text-ink-primary">{stats.totalItems}</span>
            <span className="text-xs text-ink-secondary">items</span>
          </div>
          <span className="text-[11px] text-sage-800 mt-2 block font-medium">In your kitchen</span>
        </div>

        <div
          onClick={() => navigate('/kitchen')}
          className={`rounded-2xl p-4 md:p-5 border shadow-soft cursor-pointer transition ${
            stats.useFirstCount > 0
              ? 'bg-tomato-50/80 border-tomato-200 hover:border-tomato-300'
              : 'bg-white border-cream-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-tomato-800">Needs Attention</span>
            {stats.useFirstCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-tomato-500 animate-ping" />
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-editorial text-3xl text-tomato-700">{stats.useFirstCount}</span>
            <span className="text-xs text-tomato-700">use first</span>
          </div>
          <span className="text-[11px] text-tomato-700 mt-2 block font-medium">
            Expiring today or overdue
          </span>
        </div>

        <div
          onClick={() => navigate('/kitchen')}
          className="bg-white rounded-2xl p-4 md:p-5 border border-cream-300 shadow-soft cursor-pointer hover:border-sage-300 transition"
        >
          <span className="text-xs font-medium text-amber-800 block">Use Soon</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-editorial text-3xl text-amber-800">{stats.useSoonCount}</span>
            <span className="text-xs text-amber-700">next 2-4 days</span>
          </div>
          <span className="text-[11px] text-ink-secondary mt-2 block">Plan upcoming meals</span>
        </div>

        <div
          onClick={() => navigate('/kitchen')}
          className="bg-white rounded-2xl p-4 md:p-5 border border-cream-300 shadow-soft cursor-pointer hover:border-sage-300 transition"
        >
          <span className="text-xs font-medium text-sage-800 block">Fresh & Stable</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-editorial text-3xl text-sage-800">{stats.freshCount}</span>
            <span className="text-xs text-sage-700">safe</span>
          </div>
          <span className="text-[11px] text-sage-700 mt-2 block font-medium">Good for 5+ days</span>
        </div>
      </section>

      {/* SECTION C: Use These First */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-editorial text-2xl text-ink-primary font-normal">
                Use These First
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-tomato-100 text-tomato-800 border border-tomato-200">
                Priority Attention
              </span>
            </div>
            <p className="text-xs text-ink-secondary mt-0.5">
              Prioritized ingredients nearing their estimated use-by date. Consume or freeze them next.
            </p>
          </div>

          <button
            onClick={() => navigate('/kitchen')}
            className="flex items-center gap-1 text-xs font-semibold text-sage-800 hover:text-sage-900 group"
          >
            <span>View Timeline</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {prioritizedItems.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-cream-300 text-center">
            <CheckCircle2 className="w-8 h-8 text-sage-600 mx-auto mb-2" />
            <h4 className="font-editorial text-lg text-ink-primary">Your kitchen is in great shape!</h4>
            <p className="text-xs text-ink-secondary max-w-sm mx-auto mt-1">
              No ingredients are critically close to expiration right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {prioritizedItems.map((item) => (
              <IngredientCard
                key={item.id}
                item={item}
                onEdit={(itm) => setEditingItem(itm)}
              />
            ))}
          </div>
        )}
      </section>

      {/* SECTION D: What Can You Make Today? */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-editorial text-2xl text-ink-primary font-normal">
                What Can You Make Today?
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800 border border-sage-200">
                Pantry First
              </span>
            </div>
            <p className="text-xs text-ink-secondary mt-0.5">
              Recipes calibrated to your inventory, prioritized to rescue your soonest expiring produce.
            </p>
          </div>

          <button
            onClick={() => navigate('/eat-now')}
            className="flex items-center gap-1 text-xs font-semibold text-sage-800 hover:text-sage-900 group"
          >
            <span>Open AI Chef</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {recommendedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onOpenDetail={(r) => setSelectedRecipe(r)}
            />
          ))}
        </div>
      </section>

      {/* SECTION E: Quick Actions Bar */}
      <section className="bg-white rounded-2xl p-5 border border-cream-300 shadow-soft">
        <h4 className="text-xs font-bold text-ink-primary uppercase tracking-wider mb-3">
          Quick Actions
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-cream-50 hover:bg-cream-100 text-ink-primary border border-cream-200 transition text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-cream-200 flex items-center justify-center text-sage-800 mb-2 group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Add Ingredient</span>
            <span className="text-[10px] text-ink-secondary mt-0.5">Manual input</span>
          </button>

          <button
            onClick={() => setIsScanOpen(true)}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-cream-50 hover:bg-cream-100 text-ink-primary border border-cream-200 transition text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center text-sage-800 mb-2 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Scan Groceries</span>
            <span className="text-[10px] text-ink-secondary mt-0.5">AI photo scan</span>
          </button>

          <button
            onClick={() => navigate('/eat-now')}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-cream-50 hover:bg-cream-100 text-ink-primary border border-cream-200 transition text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-cream-200 flex items-center justify-center text-sage-800 mb-2 group-hover:scale-105 transition-transform">
              <ChefHat className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Generate Recipe</span>
            <span className="text-[10px] text-ink-secondary mt-0.5">Custom AI chef</span>
          </button>

          <button
            onClick={() => navigate('/groceries')}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-cream-50 hover:bg-cream-100 text-ink-primary border border-cream-200 transition text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-cream-200 flex items-center justify-center text-sage-800 mb-2 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Smart Groceries</span>
            <span className="text-[10px] text-ink-secondary mt-0.5">Duplicate check</span>
          </button>
        </div>
      </section>

      {/* Modals */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={Boolean(selectedRecipe)}
        onClose={() => setSelectedRecipe(null)}
      />

      <IngredientFormModal
        isOpen={isAddOpen || Boolean(editingItem)}
        onClose={() => {
          setIsAddOpen(false);
          setEditingItem(null);
        }}
        editItem={editingItem}
      />

      <ScanGroceriesModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
      />
    </div>
  );
};
