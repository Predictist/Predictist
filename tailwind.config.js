/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./app/predictle/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
    safelist: [
    'bg-blue-600',
    'text-white',
    'border-blue-400',
    'shadow-blue-500/40',
    'bg-gray-700',
    'text-gray-300',
    'border-gray-500',
    'shadow-gray-500/30',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};



