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
  const pathname = usePathname() ?? '';

  return (
    <header className="flex flex-col items-center justify-center py-16 text-white bg-gradient-to-b from-gray-950 via-[#0b0e14] to-black">
      {/* Logo (no glow, blends into bg) */}
      <Image
        src="/predictle-logo.png"
        alt="Predictle Logo"
        width={300}
        height={300}
        className="mx-auto mb-2"
        priority
      />

      {/* Mode Buttons – glossy blue capsules */}
      {/* Navigation Tabs */}
<nav className="flex items-center justify-center gap-8 mt-8">
  {tabs.map((tab) => {
    const active = pathname?.startsWith(tab.href) ?? false;
    return (
      <Link
        key={tab.href}
        href={tab.href}
        className={clsx(
          'relative isolate rounded-2xl px-10 py-4 text-lg font-semibold leading-none transition-all duration-300',
          'focus:outline-none shadow-md hover:-translate-y-0.5',
          active
            ? 'text-white'
            : 'text-white/90 hover:text-white'
        )}
      >
        {/* Blue glossy background */}
        <span
          aria-hidden
          className={clsx(
            'absolute inset-0 -z-10 rounded-2xl bg-gradient-to-b from-cyan-400 to-blue-600 transition-all duration-300',
            active ? 'opacity-100' : 'opacity-70 hover:opacity-90'
          )}
        />
        {/* Subtle top shine */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-1/2 rounded-t-2xl bg-white/15"
        />
        {tab.label}
      </Link>
    );
  })}
</nav>
    </header>
  );
}




