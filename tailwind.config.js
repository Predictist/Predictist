/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./app/predictle/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-gradient-to-r',
    'from-blue-500',
    'to-cyan-500',
    'text-white',
    'border-blue-400',
    'shadow-blue-500/40',
    'hover:bg-gray-800/50',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};


