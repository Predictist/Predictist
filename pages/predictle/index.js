// pages/predictle/index.js
// pages/predictle/index.js
import { useEffect, useMemo, useState } from "react";

/* ------------------------- helpers ------------------------- */

const utcYYYYMMDD = () => new Date().toISOString().split("T")[0];

function pickDailyIndices(count, poolLen, seedStr) {
  // Simple deterministic picker: hash the seed into a number, then step
  let seed = seedStr.split("-").reduce((s, p) => s + parseInt(p), 0);
  const taken = new Set();
  const out = [];
  while (out.length < Math.min(count, poolLen)) {
    seed = (seed * 9301 + 49297) % 233280;
    const idx = seed % poolLen;
    if (!taken.has(idx)) {
      taken.add(idx);
      out.push(idx);
    }
  }
  return out;
}

function classNames(...c) {
  return c.filter(Boolean).join(" ");
}

/* -------------------- confetti (vanilla) -------------------- */
function spawnConfetti(burst = 60) {
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
}

/* ------------------------- main page ------------------------ */

export default function Predictle() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState("daily"); // 'daily' | 'free'
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Countdown to next UTC midnight
  const [tLeft, setTLeft] = useState({ h: "00", m: "00", s: "00" });

  // Shared localStorage load
  useEffect(() => {
    const savedTheme = localStorage.getItem("predictle_theme");
    if (savedTheme === "dark") setDark(true);
  }, []);

  // Fetch markets via API route
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setFetchError("");
      try {
  const res = await fetch("/api/polymarket");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const markets = await res.json();
  console.log("🧩 Sample raw market:", markets[0]);

  console.log("✅ Markets fetched:", markets.length);
  console.log("🧪 Example market:", markets[0]);

  // ✅ Filter for binary markets that have both prices
// ✅ Updated filter for CLOB markets (new structure)
const filtered = markets.filter((m) => {
  const hasQuestion = typeof m.question === "string" && m.question.trim().length > 0;
  const hasOutcomes = Array.isArray(m.outcomes) && m.outcomes.length >= 2;

  // Extract outcome prices
  const yesOutcome = m.outcomes?.find(
    (o) => o.name?.toLowerCase().includes("yes")
  );
  const noOutcome = m.outcomes?.find(
    (o) => o.name?.toLowerCase().includes("no")
  );

  const hasPrices =
    (yesOutcome && typeof yesOutcome.price === "number") ||
    (noOutcome && typeof noOutcome.price === "number");

  return hasQuestion && hasOutcomes && hasPrices && !m.closed;
});

  console.log("✅ Filtered markets:", filtered.length);
  console.log("🧪 Example filtered:", filtered[0]);

  setMarkets(filtered);
} catch (error) {
  console.error("❌ Error fetching markets:", error);
  setFetchError("Failed to fetch markets.");
} finally {
  setLoading(false);
}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // UTC countdown
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const nextUTC = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
      );
      const diff = nextUTC - now;
      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setTLeft({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("predictle_theme", next ? "dark" : "light");
  };

  return (
    <main
      className={classNames(
        "min-h-screen p-6 transition-colors duration-500",
        dark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      )}
    >
      {/* Header */}
      <div className="mx-auto max-w-4xl flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">Predictle</h1>
        <button
          onClick={toggleTheme}
          className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-700/10"
        >
          {dark ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      {/* Tabs */}
      <div className="mx-auto max-w-4xl mt-6">
        <div className="inline-flex rounded-xl overflow-hidden border">
          <button
            className={classNames(
              "px-4 py-2 text-sm font-medium",
              tab === "daily"
                ? dark
                  ? "bg-gray-800"
                  : "bg-white"
                : "bg-transparent"
            )}
            onClick={() => setTab("daily")}
          >
            Daily Challenge 🟩🟥
          </button>
          <button
            className={classNames(
              "px-4 py-2 text-sm font-medium border-l",
              tab === "free"
                ? dark
                  ? "bg-gray-800"
                  : "bg-white"
                : "bg-transparent"
            )}
            onClick={() => setTab("free")}
          >
            Free Play 🎯
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl mt-6">
        {tab === "daily" ? (
          <DailyChallenge dark={dark} markets={markets} loading={loading} fetchError={fetchError} />
        ) : (
          <FreePlay dark={dark} markets={markets} loading={loading} fetchError={fetchError} />
        )}
      </div>

      {/* UTC countdown footer */}
      <div className="mx-auto max-w-4xl text-center mt-10 text-gray-500 text-sm">
        <p className="mb-1">🌍 Next Daily Challenge (00:00 UTC)</p>
        <div className="flex gap-2 text-2xl font-mono justify-center">
          {Object.values(tLeft).map((unit, i) => (
            <div
              key={i}
              className={classNames(
                "rounded-lg px-3 py-2 transition-all duration-700 transform hover:scale-110",
                dark ? "bg-gray-800" : "bg-gray-700/10"
              )}
            >
              {unit}
            </div>
          ))}
        </div>
      </div>

      {/* Confetti CSS */}
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

/* ==================== Daily Challenge (5 Qs) ==================== */

function DailyChallenge({ dark, markets, loading, fetchError }) {
  const TODAY = utcYYYYMMDD();
  const [step, setStep] = useState(0); // 0..4 question index, 5 = summary
  const [grid, setGrid] = useState([]); // array of '🟩' | '🟥'
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null); // {type:'correct'|'wrong', probs:{yes,no}}

  // one-guess-per-day lock
  useEffect(() => {
    const lastPlay = localStorage.getItem("predictle_daily_last");
    if (lastPlay === TODAY) {
      setLocked(true);
      const savedGrid = JSON.parse(localStorage.getItem("predictle_daily_grid") || "[]");
      const savedStep = parseInt(localStorage.getItem("predictle_daily_step") || "5");
      setGrid(savedGrid);
      setStep(savedStep);
    }
  }, [TODAY]);

  // Pre-pick 5 deterministic markets for today
  const todaysFive = useMemo(() => {
    if (!markets.length) return [];
    const idxs = pickDailyIndices(5, markets.length, TODAY);
    return idxs.map((i) => markets[i]);
  }, [markets, TODAY]);

  const current = todaysFive[step];

  const handleGuess = (choice) => {
    if (!current || locked) return;
    const yesOutcome = current.outcomes.find((o) => o.name?.toUpperCase() === "YES") || current.outcomes[0];
    const noOutcome = current.outcomes.find((o) => o.name?.toUpperCase() === "NO") || current.outcomes[1];

    const yes = Number(yesOutcome?.price ?? 0);
    const no = Number(noOutcome?.price ?? 0);
    const favored = yes > no ? "YES" : "NO";
    const correct = choice === favored;

    setFeedback({ type: correct ? "correct" : "wrong", probs: { yes, no } });

    const newGrid = [...grid, correct ? "🟩" : "🟥"];
    setGrid(newGrid);

    if (correct) {
      spawnConfetti(80);
    }

    // Persist progress
    localStorage.setItem("predictle_daily_last", TODAY);
    localStorage.setItem("predictle_daily_grid", JSON.stringify(newGrid));

    // Advance after brief delay to show feedback
    setTimeout(() => {
      const nextStep = step + 1;
      if (nextStep >= 5) {
        setStep(5);
        localStorage.setItem("predictle_daily_step", "5");
        setLocked(true);
      } else {
        setStep(nextStep);
        localStorage.setItem("predictle_daily_step", String(nextStep));
      }
      setFeedback(null);
    }, 1200);
  };

  const share = () => {
    const text = `📊 Predictle — ${TODAY}\n${grid.join("")}\n${grid.filter((g) => g === "🟩").length}/5 today\nPlay: https://predictist.io/predictle\n#Predictle #PredictionMarkets`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const resetDaily = () => {
    localStorage.removeItem("predictle_daily_last");
    localStorage.removeItem("predictle_daily_grid");
    localStorage.removeItem("predictle_daily_step");
    setGrid([]);
    setStep(0);
    setLocked(false);
    setFeedback(null);
  };

  if (loading) return <Card dark={dark}><p className="text-gray-500">Loading today’s markets…</p></Card>;
  if (fetchError) return <Card dark={dark}><p className="text-red-500">{fetchError}</p></Card>;
  if (!todaysFive.length) return <Card dark={dark}><p>No markets available.</p></Card>;

  if (locked && step === 5) {
    // Summary view (completed today)
    return (
      <Card dark={dark}>
        <h2 className="text-xl font-semibold mb-2">Daily Challenge — Results</h2>
        <div className="text-3xl mb-2">{grid.join("") || "🟩🟥🟩🟩🟥"}</div>
        <p className="text-gray-500 mb-4">
          {grid.filter((g) => g === "🟩").length}/5 correct today. Come back at 00:00 UTC!
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={share}>Share Results</Button>
          <Button variant="ghost" onClick={resetDaily}>Reset (debug)</Button>
        </div>
      </Card>
    );
  }

  if (!current) {
    return (
      <Card dark={dark}>
        <p className="text-gray-500">Preparing your daily challenge…</p>
      </Card>
    );
  }

  return (
    <Card dark={dark}>
      <h2 className="text-xl font-semibold mb-2">Daily Challenge — {step + 1} / 5</h2>
      <p className="text-gray-500 mb-4">One guess per question. Results show after each guess.</p>

      {/* Question */}
      <div className="mb-4">
        <p className="text-lg font-medium">{current.question}</p>
      </div>

      {/* Guess buttons */}
      <div className="flex justify-center gap-4 mt-2">
        <Button onClick={() => handleGuess("YES")} disabled={!!feedback || locked} color="green">YES</Button>
        <Button onClick={() => handleGuess("NO")} disabled={!!feedback || locked} color="red">NO</Button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="mt-5">
          <p className="text-lg font-semibold">
            {feedback.type === "correct" ? "✅ You were right!" : "❌ Not this time!"}
          </p>
          <div className="flex gap-4 justify-center mt-2">
            <Badge>YES: {(feedback.probs.yes * 100).toFixed(1)}%</Badge>
            <Badge>NO: {(feedback.probs.no * 100).toFixed(1)}%</Badge>
          </div>
        </div>
      )}

      {/* Grid preview */}
      <div className="flex flex-wrap justify-center gap-1 mt-6 text-2xl">
        {grid.map((g, i) => (
          <span key={i}>{g}</span>
        ))}
      </div>

      {/* Lock notice */}
      {locked && step < 5 && (
        <p className="text-gray-400 mt-6 italic">
          You’ve already played today’s Daily Challenge.
        </p>
      )}
    </Card>
  );
}

/* ====================== Free Play (infinite) ===================== */

function FreePlay({ dark, markets, loading, fetchError }) {
  const [current, setCurrent] = useState(null);
  const [feedback, setFeedback] = useState(null); // {type, probs}
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const s = parseInt(localStorage.getItem("predictle_fp_score") || "0");
    const k = parseInt(localStorage.getItem("predictle_fp_streak") || "0");
    setScore(s);
    setStreak(k);
  }, []);

  useEffect(() => {
    if (!loading && markets.length && !current) {
      setCurrent(markets[Math.floor(Math.random() * markets.length)]);
    }
  }, [loading, markets, current]);

  const nextQuestion = () => {
    setCurrent(null);
    setFeedback(null);
    // Pick a different random question
    const m = markets[Math.floor(Math.random() * markets.length)];
    setCurrent(m);
  };

  const guess = (choice) => {
    if (!current || feedback) return;
    const yesOutcome = current.outcomes.find((o) => o.name?.toUpperCase() === "YES") || current.outcomes[0];
    const noOutcome = current.outcomes.find((o) => o.name?.toUpperCase() === "NO") || current.outcomes[1];
    const yes = Number(yesOutcome?.price ?? 0);
    const no = Number(noOutcome?.price ?? 0);
    const favored = yes > no ? "YES" : "NO";
    const correct = choice === favored;

    setFeedback({ type: correct ? "correct" : "wrong", probs: { yes, no } });

    if (correct) {
      spawnConfetti(60);
      const ns = score + 1;
      const nk = streak + 1;
      setScore(ns);
      setStreak(nk);
      localStorage.setItem("predictle_fp_score", String(ns));
      localStorage.setItem("predictle_fp_streak", String(nk));
      // milestones
      if ([5, 10, 25, 50, 100].includes(nk)) spawnConfetti(150);
    } else {
      setStreak(0);
      localStorage.setItem("predictle_fp_streak", "0");
    }
  };

  if (loading) return <Card dark={dark}><p className="text-gray-500">Loading markets…</p></Card>;
  if (fetchError) return <Card dark={dark}><p className="text-red-500">{fetchError}</p></Card>;
  if (!markets.length) return <Card dark={dark}><p>No markets available.</p></Card>;

  return (
    <Card dark={dark}>
      <h2 className="text-xl font-semibold mb-2">Free Play</h2>

      {/* Scoreboard */}
      <div className="flex gap-6 mb-4">
        <Stat label="Score" value={score} color="blue" />
        <Stat label="Streak" value={streak} color="green" />
      </div>

      {current ? (
        <>
          <p className="text-lg font-medium mb-3">{current.question}</p>
          {!feedback ? (
            <div className="flex justify-center gap-4">
              <Button onClick={() => guess("YES")} color="green">YES</Button>
              <Button onClick={() => guess("NO")} color="red">NO</Button>
            </div>
          ) : (
            <>
              <p className="mt-5 text-lg font-semibold">
                {feedback.type === "correct" ? "✅ Correct!" : "❌ Not this time!"}
              </p>
              <div className="flex gap-4 justify-center mt-2">
                <Badge>YES: {(feedback.probs.yes * 100).toFixed(1)}%</Badge>
                <Badge>NO: {(feedback.probs.no * 100).toFixed(1)}%</Badge>
              </div>
              <div className="flex justify-center mt-6">
                <Button onClick={nextQuestion}>Next Question</Button>
              </div>
            </>
          )}
        </>
      ) : (
        <p className="text-gray-500">Picking question…</p>
      )}
    </Card>
  );
}

