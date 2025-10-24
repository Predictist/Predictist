'use client';

import Link from 'next/link';

export default function LearnPage() {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4rem',
        padding: '6rem 2rem',
        textAlign: 'center',
        maxWidth: '1100px',
        margin: '0 auto',
      }}
    >
      {/* ======= HERO ======= */}
      <section className="fade-in" style={{ maxWidth: '800px' }}>
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 700,
            marginBottom: '1rem',
            color: '#F9FAFB',
          }}
        >
          Learn How Prediction Markets Work
        </h1>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '1.15rem',
            lineHeight: 1.6,
            maxWidth: '650px',
            marginInline: 'auto',
            marginBottom: '2.5rem',
          }}
        >
          From how odds reflect beliefs, to how traders move markets — Predictist helps you
          understand the data behind global expectations. Explore guides, insights, and interactive tools.
        </p>
      </section>

      {/* ======= GUIDES ======= */}
      <section className="fade-in" style={{ width: '100%' }}>
        <h2
          style={{
            fontSize: '1.75rem',
            marginBottom: '2rem',
            color: '#F9FAFB',
          }}
        >
          Foundational Guides
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
              title: 'What Are Prediction Markets?',
              desc: 'A beginner’s walkthrough of how markets forecast real-world events and probabilities.',
              href: '#',
            },
            {
              title: 'How Market Odds Reflect Public Belief',
              desc: 'Learn how prices encode collective expectations — and how they change over time.',
              href: '#',
            },
            {
              title: 'Why Forecasting Beats Polling',
              desc: 'Explore why aggregated prediction data often outperforms traditional opinion surveys.',
              href: '#',
            },
          ].map((guide) => (
            <Link
              key={guide.title}
              href={guide.href}
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
                  color: '#F9FAFB',
                  marginBottom: '0.75rem',
                  fontSize: '1.35rem',
                }}
              >
                {guide.title}
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {guide.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ======= LEARN BY PLAYING ======= */}
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
              fontSize: '1.75rem',
              marginBottom: '1rem',
              color: '#F9FAFB',
            }}
          >
            Learn by Playing
          </h2>
          <p
            style={{
              color: 'var(--text-muted)',
              marginBottom: '2rem',
              maxWidth: '600px',
              marginInline: 'auto',
              lineHeight: 1.6,
            }}
          >
            Get hands-on experience with prediction markets through Predictle — 
            our interactive game that turns forecasting into a fun, intuitive learning experience.
          </p>
          <Link href="/predictle" className="button-accent">
            Try Predictle
          </Link>
        </div>
      </section>
    </main>
  );
}
