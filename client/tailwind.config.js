/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#fdfbf7',
          100: '#f7f2e7',
          200: '#eee3cd',
          300: '#dfcda9',
          400: '#cdb180',
          500: '#be985f',
          600: '#aa7f4f',
          700: '#8b6440',
          800: '#715137',
          900: '#5c432f',
          950: '#342318',
        },
        ocean: {
          900: '#0a192f',
          800: '#0d2744',
          700: '#14385f',
          600: '#1c4e7f',
          500: '#286ca9',
        },
        gold: {
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
        }
      },
      fontFamily: {
        pirate: ['Cinzel', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
