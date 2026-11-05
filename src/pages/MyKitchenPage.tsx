import React, { useState } from 'react';
import { useKitchen } from '../context/KitchenContext';
import { KitchenItem, IngredientCategory, StorageLocation } from '../types';
import { IngredientCard } from '../components/inventory/IngredientCard';
import { IngredientFormModal } from '../components/inventory/IngredientFormModal';
import { ScanGroceriesModal } from '../components/inventory/ScanGroceriesModal';
import { FreshnessTimeline } from '../components/timeline/FreshnessTimeline';
import { QuickAddBar } from '../components/inventory/QuickAddBar';
import { EmptyState } from '../components/common/EmptyState';
import {
  Search,
  Filter,
  Plus,
  Sparkles,
  SlidersHorizontal,
  LayoutGrid,
  GitCommit,
  Refrigerator,
  Layers,
  MapPin,
  ArrowUpDown
} from 'lucide-react';

export const MyKitchenPage: React.FC = () => {
  const { inventory } = useKitchen();

  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'use_by_asc' | 'use_by_desc' | 'name' | 'quantity'>('use_by_asc');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KitchenItem | null>(null);

  const categories: (IngredientCategory | 'All')[] = [
    'All',
    'Vegetables',
    'Fruits',
    'Dairy',
    'Grains',
    'Pulses',
    'Spices',
    'Bakery',
    'Packaged Food'
  ];

  const locations: (StorageLocation | 'All')[] = [
    'All',
    'Refrigerator',
    'Freezer',
    'Pantry',
    'Countertop'
  ];

  // Filtering & Sorting
  const filteredItems = inventory
    .filter((item: KitchenItem) => {
      const matchesSearch =
        item.custom_name.toLowerCase().includes(search.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const matchesLocation = locationFilter === 'All' || item.storage_location === locationFilter;
      return matchesSearch && matchesCategory && matchesLocation;
    })
    .sort((a: KitchenItem, b: KitchenItem) => {
      if (sortBy === 'use_by_asc') {
        return new Date(a.estimated_use_by).getTime() - new Date(b.estimated_use_by).getTime();
      }
      if (sortBy === 'use_by_desc') {
        return new Date(b.estimated_use_by).getTime() - new Date(a.estimated_use_by).getTime();
      }
      if (sortBy === 'name') {
        return a.custom_name.localeCompare(b.custom_name);
      }
      if (sortBy === 'quantity') {
        return b.quantity - a.quantity;
      }
      return 0;
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-3xl md:text-4xl text-ink-primary font-normal leading-tight">
            My Kitchen
          </h2>
          <p className="text-xs md:text-sm text-ink-secondary mt-1">
            Manage your ingredients and track estimated freshness dates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-white rounded-xl border border-ink-border shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'grid'
                  ? 'bg-sage-800 text-white'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'timeline'
                  ? 'bg-sage-800 text-white'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
          </div>

          <button
            onClick={() => setIsScanOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-cream-100 text-ink-primary border border-ink-border text-xs font-semibold transition shadow-soft"
          >
            <Sparkles className="w-3.5 h-3.5 text-sage-800" />
            <span className="hidden sm:inline">AI Scan</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sage-800 hover:bg-sage-700 text-white text-xs font-medium transition shadow-soft"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Quick Add Bar */}
      <QuickAddBar />

      {/* Search, Filter & Sort Controls */}
      <div className="bg-white rounded-2xl p-4 border border-cream-300 shadow-soft space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ingredient name or notes..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-ink-border bg-cream-50/70 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
            />
          </div>

          {/* Storage Location Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <MapPin className="w-3.5 h-3.5 text-sage-700 shrink-0" />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-ink-border bg-cream-50/70 text-xs focus:outline-none focus:ring-2 focus:ring-sage-400 w-full md:w-40"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc === 'All' ? 'All Locations' : loc}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-sage-700 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-ink-border bg-cream-50/70 text-xs focus:outline-none focus:ring-2 focus:ring-sage-400 w-full md:w-48"
            >
              <option value="use_by_asc">Estimated Use-by (Soonest)</option>
              <option value="use_by_desc">Estimated Use-by (Latest)</option>
              <option value="name">Name (A-Z)</option>
              <option value="quantity">Quantity (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition shrink-0 ${
                categoryFilter === cat
                  ? 'bg-sage-800 text-white'
                  : 'bg-cream-100 text-ink-secondary hover:text-ink-primary hover:bg-cream-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'timeline' ? (
        <FreshnessTimeline onEditItem={(item: KitchenItem) => setEditingItem(item)} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={Refrigerator}
          title="No ingredients found"
          description={
            search || categoryFilter !== 'All' || locationFilter !== 'All'
              ? 'Try adjusting your search terms or filter selections.'
              : 'Your kitchen inventory is empty. Add your first ingredient or scan groceries!'
          }
          actionText="Add New Ingredient"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-secondary px-1">
            <span>
              Showing {filteredItems.length} of {inventory.length} ingredients
            </span>
            <span className="italic">Click "Mark Consumed" after cooking</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item: KitchenItem) => (
              <IngredientCard
                key={item.id}
                item={item}
                onEdit={(itm) => setEditingItem(itm)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <IngredientFormModal
        isOpen={isAddOpen || Boolean(editingItem)}
        onClose={() => {
          setIsAddOpen(false);
          setEditingItem(null);
        }}
        editItem={editingItem}
      />

      <ScanGroceriesModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
      />
    </div>
  );
};
