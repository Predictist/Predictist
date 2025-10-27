'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
      <nav className="flex items-center justify-center gap-6">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                'px-8 py-3 rounded-full text-base font-semibold border transition-all duration-300',
                active
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/40'
                  : 'text-gray-300 border-gray-600 hover:text-white hover:bg-gray-800/50 hover:border-gray-500'
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}







