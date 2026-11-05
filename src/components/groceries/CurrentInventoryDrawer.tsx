import React, { useState } from 'react';
import { useKitchen } from '../../context/KitchenContext';
import { X, Search, Refrigerator, MapPin } from 'lucide-react';
import { formatFreshnessLabel, getFreshnessTheme } from '../../lib/freshness';

interface CurrentInventoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CurrentInventoryDrawer: React.FC<CurrentInventoryDrawerProps> = ({
  isOpen,
  onClose
}) => {
  const { inventory } = useKitchen();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = inventory.filter(
    (item) =>
      item.custom_name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-ink-primary/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-elevated border-l border-cream-300 flex flex-col">
        {/* Drawer Header */}
        <div className="p-4 border-b border-cream-200 bg-cream-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Refrigerator className="w-5 h-5 text-sage-800" />
            <div>
              <h3 className="font-editorial text-lg text-ink-primary font-normal leading-tight">
                Current Kitchen Inventory
              </h3>
              <p className="text-[11px] text-ink-secondary">
                {inventory.length} total items in your home
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-cream-200 text-ink-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-cream-200">
          <div className="relative">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search kitchen before buying..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-ink-border bg-cream-50 text-xs focus:outline-none focus:ring-2 focus:ring-sage-400"
            />
          </div>
        </div>

        {/* List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          {filtered.length === 0 ? (
            <p className="text-xs text-ink-secondary italic text-center py-6">
              No matching ingredients in your kitchen.
            </p>
          ) : (
            filtered.map((item) => {
              const freshness = formatFreshnessLabel(item.estimated_use_by);
              const theme = getFreshnessTheme(freshness.status);

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-cream-200 bg-white hover:bg-cream-50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        item.image_url ||
                        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&auto=format&fit=crop&q=80'
                      }
                      alt={item.custom_name}
                      className="w-10 h-10 rounded-lg object-cover bg-cream-200"
                    />
                    <div>
                      <h5 className="font-medium text-xs text-ink-primary">{item.custom_name}</h5>
                      <span className="text-[11px] text-ink-secondary flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-sage-600" />
                        {item.storage_location} • {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-ink-primary block">
                      {item.quantity} {item.unit}
                    </span>
                    <span
                      className={`inline-block text-[10px] px-2 py-0.2 rounded-full border mt-0.5 ${theme.badge}`}
                    >
                      {freshness.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-cream-200 bg-cream-50 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-sage-800 text-white rounded-xl text-xs font-medium hover:bg-sage-700 transition"
          >
            Back to Grocery Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
