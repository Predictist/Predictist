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
<section
  className="fade-in"
  style={{
    background: 'radial-gradient(circle at center, #111 0%, #0A0A0A 60%)',
    borderRadius: '20px',
    padding: '6rem 2rem',
  }}
>
  <h1
    style={{
      fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
      fontWeight: 700,
      marginBottom: '1rem',
      color: '#F9FAFB',
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    }}
  >
    See what the world believes will happen.
  </h1>

  <p
    style={{
      color: 'var(--text-muted)',
      fontSize: '1.15rem',
      marginBottom: '2.5rem',
      maxWidth: '650px',
      marginInline: 'auto',
      lineHeight: 1.6,
    }}
  >
    Predictist tracks the world’s expectations — from prediction markets to public sentiment — turning data into insight and foresight.
  </p>

  <div
    style={{
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap',
    }}
  >
    <Link href="/subscribe" className="button-accent">
      Subscribe
    </Link>
    <Link href="/dashboard" className="button-secondary">
      Explore Dashboard
    </Link>
  </div>
</section>


      {/* ================= FEATURES ================= */}
      <section className="fade-in" style={{ width: '100%' }}>
        <h2
          style={{
            fontSize: '2rem',
            marginBottom: '2rem',
            color: '#F9FAFB',
          }}
        >
          The Predictist Ecosystem
        </h2>
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
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'left',
                background: 'var(--surface)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.transform = 'none';
              }}
            >
              <h3
                style={{
                  marginBottom: '0.75rem',
                  fontSize: '1.5rem',
                  color: '#F9FAFB',
                }}
              >
                {f.title}
              </h3>
              <p style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= TRENDING MARKETS ================= */}
      <section className="fade-in" style={{ width: '100%' }}>
        <h2
          style={{
            fontSize: '2rem',
            marginBottom: '2rem',
            color: '#F9FAFB',
          }}
        >
          Top Trending Markets
        </h2>
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
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.5rem',
                background: 'var(--surface)',
              }}
            >
              <h4 style={{ marginBottom: '0.5rem', color: '#F9FAFB' }}>{m.title}</h4>
              <p style={{ color: 'var(--text-muted)' }}>
                <strong style={{ color: '#F9FAFB' }}>{m.prob}</strong>{' '}
                <span
                  style={{
                    color: m.change.startsWith('+') ? '#00FFA0' : '#FF4D4D',
                    fontWeight: 500,
                  }}
                >
                  {m.change}
                </span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= NEWSLETTER CTA ================= */}
      <section className="fade-in" style={{ width: '100%' }}>
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '3rem 2rem',
            textAlign: 'center',
            background: 'var(--surface)',
          }}
        >
          <h2
            style={{
              fontSize: '2rem',
              marginBottom: '1rem',
              color: '#F9FAFB',
            }}
          >
            Join thousands staying ahead of the world’s expectations.
          </h2>
          <p
            style={{
              color: 'var(--text-muted)',
              marginBottom: '2rem',
              maxWidth: '600px',
              marginInline: 'auto',
            }}
          >
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
                border: '1px solid var(--border)',
                minWidth: '250px',
                background: '#0D0D0D',
                color: 'var(--text)',
              }}
            />
            <button className="button-accent">Subscribe</button>
          </div>
        </div>
      </section>
    </main>
  );
}
