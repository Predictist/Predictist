'use client';
import { useState, useEffect } from 'react';

// Temporary mocked markets until API integration
const MOCK_MARKETS = [
  { id: 1, question: 'Will Bitcoin trade above $100,000 by December 2025?', outcome: 'Yes' },
  { id: 2, question: 'Will AI surpass human IQ by 2030?', outcome: 'No' },
  { id: 3, question: 'Will SpaceX land humans on Mars before 2035?', outcome: 'Yes' },
  { id: 4, question: 'Will Apple release an AR headset before 2026?', outcome: 'Yes' },
  { id: 5, question: 'Will the S&P 500 hit 6000 by 2026?', outcome: 'No' },
  { id: 6, question: 'Will Ethereum flip Bitcoin by market cap?', outcome: 'No' },
  { id: 7, question: 'Will the next U.S. President be a Republican?', outcome: 'Yes' },
  { id: 8, question: 'Will OpenAI release GPT-6 in 2025?', outcome: 'No' },
  { id: 9, question: 'Will inflation fall below 2% by next year?', outcome: 'Yes' },
  { id: 10, question: 'Will TikTok be banned in the U.S. by 2026?', outcome: 'No' },
];

export default function FreePlayPage() {
  const [question, setQuestion] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [totalPlayed, setTotalPlayed] = useState(0);

  // Load saved score
  useEffect(() => {
    const storedScore = parseFloat(localStorage.getItem('predictle_fp_score') || '0');
    setScore(storedScore);
    loadRandomQuestion();
  }, []);

  const loadRandomQuestion = () => {
    const random = MOCK_MARKETS[Math.floor(Math.random() * MOCK_MARKETS.length)];
    setQuestion(random);
    setAnswered(false);
    setResult(null);
  };

  const handleGuess = (guess: string) => {
    if (!question || answered) return;

    const correct = guess === question.outcome;
    const newScore = correct ? score + 1 : Math.max(score - 0.5, 0);

    setScore(newScore);
    setAnswered(true);
    setResult(correct ? 'Correct ✅' : `Wrong ❌ (It was ${question.outcome})`);
    setTotalPlayed((prev) => prev + 1);
    localStorage.setItem('predictle_fp_score', newScore.toString());

    // After 2 seconds, load a new one
    setTimeout(() => {
      loadRandomQuestion();
    }, 2000);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
  <h1 className="text-4xl font-bold mb-3 tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
    🎯 Predictle: Free Play
  </h1>
  <p className="text-gray-400 mb-8">Endless yes/no prediction challenges</p>

  <div className="predictle-card p-8 w-full max-w-2xl">
    {question ? (
      <>
        <p className="text-xl font-medium mb-6">{question.question}</p>

        {!answered ? (
          <div className="flex justify-center gap-6">
            <button
              onClick={() => handleGuess('Yes')}
              className="predictle-btn yes text-white"
            >
              Yes
            </button>
            <button
              onClick={() => handleGuess('No')}
              className="predictle-btn no text-white"
            >
              No
            </button>
          </div>
        ) : (
          <p
            className={`text-xl font-semibold mt-4 ${
              result?.includes('Correct') ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {result}
          </p>
        )}
      </>
    ) : (
      <p>Loading question...</p>
    )}
  </div>

  <div className="mt-8 text-gray-400 text-sm">
    <p>Questions Answered: {totalPlayed}</p>
    <p>Score: {score.toFixed(1)}</p>
  </div>
</main>
  );
}

