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
    <header className="flex flex-col items-center justify-center py-10">
      <h1 className="text-4xl font-extrabold text-cyan-400 tracking-wide mb-6">
        PREDICTLE
      </h1>

      <nav
        className="relative flex items-center justify-center bg-gray-900/70 
                   rounded-full border border-gray-700 shadow-lg backdrop-blur-md 
                   overflow-hidden"
      >
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative px-6 py-2 text-sm font-semibold transition-all duration-300 
                ${active ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full z-0"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}





