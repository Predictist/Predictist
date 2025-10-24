'use client';

import Link from 'next/link';
import SignalWave from '@/components/SignalWave';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid #1A1A1A',
        background: '#0A0A0A',
        padding: '3rem 2rem',
        color: '#A1A1AA',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}
      >
        {/* --- top row: logo + links --- */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '2rem',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              color: '#F9FAFB',
            }}
          >
            <SignalWave size={28} strokeWidth={2.5} />
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: '1.2rem',
                color: '#F9FAFB',
                letterSpacing: '-0.02em',
              }}
            >
              Predictist
            </span>
          </Link>

          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              flexWrap: 'wrap',
              fontWeight: 500,
              fontSize: '0.95rem',
            }}
          >
            <Link href="/" style={{ color: '#A1A1AA', textDecoration: 'none' }}>
              Home
            </Link>
            <Link
              href="/predictle"
              style={{ color: '#A1A1AA', textDecoration: 'none' }}
            >
              Predictle
            </Link>
            <Link
              href="/dashboard"
              style={{ color: '#A1A1AA', textDecoration: 'none' }}
            >
              Dashboard
            </Link>
            <Link
              href="/subscribe"
              style={{ color: '#A1A1AA', textDecoration: 'none' }}
            >
              Subscribe
            </Link>
          </div>
        </div>

        {/* --- divider line --- */}
        <div
          style={{
            height: '1px',
            width: '100%',
            background: '#1A1A1A',
          }}
        />

        {/* --- bottom row: legal + socials --- */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            fontSize: '0.9rem',
            color: '#A1A1AA',
          }}
        >
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} Predictist. All rights reserved.
          </p>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#A1A1AA', textDecoration: 'none' }}
            >
              X
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#A1A1AA', textDecoration: 'none' }}
            >
              Discord
            </a>
            <a
              href="mailto:contact@predictist.com"
              style={{ color: '#A1A1AA', textDecoration: 'none' }}
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
