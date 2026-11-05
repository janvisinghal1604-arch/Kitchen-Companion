/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCF9',
          100: '#F7F4EC', // Warm Cream
          200: '#EFE9DC',
          300: '#E8E0D1', // Soft Beige
        },
        sage: {
          50: '#F3F6F1',
          100: '#E3EADF',
          200: '#C7D7C1',
          300: '#A6C09C',
          400: '#879B7A', // Muted Sage
          500: '#697E5D',
          600: '#526348',
          700: '#3D4A36',
          800: '#354637', // Deep Olive
          900: '#233025',
          950: '#172018',
        },
        tomato: {
          50: '#FDF4F2',
          100: '#FCE7E2',
          200: '#F9CEC4',
          300: '#F3AA9A',
          400: '#E98068',
          500: '#D96B4B', // Tomato Accent
          600: '#C55132',
          700: '#A53E24',
          800: '#873420',
          900: '#712E1F',
        },
        ink: {
          primary: '#2C3029', // Primary Text
          secondary: '#77786F', // Secondary Text
          muted: '#9CA096',
          border: '#DDD7C9',
          subtle: '#ECE7DC',
        }
      },
      fontFamily: {
        serif: ['"DM Serif Display"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(44, 48, 41, 0.05), 0 1px 3px -1px rgba(44, 48, 41, 0.03)',
        'card': '0 8px 24px -4px rgba(44, 48, 41, 0.06), 0 2px 6px -1px rgba(44, 48, 41, 0.03)',
        'elevated': '0 20px 32px -8px rgba(44, 48, 41, 0.1), 0 4px 12px -2px rgba(44, 48, 41, 0.05)',
      }
    },
  },
  plugins: [],
};
