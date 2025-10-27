/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./app/predictle/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
  // Gradients and glows for buttons
  'bg-gradient-to-r',
  'from-cyan-400',
  'to-blue-600',
  'border-blue-500',
  'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
  'hover:shadow-[0_0_15px_rgba(34,211,238,0.6)]',
  'hover:bg-gray-800/40',
  'hover:border-gray-500',
  'text-white',
  'text-gray-300',
  'border-gray-600',
],
  theme: {
    extend: {},
  },
  plugins: [],
};


