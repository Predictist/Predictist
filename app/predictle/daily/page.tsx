// predictle/daily/page.tsx
'use client';

import { useState, useEffect } from 'react';

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

  // Fetch from your working API
  useEffect(() => {
    const loadMarket = async () => {
      try {
        const res = await fetch('/api/polymarket');
        const data = await res.json();
        setActual(Math.round(data.yes_price * 100));
        setQuestion(data.question);
      } catch (err) {
        console.error('API failed, using mock');
        setActual(52);
        setQuestion('Will Trump win popular vote?');
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
      setGrid(prev => prev + (g < actual ? 'white square' : 'black square'));
    }
  };

  const endGame = (win: boolean, tries: number) => {
    setGameOver(true);
    if (win) {
      setGrid(prev => prev + 'green square' + 'white square'.repeat(6 - tries));
    } else {
      setGrid('white square'.repeat(6));
    }
  };

  const shareToX = () => {
    const score = won ? `${guesses}/6` : 'X/6';
    const clutch = guesses === 6 ? 'Nailed it on the last guess!' : won ? `Got it in ${guesses}!` : 'Better luck tomorrow!';
    const text = `PREDICTLE #001: ${score}\n${clutch}\n\nPlay: https://predictist.io/predictle\n#PredictleStreak`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (actual === null) {
    return (
      <div className="text-center py-20">
        <p className="text-xl">Loading today&apos;s market...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl p-8 shadow-2xl border border-gray-800">
      <h2 className="text-2xl font-bold text-cyan-400 mb-2">PREDICTLE #001</h2>
      <p className="text-gray-300 text-sm mb-6">“{question}”</p>

      {!gameOver ? (
        <>
          <input
            type="range"
            min="0"
            max="99"
            value={guess}
            onChange={(e) => setGuess(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="text-5xl font-bold text-cyan-400 my-6">{guess}¢</div>

          <button
            onClick={submitGuess}
            className="w-full bg-cyan-400 text-black font-bold py-4 rounded-xl text-lg hover:bg-cyan-300 transition"
          >
            Guess {guesses + 1}/6
          </button>

          <div className="mt-6 space-y-1 text-lg">
            {feedback.map((f, i) => (
              <div key={i} className="text-gray-300">{f}</div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="text-3xl font-mono mb-4">{grid}</div>
          <p className="text-xl font-semibold">
            {won ? 'Correct!' : 'Out of guesses!'}<br />
            <span className="text-cyan-400">Actual: {actual}¢</span>
          </p>
          <p className="text-sm text-gray-400 mt-2">Streak: 1 (new!)</p>

          <button
            onClick={shareToX}
            className="w-full bg-gray-700 text-white font-bold py-3 rounded-xl mt-6 hover:bg-gray-600 transition"
          >
            Share to X
          </button>

          <div className="mt-6 p-4 bg-gray-800 rounded-xl text-sm text-center space-y-2">
            <p>
              Want the edge?{' '}
              <a href="/subscribe" className="text-cyan-400 font-bold hover:underline">
                Get Pro Hints → Odds On
              </a>
            </p>
            <p>
              <a href="/dashboard" className="text-cyan-400 hover:underline">
                Track Live → Dashboard
              </a>
            </p>
          </div>
        </>
      )}
    </div>
  );
}