'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const tabs = [
  { href: '/predictle/free', label: 'Free', emoji: '🎮' },
  { href: '/predictle/daily', label: 'Daily', emoji: '📅' },
  { href: '/predictle/slider', label: 'Slider', emoji: '🎚️' },
];

export default function Header() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur bg-black/50">
      <div className="flex flex-col items-center justify-center py-3 px-3">
        {/* Logo */}
        <Link
          href="/predictle"
          className="text-cyan-400 font-extrabold text-2xl tracking-wide mb-2 select-none"
        >
          PREDICTLE
        </Link>

        {/* Tabs */}
        <nav
          className="relative flex gap-1 bg-gray-900/80 border border-gray-800
                     rounded-full px-1 py-1 shadow-inner overflow-x-auto
                     scrollbar-hide max-w-full"
        >
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative z-10 flex items-center gap-1 px-5 py-2
                           text-sm font-medium rounded-full transition-colors
                           text-gray-300 whitespace-nowrap hover:text-white"
              >
                <span>{tab.emoji}</span>
                {tab.label}
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 z-[-1] rounded-full
                               bg-gradient-to-r from-cyan-500 to-blue-500
                               shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
