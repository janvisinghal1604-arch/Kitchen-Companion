import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Refrigerator, Sparkles, ShoppingBag, BarChart3, Settings } from 'lucide-react';
import { useKitchen } from '../../context/KitchenContext';

export const BottomNavigation: React.FC = () => {
  const { stats } = useKitchen();

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    {
      to: '/kitchen',
      label: 'Kitchen',
      icon: Refrigerator,
      badge: stats.useFirstCount > 0 ? stats.useFirstCount : undefined,
      badgeColor: 'bg-tomato-500'
    },
    { to: '/eat-now', label: 'Eat Now', icon: Sparkles, highlight: true },
    { to: '/groceries', label: 'Groceries', icon: ShoppingBag },
    { to: '/insights', label: 'Insights', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-cream-300 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-sage-800 font-semibold'
                    : 'text-ink-secondary hover:text-ink-primary'
                } ${item.highlight ? 'text-sage-800' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`relative p-1 rounded-lg transition-transform ${
                      isActive ? 'bg-sage-100 scale-105' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.badge !== undefined && (
                      <span
                        className={`absolute -top-1 -right-1 text-[10px] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
