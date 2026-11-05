import React from 'react';
import { useKitchen } from '../../context/KitchenContext';
import { Clock, Plus, Sparkles, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenScanModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal, onOpenScanModal }) => {
  const { stats } = useKitchen();

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 bg-cream-100/90 backdrop-blur-md border-b border-cream-300 px-3 sm:px-6 md:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sage-800 text-cream-100 flex items-center justify-center shadow-soft shrink-0">
            <Clock className="w-5 h-5 text-cream-100" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-editorial text-lg sm:text-xl md:text-2xl text-ink-primary font-normal tracking-tight truncate">
                Kitchen Companion
              </span>
              <span className="hidden md:inline-block text-[11px] font-medium tracking-wider uppercase text-sage-800 bg-sage-100 px-2 py-0.5 rounded-full border border-sage-200 shrink-0">
                Mindful
              </span>
            </div>
            <p className="text-xs text-ink-secondary hidden sm:block truncate">
              Consume with intention. Waste less.
            </p>
          </div>
        </div>

        {/* Center / Action alerts */}
        <div className="hidden lg:flex items-center gap-3 text-xs shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cream-200 text-ink-secondary border border-cream-300">
            <span>{formattedDate}</span>
          </div>

          {stats.useFirstCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tomato-50 text-tomato-700 border border-tomato-200 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="font-medium">
                {stats.useFirstCount} {stats.useFirstCount === 1 ? 'item needs' : 'items need'} attention
              </span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenScanModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs md:text-sm font-medium rounded-xl bg-cream-200/80 hover:bg-cream-300 text-ink-primary border border-ink-border/60 transition shadow-soft"
            title="Scan grocery receipt or produce"
          >
            <Sparkles className="w-4 h-4 text-sage-800 shrink-0" />
            <span className="hidden sm:inline">Scan Groceries</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs md:text-sm font-medium rounded-xl bg-sage-800 hover:bg-sage-700 text-white transition shadow-soft"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Add Item</span>
            <span className="sm:hidden text-xs">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
