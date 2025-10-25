'use client';

export default function ScoreDisplay({
  score = 0,
  streak = 0
}: {
  score?: number;
  streak?: number;
}) {
  return (
    <div className="flex gap-6 justify-center mt-3">
      <div className="text-center">
        <div className="text-xs text-gray-400">Score</div>
        <div className="text-2xl font-semibold">{score.toFixed(1)}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-gray-400">Streak</div>
        <div className="text-2xl font-semibold">{streak}</div>
      </div>
    </div>
  );
}
