import React, { useState } from 'react';
import { useKitchen } from '../../context/KitchenContext';
import { FreshnessStatus, KitchenItem } from '../../types';
import { IngredientCard } from '../inventory/IngredientCard';
import { AlertCircle, Clock, CheckCircle2, HelpCircle } from 'lucide-react';

interface FreshnessTimelineProps {
  onEditItem?: (item: KitchenItem) => void;
}

export const FreshnessTimeline: React.FC<FreshnessTimelineProps> = ({ onEditItem }) => {
  const { inventory } = useKitchen();
  const [activeTab, setActiveTab] = useState<FreshnessStatus | 'All'>('All');

  const groups: Record<FreshnessStatus, KitchenItem[]> = {
    'Use First': inventory.filter((i) => i.freshness_status === 'Use First'),
    'Use Soon': inventory.filter((i) => i.freshness_status === 'Use Soon'),
    Fresh: inventory.filter((i) => i.freshness_status === 'Fresh'),
    'Needs Checking': inventory.filter((i) => i.freshness_status === 'Needs Checking')
  };

  const sections: {
    key: FreshnessStatus;
    title: string;
    description: string;
    icon: any;
    theme: {
      badge: string;
      headerBg: string;
      borderColor: string;
    };
  }[] = [
    {
      key: 'Use First',
      title: 'Use First',
      description: 'Estimated use-by date is today, imminent, or past. Prioritize in today’s meals.',
      icon: AlertCircle,
      theme: {
        badge: 'bg-tomato-100 text-tomato-800 border-tomato-200',
        headerBg: 'bg-tomato-50/70 border-tomato-200',
        borderColor: 'border-tomato-200'
      }
    },
    {
      key: 'Use Soon',
      title: 'Use Soon',
      description: 'Good for the next 2 to 4 days. Plan upcoming recipes around these.',
      icon: Clock,
      theme: {
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        headerBg: 'bg-amber-50/70 border-amber-200',
        borderColor: 'border-amber-200'
      }
    },
    {
      key: 'Fresh',
      title: 'Fresh & Stable',
      description: 'Safe with 5+ days remaining. No urgent consumption needed.',
      icon: CheckCircle2,
      theme: {
        badge: 'bg-sage-100 text-sage-800 border-sage-200',
        headerBg: 'bg-sage-50/70 border-sage-200',
        borderColor: 'border-sage-200'
      }
    },
    {
      key: 'Needs Checking',
      title: 'Needs Checking',
      description: 'Missing dates or uncertain shelf-life. Review smell, texture, and adjust dates.',
      icon: HelpCircle,
      theme: {
        badge: 'bg-cream-200 text-ink-primary border-ink-border',
        headerBg: 'bg-cream-100 border-ink-border',
        borderColor: 'border-ink-border'
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('All')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition shrink-0 ${
            activeTab === 'All'
              ? 'bg-sage-800 text-white shadow-soft'
              : 'bg-white text-ink-secondary hover:text-ink-primary border border-ink-border/60'
          }`}
        >
          All Stages ({inventory.length})
        </button>

        {sections.map((sec) => (
          <button
            key={sec.key}
            onClick={() => setActiveTab(sec.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition shrink-0 flex items-center gap-1.5 ${
              activeTab === sec.key
                ? 'bg-sage-800 text-white shadow-soft'
                : 'bg-white text-ink-secondary hover:text-ink-primary border border-ink-border/60'
            }`}
          >
            <span>{sec.title}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === sec.key ? 'bg-white/20 text-white' : sec.theme.badge
              }`}
            >
              {groups[sec.key].length}
            </span>
          </button>
        ))}
      </div>

      {/* Timeline Columns / Sections */}
      <div className="space-y-8">
        {sections
          .filter((sec) => activeTab === 'All' || activeTab === sec.key)
          .map((sec) => {
            const items = groups[sec.key];
            const Icon = sec.icon;

            return (
              <div
                key={sec.key}
                className="bg-white/70 rounded-2xl border border-cream-300 p-5 shadow-soft transition-all"
              >
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-cream-200">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${sec.theme.headerBg} border`}>
                      <Icon className="w-5 h-5 text-ink-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-editorial text-xl text-ink-primary font-normal">
                          {sec.title}
                        </h3>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${sec.theme.badge}`}
                        >
                          {items.length} {items.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      <p className="text-xs text-ink-secondary mt-0.5">{sec.description}</p>
                    </div>
                  </div>
                </div>

                {/* Grid */}
                {items.length === 0 ? (
                  <p className="text-xs text-ink-secondary italic py-4 text-center">
                    No ingredients currently in this category.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {items.map((item) => (
                      <IngredientCard key={item.id} item={item} onEdit={onEditItem} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
