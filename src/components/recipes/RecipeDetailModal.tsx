import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Recipe } from '../../types';
import { useKitchen } from '../../context/KitchenContext';
import {
  Clock,
  Users,
  Check,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  ChefHat,
  HelpCircle,
  Utensils
} from 'lucide-react';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  isOpen,
  onClose
}) => {
  const { cookRecipe, addMissingToGroceries } = useKitchen();
  const [isCooking, setIsCooking] = useState(false);
  const [isAddingGroceries, setIsAddingGroceries] = useState(false);

  if (!recipe) return null;

  const availableIngredients = recipe.ingredients.filter((i) => i.is_available);
  const missingIngredients = recipe.ingredients.filter((i) => !i.is_available);

  const handleCook = async () => {
    setIsCooking(true);
    try {
      await cookRecipe(recipe);
      onClose();
    } finally {
      setIsCooking(false);
    }
  };

  const handleAddMissing = async () => {
    if (missingIngredients.length === 0) return;
    setIsAddingGroceries(true);
    try {
      await addMissingToGroceries(missingIngredients);
    } finally {
      setIsAddingGroceries(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recipe.name}
      subtitle={`${recipe.cuisine} • ${recipe.preparation_time} mins • Serves ${recipe.servings}`}
      maxWidth="2xl"
    >
      <div className="space-y-6 text-xs md:text-sm">
        {/* Cover image & summary */}
        <div className="relative rounded-2xl overflow-hidden h-52 bg-cream-200">
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
            <div className="text-white">
              <span className="text-xs uppercase tracking-wider font-semibold bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-xs">
                {recipe.cuisine}
              </span>
              <p className="text-xs text-cream-200 mt-2 line-clamp-2 max-w-xl">
                {recipe.description}
              </p>
            </div>
          </div>
        </div>

        {/* Quick metrics bar */}
        <div className="grid grid-cols-3 gap-3 p-3.5 bg-cream-50 rounded-xl border border-cream-200 text-center">
          <div>
            <span className="text-[11px] text-ink-secondary block">Prep Time</span>
            <span className="font-semibold text-ink-primary flex items-center justify-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-sage-700" />
              {recipe.preparation_time} mins
            </span>
          </div>
          <div>
            <span className="text-[11px] text-ink-secondary block">Servings</span>
            <span className="font-semibold text-ink-primary flex items-center justify-center gap-1 mt-0.5">
              <Users className="w-3.5 h-3.5 text-sage-700" />
              {recipe.servings} people
            </span>
          </div>
          <div>
            <span className="text-[11px] text-ink-secondary block">Pantry Match</span>
            <span className="font-semibold text-sage-800 flex items-center justify-center gap-1 mt-0.5">
              <ChefHat className="w-3.5 h-3.5 text-sage-700" />
              {recipe.matchPercentage || 85}%
            </span>
          </div>
        </div>

        {/* Ingredients Breakdown */}
        <div className="space-y-4">
          <h4 className="font-editorial text-lg text-ink-primary font-normal">
            Ingredients Breakdown
          </h4>

          {/* Available in kitchen */}
          <div>
            <span className="text-xs font-semibold text-sage-900 flex items-center gap-1.5 mb-2">
              <Check className="w-3.5 h-3.5 text-sage-700" />
              Already in your kitchen ({availableIngredients.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableIngredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-sage-50/70 border border-sage-200 text-xs"
                >
                  <span className="font-medium text-ink-primary">{ing.ingredient_name}</span>
                  <span className="text-sage-800 font-semibold">
                    {ing.quantity} {ing.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Ingredients */}
          {missingIngredients.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-tomato-700 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-tomato-500" />
                  Missing from kitchen ({missingIngredients.length})
                </span>
                <button
                  onClick={handleAddMissing}
                  disabled={isAddingGroceries}
                  className="inline-flex items-center gap-1 text-xs font-medium text-sage-800 hover:text-sage-900 bg-cream-200 px-2.5 py-1 rounded-lg border border-ink-border hover:bg-cream-300 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-sage-700" />
                  <span>Add Missing to Grocery List</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {missingIngredients.map((ing, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-tomato-50/50 border border-tomato-200 text-xs"
                  >
                    <span className="text-ink-primary">
                      {ing.ingredient_name}
                      {ing.is_optional && (
                        <span className="text-[10px] text-ink-secondary ml-1 italic">(optional)</span>
                      )}
                    </span>
                    <span className="text-ink-secondary">
                      {ing.quantity} {ing.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Substitutions */}
        {recipe.substitutions && recipe.substitutions.length > 0 && (
          <div className="p-3.5 bg-cream-50 rounded-xl border border-cream-200">
            <h5 className="text-xs font-semibold text-ink-primary flex items-center gap-1.5 mb-2">
              <HelpCircle className="w-3.5 h-3.5 text-sage-700" />
              Smart Chef Substitutions
            </h5>
            <ul className="list-disc list-inside space-y-1 text-xs text-ink-secondary">
              {recipe.substitutions.map((sub, idx) => (
                <li key={idx}>{sub}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Step by Step Cooking Instructions */}
        <div className="space-y-3">
          <h4 className="font-editorial text-lg text-ink-primary font-normal">
            Step-by-Step Instructions
          </h4>
          <ol className="space-y-2.5">
            {recipe.instructions.map((step, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-white border border-cream-200 shadow-xs"
              >
                <span className="w-6 h-6 rounded-full bg-sage-800 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs md:text-sm text-ink-primary leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-ink-secondary">
            Done cooking? Mark ingredients as consumed to update your inventory.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-ink-border text-ink-secondary hover:bg-cream-100 transition text-xs flex-1 sm:flex-initial"
            >
              Close
            </button>
            <button
              onClick={handleCook}
              disabled={isCooking}
              className="px-5 py-2 rounded-xl bg-sage-800 hover:bg-sage-700 text-white font-medium transition shadow-soft flex items-center justify-center gap-2 text-xs flex-1 sm:flex-initial disabled:opacity-50"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Mark Used Ingredients as Consumed</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
