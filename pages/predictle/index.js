// pages/predictle/index.js
// pages/predictle/index.js
import { useEffect, useState } from "react";

export default function Predictle() {
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guess, setGuess] = useState(null);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState([]);
  const [locked, setLocked] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [milestone, setMilestone] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ h: "00", m: "00", s: "00" });

  // Load saved preferences
  useEffect(() => {
    const savedScore = localStorage.getItem("predictle_score");
    const savedStreak = localStorage.getItem("predictle_streak");
    const savedHistory = localStorage.getItem("predictle_history");
    const lastPlayDate = localStorage.getItem("predictle_last_played");
    const savedTheme = localStorage.getItem("predictle_theme");

    const todayUTC = new Date().toISOString().split("T")[0];
    if (lastPlayDate === todayUTC) setLocked(true);

    if (savedScore) setScore(parseInt(savedScore));
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedTheme === "dark") setDarkMode(true);
  }, []);

  // Fetch deterministic daily market (UTC)
  async function fetchDailyMarket() {
    setLoading(true);
    setGuess(null);
    setResult(null);

    try {
      const res = await fetch("/api/polymarket");
      const data = await res.json();
      const active = markets.filter(
        (m) =>
          m.active &&
          m.outcomes?.length === 2 &&
          !m.question.toLowerCase().includes("test")
      );

      const todayUTC = new Date().toISOString().split("T")[0];
      const index = todayUTC
        .split("-")
        .reduce((sum, part) => sum + parseInt(part), 0) % active.length;

      setMarket(active[index]);
    } catch (err) {
      console.error("Error fetching markets:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDailyMarket();
  }, []);

  // Confetti animation
  const triggerConfetti = (burst = 60) => {
    const container = document.createElement("div");
    container.classList.add("confetti-container");
    document.body.appendChild(container);

    for (let i = 0; i < burst; i++) {
      const confetti = document.createElement("div");
      confetti.classList.add("confetti");
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.animationDelay = Math.random() * 2 + "s";
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 60%)`;
      container.appendChild(confetti);
    }

    setTimeout(() => container.remove(), 4000);
  };

  // Handle Guess
  const handleGuess = (choice) => {
    if (!market || locked) return;

    const yesProb = market.outcomes[0].price;
    const noProb = market.outcomes[1].price;
    const marketFavored = yesProb > noProb ? "YES" : "NO";
    const correct = choice === marketFavored;

    setGuess(choice);
    const newHistory = [...history, correct ? "🟩" : "🟥"];

    if (correct) {
      const newScore = score + 1;
      const newStreak = streak + 1;
      setResult("correct");
      setScore(newScore);
      setStreak(newStreak);
      setHistory(newHistory);
      localStorage.setItem("predictle_score", newScore);
      localStorage.setItem("predictle_streak", newStreak);
      localStorage.setItem("predictle_history", JSON.stringify(newHistory));

      // Trigger normal confetti
      triggerConfetti(60);

      // Check for milestone streaks
      if ([5, 10, 25, 50, 100].includes(newStreak)) {
        setMilestone(true);
        triggerConfetti(150);
        setTimeout(() => setMilestone(false), 4000);
      }
    } else {
      setResult("wrong");
      setStreak(0);
      localStorage.setItem("predictle_streak", 0);
      localStorage.setItem("predictle_history", JSON.stringify(newHistory));
    }

    localStorage.setItem("predictle_last_played", new Date().toISOString().split("T")[0]);
    setLocked(true);
  };

  // UTC countdown
  useEffect(() => {
    function updateTimer() {
      const now = new Date();
      const nextUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
      const diff = nextUTC - now;
      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setTimeLeft({ h, m, s });
    }
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Theme toggle
  const toggleDarkMode = () => {
    const mode = !darkMode;
    setDarkMode(mode);
    localStorage.setItem("predictle_theme", mode ? "dark" : "light");
  };

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between w-full max-w-3xl mb-6">
        <h1 className="text-3xl font-bold">Predictle — Daily Challenge</h1>
        <button
          onClick={toggleDarkMode}
          className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-700/10"
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      {/* Streak milestone badge */}
      {milestone && (
        <div className="fixed top-10 bg-yellow-400 text-black px-6 py-3 rounded-full font-bold shadow-lg animate-bounce z-50">
          🔥 Streak Milestone! {streak} Days in a Row!
        </div>
      )}

      {/* Scoreboard */}
      <div className="flex gap-6 mb-8">
        <div
          className={`shadow rounded-lg px-6 py-3 text-center ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <p className="text-sm text-gray-500">Score</p>
          <p className="text-2xl font-semibold text-blue-500">{score}</p>
        </div>
        <div
          className={`shadow rounded-lg px-6 py-3 text-center ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <p className="text-sm text-gray-500">Streak</p>
          <p className="text-2xl font-semibold text-green-500">{streak}</p>
        </div>
      </div>

      {/* Game */}
      {loading ? (
        <p className="text-gray-500">Loading today's market...</p>
      ) : market ? (
        <div
          className={`shadow-md rounded-xl p-6 w-full max-w-xl text-center ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="text-2xl font-semibold mb-4">{market.question}</h2>

          {locked ? (
            <p className="text-gray-400 mt-6 italic">
              You’ve already played today’s Predictle. Come back tomorrow!
            </p>
          ) : !guess ? (
            <div className="flex justify-center gap-6 mt-6">
              <button
                onClick={() => handleGuess("YES")}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
              >
                YES
              </button>
              <button
                onClick={() => handleGuess("NO")}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
              >
                NO
              </button>
            </div>
          ) : (
            <p className="mt-6 text-lg font-semibold">
              {result === "correct" ? "✅ You were right!" : "❌ Not this time!"}
            </p>
          )}
        </div>
      ) : (
        <p>No markets found.</p>
      )}

      {/* Countdown */}
      <div className="mt-10 text-gray-500 text-sm text-center">
        <p>🌍 Next Predictle (00:00 UTC)</p>
        <div className="flex gap-2 text-2xl font-mono justify-center mt-1">
          {Object.values(timeLeft).map((unit, i) => (
            <div
              key={i}
              className="bg-gray-700/10 rounded-lg px-3 py-2 transition-all duration-700 transform hover:scale-110"
            >
              {unit}
            </div>
          ))}
        </div>
      </div>

      <footer className="mt-10 text-gray-400 text-xs">Data from Polymarket API</footer>

      {/* Confetti Animation Styles */}
      <style jsx>{`
        .confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
          z-index: 40;
        }
        .confetti {
          position: absolute;
          width: 8px;
          height: 14px;
          opacity: 0.9;
          animation: fall 3s linear forwards;
        }
        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
          }
        }
      `}</style>
    </main>
  );
}
