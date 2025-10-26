'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveIndicator from '@components/LiveIndicator';

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

export default function PredictleFree() {
  // Pool + current (unlimited rotation)
  const [pool, setPool] = useState<Question[]>([]);
  const [current, setCurrent] = useState<Question | null>(null);

  // Score & flow
  const [score, setScore] = useState<number>(0);
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState('');
  const [totalPlayed, setTotalPlayed] = useState(0);

  // Live/Demo pill
  const [source, setSource] = useState<string>('Gamma'); // 'CLOB' | 'Gamma' | 'Demo'

  useEffect(() => {
    const storedScore = parseFloat(localStorage.getItem('predictle_fp_score') || '0');
    setScore(storedScore);
    fetchMarketsWithFallback();
  }, []);

  async function fetchMarketsWithFallback() {
    try {
      const res = await fetch('/api/polymarket', { cache: 'no-store' });
      const data = await res.json();

      // Normalize live markets
      let live = normalizeLiveMarkets(data?.markets || []);

      // If nothing usable, switch to demo set and mark source as Demo
      if (!live || live.length === 0) {
        console.warn('No live markets — using demo set');
        setSource('Demo');
        live = DEMO_SET;
      } else {
        // Show CLOB only if explicitly returned; otherwise Gamma
        setSource(data?.source === 'CLOB' ? 'CLOB' : 'Gamma');
      }

      setPool(live);
      setCurrent(live[Math.floor(Math.random() * live.length)]);
    } catch (err) {
      console.error('Fetch error — using demo set:', err);
      setSource('Demo');
      setPool(DEMO_SET);
      setCurrent(DEMO_SET[Math.floor(Math.random() * DEMO_SET.length)]);
    }
  }

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

        const p = typeof m.probability === 'number' ? m.probability : undefined; // prob of outcomes[0]
        const correct =
          typeof p === 'number' ? (p >= 0.5 ? outcomesArr[0] : outcomesArr[1]) : outcomesArr[0];

        return {
          id: String(m.id || m.condition_id || question),
          question,
          options: outcomesArr,
          correctAnswer: correct,
        };
      })
      .filter(
        (m): m is { id: string; question: string; options: string[]; correctAnswer: string } =>
          Boolean(m)
      );
  }

  function nextQuestion() {
    if (!pool.length) return;
    const next = pool[Math.floor(Math.random() * pool.length)];
    setCurrent(next);
    setAnswered(false);
    setResult('');
  }

  function handleGuess(choice: string) {
    if (!current || answered) return;

    const correct = choice === current.correctAnswer;
    const newScore = correct ? score + 1 : Math.max(0, score - 0.5);

    setScore(newScore);
    localStorage.setItem('predictle_fp_score', String(newScore));

    setAnswered(true);
    setResult(correct ? '✅ Correct!' : `❌ Wrong — favored: ${current.correctAnswer}`);
    setTotalPlayed((n) => n + 1);

    // rotate automatically after brief pause
    setTimeout(nextQuestion, 1300);
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen p-6 text-center text-white">
      <LiveIndicator source={source} />

      <div className="predictle-card bg-gray-900 p-8 rounded-2xl shadow-lg max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6">🎮 Predictle — Free Play</h1>

        <AnimatePresence mode="wait">
          <motion.div
            key={current?.id || totalPlayed}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {current ? (
              <>
                <p className="text-xl mb-6">{current.question}</p>

                {!answered ? (
                  <div className="flex justify-center gap-6">
                    {current.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleGuess(opt)}
                        className={`px-6 py-3 rounded-lg text-lg font-medium ${
                          opt === 'Yes'
                            ? 'bg-green-600 hover:bg-green-700'
                            : opt === 'No'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <motion.p
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`text-xl font-semibold mt-4 ${
                      result.startsWith('✅') ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {result}
                  </motion.p>
                )}

                <div className="mt-8 text-sm text-gray-400">
                  <p>Questions Answered: {totalPlayed}</p>
                  <p>Score: {score.toFixed(1)}</p>
                </div>
              </>
            ) : (
              <p>Loading questions…</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

// Local demo backup used when no live markets
const DEMO_SET: Question[] = [
  { id: 'demo1', question: 'Will the sun rise tomorrow?', options: ['Yes', 'No'], correctAnswer: 'Yes' },
  { id: 'demo2', question: 'Will Bitcoin still exist in 2026?', options: ['Yes', 'No'], correctAnswer: 'Yes' },
  { id: 'demo3', question: 'Will AI models improve next year?', options: ['Yes', 'No'], correctAnswer: 'Yes' },
  { id: 'demo4', question: 'Will humans colonize Mars before 2035?', options: ['Yes', 'No'], correctAnswer: 'No' },
  { id: 'demo5', question: 'Will the next iPhone cost over $1,000?', options: ['Yes', 'No'], correctAnswer: 'Yes' },
];


