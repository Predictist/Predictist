'use client';

export default function ScoreDisplay({ score, total, streak }) {
  return (
    <div className="text-center mt-6">
      <p className="text-lg font-semibold">
        Score: {score} / {total}
      </p>
      <p className="text-sm text-gray-500">Streak: 🔥 {streak}</p>
    </div>
  );
}
