'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import SignalWave from '@/components/SignalWave'; // ✅ animated logo component

// Navigation links
const links = [
  { href: '/', label: 'Home' },
  { href: '/predictle', label: 'Predictle' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/subscribe', label: 'Subscribe' },
];

export default function NavBar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Adds scroll effect for translucent header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--card-border)',
        background: scrolled
          ? 'rgba(14,17,22,0.85)'
          : 'rgba(14,17,22,0.55)',
        transition: 'background 0.3s ease, border 0.3s ease',
      }}
    >
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 2rem',
        }}
      >
        {/* Logo + Wordmark */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textDecoration: 'none',
          }}
        >
          {/* Animated signal wave */}
          <SignalWave animated size={34} strokeWidth={3} />

          {/* Predictist wordmark */}
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '1.28rem',
              background: 'linear-gradient(90deg, var(--accent), #6aa5ff)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            Predictist
          </span>
        </Link>

        {/* Nav Links + Theme Toggle */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color:
                  pathname === link.href ? 'var(--accent)' : 'var(--text)',
                fontWeight: pathname === link.href ? 600 : 500,
                transition: 'color 0.25s ease',
              }}
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
