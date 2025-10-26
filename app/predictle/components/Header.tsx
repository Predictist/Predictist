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
    <header className="sticky top-0 z-40 flex flex-col items-center py-8 bg-transparent">
      {/* Game Title */}
      <h1 className="text-cyan-400 text-4xl font-extrabold mb-6 tracking-wide drop-shadow-md">
        PREDICTLE
      </h1>

      {/* Centered Tab Navigation */}
      <nav
        className="relative flex items-center justify-center space-x-2 bg-gray-900/60 
                   border border-gray-800 rounded-full px-2 py-2 backdrop-blur-sm shadow-lg"
      >
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative z-10 px-6 py-2 text-sm font-semibold rounded-full transition-all duration-200
                ${active
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
            >
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500
                             shadow-[0_0_12px_rgba(56,189,248,0.6)]"
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


