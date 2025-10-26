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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState('');
  const [source, setSource] = useState<string>('Gamma');

  useEffect(() => {
    fetchMarketsWithFallback();
  }, []);

  async function fetchMarketsWithFallback() {
    try {
      const res = await fetch('/api/polymarket');
const data = await res.json();
setSource(data.source || 'Gamma');

let live = normalizeLiveMarkets(data.markets);

// fallback: if no valid markets, use mock data
if (!live || live.length === 0) {
  console.warn('No live markets found — using demo questions');
  live = [
    {
      id: 'demo1',
      question: 'Will the sun rise tomorrow?',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes',
    },
    {
      id: 'demo2',
      question: 'Will Bitcoin still exist in 2026?',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes',
    },
    {
      id: 'demo3',
      question: 'Will AI models improve next year?',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes',
    },
    {
      id: 'demo4',
      question: 'Will humans colonize Mars before 2035?',
      options: ['Yes', 'No'],
      correctAnswer: 'No',
    },
    {
      id: 'demo5',
      question: 'Will the next iPhone cost over $1,000?',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes',
    },
  ];
}

setQuestions(live.slice(0, 20));
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

    setTimeout(() => {
      setAnswered(false);
      setResult('');
      setIndex((i) => (i + 1) % questions.length);
    }, 1200);
  }

  const q = questions[index];

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen p-6 text-center text-white">
      <LiveIndicator source={source} />

      <div className="predictle-card bg-gray-900 p-8 rounded-2xl shadow-lg max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6">🎮 Predictle — Free Play</h1>

        <AnimatePresence mode="wait">
          <motion.div
            key={q?.id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {q ? (
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

                <p className="text-sm text-gray-400 mt-8">
                  Score: {score} / {questions.length}
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


