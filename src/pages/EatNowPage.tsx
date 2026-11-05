import React, { useState, useEffect } from 'react';
import { useKitchen } from '../context/KitchenContext';
import { RecipeCard } from '../components/recipes/RecipeCard';
import { RecipeDetailModal } from '../components/recipes/RecipeDetailModal';
import { Recipe, KitchenItem } from '../types';
import { generateRecipesAI, hasGeminiApiKey } from '../lib/ai';
import {
  Sparkles,
  Clock,
  ChefHat,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Sliders
} from 'lucide-react';

export const EatNowPage: React.FC = () => {
  const { inventory, recipes: defaultRecipes, userProfile, showToast } = useKitchen();

  // Ingredients user selects to prioritize in cooking
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [prepTimeMax, setPrepTimeMax] = useState<number>(30);
  const [cuisine, setCuisine] = useState<string>('All');
  const [dietaryPreference, setDietaryPreference] = useState<string>(
    userProfile.dietary_preference || 'Vegetarian'
  );
  const [complexity, setComplexity] = useState<string>('Quick & Easy');

  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>(defaultRecipes);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLiveAI, setIsLiveAI] = useState(false);

  // Auto pre-select "Use First" and "Use Soon" ingredients
  useEffect(() => {
    const priority = inventory
      .filter((i: KitchenItem) => i.freshness_status === 'Use First' || i.freshness_status === 'Use Soon')
      .map((i: KitchenItem) => i.custom_name);

    if (priority.length > 0) {
      setSelectedIngredients(priority.slice(0, 4));
    } else if (inventory.length > 0) {
      setSelectedIngredients([inventory[0].custom_name]);
    }
  }, [inventory]);

  const toggleIngredient = (name: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleGenerate = async () => {
    if (inventory.length === 0) {
      showToast('Your kitchen is empty. Add ingredients first!', 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateRecipesAI({
        prioritizedIngredients: selectedIngredients,
        allInventory: inventory,
        cuisine,
        dietaryPreference,
        prepTimeMax,
        complexity
      });

      setGeneratedRecipes(result.recipes);
      setIsLiveAI(result.isLiveAI);
      showToast(
        result.isLiveAI
          ? 'Generated fresh mindful recipes with Gemini 1.5 Flash!'
          : 'Generated recipes matching your available kitchen ingredients!',
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to generate recipes', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const cuisinesList = [
    'All',
    'North Indian',
    'South Indian',
    'Indo-Chinese',
    'Bengali',
    'Gujarati',
    'Maharashtrian',
    'Comfort Indian'
  ];

  const dietaryOptions = ['Vegetarian', 'Vegan', 'Eggetarian', 'Non-Veg', 'Jain'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="font-editorial text-3xl md:text-4xl text-ink-primary font-normal leading-tight">
            Eat Now: AI Kitchen Chef
          </h2>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800 border border-sage-200">
            Pantry-First
          </span>
        </div>
        <p className="text-xs md:text-sm text-ink-secondary mt-1">
          "Cook something using what I already have." Prevent food waste by turning expiring ingredients into comforting meals.
        </p>
      </div>

      {/* Main Generator Studio */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-cream-300 shadow-card space-y-6">
        {/* Step 1: Select Ingredients to Prioritize */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
            <div>
              <h3 className="font-editorial text-xl text-ink-primary font-normal">
                1. Select Ingredients to Prioritize
              </h3>
              <p className="text-xs text-ink-secondary">
                We've pre-selected items approaching their estimated use-by date.
              </p>
            </div>
            <span className="text-xs font-semibold text-sage-800">
              {selectedIngredients.length} ingredients prioritized
            </span>
          </div>

          {/* Ingredient Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {inventory.length === 0 ? (
              <p className="text-xs text-ink-secondary italic">No ingredients in kitchen yet.</p>
            ) : (
              inventory.map((item: KitchenItem) => {
                const isSelected = selectedIngredients.includes(item.custom_name);
                const isUrgent = item.freshness_status === 'Use First';

                return (
                  <button
                    key={item.id}
                    onClick={() => toggleIngredient(item.custom_name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      isSelected
                        ? 'bg-sage-800 text-white shadow-soft scale-102 font-semibold'
                        : isUrgent
                        ? 'bg-tomato-50 text-tomato-800 border border-tomato-300 hover:bg-tomato-100'
                        : 'bg-cream-100 text-ink-primary hover:bg-cream-200 border border-ink-border/50'
                    }`}
                  >
                    {isUrgent && !isSelected && (
                      <AlertTriangle className="w-3 h-3 text-tomato-500 shrink-0" />
                    )}
                    <span>{item.custom_name}</span>
                    <span className="text-[10px] opacity-80">
                      ({item.quantity} {item.unit})
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sage-200 ml-0.5" />}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Step 2: Recipe Filters */}
        <div className="pt-4 border-t border-cream-200 space-y-4">
          <h3 className="font-editorial text-xl text-ink-primary font-normal">
            2. Choose Your Cooking Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Max Prep Time */}
            <div>
              <label className="text-xs font-semibold text-ink-primary block mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sage-700" />
                Max Time: {prepTimeMax} minutes
              </label>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={prepTimeMax}
                onChange={(e) => setPrepTimeMax(Number(e.target.value))}
                className="w-full accent-sage-800 h-1.5 bg-cream-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-ink-secondary mt-1">
                <span>10m (Quick)</span>
                <span>30m</span>
                <span>60m (Elaborate)</span>
              </div>
            </div>

            {/* Cuisine */}
            <div>
              <label className="text-xs font-semibold text-ink-primary block mb-1.5">
                Cuisine Style
              </label>
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-cream-50 text-xs focus:ring-2 focus:ring-sage-400 focus:outline-none"
              >
                {cuisinesList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Dietary Preference */}
            <div>
              <label className="text-xs font-semibold text-ink-primary block mb-1.5">
                Dietary Preference
              </label>
              <select
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-cream-50 text-xs focus:ring-2 focus:ring-sage-400 focus:outline-none"
              >
                {dietaryOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Complexity */}
            <div>
              <label className="text-xs font-semibold text-ink-primary block mb-1.5">
                Recipe Complexity
              </label>
              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-cream-50 text-xs focus:ring-2 focus:ring-sage-400 focus:outline-none"
              >
                <option value="Quick & Easy">Quick & Easy (1-pot / skillet)</option>
                <option value="Moderate">Moderate (Traditional home style)</option>
                <option value="Celebratory">Celebratory / Weekend project</option>
              </select>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-cream-200">
          <p className="text-xs text-ink-secondary">
            AI prioritizes ingredients you already have, requiring minimal or zero extra shopping.
          </p>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || inventory.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-sage-800 hover:bg-sage-700 text-white font-medium text-sm transition shadow-elevated disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting Intentional Recipes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cream-200" />
                <span>Generate Recipe Suggestions</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-editorial text-2xl text-ink-primary font-normal">
              Mindful Recipe Recommendations
            </h3>
            <p className="text-xs text-ink-secondary mt-0.5">
              Select a recipe to view step-by-step instructions and mark used items as consumed.
            </p>
          </div>

          <span className="text-xs font-medium text-sage-800 bg-sage-100 px-3 py-1 rounded-full border border-sage-200">
            {generatedRecipes.length} recipes ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {generatedRecipes.map((recipe: Recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onOpenDetail={(r: Recipe) => setSelectedRecipe(r)}
            />
          ))}
        </div>
      </div>

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={Boolean(selectedRecipe)}
        onClose={() => setSelectedRecipe(null)}
      />
    </div>
  );
};
