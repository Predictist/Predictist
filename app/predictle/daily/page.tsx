// predictle/daily/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PredictleGame() {
  const [actual, setActual] = useState<number | null>(null);
  const [question, setQuestion] = useState('Loading market...');
  const [guess, setGuess] = useState(50);
  const [guesses, setGuesses] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [grid, setGrid] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const maxGuesses = 6;

  const [market, setMarket] = useState<{ question: string; yes_price: number } | null>(null);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const loadMarket = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/markets', {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Dashboard returned ${res.status}`);
      }

      const data = await res.json();
      const m = Array.isArray(data) ? data[0] : data;

      // VALIDATE: Must have question AND yes_price
      if (!m?.question?.trim() || m.yes_price == null) {
        throw new Error('Invalid market: missing question or price');
      }

      setMarket({
        question: m.question.trim(),
        yes_price: m.yes_price,
      });
      setActual(Math.round(m.yes_price * 100));
      setQuestion(m.question);
    } catch (err: any) {
      console.error('REAL MARKET REQUIRED:', err);
      setError(err.message || 'No valid market available');
    }
  };

  loadMarket();
}, []);

  const submitGuess = () => {
    if (gameOver || actual === null) return;
    const g = guess;
    const newGuesses = guesses + 1;
    setGuesses(newGuesses);

    if (g === actual) {
      setWon(true);
      endGame(true, newGuesses);
    } else if (newGuesses >= maxGuesses) {
      endGame(false);
    } else {
      const arrow = g < actual ? 'Higher' : 'Lower';
      setFeedback(prev => [...prev, `${g}¢ → ${arrow}`]);
      setGrid(prev => prev + (g < actual ? '⬜' : '⬛'));
    }
  };

  const endGame = (win: boolean, tries: number) => {
    setGameOver(true);
    if (win) {
      setGrid(prev => prev + '✅' + '⬜'.repeat(6 - tries));
    } else {
      setGrid('⬜'.repeat(6));
    }
  };

  const shareToX = () => {
    const score = won ? `${guesses}/6` : 'X/6';
    const clutch = guesses === 6 ? 'Nailed it on the last guess! 😅' : won ? `Got it in ${guesses}! 🔥` : 'Better luck tomorrow!';
    const text = `PREDICTLE #001: ${score}\n${clutch}\n\nPlay: https://predictist.io/predictle\n#PredictleStreak`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (actual === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-cyan-400 text-xl font-bold"
        >
          LOADING MARKET...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#0f1a2e] to-[#0a0e1a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-glow drop-shadow-lg">
            PREDICTLE #001
          </h1>
          <p className="text-cyan-300 text-sm mt-2 font-medium tracking-wider">6 GUESSES • 1 CENT • PURE SKILL</p>
        </div>

        {/* CARD */}
        <div className="relative bg-gradient-to-br from-[#0f1a2e]/80 to-[#0a0e1a]/80 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-xl -z-10"></div>

          {/* QUESTION */}
          <p className="text-gray-300 text-center text-sm mb-8 leading-relaxed">“{question}”</p>

          {!gameOver ? (
            <>
              {/* SLIDER CONTAINER */}
              <div className="relative mb-8">
                <div className="absolute inset-x-0 top-1/2 h-1 bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-600 transform -translate-y-1/2 rounded-full opacity-50 blur-md"></div>
                <input
                  type="range"
                  min="0"
                  max="99"
                  value={guess}
                  onChange={(e) => setGuess(parseInt(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-full appearance-none cursor-grab slider-glow"
                  style={{
                    background: `linear-gradient(to right, #0891b2 0%, #0891b2 ${guess}%, #1e293b ${guess}%, #1e293b 100%)`,
                  }}
                />
                <div className="flex justify-between mt-2 text-xs text-cyan-400 font-mono">
                  <span>0¢</span>
                  <span>99¢</span>
                </div>
              </div>

              {/* GUESS DISPLAY */}
              <motion.div
                key={guess}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-6xl font-black text-cyan-400 text-center mb-6 tracking-tighter"
              >
                {guess}¢
              </motion.div>

              {/* GUESS BUTTON */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={submitGuess}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold text-lg py-5 rounded-2xl shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all"
              >
                GUESS {guesses + 1}/6
              </motion.button>

              {/* FEEDBACK */}
              <div className="mt-6 space-y-2">
                {feedback.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-cyan-300 text-center font-medium"
                  >
                    {f}
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* RESULT GRID */}
              <div className="text-4xl font-mono text-center mb-4 tracking-wider">{grid}</div>
              <p className="text-xl font-bold text-center text-white">
                {won ? 'NAILED IT' : 'OUT OF GUESSES'}
                <br />
                <span className="text-cyan-400">Actual: {actual}¢</span>
              </p>
              <p className="text-sm text-cyan-300 text-center mt-2">Streak: 1 (new!)</p>

              {/* SHARE */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={shareToX}
                className="w-full bg-gray-800 text-cyan-400 font-bold py-4 rounded-2xl mt-6 border border-cyan-500/50 hover:bg-gray-700 transition"
              >
                SHARE TO X
              </motion.button>

              {/* PRO CTA */}
              <div className="mt-6 p-5 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-2xl border border-cyan-500/30 text-center">
                <p className="text-sm text-cyan-300">
                  Want the edge?{' '}
                  <a href="/subscribe" className="font-bold text-cyan-400 hover:underline">
                    Get Pro Hints → Odds On
                  </a>
                </p>
                <p className="text-xs text-cyan-400 mt-2">
                  <a href="/dashboard" className="hover:underline">Track Live → Dashboard</a>
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}