// pages/predictle/index.js
import { useEffect, useMemo, useState } from "react";

/* ---------------------- Helper Utilities ---------------------- */

const utcYYYYMMDD = () => new Date().toISOString().split("T")[0];

function pickDailyIndices(count, poolLen, seedStr) {
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

/* --------------------------- Main ---------------------------- */

export default function Predictle() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState("daily");
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [tLeft, setTLeft] = useState({ h: "00", m: "00", s: "00" });

  useEffect(() => {
    const savedTheme = localStorage.getItem("predictle_theme");
    if (savedTheme === "dark") setDark(true);
  }, []);

  // Fetch Polymarket CLOB
  useEffect(() => {
    (async () => {
      setLoading(true);
      setFetchError("");
      try {
        const res = await fetch("/api/polymarket");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        console.log("✅ Raw markets:", data.length);

        const filtered = data.filter((m) => {
          const q =
            m.question ||
            m.title ||
            m.condition_title ||
            m.slug ||
            "";
          const cleanQ = q
            .replace(/^arch/i, "")
            .replace(/^[^A-Za-z0-9]+/, "")
            .replace(/\s+/g, " ")
            .trim();

          const tokens = Array.isArray(m.tokens) ? m.tokens : [];
          const validTokens = tokens.filter((t) => typeof t.price === "number");

          const createdAt = new Date(m.created_at || m.createdAt || 0);
          const daysOld = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);

          return (
            cleanQ.length > 15 &&
            validTokens.length >= 2 &&
            daysOld < 90 &&
            !m.resolved &&
            !m.closed &&
            !m.archived
          );
        });

        console.log("✅ Filtered markets:", filtered.length);
        setMarkets(filtered);
      } catch (err) {
        console.error("❌ Error fetching markets:", err);
        setFetchError("Failed to fetch markets.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Countdown to midnight UTC
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

      {/* Game Content */}
      <div className="mx-auto max-w-4xl mt-6">
        {tab === "daily" ? (
          <DailyChallenge dark={dark} markets={markets} loading={loading} fetchError={fetchError} />
        ) : (
          <FreePlay dark={dark} markets={markets} loading={loading} fetchError={fetchError} />
        )}
      </div>

      {/* UTC Countdown */}
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

      {/* Confetti styles */}
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

/* -------------------- Daily Challenge -------------------- */

function DailyChallenge({ dark, markets, loading, fetchError }) {
  const TODAY = utcYYYYMMDD();
  const [step, setStep] = useState(0);
  const [grid, setGrid] = useState([]);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);

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

  const todaysFive = useMemo(() => {
    if (!markets.length) return [];
    const idxs = pickDailyIndices(5, markets.length, TODAY);
    return idxs.map((i) => markets[i]);
  }, [markets, TODAY]);

  const current = todaysFive[step];

  const handleGuess = (choice) => {
    if (!current || locked) return;

    const tokens = Array.isArray(current.tokens) ? current.tokens : [];
    const yesToken =
      tokens.find((t) => t.outcome?.toUpperCase() === "YES") || tokens[0];
    const noToken =
      tokens.find((t) => t.outcome?.toUpperCase() === "NO") || tokens[1];

    const yes = Number(yesToken?.price ?? 0);
    const no = Number(noToken?.price ?? 0);
    const favored = yes > no ? "YES" : "NO";
    const correct = choice === favored;

    setFeedback({ type: correct ? "correct" : "wrong", probs: { yes, no } });
    const newGrid = [...grid, correct ? "🟩" : "🟥"];
    setGrid(newGrid);
    if (correct) spawnConfetti(80);

    localStorage.setItem("predictle_daily_last", TODAY);
    localStorage.setItem("predictle_daily_grid", JSON.stringify(newGrid));

    setTimeout(() => {
      const next = step + 1;
      if (next >= 5) {
        setStep(5);
        localStorage.setItem("predictle_daily_step", "5");
        setLocked(true);
      } else {
        setStep(next);
        localStorage.setItem("predictle_daily_step", String(next));
      }
      setFeedback(null);
    }, 1200);
  };

  if (loading) return <Card dark={dark}><p>Loading markets…</p></Card>;
  if (fetchError) return <Card dark={dark}><p className="text-red-500">{fetchError}</p></Card>;
  if (!todaysFive.length) return <Card dark={dark}><p>No markets available.</p></Card>;

  return (
    <Card dark={dark}>
      <h2 className="text-xl font-semibold mb-2">Daily Challenge — {step + 1}/5</h2>
      {current && <p className="mb-4">{current.question}</p>}
      <div className="flex justify-center gap-4 mt-2">
        <Button onClick={() => handleGuess("YES")} color="green">YES</Button>
        <Button onClick={() => handleGuess("NO")} color="red">NO</Button>
      </div>
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
      <div className="flex justify-center gap-1 mt-6 text-2xl">{grid.map((g, i) => <span key={i}>{g}</span>)}</div>
    </Card>
  );
}

/* ---------------------- Free Play ---------------------- */

function FreePlay({ dark, markets, loading, fetchError }) {
  const [current, setCurrent] = useState(null);
  const [feedback, setFeedback] = useState(null);
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

  const next = () => {
    setCurrent(null);
    setFeedback(null);
    const m = markets[Math.floor(Math.random() * markets.length)];
    setCurrent(m);
  };

  const guess = (choice) => {
    if (!current || feedback) return;

    const tokens = Array.isArray(current.tokens) ? current.tokens : [];
    const yesToken =
      tokens.find((t) => t.outcome?.toUpperCase() === "YES") || tokens[0];
    const noToken =
      tokens.find((t) => t.outcome?.toUpperCase() === "NO") || tokens[1];

    const yes = Number(yesToken?.price ?? 0);
    const no = Number(noToken?.price ?? 0);
    const correct = choice === (yes > no ? "YES" : "NO");

    setFeedback({ type: correct ? "correct" : "wrong", probs: { yes, no } });

    if (correct) {
      spawnConfetti(60);
      const ns = score + 1;
      const nk = streak + 1;
      setScore(ns);
      setStreak(nk);
      localStorage.setItem("predictle_fp_score", String(ns));
      localStorage.setItem("predictle_fp_streak", String(nk));
    } else {
      setStreak(0);
      localStorage.setItem("predictle_fp_streak", "0");
    }
  };

  if (loading) return <Card dark={dark}><p>Loading markets…</p></Card>;
  if (fetchError) return <Card dark={dark}><p className="text-red-500">{fetchError}</p></Card>;
  if (!markets.length) return <Card dark={dark}><p>No markets available.</p></Card>;

  return (
    <Card dark={dark}>
      <h2 className="text-xl font-semibold mb-2">Free Play</h2>
      <div className="flex gap-6 mb-4">
        <Stat label="Score" value={score} color="blue" />
        <Stat label="Streak" value={streak} color="green" />
      </div>
      {current ? (
        <>
          <p className="mb-3">{current.question}</p>
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
                <Button onClick={next}>Next Question</Button>
              </div>
            </>
          )}
        </>
      ) : (
        <p>Picking question…</p>
      )}
    </Card>
  );
}

/* ---------------------- UI Components ---------------------- */

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

function Button({ children, onClick, disabled, color = "blue" }) {
  const colorMap = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    red: "bg-red-600 hover:bg-red-700",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classNames(
        "text-white px-5 py-3 rounded-lg transition disabled:opacity-60",
        colorMap[color]
      )}
    >
      {children}
    </button>
  );
}

function Badge({ children }) {
  return <span className="px-3 py-1 rounded-full border text-sm">{children}</span>;
}

function Stat({ label, value, color }) {
  const text = color === "green" ? "text-green-500" : "text-blue-500";
  return (
    <div className="rounded-lg px-5 py-3 text-center border">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={classNames("text-2xl font-semibold", text)}>{value}</p>
    </div>
  );
}

