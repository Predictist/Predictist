'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameContainer from '../components/GameContainer';
import LiveIndicator from '@components/LiveIndicator';

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

export default function PredictleDaily() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState(0);
  const [source, setSource] = useState('Gamma');
  const [nextReset, setNextReset] = useState<string>('');

  const currentQuestion = questions[currentIndex];
  const score = answers.filter(Boolean).length;

  useEffect(() => {
    setupDaily();
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
      const diff = nextMidnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setNextReset(`${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60_000);
    return () => clearInterval(interval);
  }, []);

  function setupDaily() {
    const todayKey = new Date().toISOString().slice(0, 10);
    const stored = localStorage.getItem('predictle_daily');
    const parsed = stored ? JSON.parse(stored) : null;

    if (parsed?.date === todayKey) {
      setQuestions(parsed.questions);
      setAnswers(parsed.answers);
      setFinished(parsed.finished);
      setStreak(parsed.streak || 0);
      setSource(parsed.source || 'Gamma');
      return;
    }

    fetchMarkets(todayKey);
  }

  async function fetchMarkets(seed: string) {
    try {
      const res = await fetch('/api/polymarket', { cache: 'no-store' });
      const data = await res.json();
      const live = normalizeLiveMarkets(data?.markets || []);

      if (!live || live.length < 5) {
        console.warn('No valid live markets found.');
        setQuestions([]);
        setFinished(true);
        return;
      }

      setSource(data?.source === 'CLOB' ? 'CLOB' : 'Gamma');
      const dailySet = pickDailySet(live, seed, 5);
      setQuestions(dailySet);
      persistState(dailySet, [], false);
    } catch (err) {
      console.error('Error fetching markets:', err);
      setQuestions([]);
      setFinished(true);
    }
  }

  function pickDailySet(all: Question[], seed: string, count: number) {
    const seeded = [...all];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    for (let i = seeded.length - 1; i > 0; i--) {
      const j = Math.abs((hash + i * 17) % seeded.length);
      [seeded[i], seeded[j]] = [seeded[j], seeded[i]];
    }
    return seeded.slice(0, count);
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
        const p = typeof m.probability === 'number' ? m.probability : undefined;
        const correct = typeof p === 'number' ? (p > 0.5 ? opts[0] : opts[1]) : opts[0];
        return { id: m.id || q, question: q, options: opts, correctAnswer: correct };
      })
      .filter((m): m is Question => m !== null);
  }

  function handleGuess(choice: string) {
    if (!currentQuestion || finished) return;
    const correct = choice === currentQuestion.correctAnswer;
    const newAnswers = [...answers, correct];

    if (newAnswers.length === questions.length) {
      const todayKey = new Date().toISOString().slice(0, 10);
      const prevDate = localStorage.getItem('predictle_last_played');
      const newStreak = prevDate === todayKey ? streak : streak + 1;

      setAnswers(newAnswers);
      setFinished(true);
      setStreak(newStreak);
      persistState(questions, newAnswers, true, newStreak);
      localStorage.setItem('predictle_last_played', todayKey);
    } else {
      setAnswers(newAnswers);
      setCurrentIndex(currentIndex + 1);
      persistState(questions, newAnswers, false);
    }
  }

  function persistState(q: Question[], a: boolean[], f: boolean, s?: number) {
    localStorage.setItem(
      'predictle_daily',
      JSON.stringify({
        date: new Date().toISOString().slice(0, 10),
        questions: q,
        answers: a,
        finished: f,
        streak: s ?? streak,
        source,
      })
    );
  }

  function shareResults() {
    const todayKey = new Date().toISOString().slice(0, 10);
    const grid = answers.map((a) => (a ? '🟩' : '🟥')).join('');
    const text = `Predictle Daily (${todayKey})\n${grid}\nScore: ${score}/5 🔥 Streak: ${streak}`;
    navigator.clipboard.writeText(text);
    alert('Results copied! Share your streak 🟩🟥');
  }

  return (
    <GameContainer isLiveMode={source !== 'Demo'} title="📅 Predictle — Daily Challenge">
      <div className="absolute top-4 left-4">
        <LiveIndicator source={source} />
      </div>

      <AnimatePresence mode="wait">
        {!finished ? (
          currentQuestion ? (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-xl mb-6 font-medium text-gray-100">{currentQuestion.question}</p>

              <div className="flex justify-center gap-6">
                {currentQuestion.options.map((opt) => (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={opt}
                    onClick={() => handleGuess(opt)}
                    className={`px-6 py-3 rounded-xl text-lg font-semibold transition ${
                      opt === 'Yes'
                        ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20'
                        : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                    }`}
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>

              <p className="mt-6 text-sm text-gray-400">
                Question {currentIndex + 1} of {questions.length}
              </p>
            </motion.div>
          ) : (
            <p className="text-gray-400">Loading live markets...</p>
          )
        ) : (
          <motion.div
            key="finished"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <p className="text-lg mb-2 text-green-400 font-semibold">✅ You’ve finished today’s challenge!</p>
            <p className="text-xl mb-2 font-semibold">
              Score: {score}/5 <span className="text-sm text-gray-400">🔥 Streak: {streak}</span>
            </p>

            <div className="flex justify-center gap-2 mb-4 mt-4">
              {answers.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`w-8 h-8 rounded-md shadow ${a ? 'bg-green-500' : 'bg-red-500'}`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareResults}
              className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg font-medium mt-3 shadow-md"
            >
              Share Results 🟩🟥
            </motion.button>

            <p className="text-sm text-gray-400 mt-5">Next challenge in: {nextReset}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </GameContainer>
  );
}


