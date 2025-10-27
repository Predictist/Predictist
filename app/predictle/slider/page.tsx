'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveIndicator from '@components/LiveIndicator';
import GameContainer from '../components/GameContainer';

type Q = {
  id: string;
  question: string;
  options: string[];
  marketProb: number;
};

export default function PredictleSlider() {
  const [pool, setPool] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [guess, setGuess] = useState(50);
  const [locked, setLocked] = useState(false);
  const [lastResult, setLastResult] = useState<null | { delta: number; market: number }>(null);
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [source, setSource] = useState<'CLOB' | 'Gamma' | 'Demo'>('Gamma');

  const current = pool[idx];

  useEffect(() => {
    fetchMarketsWithFallback();
  }, []);

  async function fetchMarketsWithFallback() {
    try {
      const res = await fetch('/api/polymarket', { cache: 'no-store' });
      const data = await res.json();
      let live = normalize(data?.markets || []);
      if (!live.length) {
        setSource('Demo');
        live = DEMO_SET;
      } else {
        setSource(data?.source === 'CLOB' ? 'CLOB' : 'Gamma');
      }
      setPool(live.slice(0, 30));
    } catch (e) {
      console.error(e);
      setSource('Demo');
      setPool(DEMO_SET);
    }
  }

  function normalize(raw: any[]): Q[] {
    return (raw || [])
      .map((m: any) => {
        const q = m.question || m.title || 'Untitled market';
        const p =
          typeof m.probability === 'number'
            ? m.probability
            : typeof m?.outcomes?.[0]?.price === 'number'
            ? m.outcomes[0].price
            : typeof m?.tokens?.[0]?.price === 'number'
            ? m.tokens[0].price
            : typeof m?.tokens?.[0]?.price?.mid === 'number'
            ? m.tokens[0].price.mid
            : undefined;
        if (typeof p !== 'number' || p <= 0 || p >= 1) return null;
        return {
          id: String(m.id || q),
          question: q,
          options: ['Yes', 'No'],
          marketProb: Math.round(p * 100),
        };
      })
      .filter((x): x is Q => x !== null);
  }

  function submitGuess() {
    if (!current || locked) return;
    const delta = Math.abs(guess - current.marketProb);
    const points = Math.max(0, 100 - delta);
    setScore((s) => s + points);
    setRounds((r) => r + 1);
    setLastResult({ delta, market: current.marketProb });
    setLocked(true);
  }

  function next() {
    setLocked(false);
    setLastResult(null);
    setGuess(50);
    setIdx((i) => (i + 1) % pool.length);
  }

  const avg = useMemo(() => (rounds ? (score / rounds).toFixed(1) : '—'), [score, rounds]);

  return (
    <GameContainer isLiveMode={source !== 'Demo'} title="🎚️ Predictle — Slider Mode">

      <AnimatePresence mode="wait">
        {current ? (
          <motion.div
            key={current.id + String(idx)}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-xl mb-6 font-medium text-gray-100">{current.question}</p>

            <div className="mx-auto my-5 w-full max-w-xl">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={guess}
                onChange={(e) => setGuess(Number(e.target.value))}
                className="w-full accent-cyan-400"
                disabled={locked}
              />
              <div className="mt-2 text-lg font-semibold text-cyan-300">{guess}%</div>
            </div>

            {lastResult ? (
              <div className="mt-5">
                <div className="relative h-3 rounded-full bg-gray-700 overflow-hidden">
                  <div className="absolute inset-y-0 bg-cyan-400/40" style={{ width: `${lastResult.market}%` }} />
                  <div
                    className="absolute -top-1 h-5 w-1.5 bg-white rounded"
                    style={{ left: `calc(${guess}% - 2px)` }}
                    title="Your guess"
                  />
                  <div
                    className="absolute -top-1 h-5 w-1.5 bg-cyan-400 rounded"
                    style={{ left: `calc(${lastResult.market}% - 2px)` }}
                    title="Market probability"
                  />
                </div>
                <p className="mt-3 text-sm text-gray-300">
                  Market: <span className="text-cyan-300">{lastResult.market}%</span> • Δ{' '}
                  <span className="text-white">{lastResult.delta}</span> • Points:{' '}
                  <span className="text-green-400">{Math.max(0, 100 - lastResult.delta)}</span>
                </p>
                <div className="mt-5">
                  <button onClick={next} className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 font-medium">
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5">
                <button
                  onClick={submitGuess}
                  className="px-6 py-3 rounded-xl text-lg font-semibold bg-cyan-600 hover:bg-cyan-700"
                >
                  Submit
                </button>
              </div>
            )}

            <div className="mt-8 grid grid-cols-3 gap-3 text-sm text-gray-300">
              <div className="rounded-lg bg-gray-800/70 p-3 border border-gray-700/30">
                <p className="text-xs uppercase tracking-wide text-gray-400">Rounds</p>
                <p className="text-xl font-semibold">{rounds}</p>
              </div>
              <div className="rounded-lg bg-gray-800/70 p-3 border border-gray-700/30">
                <p className="text-xs uppercase tracking-wide text-gray-400">Total Points</p>
                <p className="text-xl font-semibold">{score}</p>
              </div>
              <div className="rounded-lg bg-gray-800/70 p-3 border border-gray-700/30">
                <p className="text-xs uppercase tracking-wide text-gray-400">Avg Score</p>
                <p className="text-xl font-semibold">{avg}</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <p className="text-gray-400">Loading questions…</p>
        )}
      </AnimatePresence>
    </GameContainer>
  );
}

/** Free/Slider fallback set only (Daily remains live-only) */
const DEMO_SET: Q[] = [
  { id: 's1', question: 'Will AI models improve next year?', options: ['Yes', 'No'], marketProb: 72 },
  { id: 's2', question: 'Will BTC be above $100k by 2026?', options: ['Yes', 'No'], marketProb: 41 },
  { id: 's3', question: 'Will US inflation fall below 2% by year-end?', options: ['Yes', 'No'], marketProb: 38 },
  { id: 's4', question: 'Will Apple release a foldable iPhone by 2026?', options: ['Yes', 'No'], marketProb: 27 },
  { id: 's5', question: 'Will the S&P 500 hit 6000 by 2026?', options: ['Yes', 'No'], marketProb: 36 },
];
