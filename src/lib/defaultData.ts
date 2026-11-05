import { KitchenItem, Recipe, GroceryItem, ConsumptionLog } from '../types';

// Helper to get dates relative to today
const getRelativeDate = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

export const INITIAL_KITCHEN_ITEMS: KitchenItem[] = [
  {
    id: 'k1',
    custom_name: 'Ripe Tomatoes',
    quantity: 4,
    unit: 'pcs',
    category: 'Vegetables',
    storage_location: 'Countertop',
    purchase_date: getRelativeDate(-4),
    estimated_use_by: getRelativeDate(0), // Use Today!
    freshness_status: 'Use First',
    image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
    notes: 'Softening slightly, ideal for curry or rasam'
  },
  {
    id: 'k2',
    custom_name: 'Fresh Palak (Spinach)',
    quantity: 250,
    unit: 'g',
    category: 'Vegetables',
    storage_location: 'Refrigerator',
    purchase_date: getRelativeDate(-3),
    estimated_use_by: getRelativeDate(1), // Use Tomorrow!
    freshness_status: 'Use First',
    image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80',
    notes: 'Washed and bundled in vegetable crisper'
  },
  {
    id: 'k3',
    custom_name: 'Malai Paneer',
    quantity: 200,
    unit: 'g',
    category: 'Dairy',
    storage_location: 'Refrigerator',
    purchase_date: getRelativeDate(-2),
    estimated_use_by: getRelativeDate(2), // Use Soon
    freshness_status: 'Use Soon',
    image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80',
    notes: 'Keep submerged in water if opened'
  },
  {
    id: 'k4',
    custom_name: 'Curd / Plain Dahi',
    quantity: 400,
    unit: 'g',
    category: 'Dairy',
    storage_location: 'Refrigerator',
    purchase_date: getRelativeDate(-3),
    estimated_use_by: getRelativeDate(3), // Use Soon
    freshness_status: 'Use Soon',
    image_url: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=500&auto=format&fit=crop&q=80',
    notes: 'Freshly set Nandini curd'
  },
  {
    id: 'k5',
    custom_name: 'Fresh Coriander',
    quantity: 1,
    unit: 'bunch',
    category: 'Vegetables',
    storage_location: 'Refrigerator',
    purchase_date: getRelativeDate(-1),
    estimated_use_by: getRelativeDate(3),
    freshness_status: 'Use Soon',
    image_url: 'https://images.unsplash.com/photo-1589135233689-d56d7870f43b?w=500&auto=format&fit=crop&q=80',
    notes: 'Wrapped in paper towel in container'
  },
  {
    id: 'k6',
    custom_name: 'Red Onions',
    quantity: 1.5,
    unit: 'kg',
    category: 'Vegetables',
    storage_location: 'Pantry',
    purchase_date: getRelativeDate(-5),
    estimated_use_by: getRelativeDate(14), // Fresh
    freshness_status: 'Fresh',
    image_url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80',
    notes: 'Stored in well-ventilated basket'
  },
  {
    id: 'k7',
    custom_name: 'Ginger & Garlic Paste',
    quantity: 150,
    unit: 'g',
    category: 'Spices',
    storage_location: 'Refrigerator',
    purchase_date: getRelativeDate(-7),
    estimated_use_by: getRelativeDate(20), // Fresh
    freshness_status: 'Fresh',
    image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80',
    notes: 'Homemade jar'
  },
  {
    id: 'k8',
    custom_name: 'Basmati Rice',
    quantity: 2,
    unit: 'kg',
    category: 'Grains',
    storage_location: 'Pantry',
    purchase_date: getRelativeDate(-12),
    estimated_use_by: getRelativeDate(90), // Fresh
    freshness_status: 'Fresh',
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
    notes: 'Aged Daawat basmati in sealed glass container'
  },
  {
    id: 'k9',
    custom_name: 'Farm Fresh Eggs',
    quantity: 6,
    unit: 'pcs',
    category: 'Dairy',
    storage_location: 'Refrigerator',
    purchase_date: getRelativeDate(-4),
    estimated_use_by: getRelativeDate(8),
    freshness_status: 'Fresh',
    image_url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&auto=format&fit=crop&q=80',
    notes: 'Brown free-range eggs'
  },
  {
    id: 'k10',
    custom_name: 'Shimla Apples',
    quantity: 3,
    unit: 'pcs',
    category: 'Fruits',
    storage_location: 'Countertop',
    purchase_date: getRelativeDate(-2),
    estimated_use_by: getRelativeDate(5),
    freshness_status: 'Fresh',
    image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80',
    notes: 'Crisp sweet apples'
  },
  {
    id: 'k11',
    custom_name: 'Curry Leaves',
    quantity: 1,
    unit: 'bunch',
    category: 'Vegetables',
    storage_location: 'Refrigerator',
    purchase_date: getRelativeDate(-6),
    estimated_use_by: getRelativeDate(0),
    freshness_status: 'Use First',
    image_url: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=500&auto=format&fit=crop&q=80',
    notes: 'Aromatic kadi patta'
  }
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'r1',
    name: 'Quick Palak Paneer & Jeera Rice',
    description: 'A creamy restaurant-style cottage cheese curry served over fragrant cumin rice. Perfect for using spinach and paneer before they lose freshness.',
    cuisine: 'North Indian',
    preparation_time: 25,
    servings: 2,
    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    matchPercentage: 92,
    substitutions: [
      'Substitute Paneer with pressed Tofu or boiled Potatoes if vegan',
      'Use sour cream or cashew paste if curd is unavailable'
    ],
    ingredients: [
      { ingredient_name: 'Fresh Palak (Spinach)', quantity: 250, unit: 'g', is_available: true },
      { ingredient_name: 'Malai Paneer', quantity: 200, unit: 'g', is_available: true },
      { ingredient_name: 'Ripe Tomatoes', quantity: 2, unit: 'pcs', is_available: true },
      { ingredient_name: 'Red Onions', quantity: 1, unit: 'pcs', is_available: true },
      { ingredient_name: 'Ginger & Garlic Paste', quantity: 1, unit: 'tbsp', is_available: true },
      { ingredient_name: 'Basmati Rice', quantity: 1, unit: 'cup', is_available: true },
      { ingredient_name: 'Garam Masala', quantity: 1, unit: 'tsp', is_available: false, is_optional: true }
    ],
    instructions: [
      'Blanch the spinach in boiling salted water for 2 minutes, then plunge into ice water. Blend to a silky vibrant green puree.',
      'In a pan, heat 1 tbsp oil/ghee. Sauté finely chopped onions and ginger-garlic paste until golden brown.',
      'Puree the 2 ripe tomatoes and simmer into the pan with turmeric and chili powder until oil separates (4 mins).',
      'Fold in the spinach puree and 2 tbsp curd or cream. Gently drop paneer cubes into the simmering gravy.',
      'Cook covered on low heat for 3-4 minutes. Do not overcook to preserve bright green color. Serve hot with steamed basmati rice!'
    ]
  },
  {
    id: 'r2',
    name: 'Charred Tomato & Curd Pachadi',
    description: 'A comforting South Indian tempered yogurt relish that uses soft tomatoes and curry leaves at their flavor peak.',
    cuisine: 'South Indian',
    preparation_time: 15,
    servings: 3,
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    matchPercentage: 100,
    substitutions: [
      'Can add roasted peanuts for extra crunch',
      'Substitute curd with plant yogurt for vegan version'
    ],
    ingredients: [
      { ingredient_name: 'Ripe Tomatoes', quantity: 3, unit: 'pcs', is_available: true },
      { ingredient_name: 'Curd / Plain Dahi', quantity: 250, unit: 'g', is_available: true },
      { ingredient_name: 'Curry Leaves', quantity: 8, unit: 'leaves', is_available: true },
      { ingredient_name: 'Fresh Coriander', quantity: 2, unit: 'tbsp', is_available: true },
      { ingredient_name: 'Red Onions', quantity: 0.5, unit: 'pcs', is_available: true },
      { ingredient_name: 'Mustard Seeds', quantity: 1, unit: 'tsp', is_available: true }
    ],
    instructions: [
      'Dice the ripe tomatoes roughly and sauté on high heat with a pinch of salt until softened and lightly charred.',
      'Whisk the chilled curd in a mixing bowl with salt and chopped green chillies.',
      'Let the tomatoes cool for 3 minutes, then fold into the whisked curd along with finely minced onion.',
      'Make a tadka: heat coconut or sesame oil, crackle mustard seeds and curry leaves until fragrant, and pour over pachadi.',
      'Garnish generously with fresh coriander. Best paired with warm rice or parathas.'
    ]
  },
  {
    id: 'r3',
    name: 'Spiced Tomato & Egg Shakshuka / Anda Bhurji',
    description: 'Rich spiced tomato gravy with gently poached eggs or soft scramble, infused with fresh coriander.',
    cuisine: 'Indo-Western Fusion',
    preparation_time: 20,
    servings: 2,
    image_url: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=600&auto=format&fit=crop&q=80',
    matchPercentage: 100,
    substitutions: [
      'Can scramble the eggs instead of poaching for classic street-style Bhurji',
      'Add crumbled paneer for extra protein'
    ],
    ingredients: [
      { ingredient_name: 'Farm Fresh Eggs', quantity: 3, unit: 'pcs', is_available: true },
      { ingredient_name: 'Ripe Tomatoes', quantity: 3, unit: 'pcs', is_available: true },
      { ingredient_name: 'Red Onions', quantity: 1, unit: 'pcs', is_available: true },
      { ingredient_name: 'Ginger & Garlic Paste', quantity: 1, unit: 'tsp', is_available: true },
      { ingredient_name: 'Fresh Coriander', quantity: 3, unit: 'tbsp', is_available: true }
    ],
    instructions: [
      'Heat oil in a skillet. Fry diced onions until soft and translucent.',
      'Add ginger garlic paste and finely chopped tomatoes with cumin powder and chili powder.',
      'Simmer down for 8 minutes until a thick, jammy tomato sauce develops.',
      'Create 3 small wells in the sauce and crack the fresh eggs directly into them.',
      'Cover with a lid and simmer on low for 4-5 minutes until whites are set but yolks remain runny. Top with fresh coriander.'
    ]
  },
  {
    id: 'r4',
    name: 'Creamy Dahi Tadka with Warm Toast',
    description: 'Crispy tempered garlic and chili poured over chilled seasoned thick yogurt. A quick 10-minute lifesaver.',
    cuisine: 'Comfort Indian',
    preparation_time: 10,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    matchPercentage: 85,
    substitutions: [
      'Serve with roti, rice, or sourdough bread',
      'Use Greek yogurt for thicker texture'
    ],
    ingredients: [
      { ingredient_name: 'Curd / Plain Dahi', quantity: 200, unit: 'g', is_available: true },
      { ingredient_name: 'Curry Leaves', quantity: 6, unit: 'leaves', is_available: true },
      { ingredient_name: 'Red Onions', quantity: 0.5, unit: 'pcs', is_available: true },
      { ingredient_name: 'Fresh Coriander', quantity: 1, unit: 'tbsp', is_available: true },
      { ingredient_name: 'Bread or Roti', quantity: 2, unit: 'slices', is_available: false, is_optional: false }
    ],
    instructions: [
      'In a bowl, season fresh chilled curd with black salt, regular salt, and roasted cumin powder.',
      'Heat 1 tbsp ghee in a small tadka pan. Add chopped garlic, curry leaves, and a slit green chili.',
      'Once golden and crackling, turn off heat, stir in a pinch of Kashmiri red chili powder for vibrant color.',
      'Pour the sizzling fragrant tadka over the curd. Swirl gently and serve with crusty toast or roti.'
    ]
  }
];

