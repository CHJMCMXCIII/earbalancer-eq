/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans KR"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#edf5ff',
          100: '#d0e2ff',
          500: '#0f62fe', // IBM Carbon Interactive Blue
          600: '#0043ce',
          700: '#002d9c',
          900: '#001141',
        },
        carbon: {
          blue: '#0f62fe',
          blueHover: '#0353e9',
          gray10: '#f4f4f4',
          gray20: '#e0e0e0',
          gray30: '#c6c6c6',
          gray50: '#8d8d8d',
          gray70: '#525252',
          gray80: '#393939',
          gray90: '#262626',
          gray100: '#161616',
        },
      },
      transitionTimingFunction: {
        'carbon-standard': 'cubic-bezier(0.2, 0, 0.38, 0.9)',
        'carbon-entrance': 'cubic-bezier(0, 0, 0.38, 0.9)',
        'carbon-exit': 'cubic-bezier(0.2, 0, 1, 0.9)',
      },
    },
  },
  plugins: [],
}
