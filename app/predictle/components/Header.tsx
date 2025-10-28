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
      <nav className="mt-8 flex flex-wrap items-center justify-center gap-8">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                'relative isolate rounded-2xl px-8 py-4 text-lg font-semibold leading-none',
                'transition-all duration-200 hover:-translate-y-0.5 focus:outline-none',
                'ring-1 ring-inset',
                // text is always white in mock
                'text-white',
                // ring color + shadow depend on active
                active
                  ? 'ring-cyan-400 shadow-[0_10px_30px_rgba(56,189,248,0.35)]'
                  : 'ring-slate-500/40 shadow-[0_8px_24px_rgba(56,189,248,0.15)]'
              )}
            >
              {/* glossy gradient fill (layered behind text) */}
              <span
                aria-hidden
                className={clsx(
                  'absolute inset-0 -z-10 rounded-2xl bg-gradient-to-b',
                  active
                    ? 'from-cyan-400 to-blue-600 opacity-100'
                    : 'from-cyan-500 to-blue-700 opacity-80'
                )}
              />
              {/* subtle top shine */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/2 rounded-t-2xl bg-white/15"
              />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}




