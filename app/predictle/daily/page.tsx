"use client";

import { useState, useEffect, useMemo, useRef } from "react";

// ✅ Utilities
import {
  utcYYYYMMDD,
  classNames,
  pickDailyIndices,
  spawnConfetti,
  showToast,
  shuffle,
} from "@/lib/utils";

// ✅ Local Predictle Components
import Feedback from "@/components/Feedback";
import GameCard from "@/components/GameCard";
import ScoreDisplay from "@/components/ScoreDisplay";

/* -------------------------------------------------------
   Helper: Normalize and clean market data
------------------------------------------------------- */
function getOutcomes(market: any) {
  const outcomes = Array.isArray(market.outcomes)
    ? market.outcomes
    : market.tokens || [];

  return outcomes
    .map((o: any) => {
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
    .filter((o: any) => typeof o.price === "number" && o.price > 0 && o.price < 1);
}

function cleanQuestion(qRaw: string) {
  return (qRaw || "")
    .replace(/^arch/i, "")
    .replace(/^[^A-Za-z0-9]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* -------------------------------------------------------
   UI Components
------------------------------------------------------- */
function Card({ dark, children }: { dark: boolean; children: React.ReactNode }) {
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

function Button({
  children,
  onClick,
  disabled = false,
  variant = "solid",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "solid" | "ghost";
}) {
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

function Stat({
  label,
  value,
  color = "blue",
}: {
  label: string;
  value: string | number;
  color?: "blue" | "green";
}) {
  const text = color === "green" ? "text-green-500" : "text-blue-500";
  return (
    <div className="rounded-lg px-5 py-3 text-center border">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={classNames("text-2xl font-semibold", text)}>{value}</p>
    </div>
  );
}

function ComparisonBar({ guess, actual }: { guess: number; actual: number }) {
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
   Main Component
------------------------------------------------------- */
export default function DailyChallenge() {
  const TODAY = utcYYYYMMDD();
  const [dark, setDark] = useState(false);
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [step, setStep] = useState(0);
  const [grid, setGrid] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ zone: string; guess: number; actual: number } | null>(null);
  const [guess, setGuess] = useState(50);
  const [dailyScore, setDailyScore] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [locked, setLocked] = useState(false);
  const lastDayRef = useRef(TODAY);

  useEffect(() => {
    const saved = localStorage.getItem("predictle_theme");
    if (saved === "dark") setDark(true);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchMarkets = async () => {
      try {
        const res = await fetch("/api/polymarket");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const filtered = data
          .map((raw: any) => {
            const marketObj = Array.isArray(raw.markets) && raw.markets.length > 0 ? raw.markets[0] : raw;
            const qRaw = raw.question || raw.title || marketObj.question || marketObj.title || "";
            const q = cleanQuestion(qRaw);
            const outcomes = getOutcomes(marketObj);
            return { ...raw, question: q, outcomes };
          })
          .filter(
            (m: any) =>
              m.outcomes?.length === 2 &&
              !m.resolved &&
              !m.closed &&
              !/test|archive|2018|2019|2020|2021|2022|2023/i.test(m.question || "")
          );

        if (mounted) {
          const deduped = Array.from(new Map(filtered.map((m: any) => [m.question, m])).values());
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

  useEffect(() => {
    const id = setInterval(() => {
      const nowDay = utcYYYYMMDD();
      if (nowDay !== lastDayRef.current) {
        lastDayRef.current = nowDay;
        localStorage.clear();
        setStep(0);
        setGrid([]);
        setFeedback(null);
        setGuess(50);
        setDailyScore(0);
        setDailyStreak(0);
        setLocked(false);
        showToast("🔄 New daily challenge is live!");
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const lastPlay = localStorage.getItem("predictle_daily_last");
    if (lastPlay === TODAY) {
      setLocked(true);
      setGrid(JSON.parse(localStorage.getItem("predictle_daily_grid") || "[]"));
      setStep(parseInt(localStorage.getItem("predictle_daily_step") || "5"));
    }
    setDailyScore(parseFloat(localStorage.getItem("predictle_daily_score") || "0"));
    setDailyStreak(parseInt(localStorage.getItem("predictle_daily_streak") || "0", 10));
  }, [TODAY]);

  const todaysFive = useMemo(() => {
    if (!markets.length) return [];
    const idxs = pickDailyIndices(5, markets.length, TODAY);
    return idxs.map((i) => markets[i]).filter(Boolean);
  }, [markets, TODAY]);

  const current = todaysFive[step];
  const judge = (guessPct: number, actualPct: number) => {
    const diff = Math.abs(guessPct - actualPct);
    if (diff <= 10) return "green";
    if (diff <= 20) return "yellow";
    return "red";
  };

  const handleSubmit = () => {
    if (!current || locked) return;
    const actual = Math.round(current.outcomes[0].price * 100);
    const zone = judge(guess, actual);
    setFeedback({ zone, guess, actual });

    let newScore = dailyScore;
    let newStreak = dailyStreak;
    if (zone === "green") {
      newScore += 1;
      newStreak += 1;
      spawnConfetti(80);
    } else if (zone === "yellow") {
      newScore += 0.5;
      newStreak += 1;
    } else newStreak = 0;

    setDailyScore(newScore);
    setDailyStreak(newStreak);
    localStorage.setItem("predictle_daily_score", String(newScore));
    localStorage.setItem("predictle_daily_streak", String(newStreak));

    const emoji = zone === "green" ? "🟩" : zone === "yellow" ? "🟨" : "🟥";
    const newGrid = [...grid, emoji];
    setGrid(newGrid);
    localStorage.setItem("predictle_daily_grid", JSON.stringify(newGrid));
    localStorage.setItem("predictle_daily_last", TODAY);
  };

  const nextQ = () => {
    setFeedback(null);
    setGuess(50);
    const next = step + 1;
    if (next >= 5) {
      setLocked(true);
      localStorage.setItem("predictle_daily_step", "5");
      showToast("✅ Daily complete!");
    } else {
      setStep(next);
      localStorage.setItem("predictle_daily_step", String(next));
    }
  };

  const share = () => {
    const text = `📊 Predictle — ${TODAY}\n${grid.join("")}\nScore: ${dailyScore.toFixed(
      1
    )} | Streak: ${dailyStreak}\nPlay: https://predictist.io/predictle/daily`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  if (loading)
    return (
      <Card dark={dark}>
        <p className="text-gray-500">Loading today’s markets…</p>
      </Card>
    );

  if (fetchError)
    return (
      <Card dark={dark}>
        <p className="text-red-500">{fetchError}</p>
      </Card>
    );

  if (!todaysFive.length)
    return (
      <Card dark={dark}>
        <p className="text-gray-500">Preparing today’s challenge…</p>
        <div className="mt-3">
          <Button onClick={() => location.reload()}>Try Refresh</Button>
        </div>
      </Card>
    );

  if (locked && step >= 5)
    return (
      <Card dark={dark}>
        <h2 className="text-xl font-semibold mb-2">Daily Results</h2>
        <div className="text-3xl mb-2">{grid.join("")}</div>
        <div className="flex gap-6 mb-4 justify-center">
          <Stat label="Daily Score" value={dailyScore.toFixed(1)} color="blue" />
          <Stat label="Daily Streak" value={dailyStreak} color="green" />
        </div>
        <Button onClick={share}>Share Results</Button>
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
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">🗓️ Predictle Daily Challenge</h1>

        <Card dark={dark}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Question {Math.min(step + 1, 5)} / 5</h2>
            <div className="flex gap-4">
              <Stat label="Score" value={dailyScore.toFixed(1)} color="blue" />
              <Stat label="Streak" value={dailyStreak} color="green" />
            </div>
          </div>

          <p className="text-gray-500 mb-4">{current?.question || "..."}</p>

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
                <Button onClick={nextQ}>Next</Button>
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
