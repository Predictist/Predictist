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
    <header className="relative flex flex-col items-center justify-center py-10 bg-transparent">
      {/* Title */}
      <h1 className="text-cyan-400 text-4xl font-extrabold mb-6 tracking-wide text-center drop-shadow-lg">
        PREDICTLE
      </h1>

      {/* Toggle Bar */}
      <div className="relative flex justify-center w-full">
        <nav
          className="relative flex items-center justify-center space-x-2 
                     bg-gray-900/70 border border-gray-800 rounded-full 
                     px-2 py-2 shadow-[0_0_12px_rgba(0,0,0,0.4)] backdrop-blur-sm"
        >
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300
                  ${active
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-full bg-gradient-to-r 
                               from-cyan-500 to-blue-500 shadow-[0_0_12px_rgba(56,189,248,0.6)]"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}



