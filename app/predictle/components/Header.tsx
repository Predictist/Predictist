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
    <header className="sticky top-0 z-40 flex flex-col items-center py-5 bg-transparent">
      {/* Logo */}
      <h1 className="text-cyan-400 text-3xl font-extrabold mb-4 tracking-wide">
        PREDICTLE
      </h1>

      {/* Tabs */}
      <nav
        className="relative flex items-center justify-center bg-gray-900/70 
                   border border-gray-800 rounded-full p-1 backdrop-blur-sm"
      >
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative z-10 px-6 py-2 text-sm font-medium rounded-full transition-colors
                ${active ? 'text-white' : 'text-gray-400 hover:text-white'}
              `}
            >
              {tab.label}
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full bg-gradient-to-r 
                             from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(56,189,248,0.6)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

