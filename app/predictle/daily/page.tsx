'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import LiveIndicator from '@components/LiveIndicator';

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

export default function PredictleDaily() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState('');
  const [locked, setLocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [source, setSource] = useState<string>('Gamma');
  const { width, height } = useWindowSize();

  useEffect(() => {
    const todayKey = new Date().toDateString();
    const lastDate = localStorage.getItem('predictle_daily_date');

    if (lastDate === todayKey) {
      setLocked(true);
      return;
    }

    fetchMarketsWithFallback();
  }, []);

  async function fetchMarketsWithFallback() {
    try {
      const res = await fetch('/api/polymarket');
      const data = await res.json();
      setSource(data.source || 'Gamma');
      const live = normalizeLiveMarkets(data.markets);
      setQuestions(live.slice(0, 5));
    } catch (err) {
      console.error('Error fetching markets:', err);
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

        const p = typeof m.probability === 'number' ? m.probability : undefined;
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

  function handleGuess(answer: string) {
    if (answered) return;
    const current = questions[index];
    const isCorrect = answer === current.correctAnswer;
    setAnswered(true);
    setResult(isCorrect ? '✅ Correct!' : '❌ Wrong!');
    if (isCorrect) setScore(score + 1);

    if (index >= 4) {
      localStorage.setItem('predictle_daily_date', new Date().toDateString());
      setLocked(true);

      if (score + (isCorrect ? 1 : 0) >= 5) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      return;
    }

    setTimeout(() => {
      setAnswered(false);
      setResult('');
      setIndex((i) => i + 1);
    }, 1200);
  }

  const q = questions[index];

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen p-6 text-center text-white">
      <LiveIndicator source={source} />
      {showConfetti && <Confetti width={width} height={height} recycle={false} />}

      <div className="predictle-card bg-gray-900 p-8 rounded-2xl shadow-lg max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6">📅 Predictle Daily Challenge</h1>

        <AnimatePresence mode="wait">
          <motion.div
            key={q?.id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {locked ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-lg text-green-400 mb-2">
                  ✅ You’ve finished today’s challenge!
                </p>
                <p className="text-gray-400 mb-4">Score: {score}/5</p>
                <p className="text-gray-500">Come back tomorrow for 5 new questions!</p>
              </motion.div>
            ) : q ? (
              <>
                <p className="text-xl mb-6">{q.question}</p>

                {!answered ? (
                  <div className="flex justify-center gap-6">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleGuess(opt)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-medium"
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
                      result.includes('Correct') ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {result}
                  </motion.p>
                )}

                <div className="w-full h-2 bg-gray-700 rounded-full mt-8">
                  <motion.div
                    className="h-2 bg-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((index + 1) / 5) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Question {index + 1} / 5
                </p>
              </>
            ) : (
              <p>Loading questions...</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}



