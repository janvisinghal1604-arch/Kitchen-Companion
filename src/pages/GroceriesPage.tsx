import React, { useState } from 'react';
import { useKitchen } from '../context/KitchenContext';
import { GroceryItem, IngredientCategory, DuplicateCheckResult } from '../types';
import { DuplicateAlertModal } from '../components/groceries/DuplicateAlertModal';
import { CurrentInventoryDrawer } from '../components/groceries/CurrentInventoryDrawer';
import { EmptyState } from '../components/common/EmptyState';
import {
  ShoppingBag,
  Plus,
  Check,
  Trash2,
  Refrigerator,
  ArrowRight,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const GroceriesPage: React.FC = () => {
  const {
    groceryItems,
    addGroceryItem,
    updateGroceryItem,
    deleteGroceryItem,
    toggleGroceryPurchased,
    movePurchasedToInventory,
    checkGroceryDuplicate
  } = useKitchen();

  // Form State
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('pcs');
  const [category, setCategory] = useState<IngredientCategory>('Vegetables');

  // Modals & Drawers
  const [duplicateResult, setDuplicateResult] = useState<DuplicateCheckResult | null>(null);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const categories: IngredientCategory[] = [
    'Vegetables',
    'Fruits',
    'Dairy',
    'Grains',
    'Pulses',
    'Spices',
    'Bakery',
    'Packaged Food',
    'Others'
  ];

  // Submission with Smart Duplicate Check
  const handleAddAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Check inventory for duplicate
    const check = checkGroceryDuplicate(name.trim(), Number(quantity) || 1, unit, category);

    if (check.hasDuplicate) {
      setDuplicateResult(check);
      setIsDuplicateModalOpen(true);
    } else {
      executeAdd(name.trim(), Number(quantity) || 1, unit, category);
    }
  };

  const executeAdd = (
    finalName: string,
    finalQty: number,
    finalUnit: string,
    finalCategory: IngredientCategory
  ) => {
    addGroceryItem({
      ingredient_name: finalName,
      quantity: finalQty,
      unit: finalUnit,
      category: finalCategory,
      is_purchased: false
    });
    setName('');
    setQuantity(1);
  };

  // Group items by category
  const activeItems = groceryItems.filter((i: GroceryItem) => !i.is_purchased);
  const purchasedItems = groceryItems.filter((i: GroceryItem) => i.is_purchased);

  const groupedActive: Record<string, GroceryItem[]> = {};
  for (const item of activeItems) {
    if (!groupedActive[item.category]) groupedActive[item.category] = [];
    groupedActive[item.category].push(item);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Top Drawer Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-editorial text-3xl md:text-4xl text-ink-primary font-normal leading-tight">
              Smart Grocery List
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800 border border-sage-200">
              Anti-Double Buy
            </span>
          </div>
          <p className="text-xs md:text-sm text-ink-secondary mt-1">
            Never accidentally rebuy what's already sitting in your kitchen.
          </p>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-cream-100 text-ink-primary border border-ink-border text-xs md:text-sm font-semibold transition shadow-soft self-start sm:self-auto"
        >
          <Refrigerator className="w-4 h-4 text-sage-800" />
          <span>Peek Inside Kitchen Inventory</span>
        </button>
      </div>

      {/* Add Grocery Bar with Category & Unit */}
      <form
        onSubmit={handleAddAttempt}
        className="bg-white rounded-2xl p-4 border border-cream-300 shadow-card space-y-3"
      >
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Add to grocery list (e.g. Tomatoes, Sourdough Bread, Coconut Milk)..."
              className="w-full px-4 py-2.5 rounded-xl border border-ink-border bg-cream-50 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="number"
              step="any"
              min="0.1"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
              className="w-20 px-3 py-2 rounded-xl border border-ink-border bg-cream-50 text-xs text-center font-semibold focus:outline-none focus:ring-2 focus:ring-sage-400"
            />

            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="px-3 py-2 rounded-xl border border-ink-border bg-cream-50 text-xs focus:outline-none focus:ring-2 focus:ring-sage-400"
            >
              <option value="pcs">pcs</option>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="L">L</option>
              <option value="ml">ml</option>
              <option value="bunch">bunch</option>
              <option value="pack">pack</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IngredientCategory)}
              className="px-3 py-2 rounded-xl border border-ink-border bg-cream-50 text-xs focus:outline-none focus:ring-2 focus:ring-sage-400"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sage-800 hover:bg-sage-700 text-white text-xs font-semibold transition shadow-soft shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        <p className="text-[11px] text-ink-secondary">
          💡 Our smart duplicate detection automatically scans your kitchen inventory to prevent
          unnecessary purchases.
        </p>
      </form>

      {/* Main Grocery Items List */}
      <div className="space-y-6">
        {activeItems.length === 0 && purchasedItems.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your grocery list is empty"
            description="Add items manually or use 'Add Missing to Groceries' directly from any recipe."
          />
        ) : (
          <>
            {/* Active Items grouped by category */}
            <div className="space-y-4">
              <h3 className="font-editorial text-xl text-ink-primary font-normal">
                To Buy ({activeItems.length})
              </h3>

              {Object.keys(groupedActive).length === 0 ? (
                <p className="text-xs text-ink-secondary italic bg-white p-4 rounded-xl border border-cream-200">
                  All items marked as purchased! Great shopping.
                </p>
              ) : (
                Object.entries(groupedActive).map(([cat, items]) => (
                  <div
                    key={cat}
                    className="bg-white rounded-2xl border border-cream-300 shadow-soft overflow-hidden"
                  >
                    <div className="bg-cream-50 px-4 py-2 border-b border-cream-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-sage-900 uppercase tracking-wider">
                        {cat}
                      </span>
                      <span className="text-[10px] text-ink-secondary">
                        {items.length} {items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    <div className="divide-y divide-cream-200">
                      {items.map((item: GroceryItem) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3.5 hover:bg-cream-50/50 transition"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={item.is_purchased}
                              onChange={() => toggleGroceryPurchased(item.id)}
                              className="w-4 h-4 rounded text-sage-800 border-ink-border focus:ring-sage-400 cursor-pointer"
                            />
                            <div>
                              <span className="text-xs md:text-sm font-medium text-ink-primary">
                                {item.ingredient_name}
                              </span>
                              <span className="text-xs text-ink-secondary ml-2 font-semibold">
                                {item.quantity} {item.unit}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => deleteGroceryItem(item.id)}
                              className="p-1.5 rounded-lg text-ink-muted hover:text-tomato-500 hover:bg-tomato-50 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Completed / Purchased Section */}
            {purchasedItems.length > 0 && (
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-editorial text-lg text-ink-secondary font-normal">
                    Purchased ({purchasedItems.length})
                  </h3>
                </div>

                <div className="bg-white/60 rounded-2xl border border-cream-200 divide-y divide-cream-200">
                  {purchasedItems.map((item: GroceryItem) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 hover:bg-white transition opacity-80"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={item.is_purchased}
                          onChange={() => toggleGroceryPurchased(item.id)}
                          className="w-4 h-4 rounded text-sage-800 border-ink-border focus:ring-sage-400 cursor-pointer"
                        />
                        <span className="text-xs md:text-sm text-ink-secondary line-through">
                          {item.ingredient_name} ({item.quantity} {item.unit})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => movePurchasedToInventory(item)}
                          className="flex items-center gap-1 text-[11px] font-medium text-sage-800 bg-sage-50 hover:bg-sage-100 px-2.5 py-1 rounded-lg border border-sage-200 transition"
                          title="Move to Kitchen"
                        >
                          <Refrigerator className="w-3 h-3 text-sage-600" />
                          <span>Move to Kitchen</span>
                        </button>
                        <button
                          onClick={() => deleteGroceryItem(item.id)}
                          className="p-1 text-ink-muted hover:text-tomato-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Duplicate Alert Modal */}
      <DuplicateAlertModal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        duplicateInfo={duplicateResult}
        onConfirmKeep={(customQty) => {
          if (duplicateResult) {
            executeAdd(
              duplicateResult.enteredName,
              customQty,
              duplicateResult.enteredUnit,
              duplicateResult.enteredCategory
            );
          }
        }}
        onCancel={() => {
          setName('');
        }}
      />

      {/* Current Kitchen Inventory Peek Drawer */}
      <CurrentInventoryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
