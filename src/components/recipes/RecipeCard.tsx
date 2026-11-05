import React from 'react';
import { Recipe } from '../../types';
import { Clock, Users, Check, AlertCircle, ChefHat } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onOpenDetail: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onOpenDetail }) => {
  const availableCount = recipe.ingredients.filter((i) => i.is_available).length;
  const totalCount = recipe.ingredients.length;
  const matchPct = recipe.matchPercentage || Math.round((availableCount / (totalCount || 1)) * 100);
  const missingCount = totalCount - availableCount;

  return (
    <div
      onClick={() => onOpenDetail(recipe)}
      className="group bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Cover Image */}
        <div className="relative h-44 w-full overflow-hidden bg-cream-200">
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Match % Pill */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-xs ${
                matchPct >= 90
                  ? 'bg-sage-800/90 text-white border border-sage-700'
                  : matchPct >= 65
                  ? 'bg-amber-100/95 text-amber-900 border border-amber-300'
                  : 'bg-white/95 text-ink-primary border border-ink-border'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              {matchPct}% Kitchen Match
            </span>
          </div>

          {/* Cuisine Pill */}
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-md">
              {recipe.cuisine}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4">
          <div className="flex items-center gap-3 text-xs text-ink-secondary mb-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sage-700" />
              {recipe.preparation_time} mins
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-sage-700" />
              {recipe.servings} servings
            </span>
          </div>

          <h4 className="font-editorial text-xl text-ink-primary font-normal leading-snug line-clamp-1 group-hover:text-sage-800 transition-colors mb-2">
            {recipe.name}
          </h4>

          <p className="text-xs text-ink-secondary line-clamp-2 leading-relaxed mb-3">
            {recipe.description}
          </p>

          {/* Ingredient Match preview pills */}
          <div className="space-y-1.5 pt-2 border-t border-cream-200 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-sage-800 font-medium flex items-center gap-1">
                <Check className="w-3 h-3 text-sage-600" />
                {availableCount} items in your kitchen
              </span>
              {missingCount > 0 ? (
                <span className="text-tomato-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {missingCount} missing
                </span>
              ) : (
                <span className="text-sage-700 font-semibold">100% available!</span>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-cream-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  matchPct >= 90 ? 'bg-sage-600' : matchPct >= 65 ? 'bg-amber-500' : 'bg-tomato-500'
                }`}
                style={{ width: `${matchPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-cream-50/80 border-t border-cream-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(recipe);
          }}
          className="w-full py-2 px-3 rounded-xl bg-white hover:bg-sage-50 text-sage-900 border border-ink-border/60 text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs"
        >
          <span>View Recipe & Instructions</span>
        </button>
      </div>
    </div>
  );
};
