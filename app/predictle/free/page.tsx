'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveIndicator from '@components/LiveIndicator';
import GameContainer from '../components/GameContainer';
import { getMarkets } from "@/lib/api";

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

export default function PredictleFree() {
  const [pool, setPool] = useState<Question[]>([]);
  const [current, setCurrent] = useState<Question | null>(null);
  const [score, setScore] = useState<number>(0);
  const [totalPlayed, setTotalPlayed] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState('');
  const [source, setSource] = useState<'CLOB' | 'Gamma' | 'Demo' | null>(null);

  useEffect(() => {
    const storedScore = parseFloat(localStorage.getItem('predictle_fp_score') || '0');
    if (!Number.isNaN(storedScore)) setScore(storedScore);
    fetchMarketsWithFallback();
  }, []);

  async function fetchMarketsWithFallback() {
  console.log("Fetching from dashboard API...");
  try {
    const markets = await getMarkets(100);
    console.log("Raw markets from API:", markets);

    const normalized = normalizeLiveMarkets(markets);
    console.log("Normalized markets:", normalized);

    if (!normalized || normalized.length === 0) {
      console.warn('No valid markets — falling back to DEMO_SET');
      setSource('Demo');
      setPool(DEMO_SET);
      setCurrent(DEMO_SET[Math.floor(Math.random() * DEMO_SET.length)]);
    } else {
      console.log("Using live markets!");
      setSource('CLOB');
      setPool(normalized);
      setCurrent(normalized[Math.floor(Math.random() * normalized.length)]);
    }
  } catch (err) {
    console.error('API fetch failed:', err);
    setSource('Demo');
    setPool(DEMO_SET);
    setCurrent(DEMO_SET[Math.floor(Math.random() * DEMO_SET.length)]);
  }
}

  function normalizeLiveMarkets(raw: any[]): Question[] {
    return (raw || [])
      .map((m: any) => {
        const q = m.question || m.title || 'Untitled market';
        const opts =
          (Array.isArray(m.outcomes) && m.outcomes.length === 2 && m.outcomes.map((o: any) => o.name)) ||
          (Array.isArray(m.tokens) && m.tokens.length === 2 && m.tokens.map((t: any) => t.ticker || t.outcome)) ||
          null;

        if (!opts) return null;

        const p = typeof m.yes_price === 'number' ? m.yes_price : undefined;
        const correct = typeof p === 'number' ? (p >= 0.5 ? opts[0] : opts[1]) : opts[0];

        return {
          id: String(m.id || m.condition_id || q),
          question: q,
          options: opts,
          correctAnswer: correct,
        };
      })
      .filter((m): m is Question => m !== null);
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
    setResult(correct ? 'Correct!' : `Wrong — favored: ${current.correctAnswer}`);
    setTotalPlayed((n) => n + 1);

    setTimeout(nextQuestion, 1300);
  }

  return (
    <GameContainer
      isLiveMode={source === 'CLOB' || source === 'Gamma'}
      title="Predictle — Free Play"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-gray-400 mb-6 text-sm">
          Unlimited questions. Practice mode using live markets (or demo when unavailable).
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={current?.id || totalPlayed}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {current ? (
              <>
                <p className="text-xl mb-6 font-medium text-gray-100">{current.question}</p>

                {!answered ? (
                  <div className="flex justify-center gap-6">
                    {current.options.map((opt) => (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        key={opt}
                        onClick={() => handleGuess(opt)}
                        className={`px-6 py-3 rounded-xl text-lg font-semibold transition ${
                          opt === 'Yes'
                            ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20'
                            : opt === 'No'
                            ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                        }`}
                      >
                        {opt}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <motion.p
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className={`text-xl font-semibold mt-5 ${
                      result.startsWith('Correct') ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {result}
                  </motion.p>
                )}

                <div className="mt-8 grid grid-cols-2 gap-3 text-sm text-gray-300">
                  <div className="rounded-lg bg-gray-800/70 p-3 border border-gray-700/30">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Questions Answered</p>
                    <p className="text-xl font-semibold">{totalPlayed}</p>
                  </div>
                  <div className="rounded-lg bg-gray-800/70 p-3 border border-gray-700/30">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Score</p>
                    <p className="text-xl font-semibold">{score.toFixed(1)}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-400">Loading questions…</p>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </GameContainer>
  );
}

/** Local demo set */
const DEMO_SET: Question[] = [
  { id: 'demo1', question: 'Will the sun rise tomorrow?', options: ['Yes', 'No'], correctAnswer: 'Yes' },
  { id: 'demo2', question: 'Will Bitcoin still exist in 2026?', options: ['Yes', 'No'], correctAnswer: 'Yes' },
  { id: 'demo3', question: 'Will AI models improve next year?', options: ['Yes', 'No'], correctAnswer: 'Yes' },
  { id: 'demo4', question: 'Will humans colonize Mars before 2035?', options: ['Yes', 'No'], correctAnswer: 'No' },
  { id: 'demo5', question: 'Will the next iPhone cost over $1,000?', options: ['Yes', 'No'], correctAnswer: 'Yes' },
];