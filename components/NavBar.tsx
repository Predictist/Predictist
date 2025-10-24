'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import SignalWave from '@/components/SignalWave';

const links = [
  { href: '/predictle', label: 'Predictle' },
  { href: '/dashboard', label: 'Dashboard' },
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
        {/* Left: Logo */}
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
              color: '#F9FAFB',
              letterSpacing: '-0.02em',
            }}
          >
            Predictist
          </span>
        </Link>

        {/* Center: Links */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: pathname === link.href ? '#FFFFFF' : '#A1A1AA',
                fontWeight: pathname === link.href ? 600 : 500,
                textDecoration: 'none',
                transition: 'color 0.25s ease',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Auth actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            href="#"
            style={{
              color: '#A1A1AA',
              fontWeight: 500,
              textDecoration: 'none',
              fontSize: '0.95rem',
            }}
          >
            Log in
          </Link>
          <Link
            href="#"
            style={{
              background: '#F9FAFB',
              color: '#0A0A0A',
              fontWeight: 600,
              borderRadius: '8px',
              padding: '0.5rem 1.25rem',
              textDecoration: 'none',
              fontSize: '0.95rem',
            }}
          >
            Sign up
          </Link>
        </div>
      </nav>
    </header>
  );
}
