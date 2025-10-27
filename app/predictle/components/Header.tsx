'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const tabs = [
  { href: '/predictle/free', label: 'Free Play' },
  { href: '/predictle/daily', label: 'Daily Challenge' },
  { href: '/predictle/slider', label: 'Slider Mode' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="flex flex-col items-center justify-center py-10 text-white space-y-8">
      {/* Title */}
      <h1 className="text-5xl font-extrabold tracking-wide text-cyan-400 drop-shadow-lg">
        PREDICTLE
      </h1>

      {/* Game Mode Toggle */}
      <nav className="flex items-center justify-center gap-4">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <motion.div key={tab.href} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                href={tab.href}
                className={clsx(
                  'relative px-8 py-3 rounded-full text-base font-semibold transition-all duration-300 border border-gray-700/60 shadow-sm',
                  active
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg border-blue-500/50'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                )}
              >
                {tab.label}
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </header>
  );
}







