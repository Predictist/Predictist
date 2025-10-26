'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function PredictleNav() {
  const pathname = usePathname();
  const links = [
    { href: '/predictle/free', label: '🎮 Free Play' },
    { href: '/predictle/daily', label: '📅 Daily Challenge' },
  ];

  return (
    <nav className="flex justify-center items-center py-4 mb-6">
      <div className="flex gap-4 bg-gray-900/60 backdrop-blur-md px-6 py-2 rounded-full border border-gray-700/40 shadow-md">
        {links.map(({ href, label }) => {
          const active = pathname?.startsWith(href) ?? false;
          return (
            <Link key={href} href={href} className="relative">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className={`text-sm sm:text-base font-medium transition ${
                  active ? 'text-blue-400' : 'text-gray-300 hover:text-white'
                }`}
              >
                {label}
              </motion.span>
              {active && (
                <motion.div
                  layoutId="underline"
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-blue-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
