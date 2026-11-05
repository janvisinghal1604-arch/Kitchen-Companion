import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useKitchen } from '../../context/KitchenContext';
import { Clock, Plus, Sparkles, AlertTriangle, Compass } from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenScanModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal, onOpenScanModal }) => {
  const navigate = useNavigate();
  const { stats } = useKitchen();

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 bg-cream-100/90 backdrop-blur-md border-b border-cream-300 px-4 md:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sage-800 text-cream-100 flex items-center justify-center shadow-soft">
            <Clock className="w-5 h-5 text-cream-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-editorial text-xl md:text-2xl text-ink-primary font-normal tracking-tight">
                Kitchen Companion
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium tracking-wider uppercase text-sage-800 bg-sage-100 px-2 py-0.5 rounded-full border border-sage-200">
                Mindful
              </span>
            </div>
            <p className="text-xs text-ink-secondary hidden sm:block">
              Consume with intention. Waste less.
            </p>
          </div>
        </div>

        {/* Center / Action alerts */}
        <div className="hidden lg:flex items-center gap-3 text-xs">
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
        <div className="flex items-center gap-2">
          {/* Onboarding & Setup direct button */}
          <button
            onClick={() => navigate('/onboarding')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-semibold rounded-xl bg-sage-100 hover:bg-sage-200 text-sage-900 border border-sage-300 transition shadow-soft"
            title="Open Onboarding & Setup walkthrough"
          >
            <Compass className="w-4 h-4 text-sage-800" />
            <span className="hidden sm:inline">Onboarding & Setup</span>
            <span className="sm:hidden">Setup</span>
          </button>

          <button
            onClick={onOpenScanModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium rounded-xl bg-cream-200/80 hover:bg-cream-300 text-ink-primary border border-ink-border/60 transition shadow-soft"
            title="Scan grocery receipt or produce"
          >
            <Sparkles className="w-4 h-4 text-sage-800" />
            <span className="hidden sm:inline">Scan Groceries</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-medium rounded-xl bg-sage-800 hover:bg-sage-700 text-white transition shadow-soft"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>
    </header>
  );
};
