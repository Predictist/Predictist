// pages/predictle/free.js
import { useState, useEffect } from "react";
import {
  classNames,
  shuffle,
  spawnConfetti,
  showToast,
} from "../../lib/utils";

/* -------------------------------------------------------
   Helper: Normalize and clean market data
------------------------------------------------------- */
function getOutcomes(market) {
  const outcomes = Array.isArray(market.outcomes)
    ? market.outcomes
    : market.tokens || [];

  return outcomes
    .map((o) => {
      const name = o.name || o.outcome || o.ticker || "Option";
      const p =
        typeof o.price === "number"
          ? o.price
          : typeof o.last_price === "number"
          ? o.last_price
          : typeof o?.price?.mid === "number"
          ? o.price.mid
          : undefined;
      return { name, price: typeof p === "number" ? p : undefined, raw: o };
    })
    .filter((o) => typeof o.price === "number" && o.price > 0 && o.price < 1);
}

function cleanQuestion(qRaw) {
  return (qRaw || "")
    .replace(/^arch/i, "")
    .replace(/^[^A-Za-z0-9]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* -------------------------------------------------------
   UI Primitives
------------------------------------------------------- */
function Card({ dark, children }) {
  return (
    <div
      className={classNames(
        "shadow-md rounded-xl p-6",
        dark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
      )}
    >
      {children}
    </div>
  );
}

function Button({ children, onClick, disabled, variant = "solid" }) {
  const cls =
    variant === "ghost"
      ? "text-gray-500 underline hover:text-gray-700"
      : "bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classNames("disabled:opacity-60", cls)}
    >
      {children}
    </button>
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

function ComparisonBar({ guess, actual }) {
  const g = Math.max(0, Math.min(100, guess));
  const a = Math.max(0, Math.min(100, actual));
  const diff = Math.abs(g - a);
  let color = "#ef4444";
  if (diff <= 10) color = "#22c55e";
  else if (diff <= 20) color = "#eab308";

  return (
    <div className="mt-5">
      <div className="relative h-3 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden">
        <div
          className="absolute top-0 bottom-0"
          style={{
            left: 0,
            width: `${a}%`,
            backgroundColor: color,
            opacity: 0.3,
            transition: "width .3s ease",
          }}
        />
        <div
          className="absolute -top-1 h-5 w-1.5 bg-blue-600 rounded"
          style={{ left: `calc(${g}% - 2px)` }}
        />
        <div
          className="absolute -top-1 h-5 w-1.5 bg-black dark:bg-white rounded"
          style={{ left: `calc(${a}% - 2px)` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   Free Play Component
------------------------------------------------------- */
export default function FreePlay() {
  const [dark, setDark] = useState(false);
  const [markets, setMarkets] = useState([]);
  const [idx, setIdx] = useState(0);
  const [guess, setGuess] = useState(50);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Load theme
  useEffect(() => {
    const saved = localStorage.getItem("predictle_theme");
    if (saved === "dark") setDark(true);
  }, []);

  // Fetch Polymarket data
  useEffect(() => {
    let mounted = true;
    const fetchMarkets = async () => {
      try {
        const res = await fetch("/api/polymarket");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const filtered = data
          .map((raw) => {
            const marketObj =
              Array.isArray(raw.markets) && raw.markets.length > 0
                ? raw.markets[0]
                : raw;
            const qRaw =
              raw.question ||
              raw.title ||
              marketObj.question ||
              marketObj.title ||
              "";
            const q = cleanQuestion(qRaw);
            const outcomes = getOutcomes(marketObj);
            return { ...raw, question: q, outcomes };
          })
          .filter(
            (m) =>
              m.outcomes?.length === 2 &&
              !m.resolved &&
              !m.closed &&
              !/test|archive|2018|2019|2020|2021|2022|2023/i.test(
                m.question || ""
              )
          );

        if (mounted) {
          const deduped = Array.from(
            new Map(filtered.map((m) => [m.question, m])).values()
          );
          const shuffled = shuffle(deduped);
          setMarkets(shuffled);
        }
      } catch (err) {
        console.error("Error fetching markets:", err);
        setFetchError("Failed to load markets. Try again later.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchMarkets();
    return () => {
      mounted = false;
    };
  }, []);

  // Restore scoreboard
  useEffect(() => {
    const s = parseFloat(localStorage.getItem("predictle_fp_score") || "0");
    const k = parseInt(localStorage.getItem("predictle_fp_streak") || "0", 10);
    setScore(s);
    setStreak(k);
  }, []);

  // Helpers
  const current = markets[idx];
  const judge = (guessPct, actualPct) => {
    const diff = Math.abs(guessPct - actualPct);
    if (diff <= 10) return "green";
    if (diff <= 20) return "yellow";
    return "red";
  };

  const handleSubmit = () => {
    if (!current || feedback) return;
    const actual = Math.round(current.outcomes[0].price * 100);
    const zone = judge(guess, actual);
    setFeedback({ zone, guess, actual });

    if (zone === "green") {
      const ns = score + 1;
      const nk = streak + 1;
      setScore(ns);
      setStreak(nk);
      localStorage.setItem("predictle_fp_score", String(ns));
      localStorage.setItem("predictle_fp_streak", String(nk));
      spawnConfetti(80);
      if ([5, 10, 25, 50, 100].includes(nk)) {
        spawnConfetti(200);
        showToast(`🔥 Free Play streak ${nk}!`);
      }
    } else if (zone === "yellow") {
      const ns = score + 0.5;
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

  const next = () => {
    setFeedback(null);
    setGuess(50);

    if (!markets.length) return;

    // advance to next unique market (skip invalid)
    let nextIdx = (idx + 1) % markets.length;
    let tries = 0;
    while (
      tries < markets.length &&
      (!markets[nextIdx]?.outcomes?.length ||
        markets[nextIdx]?.outcomes?.some((o) => o.price <= 0))
    ) {
      nextIdx = (nextIdx + 1) % markets.length;
      tries++;
    }
    setIdx(nextIdx);
  };

  // Render states
  if (loading)
    return (
      <Card dark={dark}>
        <p className="text-gray-500">Loading markets…</p>
      </Card>
    );
  if (fetchError)
    return (
      <Card dark={dark}>
        <p className="text-red-500">{fetchError}</p>
      </Card>
    );
  if (!markets.length)
    return (
      <Card dark={dark}>
        <p className="text-gray-500">No markets available.</p>
        <div className="mt-3">
          <Button onClick={() => location.reload()}>Try Refresh</Button>
        </div>
      </Card>
    );

  const [left, right] = current?.outcomes || [{}, {}];

  return (
    <main
      className={classNames(
        "min-h-screen p-6 transition-colors duration-500",
        dark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      )}
    >
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">🎮 Predictle Free Play</h1>

        <Card dark={dark}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Free Play Mode</h2>
            <div className="flex gap-4">
              <Stat label="Score" value={score.toFixed(1)} color="blue" />
              <Stat label="Streak" value={streak} color="green" />
            </div>
          </div>

          <p className="text-gray-500 mb-4">{current?.question || "Loading…"}</p>

          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{left?.name || "Outcome A"}</span>
            <span>{right?.name || "Outcome B"}</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={guess}
            onChange={(e) => setGuess(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <p className="text-center mt-2 font-medium">Your guess: {guess}%</p>

          {feedback ? (
            <>
              <ComparisonBar guess={feedback.guess} actual={feedback.actual} />
              <p className="mt-4 text-lg font-semibold text-center">
                {feedback.zone === "green"
                  ? "✅ Perfect!"
                  : feedback.zone === "yellow"
                  ? "🟨 Close!"
                  : "❌ Off!"}{" "}
                You guessed {feedback.guess}%, actual {feedback.actual}%.
              </p>
              <div className="flex justify-center mt-4">
                <Button onClick={next}>Next</Button>
              </div>
            </>
          ) : (
            <div className="flex justify-center mt-4">
              <Button onClick={handleSubmit}>Submit Guess</Button>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}