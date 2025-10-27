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
      <nav className="flex items-center justify-center gap-10 mt-2">
  {tabs.map((tab) => {
    const active = pathname === tab.href;
    return (
      <motion.div key={tab.href} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
        <Link
          href={tab.href}
          className={clsx(
            'relative px-10 py-3 rounded-full text-lg font-semibold border transition-all duration-300',
            active
              ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)]'
              : 'text-gray-400 border-gray-700 hover:text-white hover:bg-gray-800/50'
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







