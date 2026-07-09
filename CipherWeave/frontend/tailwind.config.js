/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#1a202c',
          900: '#111827',
        },
        teal: {
          500: '#14b8a6',
        },
        amber: {
          500: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
}
