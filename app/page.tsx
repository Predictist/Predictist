'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import SignalWave from '@/components/SignalWave';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6rem',
        padding: '6rem 2rem',
        textAlign: 'center',
        maxWidth: '1100px',
        margin: '0 auto',
      }}
    >
      {/* ================= HERO ================= */}
      <section>
        <div style={{ marginBottom: '2rem' }}>
          <SignalWave animated size={80} strokeWidth={4} />
        </div>
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            marginBottom: '1rem',
            background: 'linear-gradient(90deg, var(--accent), #6aa5ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          See what the world believes will happen.
        </h1>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '1.2rem',
            marginBottom: '2rem',
          }}
        >
          Predictist combines data, dashboards, and games to track global expectations in real time.
        </p>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/predictle"
            className="button-accent"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--accent)',
              color: 'white',
              borderRadius: '8px',
              fontWeight: 600,
            }}
          >
            🎮 Play Predictle
          </Link>
          <Link
            href="/dashboard"
            className="button-secondary"
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid var(--card-border)',
              borderRadius: '8px',
              color: 'var(--text)',
              fontWeight: 600,
            }}
          >
            📊 Explore Dashboard
          </Link>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section style={{ width: '100%' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>The Predictist Ecosystem</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {[
            {
              title: 'Predictle',
              desc: 'A daily prediction challenge. Guess the odds. Beat the crowd.',
              href: '/predictle',
            },
            {
              title: 'Dashboard',
              desc: 'Track what’s trending in the world’s prediction markets.',
              href: '/dashboard',
            },
            {
              title: 'Newsletters',
              desc: 'The Edge & Odds On: decoding what the data really means.',
              href: '/subscribe',
            },
          ].map((f) => (
            <Link
              key={f.title}
              href={f.href}
              style={{
                border: '1px solid var(--card-border)',
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'left',
                background: 'rgba(255,255,255,0.03)',
                transition: 'transform 0.2s ease, border 0.2s ease',
              }}
            >
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.5rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= TRENDING MARKETS ================= */}
      <section style={{ width: '100%' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Top Trending Markets</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {[
            {
              title: 'Will Bitcoin reach $100k before 2026?',
              prob: '62%',
              change: '+4%',
            },
            {
              title: 'Will Trump win the 2024 election?',
              prob: '55%',
              change: '-2%',
            },
            {
              title: 'Will AI-generated music hit #1 on Billboard?',
              prob: '21%',
              change: '+6%',
            },
          ].map((m) => (
            <div
              key={m.title}
              style={{
                border: '1px solid var(--card-border)',
                borderRadius: '12px',
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <h4 style={{ marginBottom: '0.5rem' }}>{m.title}</h4>
              <p>
                <strong>{m.prob}</strong>{' '}
                <span style={{ color: m.change.startsWith('+') ? '#00ffa0' : '#ff4d4d' }}>
                  {m.change}
                </span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= NEWSLETTER CTA ================= */}
      <section style={{ width: '100%' }}>
        <div
          style={{
            border: '1px solid var(--card-border)',
            borderRadius: '16px',
            padding: '3rem 2rem',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.03)',
          }}
        >
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            Join thousands staying ahead of the world’s expectations.
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Subscribe to The Edge and Odds On for prediction-market insights and trends.
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <input
              type="email"
              placeholder="you@example.com"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--card-border)',
                minWidth: '250px',
                background: 'rgba(0,0,0,0.3)',
                color: 'var(--text)',
              }}
            />
            <button
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                background: 'var(--accent)',
                color: 'white',
                fontWeight: 600,
                border: 'none',
              }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

