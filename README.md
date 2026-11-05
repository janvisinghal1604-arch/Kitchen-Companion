# Kitchen Companion ⏱️🥬
> **Consume with intention. Waste less.**

A mindful food consumption companion that helps households manage kitchen inventory, prioritize ingredients requiring attention, discover comforting recipes using food they already own, and prevent unplanned grocery double-purchases.

---

## 🌟 The Core Behavioural Loop

1. **Awareness** — Know what food is available across your refrigerator, freezer, and pantry.
2. **Decision** — Understand what needs attention first through transparent estimated use-by timelines.
3. **Action** — Cook intentionally with AI recipe recommendations and mark used ingredients as consumed.
4. **Reflection** — Understand consumption habits and avoid recurring grocery waste with non-judgmental insights.

---

## 🚀 Key Features & Screens

### 1. Onboarding & Setup System (`/onboarding`)
- **Splash Screen**: Introduces the application, vision, and mindful philosophy with an elegant presentation.
- **Onboarding Screens**: Interactive walkthrough introducing the 4 core pillars:
  1. *Smart Inventory & Visibility*
  2. *Freshness Prioritization Timelines*
  3. *Eat Now: AI Kitchen Chef*
  4. *Anti-Duplicate Smart Groceries*
- **Personalised Screens**: Collects optional household size, dietary patterns (*Vegetarian, Vegan, Non-Veg, Jain, etc.*), favorite cuisines, cooking skill level, spice tolerance, and allergies.
- **Kitchen Setup Screen**: Interactive visual starter basket allowing users to pre-populate their kitchen with common household staples (*Tomatoes, Onions, Curd, Spinach, Rice, Ginger & Garlic, etc.*) with 1 click.

### 2. Profile & Settings (`/settings`)
Organized into 4 purpose-built screens:
- **User Profile** (*Purpose: Manage User Information*):
  - Avatar selection from preset chef personas.
  - Name, email, phone number, location (*e.g. Bengaluru, India*).
  - Household size & member count.
  - Cooking skill level (*Beginner, Home Cook, Passionate Chef*).
  - Account status & session sign out.
- **Dietary Preferences** (*Purpose: Manage Food Preferences*):
  - Primary dietary style selector.
  - Multi-select favorite cuisines (*South Indian, North Indian, Indo-Chinese, Mediterranean, etc.*).
  - Spice tolerance levels (*Mild, Medium, Spicy, Fiery*).
  - Allergy & intolerance exclusions (*Peanuts, Dairy, Gluten, Soy, etc.*).
  - Mindful kitchen goal toggles.
- **Notification Settings** (*Purpose: Configure Reminders*):
  - Morning Freshness Check-In reminder (*with customizable time picker, e.g. 09:00 AM*).
  - Evening "What to Cook Tonight" dinner nudge (*e.g. 06:30 PM*).
  - Weekend Smart Grocery day reminder.
  - Audio sound feedback and weekly email digest toggles.
  - "Send Test Reminder" live preview.
- **App Settings** (*Purpose: Manage Application Preferences*):
  - Supabase PostgreSQL Backend connection & live test.
  - SQL Schema viewer with 1-click copy.
  - Multimodal AI configuration (Google Gemini 1.5 Flash API Key).
  - JSON data export for full inventory backup.
  - 1-click Reset to demo pantry data.

### 3. Home Dashboard (`/`)
- **Contextual Greeting & Pulse**: Time-aware greeting, current date, and an intentional mindset prompt.
- **Kitchen Pulse Metrics**: Real-time counter of total ingredients, items needing attention (*Use First*), *Use Soon*, and *Fresh*.
- **"Use These First" Priority Reel**: Visual cards displaying produce nearing estimated use-by dates with 1-click **Mark Consumed**.
- **"What Can You Make Today?"**: Pantry-first recipe cards calibrated to prioritize ingredients needing immediate attention.
- **Quick Action Bar & Inline Quick Add**: Natural language entry (e.g. `4 Tomatoes` or `250g Paneer`) to log produce in seconds.

