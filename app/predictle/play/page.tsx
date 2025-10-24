'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PredictlePlay() {
  const [guess, setGuess] = useState(50);
  const [submitted, setSubmitted] = useState(false);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background:
          'radial-gradient(circle at center, #0C101B 0%, #05070D 80%)',
        color: '#F8FAFC',
      }}
    >
      {/* ===== Header ===== */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1
          style={{
            fontSize: '2.8rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#00E5FF',
            textShadow: '0 0 18px rgba(0, 229, 255, 0.6)',
          }}
        >
          Predictle
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '1rem' }}>
          Guess the world’s odds — one question at a time.
        </p>
      </div>

      {/* ===== Game Card ===== */}
      <div
        style={{
          background: 'rgba(16, 20, 31, 0.9)',
          border: '1px solid #1A1A1A',
          borderRadius: '16px',
          padding: '3rem 2rem',
          textAlign: 'center',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 0 30px rgba(0, 229, 255, 0.05)',
          transition: 'transform 0.3s ease',
        }}
      >
        <h2
          style={{
            fontSize: '1.4rem',
            marginBottom: '2rem',
            lineHeight: 1.4,
          }}
        >
          Will the U.S. economy avoid a recession in 2025?
        </h2>

        {/* Slider */}
        <input
          type="range"
          min="0"
          max="100"
          value={guess}
          onChange={(e) => setGuess(Number(e.target.value))}
          style={{
            width: '100%',
            accentColor: '#00E5FF',
            cursor: 'pointer',
            marginBottom: '1.5rem',
          }}
        />
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Your guess: <strong>{guess}%</strong>
        </p>

        {/* Buttons */}
        {!submitted ? (
          <button
            onClick={() => setSubmitted(true)}
            style={{
              background:
                'linear-gradient(90deg, #00E5FF 0%, #2EE6B9 100%)',
              color: '#0A0A0A',
              fontWeight: 700,
              borderRadius: '8px',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(0, 229, 255, 0.3)',
              transition: 'transform 0.2s ease',
            }}
          >
            Submit Guess
          </button>
        ) : (
          <div>
            <p style={{ marginTop: '1.5rem', color: '#94A3B8' }}>
              🎯 The real probability was <strong>68%</strong>
            </p>
            <p style={{ color: '#00E5FF', fontWeight: 600 }}>
              You were off by {Math.abs(68 - guess)}%
            </p>
            <div
              style={{
                marginTop: '1.5rem',
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
              }}
            >
              <button
                onClick={() => setSubmitted(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid #1A1A1A',
                  color: '#F8FAFC',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Next Question
              </button>
              <Link
                href="/predictle/results"
                style={{
                  color: '#00E5FF',
                  textDecoration: 'none',
                  alignSelf: 'center',
                }}
              >
                View Results →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ===== Footer ===== */}
      <footer
        style={{
          marginTop: '4rem',
          color: '#64748B',
          fontSize: '0.9rem',
        }}
      >
        <p>
          Powered by <Link href="/" style={{ color: '#00E5FF' }}>Predictist</Link>
        </p>
      </footer>
    </main>
  );
}