'use client';

import Link from 'next/link';

export default function PredictleResults() {
  const correct = 68;
  const userGuess = 62;
  const offBy = Math.abs(correct - userGuess);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at 50% 20%, #0A0E1A, #05070D 80%)',
        color: '#F8FAFC',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h1
        style={{
          fontSize: '3rem',
          fontWeight: 800,
          color: '#00E5FF',
          textShadow: '0 0 20px rgba(0, 229, 255, 0.6)',
          marginBottom: '1rem',
        }}
      >
        Results
      </h1>
      <p style={{ color: '#94A3B8', marginBottom: '3rem' }}>
        Here’s how your forecast stacked up.
      </p>

      <div
        style={{
          background: 'rgba(16,20,31,0.9)',
          border: '1px solid #1A1A1A',
          borderRadius: '16px',
          padding: '3rem 2rem',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 0 25px rgba(0,229,255,0.05)',
        }}
      >
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>
          Market: <span style={{ color: '#00E5FF' }}>U.S. Recession 2025</span>
        </h2>

        <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
          🎯 Real Probability: <strong>{correct}%</strong>
        </p>
        <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
          🧠 Your Guess: <strong>{userGuess}%</strong>
        </p>
        <p style={{ fontSize: '1.2rem', color: '#2EE6B9' }}>
          Off by {offBy}%
        </p>

        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/predictle/play" className="button-accent">
            Play Again
          </Link>
          <Link href="/" className="button-secondary">
            Back to Predictist
          </Link>
        </div>
      </div>

      <div style={{ marginTop: '3rem', color: '#94A3B8' }}>
        <p>Share your result:</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button style={{ background: 'transparent', border: '1px solid #1A1A1A', color: '#00E5FF', borderRadius: '6px', padding: '0.5rem 1rem' }}>Copy Result</button>
          <button style={{ background: 'transparent', border: '1px solid #1A1A1A', color: '#F9FAFB', borderRadius: '6px', padding: '0.5rem 1rem' }}>Share</button>
        </div>
      </div>
    </main>
  );
}