### 4. My Kitchen: Smart Inventory (`/kitchen`)
- **CRUD Inventory System**: Track ingredient name, quantity, unit (`pcs`, `g`, `kg`, `L`, `ml`, `bunch`, `pack`, etc.), category, and storage location (`Refrigerator`, `Freezer`, `Pantry`, `Countertop`).
- **Dual Views**: Seamless toggle between **Card Grid** and **Freshness Timeline**.
- **Multi-Filter & Dynamic Sorting**: Filter by 9+ categories, 4 storage zones, or sort by estimated use-by date and quantity.
- **Consumption Logging**: Mark items as **Consumed** (with optional partial quantities) or **Discarded** (with reason for reflection).

### 5. AI Grocery Scanner with Multimodal Vision
- **Camera & File Upload**: Upload photos of fresh produce, supermarket baskets, or market hauls.
- **Google Gemini 1.5 Flash Vision**: Detects ingredients, quantities, categories, and estimated shelf lives.
- **Interactive Confirmation Screen**: User can edit names, adjust quantities, toggle items, and review before saving.
- **Transparent Safety First**: Communicates that AI estimates do not replace biological food safety checks.

### 6. Visual Freshness Timeline
- **Use First**: Ingredients expiring today, imminent, or overdue.
- **Use Soon**: Ingredients in good standing for the next 2 to 4 days.
- **Fresh**: Ingredients safe for 5+ days.
- **Needs Checking**: Items with missing dates or uncertain shelf-life.

### 7. Eat Now: AI Kitchen Chef (`/eat-now`)
- **"Cook something using what I already have"**: Multi-select pantry ingredients with automatic pre-selection of expiring items.
- **Culinary Controls**: Max prep time slider (10m–60m), cuisines, dietary preferences, and complexity.
- **Recipe Details**:
  - Available ingredients vs. missing ingredients with pantry match %.
  - Practical chef substitutions.
  - One-click **"Add Missing to Grocery List"**.
  - One-click **"Mark Used Ingredients as Consumed"** (updates inventory and writes to consumption logs).

### 8. Smart Grocery List (`/groceries`)
- **Smart Duplicate Detection**: Whenever adding an ingredient, the app scans active kitchen inventory. If you add "Tomatoes" and already own 4, it alerts: *"You already have 4 pcs of Ripe Tomatoes in your kitchen. Would you like to adjust the quantity?"*
- **Store-Ready Checklist**: Category grouping and mobile-friendly checkboxes.
- **Current Inventory Peek**: Slide-out drawer to view your kitchen inventory while shopping.
- **"Move to Kitchen"**: 1-click migration of purchased groceries into your kitchen inventory.

### 9. Consumption Insights & Financial Reflection (`/insights`)
- **Food Value Saved (₹)**: Financial calculation of savings achieved by consuming produce before spoilage.
- **Category Charts (`recharts`)**: Consumed vs. discarded items by category.
- **Produce Frequently Left Unused**: Signal detection to help adjust future shopping trips without guilt or shame.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 with TypeScript |
| **Styling** | Tailwind CSS with custom editorial design tokens |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Build Tool** | Vite |
| **Backend & Auth** | Supabase (PostgreSQL, Auth, RLS) |
| **AI Integration** | Google Gemini 1.5 Flash (Vision & Chat API) |

---

## 🎨 Visual Design Palette

- **Warm Cream**: `#F7F4EC`
- **Muted Sage**: `#879B7A`
- **Deep Olive**: `#354637`
- **Tomato Accent**: `#D96B4B`
- **Soft Beige**: `#E8E0D1`
- **Primary Ink**: `#2C3029`
- **Secondary Ink**: `#77786F`
- **Editorial Typography**: *DM Serif Display* & *Plus Jakarta Sans*

---

## 📦 Getting Started

```bash
cd /Users/janvisinghal/.gemini/antigravity/scratch/eat-the-clock
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.
