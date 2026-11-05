import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { KitchenItem, IngredientCategory, StorageLocation } from '../../types';
import { useKitchen } from '../../context/KitchenContext';
import { Sparkles, Calendar, Layers, MapPin } from 'lucide-react';
import { IngredientAutocomplete } from './IngredientAutocomplete';

interface IngredientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: KitchenItem | null;
}

const CATEGORIES: IngredientCategory[] = [
  'Vegetables',
  'Fruits',
  'Dairy',
  'Grains',
  'Pulses',
  'Spices',
  'Meat',
  'Bakery',
  'Packaged Food',
  'Others'
];

const STORAGE_LOCATIONS: StorageLocation[] = [
  'Refrigerator',
  'Freezer',
  'Pantry',
  'Countertop'
];

const COMMON_UNITS = ['pcs', 'g', 'kg', 'ml', 'L', 'bunch', 'pack', 'slices'];

export const IngredientFormModal: React.FC<IngredientFormModalProps> = ({
  isOpen,
  onClose,
  editItem
}) => {
  const { addKitchenItem, updateKitchenItem } = useKitchen();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pcs');
  const [category, setCategory] = useState<IngredientCategory>('Vegetables');
  const [storageLocation, setStorageLocation] = useState<StorageLocation>('Refrigerator');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [estimatedUseBy, setEstimatedUseBy] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form
  useEffect(() => {
    if (editItem) {
      setName(editItem.custom_name);
      setQuantity(editItem.quantity);
      setUnit(editItem.unit);
      setCategory(editItem.category);
      setStorageLocation(editItem.storage_location);
      setPurchaseDate(editItem.purchase_date);
      setEstimatedUseBy(editItem.estimated_use_by);
      setImageUrl(editItem.image_url || '');
      setNotes(editItem.notes || '');
    } else {
      setName('');
      setQuantity(1);
      setUnit('pcs');
      setCategory('Vegetables');
      setStorageLocation('Refrigerator');
      const today = new Date().toISOString().split('T')[0];
      setPurchaseDate(today);

      // Default use-by 5 days ahead
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 5);
      setEstimatedUseBy(nextDate.toISOString().split('T')[0]);
      setImageUrl('');
      setNotes('');
    }
  }, [editItem, isOpen]);

  // Adjust default use-by based on category selection if creating new
  const handleCategoryChange = (newCat: IngredientCategory) => {
    setCategory(newCat);
    if (!editItem) {
      const daysMap: Record<IngredientCategory, number> = {
        Vegetables: 5,
        Fruits: 4,
        Dairy: 3,
        Bakery: 3,
        Meat: 2,
        'Packaged Food': 30,
        Grains: 90,
        Pulses: 90,
        Spices: 180,
        Others: 7
      };
      const days = daysMap[newCat] || 5;
      const d = new Date(purchaseDate || Date.now());
      d.setDate(d.getDate() + days);
      setEstimatedUseBy(d.toISOString().split('T')[0]);

      // Set logical storage
      if (['Grains', 'Pulses', 'Spices', 'Packaged Food'].includes(newCat)) {
        setStorageLocation('Pantry');
      } else if (newCat === 'Dairy' || newCat === 'Meat') {
        setStorageLocation('Refrigerator');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editItem) {
        await updateKitchenItem(editItem.id, {
          custom_name: name.trim(),
          quantity: Number(quantity) || 1,
          unit,
          category,
          storage_location: storageLocation,
          purchase_date: purchaseDate,
          estimated_use_by: estimatedUseBy,
          notes: notes.trim() || undefined,
          image_url: imageUrl.trim() || undefined
        });
      } else {
        await addKitchenItem({
          custom_name: name.trim(),
          quantity: Number(quantity) || 1,
          unit,
          category,
          storage_location: storageLocation,
          purchase_date: purchaseDate,
          estimated_use_by: estimatedUseBy,
          notes: notes.trim() || undefined,
          image_url:
            imageUrl.trim() ||
            'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? 'Edit Ingredient' : 'Add to Kitchen'}
      subtitle="Track what you own to cook intentionally."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs md:text-sm">
        {/* Ingredient Name */}
        <div>
          <label className="block font-medium text-ink-primary mb-1">
            Ingredient Name <span className="text-tomato-500">*</span>
          </label>
          <IngredientAutocomplete
            value={name}
            onChange={(val) => setName(val)}
            placeholder="e.g. Ripe Tomatoes, Paneer, Coriander..."
          />
        </div>

        {/* Quantity & Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-ink-primary mb-1">Quantity</label>
            <input
              type="number"
              step="any"
              min="0.1"
              required
              value={quantity}
              placeholder="e.g. 1"
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-white focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm"
            />
          </div>
          <div>
            <label className="block font-medium text-ink-primary mb-1">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-white focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm"
            >
              {COMMON_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category & Storage Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-ink-primary mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sage-700" />
              Category
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as IngredientCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-white focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-ink-primary mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sage-700" />
              Storage Location
            </label>
            <select
              value={storageLocation}
              onChange={(e) => setStorageLocation(e.target.value as StorageLocation)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-white focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm"
            >
              {STORAGE_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Purchase Date & Estimated Use-By Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-ink-primary mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-ink-secondary" />
              Purchase Date
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-white focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm"
            />
          </div>

          <div>
            <label className="block font-medium text-ink-primary mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-tomato-500" />
              Estimated Use-By Date <span className="text-tomato-500">*</span>
            </label>
            <input
              type="date"
              required
              value={estimatedUseBy}
              onChange={(e) => setEstimatedUseBy(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-white focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm"
            />
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block font-medium text-ink-primary mb-1">Optional Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. In vegetable crisper, half packet opened"
            className="w-full px-3.5 py-2 rounded-xl border border-ink-border bg-white focus:outline-none focus:ring-2 focus:ring-sage-400"
          />
        </div>

        {/* Buttons */}
        <div className="pt-3 border-t border-cream-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-ink-border text-ink-secondary hover:bg-cream-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-sage-800 hover:bg-sage-700 text-white font-medium transition shadow-soft disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{editItem ? 'Save Changes' : 'Add Ingredient'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
