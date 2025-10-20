import { useEffect, useMemo, useState, useRef } from "react";

/* -------------------------------------------------------
   Utilities
------------------------------------------------------- */
const utcYYYYMMDD = () => new Date().toISOString().split("T")[0];
const classNames = (...c) => c.filter(Boolean).join(" ");
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function pickDailyIndices(count, poolLen, seedStr) {
  let seed = seedStr.split("-").reduce((s, p) => s + parseInt(p, 10), 0);
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

/* -------------------------------------------------------
   Confetti & Toast (no libs)
------------------------------------------------------- */
function spawnConfetti(burst = 60) {
  const container = document.createElement("div");
  container.className = "confetti-container";
  document.body.appendChild(container);
  for (let i = 0; i < burst; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";
    c.style.animationDelay = Math.random() * 2 + "s";
    c.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 60%)`;
    container.appendChild(c);
  }
  setTimeout(() => container.remove(), 4000);
}

function showToast(message) {
  const el = document.createElement("div");
  el.className = "predictle-toast";
  el.textContent = message;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, 1800);
}

/* -------------------------------------------------------
   Normalization helpers
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
    .filter((o) => typeof o.price === "number");
}

function cleanQuestion(qRaw) {
  return (qRaw || "")
    .replace(/^arch/i, "")
    .replace(/^[^A-Za-z0-9]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* -------------------------------------------------------
   Main Predictle Component
------------------------------------------------------- */
export default function Predictle() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState("daily");

  const [markets, setMarkets] = useState([]);
  const [dailyMarkets, setDailyMarkets] = useState([]);
  const [freeMarkets, setFreeMarkets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [tLeft, setTLeft] = useState({ h: "00", m: "00", s: "00" });

  // Theme
  useEffect(() => {
    const saved = localStorage.getItem("predictle_theme");
    if (saved === "dark") setDark(true);
  }, []);

  /* -----------------------------------------------
     Market Fetch with Progressive Backoff
  ----------------------------------------------- */
  useEffect(() => {
    let mounted = true;
    let retryTimer = null;
    let retryCount = 0;
    const backoffMins = [5, 10, 15];

    const fetchMarkets = async (manual = false) => {
      try {
        if (manual) showToast("Refreshing markets…");
        if (!manual) setLoading(true);
        setFetchError("");

        const res = await fetch("/api/polymarket");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Filter valid markets only
        const filtered = data
          .filter((m) => {
            const qRaw = m.question || m.title || m.condition_title || m.slug || "";
            const q = cleanQuestion(qRaw);
            const os = getOutcomes(m);
            if (os.length < 2) return false;

            const isActive =
              !m.closed &&
              !m.resolved &&
              !m.archived &&
              !qRaw.toLowerCase().includes("test") &&
              !qRaw.toLowerCase().includes("archived");

            const looksOld = /\b(2018|2019|2020|2021|2022|2023)\b/i.test(qRaw);
            return isActive && !looksOld && q.length > 8;
          })
          .map((m) => {
            const qRaw = m.question || m.title || m.condition_title || m.slug || "";
            const q = cleanQuestion(qRaw);
            const outcomes = getOutcomes(m)
              .sort((a, b) => (b.raw?.volume || 0) - (a.raw?.volume || 0) || b.price - a.price)
              .slice(0, 2);
            return { ...m, question: q, outcomes };
          })
          // ✅ Exclude markets with 0% or 100% (illiquid/old)
          .filter((m) => {
            const prices = m.outcomes.map((o) => o.price);
  // Exclude only if BOTH outcomes are extreme or invalid
            const bothExtreme = prices.every((p) => p <= 0.005 || p >= 0.995);
            const bothInvalid = prices.some((p) => typeof p !== "number" || isNaN(p));
            return m.outcomes.length === 2 && !bothExtreme && !bothInvalid;
        });

        // Deduplicate by question prefix
        const seen = new Set();
        const deduped = filtered.filter((m) => {
          const key = m.question.toLowerCase().slice(0, 80);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        if (!mounted) return;

        if (!deduped.length) {
          retryCount += 1;
          const idx = Math.min(retryCount - 1, backoffMins.length - 1);
          const delayMs = backoffMins[idx] * 60_000;
          setFetchError(`No valid markets yet. Retrying in ${backoffMins[idx]} minutes…`);
          if (retryTimer) clearTimeout(retryTimer);
          retryTimer = setTimeout(() => fetchMarkets(false), delayMs);
        } else {
          retryCount = 0;
          const shuffled = shuffle(deduped);
          const splitIndex = Math.floor(shuffled.length * 0.6);
          setMarkets(deduped);
          setDailyMarkets(shuffled.slice(0, splitIndex));
          setFreeMarkets(shuffled.slice(splitIndex));
          if (manual) showToast(`✅ Updated • ${deduped.length} markets`);
        }
      } catch (e) {
        if (!mounted) return;
        retryCount += 1;
        const idx = Math.min(retryCount - 1, backoffMins.length - 1);
        const delayMs = backoffMins[idx] * 60_000;
        setFetchError(`Fetch failed. Retrying in ${backoffMins[idx]} minutes…`);
        showToast(`❌ Fetch failed • retry in ${backoffMins[idx]} min`);
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = setTimeout(() => fetchMarkets(false), delayMs);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMarkets();
    window.refreshMarkets = () => fetchMarkets(true);

    return () => {
      mounted = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  /* -----------------------------------------------
     UTC Countdown
  ----------------------------------------------- */
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => (window.refreshMarkets(), showToast("Refreshing markets…"))}
            className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-700/10"
          >
            🔁 Refresh
          </button>
          <button
            onClick={toggleTheme}
            className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-700/10"
          >
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-auto max-w-4xl mt-6">
        <div className="inline-flex rounded-xl overflow-hidden border">
          <button
            className={classNames(
              "px-4 py-2 text-sm font-medium",
              tab === "daily" ? (dark ? "bg-gray-800" : "bg-white") : "bg-transparent"
            )}
            onClick={() => setTab("daily")}
          >
            Daily Challenge 🟩🟨🟥
          </button>
          <button
            className={classNames(
              "px-4 py-2 text-sm font-medium border-l",
              tab === "free" ? (dark ? "bg-gray-800" : "bg-white") : "bg-transparent"
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
          <DailyChallenge dark={dark} markets={dailyMarkets} loading={loading} fetchError={fetchError} />
        ) : (
          <FreePlay dark={dark} markets={freeMarkets} loading={loading} fetchError={fetchError} />
        )}
      </div>

      {/* Countdown footer */}
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

      {/* Confetti + Toast CSS */}
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
      <style jsx global>{`
        .predictle-toast {
          position: fixed;
          left: 50%;
          bottom: 24px;
          transform: translateX(-50%) translateY(10px);
          background: rgba(17, 24, 39, 0.95);
          color: #fff;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 14px;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
          opacity: 0;
          z-index: 9999;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .predictle-toast.show {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      `}</style>
    </main>
  );
}

/* -------------------------------------------------------
   Daily Challenge (patched restore + reset)
------------------------------------------------------- */
function DailyChallenge({ dark, markets, loading, fetchError }) {
  const TODAY = utcYYYYMMDD();
  const [step, setStep] = useState(0);
  const [grid, setGrid] = useState([]);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [guess, setGuess] = useState(50);

  const [dailyScore, setDailyScore] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);

  const lastDayRef = useRef(TODAY);

  // Auto-reset at UTC midnight
  useEffect(() => {
    const id = setInterval(() => {
      const nowDay = utcYYYYMMDD();
      if (nowDay !== lastDayRef.current) {
        lastDayRef.current = nowDay;
        localStorage.clear();
        setStep(0);
        setGrid([]);
        setLocked(false);
        setFeedback(null);
        setGuess(50);
        setDailyScore(0);
        setDailyStreak(0);
        showToast("🔄 New daily challenge is live!");
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Restore progress AFTER markets loaded
  useEffect(() => {
    const lastPlay = localStorage.getItem("predictle_daily_last");
    const sc = parseFloat(localStorage.getItem("predictle_daily_score") || "0");
    const st = parseInt(localStorage.getItem("predictle_daily_streak") || "0", 10);
    setDailyScore(sc);
    setDailyStreak(st);

    if (markets.length && lastPlay === TODAY) {
      const savedStep = parseInt(localStorage.getItem("predictle_daily_step") || "0", 10);
      const savedGrid = JSON.parse(localStorage.getItem("predictle_daily_grid") || "[]");
      const clampedStep = Math.min(savedStep, 4);
      setStep(clampedStep);
      setGrid(savedGrid);
      setLocked(savedStep >= 5);
    }
  }, [markets, TODAY]);

  const todaysFive = useMemo(() => {
    if (!markets.length) return [];
    const idxs = pickDailyIndices(5, markets.length, TODAY);
    return idxs.map((i) => markets[i]).filter(Boolean);
  }, [markets, TODAY]);

  const current = todaysFive[step];

  const judge = (guessPct, actualPct) => {
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
      spawnConfetti(100);
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
    localStorage.setItem("predictle_daily_last", TODAY);
    localStorage.setItem("predictle_daily_grid", JSON.stringify(newGrid));
  };

  const nextQ = () => {
    setFeedback(null);
    setGuess(50);
    const next = step + 1;
    if (next >= 5) {
      setStep(5);
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
    )} | Streak: ${dailyStreak}\nPlay: https://predictist.io/predictle`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
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
          <Button onClick={() => window.refreshMarkets?.()}>Try Refresh</Button>
        </div>
      </Card>
    );

  if (locked && step === 5)
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
    <Card dark={dark}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Daily Challenge — {Math.min(step + 1, 5)} / 5</h2>
        <div className="flex gap-4">
          <Stat label="Score" value={dailyScore.toFixed(1)} color="blue" />
          <Stat label="Streak" value={dailyStreak} color="green" />
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
            <Button onClick={nextQ}>Next</Button>
          </div>
        </>
      ) : (
        <div className="flex justify-center mt-4">
          <Button onClick={handleSubmit}>Submit Guess</Button>
        </div>
      )}
    </Card>
  );
}

