'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Mock fallback (used until your API key is live) ---
const MOCK_MARKETS = [
  { id: 'd1', question: 'Will Apple ship a foldable iPhone by 2026?', options: ['Yes', 'No'], correctAnswer: 'No' },
  { id: 'd2', question: 'Will Ethereum trade above $4,000 by June 2025?', options: ['Yes', 'No'], correctAnswer: 'Yes' },
  { id: 'd3', question: 'Will SpaceX land humans on Mars before 2030?', options: ['Yes', 'No'], correctAnswer: 'No' },
  { id: 'd4', question: 'Will AI regulation pass in the US by 2025?', options: ['Yes', 'No'], correctAnswer: 'No' },
  { id: 'd5', question: 'Will inflation fall below 2% by year-end?', options: ['Yes', 'No'], correctAnswer: 'Yes' },
  { id: 'd6', question: 'Will the next US President be Republican?', options: ['Yes', 'No'], correctAnswer: 'Yes' },
  { id: 'd7', question: 'Will TikTok be banned in the US by 2026?', options: ['Yes', 'No'], correctAnswer: 'No' },
  { id: 'd8', question: 'Will S&P 500 hit 6000 by 2026?', options: ['Yes', 'No'], correctAnswer: 'No' },
];

// normalize live markets -> { id, question, options: [a,b], correctAnswer }
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

const DAILY_COUNT = 5;

export default function DailyChallenge() {
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [pool, setPool] = useState<any[]>([]);
  const [five, setFive] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // boot: load markets + restore progress/lock per day
  useEffect(() => {
    const savedDate = localStorage.getItem('predictle_daily_date');
    const savedScore = parseFloat(localStorage.getItem('predictle_daily_score') || '0');
    const savedStreak = parseInt(localStorage.getItem('predictle_daily_streak') || '0', 10);

    if (savedDate === todayKey) {
      setScore(savedScore);
      setStreak(savedStreak);
      if (savedScore >= DAILY_COUNT) setLocked(true);
    } else {
      // New day reset (keep streak; we update it at the end of play)
      localStorage.setItem('predictle_daily_date', todayKey);
      localStorage.setItem('predictle_daily_score', '0');
    }

    (async () => {
      const markets = await fetchMarketsWithFallback();
      setPool(markets);
      // choose 5 unique markets for today
      const shuffled = [...markets].sort(() => 0.5 - Math.random());
      setFive(shuffled.slice(0, DAILY_COUNT));
    })();
  }, [todayKey]);

  const handleGuess = (choice: string) => {
    if (locked || !five[index]) return;

    const correct = choice === five[index].correctAnswer;
    const newScore = score + (correct ? 1 : 0);

    setScore(newScore);
    setResult(correct ? '✅ Correct' : `❌ Wrong — favored: ${five[index].correctAnswer}`);
    localStorage.setItem('predictle_daily_score', String(newScore));

    if (index >= DAILY_COUNT - 1) {
      // finished all 5 — lock for the day
      setLocked(true);
      localStorage.setItem('predictle_daily_date', todayKey);

      // simple streak rule: keep streak if 3+ correct today; else reset
      if (newScore >= 3) {
        const ns = streak + 1;
        setStreak(ns);
        localStorage.setItem('predictle_daily_streak', String(ns));
      } else {
        setStreak(0);
        localStorage.setItem('predictle_daily_streak', '0');
      }

      // show final banner a moment later
      setTimeout(() => setResult('Daily challenge complete!'), 1200);
    } else {
      setTimeout(() => {
        setIndex((i) => i + 1);
        setResult(null);
      }, 1200);
    }
  };

  const handleShare = async () => {
    const squares = Array(score).fill('🟩').concat(Array(DAILY_COUNT - score).fill('⬜️')).join('');
    const text = `${squares}\nPredictle Daily #${todayKey}\n${score}/${DAILY_COUNT} correct\npredictist.com/predictle/daily`;
    try {
      await navigator.clipboard.writeText(text);
      alert('📋 Results copied! Share it anywhere.');
    } catch {
      // fallback
      prompt('Copy your results:', text);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-4xl font-bold mb-3 tracking-tight bg-gradient-to-r from-violet-400 to-pink-400 text-transparent bg-clip-text">
        📅 Predictle Daily Challenge
      </h1>
      <p className="text-gray-400 mb-8">5 questions per day — come back tomorrow!</p>

      <div className="predictle-card p-8 w-full max-w-2xl relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={locked ? 'locked' : five[index]?.id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            {locked ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-lg mb-4 text-green-400">✅ You’ve finished today’s challenge!</p>
                <p className="text-gray-400 mb-2">Score: {score}/{DAILY_COUNT}</p>
                <p className="text-gray-400 mb-6">Streak: 🔥 {streak}</p>
                <button
                  onClick={handleShare}
                  className="predictle-btn bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Share Results
                </button>
              </motion.div>
            ) : five[index] ? (
              <>
                <p className="text-xl font-medium mb-6">{five[index].question}</p>

                {!result ? (
                  <div className="flex justify-center gap-6">
                    {five[index].options.map((opt: string) => (
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
                      result.startsWith('✅') ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {result}
                  </motion.p>
                )}

                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-700 rounded-full mt-8">
                  <motion.div
                    className="h-2 bg-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((index + 1) / DAILY_COUNT) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Question {index + 1} / {DAILY_COUNT}
                </p>
              </>
            ) : (
              <p>Loading today’s questions…</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}


