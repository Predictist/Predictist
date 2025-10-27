'use client';

import Image from 'next/image';
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
    <header className="flex flex-col items-center justify-center py-16 text-white bg-gradient-to-b from-gray-950 via-[#0b0e14] to-black">
      {/* Logo */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-cyan-500/20 rounded-full scale-150" />
          <Image
            src="/predictle-logo.png"
            alt="Predictle Logo"
            width={240} // ✅ larger logo
            height={240}
            className="relative drop-shadow-[0_0_25px_rgba(34,211,238,0.6)]"
            priority
          />
        </div>
        <div className="w-56 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-70" />
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center justify-center gap-10 mt-10">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                'relative px-10 py-4 rounded-full text-lg font-semibold border transition-all duration-300 tracking-wide',
                active
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                  : 'text-gray-300 border-gray-600 hover:text-white hover:shadow-[0_0_15px_rgba(34,211,238,0.6)] hover:bg-gray-800/40 hover:border-gray-500'
              )}
            >
              {/* Animated light sweep */}
              <span className="relative z-10">{tab.label}</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700 rounded-full" />
            </Link>
          );
        })}
      </nav>
    </header>
  );
}



