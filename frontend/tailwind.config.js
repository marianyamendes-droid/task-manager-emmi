/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f9f2eb',
          100: '#f4e4c3',
          500: '#906a47',
          600: '#7a5a3a',
          700: '#5e4329',
        },
        dark: '#2e313c',
        sand: '#e7e6e4',
        cream: '#f4e4c3',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