/* -------------------------------------------------------
   Free Play (patched shuffle order)
------------------------------------------------------- */
function FreePlay({ dark, markets, loading, fetchError }) {
  const [order, setOrder] = useState([]);
  const [idx, setIdx] = useState(0);
  const [guess, setGuess] = useState(50);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const s = parseFloat(localStorage.getItem("predictle_fp_score") || "0");
    const k = parseInt(localStorage.getItem("predictle_fp_streak") || "0", 10);
    setScore(s);
    setStreak(k);
  }, []);

  useEffect(() => {
    if (markets.length) setOrder(shuffle([...Array(markets.length).keys()]));
  }, [markets]);

  const judge = (guessPct, actualPct) => {
    const diff = Math.abs(guessPct - actualPct);
    if (diff <= 10) return "green";
    if (diff <= 20) return "yellow";
    return "red";
  };

  const current = markets[order[idx]];

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
    if (!order.length) return;
    const nextIdx = (idx + 1) % order.length;
    setIdx(nextIdx);
  };

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
          <Button onClick={() => window.refreshMarkets?.()}>Try Refresh</Button>
        </div>
      </Card>
    );

  const [left, right] = current.outcomes;
  return (
    <Card dark={dark}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Free Play</h2>
        <div className="flex gap-4">
          <Stat label="Score" value={score.toFixed(1)} color="blue" />
          <Stat label="Streak" value={streak} color="green" />
        </div>
      </div>

      <p className="text-gray-500 mb-4">{current.question}</p>

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
  );
}

/* -------------------------------------------------------
   Comparison bar + UI primitives
------------------------------------------------------- */
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

function Card({ dark, children }) {
  return (
    <div
      className={classNames("shadow-md rounded-xl p-6", dark ? "bg-gray-800" : "bg-white")}
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

