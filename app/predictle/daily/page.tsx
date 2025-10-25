'use client';
import { useState, useEffect } from 'react';
import GameCard from '../components/GameCard';
import Feedback from '../components/Feedback';
import ScoreDisplay from '../components/ScoreDisplay';

// For now, static questions — later we’ll replace this with Polymarket fetch.
const QUESTIONS = [
  {
    question: 'Will Apple release a foldable iPhone by 2026?',
    options: ['Yes', 'No'],
    correctAnswer: 'No',
  },
  {
    question: 'Will Ethereum trade above $4,000 by June 2025?',
    options: ['Yes', 'No'],
    correctAnswer: 'Yes',
  },
  {
    question: 'Will Donald Trump win the 2024 U.S. election?',
    options: ['Yes', 'No'],
    correctAnswer: 'Yes',
  },
  {
    question: 'Will SpaceX land humans on Mars before 2030?',
    options: ['Yes', 'No'],
    correctAnswer: 'No',
  },
  {
    question: 'Will AI-generated music win a Grammy by 2026?',
    options: ['Yes', 'No'],
    correctAnswer: 'No',
  },
];

export default function DailyChallenge() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [today, setToday] = useState('');

  // Track today’s date for “Daily” logic
  useEffect(() => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    setToday(dateStr);
    const lastPlayed = localStorage.getItem('predictle_daily_date');

    if (lastPlayed === dateStr) {
      const storedScore = localStorage.getItem('predictle_daily_score');
      const storedStreak = localStorage.getItem('predictle_daily_streak');
      if (storedScore) setScore(parseFloat(storedScore));
      if (storedStreak) setStreak(parseInt(storedStreak, 10));
      setCurrent(QUESTIONS.length); // lock after completion
    }
  }, []);

  const handleSubmit = (answer: string) => {
    const correct = answer === QUESTIONS[current].correctAnswer;
    setIsCorrect(correct);
    if (correct) {
      const newScore = score + 1;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      localStorage.setItem('predictle_daily_score', String(newScore));
      localStorage.setItem('predictle_daily_streak', String(newStreak));
    } else {
      setStreak(0);
      localStorage.setItem('predictle_daily_streak', '0');
    }
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    const next = current + 1;
    if (next >= QUESTIONS.length) {
      localStorage.setItem('predictle_daily_date', today);
      localStorage.setItem('predictle_daily_score', String(score));
      return;
    }
    setCurrent(next);
  };

  if (current >= QUESTIONS.length) {
    return (
      <main className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Daily Complete!</h1>
        <ScoreDisplay
          score={score}
          total={QUESTIONS.length}
          streak={streak}
        />
        <p className="text-gray-500 mt-4">
          Come back tomorrow for a new challenge.
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">
        🗓️ Predictle Daily Challenge
      </h1>

      {!showFeedback ? (
        <GameCard
          question={QUESTIONS[current].question}
          options={QUESTIONS[current].options}
          onSubmit={handleSubmit}
        />
      ) : (
        <Feedback
          isCorrect={isCorrect}
          correctAnswer={QUESTIONS[current].correctAnswer}
          onNext={handleNext}
        />
      )}

      <ScoreDisplay
        score={score}
        total={QUESTIONS.length}
        streak={streak}
      />
    </main>
  );
}
