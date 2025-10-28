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
            width={240} // ✅ larger logo
            height={240}
            className="mx-auto mb-4 rounded-lg bg-transparent"
            priority
          />
        </div>
        <div className="w-56 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-70" />
      </div>

      {/* Navigation Tabs */}
      {/* Navigation Tabs */}
{/* Navigation Tabs */}
<nav className="flex items-center justify-center gap-6 mt-10">
  {tabs.map((tab) => {
    const active = pathname?.startsWith(tab.href) ?? false;
    return (
      <Link
        key={tab.href}
        href={tab.href}
        className={clsx(
          'px-8 py-3 rounded-xl text-base font-semibold transition-all duration-300 border shadow-sm',
          active
            ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700'
            : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white'
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



