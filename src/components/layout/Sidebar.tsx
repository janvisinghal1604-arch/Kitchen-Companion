import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Refrigerator,
  Sparkles,
  ShoppingBag,
  BarChart3,
  Settings,
  Clock,
  AlertTriangle,
  Leaf
} from 'lucide-react';
import { useKitchen } from '../../context/KitchenContext';

interface SidebarProps {
  onOpenScanModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenScanModal }) => {
  const { stats } = useKitchen();

  const navLinks = [
    { to: '/', label: 'Home Dashboard', icon: Home },
    {
      to: '/kitchen',
      label: 'My Kitchen',
      icon: Refrigerator,
      badge: stats.useFirstCount > 0 ? `${stats.useFirstCount} urgent` : undefined,
      badgeColor: 'bg-tomato-100 text-tomato-800 border-tomato-200'
    },
    { to: '/eat-now', label: 'Eat Now (AI Chef)', icon: Sparkles, accent: true },
    {
      to: '/groceries',
      label: 'Smart Groceries',
      icon: ShoppingBag
    },
    { to: '/insights', label: 'Mindful Insights', icon: BarChart3 },
    { to: '/settings', label: 'Profile & Settings', icon: Settings }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-cream-50 border-r border-cream-300 p-6 shrink-0 h-screen sticky top-0 overflow-y-auto">
      {/* Brand logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-2xl bg-sage-800 text-cream-100 flex items-center justify-center shadow-soft">
          <Clock className="w-6 h-6 text-cream-100" />
        </div>
        <div>
          <h1 className="font-editorial text-2xl text-ink-primary font-normal leading-tight">
            Kitchen Companion
          </h1>
          <p className="text-xs text-ink-secondary">Consume with intention.</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1.5 flex-1">
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sage-800 text-white shadow-soft font-semibold'
                    : 'text-ink-primary hover:bg-cream-200/80 hover:text-sage-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 ${
                        isActive
                          ? 'text-cream-100'
                          : item.accent
                          ? 'text-sage-800'
                          : 'text-ink-secondary'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Mindful status callout widget */}
      <div className="mt-6 pt-5 border-t border-cream-200">
        <div className="p-4 rounded-2xl bg-white border border-ink-border/60 shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-4 h-4 text-sage-600" />
            <span className="text-xs font-semibold text-sage-900 uppercase tracking-wider">
              Kitchen Rhythm
            </span>
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed mb-3">
            {stats.useFirstCount > 0 ? (
              <span className="flex items-center gap-1.5 text-tomato-700 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {stats.useFirstCount} items need attention before spoilage.
              </span>
            ) : (
              'All current ingredients are fresh and in good standing.'
            )}
          </p>

          <button
            onClick={onOpenScanModal}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-sage-100 hover:bg-sage-200 text-sage-800 text-xs font-medium transition border border-sage-200"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Grocery Scanner</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
