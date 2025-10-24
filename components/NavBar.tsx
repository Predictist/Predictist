'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import SignalWave from '@/components/SignalWave'; // animated logo component

const links = [
  { href: '/', label: 'Home' },
  { href: '/predictle', label: 'Predictle' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/subscribe', label: 'Subscribe' },
];

export default function NavBar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

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
        background: scrolled ? 'rgba(10,10,10,0.9)' : 'rgba(10,10,10,0.7)',
        borderBottom: '1px solid #1A1A1A',
        transition: 'background 0.3s ease, border 0.3s ease',
      }}
    >
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
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
          <SignalWave animated size={34} strokeWidth={3} />
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '1.28rem',
              color: '#F9FAFB', // clean white text
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            Predictist
          </span>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color:
                  pathname === link.href ? '#FFFFFF' : '#A1A1AA',
                fontWeight: pathname === link.href ? 600 : 500,
                textDecoration: 'none',
                transition: 'color 0.25s ease',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
