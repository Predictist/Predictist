'use client';
import { useState, useEffect } from 'react';

// Temporary mock markets — will be replaced by real Polymarket feed
const MOCK_MARKETS = [
  { id: 1, question: 'Will Bitcoin be above $90,000 by next month?', outcome: 'Yes' },
  { id: 2, question: 'Will the next iPhone be foldable?', outcome: 'No' },
  { id: 3, question: 'Will the U.S. win more than 40 medals in the next Olympics?', outcome: 'Yes' },
  { id: 4, question: 'Will ChatGPT surpass 2 billion users by 2026?', outcome: 'No' },
  { id: 5, question: 'Will inflation fall below 2% by the end of this year?', outcome: 'Yes' },
  { id: 6, question: 'Will Ethereum flip Bitcoin by 2027?', outcome: 'No' },
  { id: 7, question: 'Will Tesla release a flying car before 2030?', outcome: 'No' },
  { id: 8, question: 'Will AI regulation pass in the U.S. by 2025?', outcome: 'Yes' },
  { id: 9, question: 'Will space tourism reach 10,000 customers by 2030?', outcome: 'No' },
  { id: 10, question: 'Will a female U.S. president be elected by 2032?', outcome: 'Yes' },
];

export default function DailyChallenge() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  // Helper: get today’s date string
  const todayKey = new Date().toISOString().slice(0, 10);

  // Load progress or reset for new day
  useEffect(() => {
    const savedDate = localStorage.getItem('predictle_daily_date');
    const savedScore = parseFloat(localStorage.getItem('predictle_daily_score') || '0');
    const savedStreak = parseInt(localStorage.getItem('predictle_daily_streak') || '0', 10);

    if (savedDate === todayKey) {
      setScore(savedScore);
      setStreak(savedStreak);
      setLocked(savedScore >= 5);
    } else {
      // New day
      localStorage.setItem('predictle_daily_date', todayKey);
      localStorage.setItem('predictle_daily_score', '0');
      setScore(0);
      setStreak(savedStreak); // keep streak for now
    }

    // Pick 5 unique questions for today
    const shuffled = [...MOCK_MARKETS].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 5));
  }, []);

  const handleGuess = (guess: string) => {
    if (locked || !questions[index]) return;

    const correct = guess === questions[index].outcome;
    const newScore = score + (correct ? 1 : 0);
    setScore(newScore);
    setResult(correct ? '✅ Correct' : `❌ Wrong — it was ${questions[index].outcome}`);
    localStorage.setItem('predictle_daily_score', newScore.toString());

    // If finished all 5
    if (index >= 4) {
      const finished = true;
      localStorage.setItem('predictle_daily_score', newScore.toString());
      localStorage.setItem('predictle_daily_date', todayKey);
      setLocked(true);

      // Update streaks
      if (newScore >= 3) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem('predictle_daily_streak', newStreak.toString());
      } else {
        setStreak(0);
        localStorage.setItem('predictle_daily_streak', '0');
      }

      // Show results summary
      setTimeout(() => {
        setResult('Daily challenge complete!');
      }, 2000);
    } else {
      // Move to next question after 1.5s
      setTimeout(() => {
        setIndex(index + 1);
        setResult(null);
      }, 1500);
    }
  };

  // Wordle-style share summary
  const handleShare = () => {
    const squares = Array(score)
      .fill('🟩')
      .concat(Array(5 - score).fill('⬜️'))
      .join('');
    const shareText = `${squares}\nPredictle Daily #${todayKey}\n${score}/5 correct\npredictist.com/predictle`;
    navigator.clipboard.writeText(shareText);
    alert('📋 Results copied! Share it on social!');
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-2">📅 Predictle Daily Challenge</h1>
      <p className="text-gray-500 mb-6">5 questions per day — come back tomorrow!</p>

      {locked ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 w-full max-w-lg text-center">
          <p className="text-lg mb-4">✅ You’ve finished today’s challenge!</p>
          <p className="mb-2 text-gray-500">Score: {score}/5</p>
          <p className="mb-4 text-gray-500">Streak: 🔥 {streak}</p>
          <button
            onClick={handleShare}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Share Results
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 w-full max-w-lg text-center">
          {questions[index] ? (
            <>
              <p className="text-lg font-medium mb-6">
                {questions[index].question}
              </p>
              {!result ? (
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => handleGuess('Yes')}
                    className="px-6 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleGuess('No')}
                    className="px-6 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition"
                  >
                    No
                  </button>
                </div>
              ) : (
                <p className="text-lg font-semibold mt-2">{result}</p>
              )}
              <p className="text-sm text-gray-400 mt-4">
                Question {index + 1} / 5
              </p>
            </>
          ) : (
            <p>Loading today’s markets...</p>
          )}
        </div>
      )}
    </main>
  );
}

