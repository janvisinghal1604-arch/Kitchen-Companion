import React, { useState } from 'react';
import { useKitchen } from '../../context/KitchenContext';
import { Plus, Zap } from 'lucide-react';
import { IngredientCategory } from '../../types';

export const QuickAddBar: React.FC = () => {
  const { addKitchenItem } = useKitchen();
  const [inputVal, setInputVal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = inputVal.trim();
    if (!raw) return;

    setIsSubmitting(true);
    try {
      // Smart text parsing: e.g. "3 Lemons", "500g curd", "Coriander"
      let qty = 1;
      let unit = 'pcs';
      let name = raw;

      const numberMatch = raw.match(/^([\d.]+)\s*([a-zA-Z]*)\s+(.+)$/);
      if (numberMatch) {
        qty = parseFloat(numberMatch[1]) || 1;
        unit = numberMatch[2] || 'pcs';
        name = numberMatch[3];
      } else {
        const simpleQty = raw.match(/^([\d.]+)\s+(.+)$/);
        if (simpleQty) {
          qty = parseFloat(simpleQty[1]) || 1;
          name = simpleQty[2];
        }
      }

      // Default category inference
      let category: IngredientCategory = 'Vegetables';
      const lower = name.toLowerCase();
      if (lower.includes('milk') || lower.includes('paneer') || lower.includes('curd') || lower.includes('cheese') || lower.includes('egg')) {
        category = 'Dairy';
      } else if (lower.includes('apple') || lower.includes('banana') || lower.includes('mango') || lower.includes('fruit')) {
        category = 'Fruits';
      } else if (lower.includes('rice') || lower.includes('atta') || lower.includes('flour') || lower.includes('bread')) {
        category = 'Grains';
      }

      const today = new Date().toISOString().split('T')[0];
      const useBy = new Date();
      useBy.setDate(useBy.getDate() + 5);

      await addKitchenItem({
        custom_name: name.charAt(0).toUpperCase() + name.slice(1),
        quantity: qty,
        unit: unit,
        category,
        storage_location: category === 'Grains' ? 'Pantry' : 'Refrigerator',
        purchase_date: today,
        estimated_use_by: useBy.toISOString().split('T')[0],
        notes: 'Added via Quick Add'
      });

      setInputVal('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleQuickAdd} className="relative w-full">
      <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 pl-3 border border-ink-border shadow-card hover:border-sage-300 transition">
        <Zap className="w-4 h-4 text-sage-600 shrink-0" />
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Quick add: e.g. '3 Lemons' or '250g Paneer'..."
          className="flex-1 bg-transparent border-none text-xs md:text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-0"
        />
        <button
          type="submit"
          disabled={!inputVal.trim() || isSubmitting}
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-sage-800 hover:bg-sage-700 text-white text-xs font-medium transition shadow-soft disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>
    </form>
  );
};
