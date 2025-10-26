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
  console.log('Header component loaded');

  return (
    <header className="flex flex-col items-center justify-center py-12 text-white space-y-6">
      <h1 className="text-4xl font-extrabold tracking-wide text-cyan-400 drop-shadow-lg">
        PREDICTLE
      </h1>

      {/* Toggle Bar */}
      <div className="relative">
        <nav className="flex items-center justify-center bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-full p-1 shadow-lg">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative px-6 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                  active
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Glow ring */}
        <motion.div
          className="absolute -inset-1 rounded-full bg-cyan-500/10 blur-xl"
          animate={{
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </header>
  );
}






