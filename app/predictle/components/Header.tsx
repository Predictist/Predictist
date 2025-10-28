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
  console.log('PATHNAME:', pathname);

  return (
    <header className="flex flex-col items-center justify-center py-16 text-white bg-gradient-to-b from-gray-950 via-[#0b0e14] to-black">
      {/* Logo */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-cyan-500/20 rounded-full scale-150" />
          <Image
            src="/predictle-logo.png"
            alt="Predictle Logo"
            width={300} // ✅ larger logo
            height={300}
            className="mx-auto mb-4 rounded-lg bg-transparent"
            priority
          />
        </div>
        <div className="w-56 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-70" />
      </div>

      {/* Navigation Tabs */}
      {/* Navigation Tabs */}
{/* Navigation Tabs */}
{/* Navigation Tabs */}
<nav className="flex items-center justify-center gap-6 mt-10">
  {tabs.map((tab) => {
    const active = pathname?.startsWith(tab.href) ?? false
    return (
      <Link
        key={tab.href}
        href={tab.href}
        className={clsx(
          'px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 shadow-md focus:outline-none',
          active
            ? 'bg-blue-600 text-white shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/40'
            : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-white hover:shadow-gray-500/30'
        )}
      >
        {tab.label}
      </Link>
    )
  })}
</nav>
    </header>
  );
}



