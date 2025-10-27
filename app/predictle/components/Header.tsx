'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const tabs = [
  { href: '/predictle/free', label: 'Free Play' },
  { href: '/predictle/daily', label: 'Daily Challenge' },
  { href: '/predictle/slider', label: 'Slider Mode' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="flex flex-col items-center justify-center py-10 text-white space-y-6">
      <h1 className="text-5xl font-extrabold tracking-wide text-cyan-400 drop-shadow-lg">
        PREDICTLE
      </h1>

      {/* Game Mode Toggle */}
      <nav className="relative flex items-center justify-center bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-full px-4 py-2 shadow-md gap-4">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative px-6 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                active
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}







