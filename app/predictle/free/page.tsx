'use client';
import { useState } from 'react';
import GameCard from '../components/GameCard';
import ScoreDisplay from '../components/ScoreDisplay';
import Feedback from '../components/Feedback';

const QUESTIONS = [
  {
    question: 'Will Bitcoin be above $70k by December 2025?',
    options: ['Yes', 'No'],
    correctAnswer: 'Yes',
  },
  {
    question: 'Will the US win more than 40 medals at the next Olympics?',
    options: ['Yes', 'No'],
    correctAnswer: 'Yes',
  },
  {
    question: 'Will AI regulation pass in 2025?',
    options: ['Yes', 'No'],
    correctAnswer: 'No',
  },
];

export default function FreePlayPage() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = (answer) => {
    const correct = answer === QUESTIONS[current].correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore(score + 1);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setCurrent((prev) => prev + 1);
  };

  if (current >= QUESTIONS.length) {
    return (
      <main className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Game Over!</h1>
        <ScoreDisplay score={score} total={QUESTIONS.length} streak={score} />
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center p-8">
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
      <ScoreDisplay score={score} total={QUESTIONS.length} streak={score} />
    </main>
  );
}
