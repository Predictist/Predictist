'use client';
import { useEffect, useState } from 'react';

export default function LeaderboardPage() {
  const [dailyScore, setDailyScore] = useState(0);
  const [freeScore, setFreeScore] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    // Load local scores
    const dScore = parseFloat(localStorage.getItem('predictle_daily_score') || '0');
    const fScore = parseFloat(localStorage.getItem('predictle_fp_score') || '0');
    const dStreak = parseInt(localStorage.getItem('predictle_daily_streak') || '0', 10);

    setDailyScore(dScore);
    setFreeScore(fScore);
    setDailyStreak(dStreak);

    // Temporary global leaderboard (mock data)
    const mockPlayers = [
      { name: 'You', score: dScore + fScore, streak: dStreak },
      { name: 'MarketWizard', score: 28, streak: 10 },
      { name: 'AlphaGuru', score: 25, streak: 7 },
      { name: 'RiskyRick', score: 21, streak: 5 },
      { name: 'AIOracle', score: 19, streak: 3 },
    ];
    // Sort descending by total score
    mockPlayers.sort((a, b) => b.score - a.score);
    setPlayers(mockPlayers);
  }, []);

  return (
    <main className="flex flex-col items-center p-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🏆 Predictle Leaderboard</h1>

      <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-3">Your Stats</h2>
        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <div>
            <p className="text-gray-500 text-sm">Daily Score</p>
            <p className="text-xl font-semibold text-blue-600">{dailyScore.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Free Play Score</p>
            <p className="text-xl font-semibold text-green-600">{freeScore.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Streak</p>
            <p className="text-xl font-semibold text-yellow-600">{dailyStreak}</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-3">Global Standings</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="py-2 text-left">Rank</th>
              <th className="text-left">Player</th>
              <th className="text-center">Score</th>
              <th className="text-center">Streak</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, idx) => (
              <tr
                key={p.name}
                className={`border-b ${
                  p.name === 'You' ? 'bg-blue-50 dark:bg-gray-800' : ''
                }`}
              >
                <td className="py-2">{idx + 1}</td>
                <td>{p.name}</td>
                <td className="text-center">{p.score}</td>
                <td className="text-center">{p.streak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
