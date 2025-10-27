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
    <header className="flex flex-col items-center justify-center py-10 text-white space-y-10">
      {/* Title */}
      <h1 className="text-5xl font-extrabold tracking-wide text-cyan-400 drop-shadow-lg">
        PREDICTLE
      </h1>

      {/* Navigation Tabs */}
      <nav className="flex items-center justify-center gap-8">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <motion.div
              key={tab.href}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Link
                href={tab.href}
                className={clsx(
                  'relative px-10 py-3 rounded-full text-base font-semibold border border-gray-700/50 shadow-md transition-all duration-300',
                  active
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-blue-500/50 shadow-blue-500/40'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/40 hover:border-gray-600/50'
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







