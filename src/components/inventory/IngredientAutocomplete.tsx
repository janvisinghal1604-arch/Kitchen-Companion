import React, { useState, useRef, useEffect, useCallback } from 'react';

const INGREDIENT_SUGGESTIONS = [
  // Vegetables
  'Tomatoes', 'Ripe Tomatoes', 'Cherry Tomatoes', 'Onions', 'Red Onions', 'Green Onions',
  'Garlic', 'Ginger', 'Ginger & Garlic', 'Potatoes', 'Sweet Potatoes', 'Spinach',
  'Fresh Palak (Spinach)', 'Methi (Fenugreek)', 'Cabbage', 'Cauliflower', 'Broccoli',
  'Carrots', 'Beetroot', 'Capsicum', 'Green Chillies', 'Red Chillies', 'Cucumber',
  'Bottle Gourd (Lauki)', 'Bitter Gourd (Karela)', 'Drumstick (Moringa)', 'Raw Banana',
  'Banana Stem', 'Pumpkin', 'Zucchini', 'Mushrooms', 'Baby Corn', 'Corn Kernels',
  'Green Beans', 'French Beans', 'Peas', 'Fresh Green Peas', 'Cluster Beans (Gavar)',
  'Okra (Bhindi)', 'Colocasia (Arbi)', 'Yam (Suran)', 'Raw Papaya', 'Lotus Root (Kamal Kakdi)',
  'Leeks', 'Celery', 'Asparagus', 'Artichoke', 'Radish', 'Turnip', 'Parsnip',
  'Fresh Coriander', 'Curry Leaves', 'Mint Leaves', 'Basil', 'Lemongrass',
  // Fruits
  'Shimla Apples', 'Bananas', 'Mangoes', 'Alphonso Mangoes', 'Oranges', 'Lemons', 'Limes',
  'Pomegranate', 'Grapes', 'Watermelon', 'Papaya', 'Pineapple', 'Strawberries',
  'Blueberries', 'Avocado', 'Kiwi', 'Pears', 'Plums', 'Peaches', 'Coconut',
  'Tender Coconut', 'Guava', 'Sapota (Chikoo)', 'Custard Apple (Sitaphal)',
  // Dairy
  'Malai Paneer', 'Paneer', 'Curd / Plain Dahi', 'Greek Yogurt', 'Milk', 'Full-Fat Milk',
  'Skimmed Milk', 'Butter', 'Ghee', 'Cream', 'Cheese', 'Mozzarella', 'Condensed Milk',
  'Khoya / Mawa', 'Lassi', 'Buttermilk (Chaas)', 'Cream Cheese', 'Sour Cream',
  // Eggs
  'Farm Fresh Eggs', 'Eggs',
  // Grains & Cereals
  'Basmati Rice', 'Brown Rice', 'Sona Masoori Rice', 'Idli Rice', 'Poha (Flattened Rice)',
  'Wheat Flour (Atta)', 'Maida (All-Purpose Flour)', 'Semolina (Sooji / Rava)',
  'Oats', 'Cornflour', 'Ragi Flour', 'Jowar Flour', 'Bajra Flour', 'Besan (Chickpea Flour)',
  'Bread', 'Brown Bread', 'Multigrain Bread', 'Pav', 'Naan', 'Roti', 'Pasta', 'Spaghetti',
  'Penne', 'Noodles', 'Rice Noodles', 'Quinoa', 'Millet', 'Broken Wheat (Dalia)',
  // Pulses & Lentils
  'Toor Dal (Arhar Dal)', 'Moong Dal', 'Masoor Dal', 'Chana Dal', 'Urad Dal',
  'Rajma (Kidney Beans)', 'Kabuli Chana (Chickpeas)', 'Kala Chana', 'Black-Eyed Peas (Lobia)',
  'Moth Beans', 'Peas (Matar)', 'Soybean', 'Lentils', 'Mixed Dal',
  // Spices & Condiments
  'Turmeric Powder', 'Red Chilli Powder', 'Coriander Powder', 'Cumin Seeds', 'Cumin Powder',
  'Mustard Seeds', 'Fenugreek Seeds (Methi Dana)', 'Fennel Seeds (Saunf)', 'Asafoetida (Hing)',
  'Cardamom (Elaichi)', 'Cloves (Laung)', 'Cinnamon (Dalchini)', 'Bay Leaves (Tej Patta)',
  'Black Pepper', 'Black Pepper Powder', 'Garam Masala', 'Chaat Masala', 'Pav Bhaji Masala',
  'Biryani Masala', 'Sambar Powder', 'Rasam Powder', 'Curry Powder', 'Kashmiri Chilli Powder',
  'Kasuri Methi (Dried Fenugreek)', 'Tamarind', 'Amchur (Dry Mango Powder)', 'Kokum',
  'Salt', 'Sugar', 'Jaggery', 'Honey', 'Vinegar', 'Soy Sauce', 'Green Chutney', 'Tomato Ketchup',
  // Oils & Fats
  'Refined Oil', 'Sunflower Oil', 'Groundnut Oil', 'Coconut Oil', 'Sesame Oil',
  'Olive Oil', 'Mustard Oil', 'Vanaspati (Vegetable Shortening)',
  // Nuts & Dry Fruits
  'Cashews (Kaju)', 'Almonds (Badam)', 'Walnuts (Akhrot)', 'Pistachios (Pista)',
  'Raisins (Kishmish)', 'Dates (Khajoor)', 'Peanuts (Groundnuts)', 'Sesame Seeds (Til)',
  // Meat & Seafood
  'Chicken', 'Chicken Breast', 'Chicken Thighs', 'Mutton', 'Lamb', 'Fish', 'Prawns',
  'Tuna', 'Salmon',
  // Packaged Foods
  'Coconut Milk', 'Tomato Puree', 'Canned Tomatoes', 'Vegetable Stock', 'Chicken Stock',
];

interface IngredientAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const IngredientAutocomplete: React.FC<IngredientAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'e.g. Ripe Tomatoes, Paneer, Coriander...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = value.trim()
    ? INGREDIENT_SUGGESTIONS.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8)
    : INGREDIENT_SUGGESTIONS.slice(0, 8);

  const handleSelect = useCallback(
    (item: string) => {
      onChange(item);
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        e.preventDefault();
        handleSelect(filteredSuggestions[highlightedIndex]);
      } else {
        // Allow custom entry — just close dropdown
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-white focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm"
        autoComplete="off"
      />

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-ink-border rounded-xl shadow-elevated max-h-52 overflow-y-auto">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((item, idx) => (
              <button
                key={item}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-sm transition ${
                  idx === highlightedIndex
                    ? 'bg-sage-50 text-sage-900 font-medium'
                    : 'text-ink-primary hover:bg-cream-50'
                }`}
              >
                {item}
              </button>
            ))
          ) : (
            <div className="px-3.5 py-3 text-xs text-ink-secondary italic">
              No results. Press <kbd className="font-mono font-semibold">Enter</kbd> to add custom ingredient.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