/* ---------------------- tiny UI primitives ---------------------- */

function Card({ dark, children }) {
  return (
    <div
      className={classNames(
        "shadow-md rounded-xl p-6",
        dark ? "bg-gray-800" : "bg-white"
      )}
    >
      {children}
    </div>
  );
}

function Button({ children, onClick, disabled, variant = "solid", color = "blue" }) {
  const colorMap = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    red: "bg-red-600 hover:bg-red-700",
  };
  const solid = "text-white";
  const ghost = "text-gray-500 underline hover:text-gray-700";
  const cls =
    variant === "ghost"
      ? ghost
      : `${colorMap[color] || colorMap.blue} ${solid} px-5 py-3 rounded-lg transition`;
  return (
    <button onClick={onClick} disabled={disabled} className={classNames("disabled:opacity-60", cls)}>
      {children}
    </button>
  );
}

function Badge({ children }) {
  return (
    <span className="px-3 py-1 rounded-full border text-sm">
      {children}
    </span>
  );
}

function Stat({ label, value, color = "blue" }) {
  const text = color === "green" ? "text-green-500" : "text-blue-500";
  return (
    <div className="rounded-lg px-5 py-3 text-center border">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={classNames("text-2xl font-semibold", text)}>{value}</p>
    </div>
  );
}
