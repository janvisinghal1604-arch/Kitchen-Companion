import React, { useState } from 'react';
import { KitchenItem } from '../../types';
import { formatFreshnessLabel, getFreshnessTheme } from '../../lib/freshness';
import { useKitchen } from '../../context/KitchenContext';
import { Check, Trash2, Edit3, MapPin, Calendar, MoreVertical } from 'lucide-react';

interface IngredientCardProps {
  item: KitchenItem;
  onEdit?: (item: KitchenItem) => void;
  compact?: boolean;
}

export const IngredientCard: React.FC<IngredientCardProps> = ({
  item,
  onEdit,
  compact = false
}) => {
  const { markAsConsumed, markAsDiscarded } = useKitchen();
  const [showMenu, setShowMenu] = useState(false);
  const [isConsuming, setIsConsuming] = useState(false);

  const freshnessInfo = formatFreshnessLabel(item.estimated_use_by);
  const theme = getFreshnessTheme(freshnessInfo.status);

  const handleQuickConsume = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConsuming(true);
    await markAsConsumed(item.id);
    setIsConsuming(false);
  };

  const handleDiscard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Log ${item.custom_name} as discarded for reflection?`)) {
      await markAsDiscarded(item.id, 'Spoiled or past date');
    }
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl border ${theme.border} shadow-card hover:shadow-elevated transition-all overflow-hidden flex flex-col justify-between ${
        theme.accentBg
      }`}
    >
      {/* Top Banner & Image */}
      <div>
        <div className="relative h-36 w-full overflow-hidden bg-cream-200">
          <img
            src={
              item.image_url ||
              'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'
            }
            alt={item.custom_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Freshness Badge overlay */}
          <div className="absolute top-2.5 left-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-xs ${theme.badge}`}
            >
              <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
              {freshnessInfo.label}
            </span>
          </div>

          {/* Quick Menu */}
          <div className="absolute top-2.5 right-2.5">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-ink-primary shadow-xs hover:bg-white"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-elevated border border-ink-border/70 py-1 z-20 text-xs animate-in fade-in zoom-in-95 duration-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  {onEdit && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(item);
                      }}
                      className="w-full text-left px-3 py-2 text-ink-primary hover:bg-cream-100 flex items-center gap-2"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-ink-secondary" />
                      <span>Edit Item</span>
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      setShowMenu(false);
                      handleDiscard(e);
                    }}
                    className="w-full text-left px-3 py-2 text-tomato-600 hover:bg-tomato-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Log Discarded</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h4 className="font-editorial text-lg text-ink-primary font-normal leading-snug line-clamp-1">
              {item.custom_name}
            </h4>
            <span className="text-xs font-bold text-sage-900 bg-sage-100/80 px-2 py-0.5 rounded-md shrink-0">
              {item.quantity} {item.unit}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-ink-secondary mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-sage-600" />
              {item.storage_location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-ink-muted" />
              Est. {item.estimated_use_by}
            </span>
          </div>

          {item.notes && (
            <p className="text-xs text-ink-secondary italic line-clamp-2 bg-cream-50/90 p-2 rounded-lg border border-cream-200 mb-3">
              "{item.notes}"
            </p>
          )}
        </div>
      </div>

      {/* Card Action footer */}
      <div className="p-3 bg-white/80 border-t border-cream-200/80 flex items-center justify-between gap-2">
        <button
          onClick={handleQuickConsume}
          disabled={isConsuming}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sage-800 hover:bg-sage-700 text-white text-xs font-medium transition shadow-soft disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Mark Consumed</span>
        </button>

        {onEdit && (
          <button
            onClick={() => onEdit(item)}
            className="p-2 rounded-xl text-ink-secondary hover:text-ink-primary hover:bg-cream-200 transition border border-transparent hover:border-ink-border/50"
            title="Edit details"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
