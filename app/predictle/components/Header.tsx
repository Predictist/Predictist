'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import logo from '@/public/predictle-logo.png';

const tabs = [
  { href: '/predictle/free', label: 'Free Play' },
  { href: '/predictle/daily', label: 'Daily Challenge' },
  { href: '/predictle/slider', label: 'Slider Mode' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="flex flex-col items-center justify-center py-12 text-white bg-gradient-to-b from-gray-950 via-[#0b0e14] to-black">
      {/* Logo Section */}
      <div className="flex flex-col items-center space-y-3">
        <Image
          src={logo}
          alt="Predictle Logo"
          width={140}
          height={140}
          className="drop-shadow-[0_0_18px_rgba(34,211,238,0.5)]"
        />
        <div className="w-40 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-70" />
      </div>

      {/* Mode Buttons */}
      <nav className="flex items-center justify-center gap-10 mt-8">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                'px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 border shadow-md',
                active
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                  : 'bg-transparent text-gray-300 border-gray-600 hover:text-white hover:bg-gray-800/40 hover:border-gray-500 hover:shadow-[0_0_12px_rgba(34,211,238,0.4)]'
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