export const INITIAL_GROCERY_ITEMS: GroceryItem[] = [
  {
    id: 'g1',
    ingredient_name: 'Cold Pressed Mustard Oil',
    quantity: 1,
    unit: 'L',
    category: 'Packaged Food',
    is_purchased: false
  },
  {
    id: 'g2',
    ingredient_name: 'Whole Wheat Atta',
    quantity: 5,
    unit: 'kg',
    category: 'Grains',
    is_purchased: false
  },
  {
    id: 'g3',
    ingredient_name: 'Kashmiri Chili Powder',
    quantity: 100,
    unit: 'g',
    category: 'Spices',
    is_purchased: true
  }
];

export const INITIAL_CONSUMPTION_LOGS: ConsumptionLog[] = [
  {
    id: 'c1',
    ingredient_name: 'Coriander Leaves',
    quantity: 1,
    unit: 'bunch',
    category: 'Vegetables',
    action_type: 'consumed',
    estimated_value: 20,
    action_date: getRelativeDate(-1),
    notes: 'Used completely in cilantro chutney'
  },
  {
    id: 'c2',
    ingredient_name: 'Malai Paneer',
    quantity: 200,
    unit: 'g',
    category: 'Dairy',
    action_type: 'consumed',
    estimated_value: 95,
    action_date: getRelativeDate(-2),
    notes: 'Cooked paneer bhurji for dinner'
  },
  {
    id: 'c3',
    ingredient_name: 'Mushrooms',
    quantity: 200,
    unit: 'g',
    category: 'Vegetables',
    action_type: 'discarded',
    estimated_value: 65,
    action_date: getRelativeDate(-3),
    notes: 'Forgot at back of fridge crisper'
  },
  {
    id: 'c4',
    ingredient_name: 'Brown Bread',
    quantity: 4,
    unit: 'slices',
    category: 'Bakery',
    action_type: 'consumed',
    estimated_value: 30,
    action_date: getRelativeDate(-4),
    notes: 'Breakfast avocado & egg toast'
  },
  {
    id: 'c5',
    ingredient_name: 'Cucumber',
    quantity: 2,
    unit: 'pcs',
    category: 'Vegetables',
    action_type: 'consumed',
    estimated_value: 35,
    action_date: getRelativeDate(-5),
    notes: 'Kachumber salad with lunch'
  },
  {
    id: 'c6',
    ingredient_name: 'Greek Yogurt',
    quantity: 100,
    unit: 'g',
    category: 'Dairy',
    action_type: 'discarded',
    estimated_value: 50,
    action_date: getRelativeDate(-6),
    notes: 'Past expiry, had sour mold'
  },
  {
    id: 'c7',
    ingredient_name: 'Bananas',
    quantity: 3,
    unit: 'pcs',
    category: 'Fruits',
    action_type: 'consumed',
    estimated_value: 25,
    action_date: getRelativeDate(-7),
    notes: 'Smoothie bowl'
  }
];
