'use client';

import Link from 'next/link';

export default function PredictleAbout() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0A0E1A 0%, #05070D 100%)',
        color: '#F8FAFC',
        padding: '6rem 2rem',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontSize: '3rem',
          fontWeight: 800,
          marginBottom: '1rem',
          color: '#00E5FF',
          textShadow: '0 0 20px rgba(0,229,255,0.4)',
        }}
      >
        About Predictle
      </h1>
      <p
        style={{
          color: '#94A3B8',
          fontSize: '1.15rem',
          maxWidth: '700px',
          margin: '0 auto 3rem auto',
          lineHeight: 1.7,
        }}
      >
        Predictle is where prediction meets play. It’s a daily guessing challenge built on real-world prediction markets —
        helping you learn how probabilities, forecasts, and expectations work through interactive gameplay.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          maxWidth: '1000px',
          margin: '0 auto',
        }}
      >
        {[
          {
            title: 'Learn Through Play',
            desc: 'Each guess teaches you how the world’s traders think about the future.',
          },
          {
            title: 'Data Meets Design',
            desc: 'Powered by prediction markets, Predictle turns live probabilities into an interactive experience.',
          },
          {
            title: 'Part of the Predictist Ecosystem',
            desc: 'Predictle connects to Predictist’s dashboards, newsletters, and data streams.',
          },
        ].map((f) => (
          <div
            key={f.title}
            style={{
              background: 'rgba(16,20,31,0.9)',
              border: '1px solid #1A1A1A',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'left',
            }}
          >
            <h3 style={{ color: '#00E5FF', marginBottom: '0.75rem' }}>
              {f.title}
            </h3>
            <p style={{ color: '#94A3B8', lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '3rem' }}>
        <Link href="/predictle/play" className="button-accent">
          Start Playing
        </Link>
      </div>
    </main>
  );
}
