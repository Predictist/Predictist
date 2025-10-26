'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Mock fallback (used until your API key is live) ---
const MOCK_MARKETS = [
  { id: 'm1', question: 'Will Bitcoin trade above $100,000 by Dec 2025?', options: ['Yes', 'No'], correctAnswer: 'Yes' },
  { id: 'm2', question: 'Will SpaceX land humans on Mars before 2035?', options: ['Yes', 'No'], correctAnswer: 'Yes' },
  { id: 'm3', question: 'Will AI pass comprehensive US regulation by 2025?', options: ['Yes', 'No'], correctAnswer: 'No' },
  { id: 'm4', question: 'Will the S&P 500 hit 6000 by 2026?', options: ['Yes', 'No'], correctAnswer: 'No' },
  { id: 'm5', question: 'Will TikTok be banned in the U.S. by 2026?', options: ['Yes', 'No'], correctAnswer: 'No' },
];

// normalize live markets -> { id, question, options: [a,b], correctAnswer }
function normalizeLiveMarkets(
  raw: any[]
): { id: string; question: string; options: string[]; correctAnswer: string }[] {
  return (raw || [])
    .map((m: any) => {
      const question = m.question || m.title || 'Untitled market';
      const outcomesArr =
        (Array.isArray(m.outcomes) && m.outcomes.length === 2 && m.outcomes.map((o: any) => o.name)) ||
        (Array.isArray(m.tokens) && m.tokens.length === 2 && m.tokens.map((t: any) => t.ticker || t.outcome)) ||
        null;

      if (!outcomesArr) return null;

      // favor the side with probability >= 0.5 (when present)
      const p = typeof m.probability === 'number' ? m.probability : undefined;
      const correct =
        typeof p === 'number'
          ? (p >= 0.5 ? outcomesArr[0] : outcomesArr[1])
          : outcomesArr[0];

      return {
        id: String(m.id || m.condition_id || question),
        question,
        options: outcomesArr,
        correctAnswer: correct,
      };
    })
    .filter((m): m is { id: string; question: string; options: string[]; correctAnswer: string } => Boolean(m));
}

async function fetchMarketsWithFallback(): Promise<{ id: string; question: string; options: string[]; correctAnswer: string }[]> {
  try {
    const res = await fetch('/api/polymarket', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { markets } = await res.json();
    const normalized = normalizeLiveMarkets(markets);
    if (normalized && normalized.length) return normalized;
  } catch (e) {
    console.warn('Polymarket fetch failed, using mocks:', e);
  }
  return MOCK_MARKETS;
}

export default function FreePlayPage() {
  const [pool, setPool] = useState<any[]>([]);
  const [current, setCurrent] = useState<any | null>(null);
  const [score, setScore] = useState<number>(0);
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [totalPlayed, setTotalPlayed] = useState(0);

  useEffect(() => {
    const storedScore = parseFloat(localStorage.getItem('predictle_fp_score') || '0');
    setScore(storedScore);
    (async () => {
      const markets = await fetchMarketsWithFallback();
      setPool(markets);
      setCurrent(markets[Math.floor(Math.random() * markets.length)]);
    })();
  }, []);

  const nextQuestion = () => {
    if (!pool.length) return;
    const next = pool[Math.floor(Math.random() * pool.length)];
    setCurrent(next);
    setAnswered(false);
    setResult(null);
  };

  const handleGuess = (choice: string) => {
    if (!current || answered) return;
    const correct = choice === current.correctAnswer;
    const newScore = correct ? score + 1 : Math.max(0, score - 0.5);
    setScore(newScore);
    setAnswered(true);
    setResult(
      correct ? '✅ Correct' : `❌ Wrong — favored: ${current.correctAnswer}`
    );
    setTotalPlayed((n) => n + 1);
    localStorage.setItem('predictle_fp_score', String(newScore));

    // rotate automatically after a short beat
    setTimeout(nextQuestion, 1600);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-4xl font-bold mb-3 tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
        🎯 Predictle: Free Play
      </h1>
      <p className="text-gray-400 mb-8">Endless yes/no prediction challenges</p>

      <div className="predictle-card p-8 w-full max-w-2xl relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current?.id || totalPlayed}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            {current ? (
              <>
                <p className="text-xl font-medium mb-6">{current.question}</p>

                {!answered ? (
                  <div className="flex justify-center gap-6">
                    {current.options.map((opt: string) => (
                      <button
                        key={opt}
                        onClick={() => handleGuess(opt)}
                        className={`predictle-btn text-white ${opt === 'Yes' ? 'yes' : opt === 'No' ? 'no' : 'bg-blue-600'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <motion.p
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className={`text-xl font-semibold mt-4 ${
                      result?.startsWith('✅') ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {result}
                  </motion.p>
                )}
              </>
            ) : (
              <p>Loading question…</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 text-gray-400 text-sm">
        <p>Questions Answered: {totalPlayed}</p>
        <p>Score: {score.toFixed(1)}</p>
      </div>
    </main>
  );
}


