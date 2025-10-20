import { useEffect, useMemo, useState } from "react";

/* -------------------------------------------------------
   Utilities
------------------------------------------------------- */
const utcYYYYMMDD = () => new Date().toISOString().split("T")[0];

function classNames(...c) {
  return c.filter(Boolean).join(" ");
}

function pickDailyIndices(count, poolLen, seedStr) {
  // Deterministic picker based on date seed
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

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

/* -------------------------------------------------------
   Confetti (vanilla)
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

/* -------------------------------------------------------
   Toast (no deps)
------------------------------------------------------- */
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
   Main Page
------------------------------------------------------- */
export default function Predictle() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState("daily"); // 'daily' | 'free'

  const [markets, setMarkets] = useState([]);
  const [dailyMarkets, setDailyMarkets] = useState([]);
  const [freeMarkets, setFreeMarkets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // UTC countdown
  const [tLeft, setTLeft] = useState({ h: "00", m: "00", s: "00" });

  // Theme load
  useEffect(() => {
    const saved = localStorage.getItem("predictle_theme");
    if (saved === "dark") setDark(true);
  }, []);

  // Market fetch with Option B backoff: 5 → 10 → 15 → steady 15
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

        // Filter YES/NO, active, recent; clean question; dedupe
        const filtered = data
          .filter((m) => {
            const qRaw = m.question || m.title || m.condition_title || m.slug || "";
            const q = qRaw
              .replace(/^arch/i, "")
              .replace(/^[^A-Za-z0-9]+/, "")
              .replace(/\s+/g, " ")
              .trim();

            const tokens = Array.isArray(m.tokens) ? m.tokens : [];
            if (tokens.length < 2) return false;

            const yes = tokens.find((t) =>
              /yes/i.test(t.outcome || t.name || "")
            );
            const no = tokens.find((t) =>
              /no/i.test(t.outcome || t.name || "")
            );
            const hasYesNo = !!(yes && no);

            const createdAt = new Date(
              m.created_at || m.start_date || m.createdAt || m.timestamp || Date.now()
            );
            const daysOld = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

            const isActive =
              !m.closed && !m.resolved && !m.archived && !qRaw.toLowerCase().includes("test");

            return hasYesNo && isActive && q.length > 10 && daysOld < 365;
          })
          .map((m) => ({
            ...m,
            question:
              (m.question || m.title || m.condition_title || m.slug || "")
                .replace(/^arch/i, "")
                .replace(/^[^A-Za-z0-9]+/, "")
                .replace(/\s+/g, " ")
                .trim(),
          }));

        // Deduplicate by first 60 chars of question
        const seen = new Set();
        const deduped = filtered.filter((m) => {
          const key = m.question.toLowerCase().slice(0, 60);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        if (!mounted) return;

        if (deduped.length === 0) {
          retryCount += 1;
          const idx = Math.min(retryCount - 1, backoffMins.length - 1);
          const delayMin = backoffMins[idx];
          const delayMs = delayMin * 60 * 1000;
          setFetchError(`No valid markets yet. Retrying in ${delayMin} minutes…`);
          if (manual) showToast(`No markets found • retry in ${delayMin} min`);
          if (retryTimer) clearTimeout(retryTimer);
          retryTimer = setTimeout(() => fetchMarkets(false), delayMs);
        } else {
          retryCount = 0;

          // Split into Daily (60%) and Free (40%) to avoid overlap
          const shuffled = shuffle(deduped);
          const splitIndex = Math.floor(shuffled.length * 0.6);
          const dailyPool = shuffled.slice(0, splitIndex);
          const freePool = shuffled.slice(splitIndex);

          setMarkets(deduped);
          setDailyMarkets(dailyPool);
          setFreeMarkets(freePool);

          if (manual) showToast(`✅ Updated • ${deduped.length} markets`);
        }
      } catch (e) {
        if (!mounted) return;
        retryCount += 1;
        const idx = Math.min(retryCount - 1, backoffMins.length - 1);
        const delayMin = backoffMins[idx];
        const delayMs = delayMin * 60 * 1000;
        setFetchError(`Fetch failed. Retrying in ${delayMin} minutes…`);
        showToast(`❌ Fetch failed • retry in ${delayMin} min`);
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = setTimeout(() => fetchMarkets(false), delayMs);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMarkets();
    // Expose manual refresh
    window.refreshMarkets = () => fetchMarkets(true);

    return () => {
      mounted = false;
      if (retryTimer) clearTimeout(retryTimer);
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => (window.refreshMarkets(), showToast("Refreshing markets…"))}
            className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-700/10"
          >
            🔁 Refresh Markets
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
          <DailyChallenge
            dark={dark}
            markets={dailyMarkets}
            loading={loading}
            fetchError={fetchError}
          />
        ) : (
          <FreePlay
            dark={dark}
            markets={freeMarkets}
            loading={loading}
            fetchError={fetchError}
          />
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
          0% { transform: translateY(-10vh) rotate(0deg); }
          100% { transform: translateY(100vh) rotate(720deg); }
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
          box-shadow: 0 10px 24px rgba(0,0,0,0.25);
          opacity: 0;
          z-index: 9999;
          transition: transform .2s ease, opacity .2s ease;
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
   Daily Challenge — 5 questions / day with share grid
------------------------------------------------------- */
function DailyChallenge({ dark, markets, loading, fetchError }) {
  const TODAY = utcYYYYMMDD();
  const [step, setStep] = useState(0); // 0..4, then 5 = summary
  const [grid, setGrid] = useState([]); // 🟩 / 🟥
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null); // {type:'correct'|'wrong', probs:{yes,no}}

  // One-play-per-day lock
  useEffect(() => {
    const lastPlay = localStorage.getItem("predictle_daily_last");
    if (lastPlay === TODAY) {
      setLocked(true);
      setGrid(JSON.parse(localStorage.getItem("predictle_daily_grid") || "[]"));
      setStep(parseInt(localStorage.getItem("predictle_daily_step") || "5", 10));
    }
  }, [TODAY]);

  const todaysFive = useMemo(() => {
    if (!markets.length) return [];
    const idxs = pickDailyIndices(5, markets.length, TODAY);
    return idxs.map((i) => markets[i]).filter(Boolean);
  }, [markets, TODAY]);

  const current = todaysFive[step];

  const handleGuess = (choice) => {
    if (!current || locked) return;
    const outcomes = Array.isArray(current.outcomes)
      ? current.outcomes
      : current.tokens || [];

    const yes = outcomes.find((o) => /yes/i.test(o.name || o.outcome || "")) || outcomes[0];
    const no = outcomes.find((o) => /no/i.test(o.name || o.outcome || "")) || outcomes[1];

    const yesP = Number(yes?.price ?? 0);
    const noP = Number(no?.price ?? 0);
    const correct = (choice === "YES" && yesP > noP) || (choice === "NO" && noP > yesP);

    setFeedback({ type: correct ? "correct" : "wrong", probs: { yes: yesP, no: noP } });
    const newGrid = [...grid, correct ? "🟩" : "🟥"];
    setGrid(newGrid);

    if (correct) spawnConfetti(80);

    // Persist progress + lock today
    localStorage.setItem("predictle_daily_last", TODAY);
    localStorage.setItem("predictle_daily_grid", JSON.stringify(newGrid));

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
  if (!todaysFive.length) return <Card dark={dark}><p>No markets available for today.</p></Card>;

  if (locked && step === 5) {
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

  return (
    <Card dark={dark}>
      <h2 className="text-xl font-semibold mb-2">Daily Challenge — {Math.min(step + 1, 5)} / 5</h2>
      {current ? (
        <>
          <p className="text-gray-500 mb-4">{current.question}</p>
          <div className="flex justify-center gap-4 mt-2">
            <Button onClick={() => handleGuess("YES")} disabled={!!feedback || locked} color="green">YES</Button>
            <Button onClick={() => handleGuess("NO")} disabled={!!feedback || locked} color="red">NO</Button>
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
          <div className="flex flex-wrap justify-center gap-1 mt-6 text-2xl">
            {grid.map((g, i) => <span key={i}>{g}</span>)}
          </div>
        </>
      ) : (
        <p className="text-gray-400 italic">Preparing today’s question…</p>
      )}
    </Card>
  );
}

/* -------------------------------------------------------
   Free Play — infinite; score + streak (localStorage)
------------------------------------------------------- */
function FreePlay({ dark, markets, loading, fetchError }) {
  const [current, setCurrent] = useState(null);
  const [feedback, setFeedback] = useState(null); // {type, probs}
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const s = parseInt(localStorage.getItem("predictle_fp_score") || "0", 10);
    const k = parseInt(localStorage.getItem("predictle_fp_streak") || "0", 10);
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
    const m = markets[Math.floor(Math.random() * markets.length)];
    setCurrent(m);
  };

  const guess = (choice) => {
    if (!current || feedback) return;
    const outcomes = Array.isArray(current.outcomes)
      ? current.outcomes
      : current.tokens || [];

    const yes = outcomes.find((o) => /yes/i.test(o.name || o.outcome || "")) || outcomes[0];
    const no = outcomes.find((o) => /no/i.test(o.name || o.outcome || "")) || outcomes[1];

    const yesP = Number(yes?.price ?? 0);
    const noP = Number(no?.price ?? 0);
    const correct = (choice === "YES" && yesP > noP) || (choice === "NO" && noP > yesP);

    setFeedback({ type: correct ? "correct" : "wrong", probs: { yes: yesP, no: noP } });

    if (correct) {
      spawnConfetti(60);
      const ns = score + 1;
      const nk = streak + 1;
      setScore(ns);
      setStreak(nk);
      localStorage.setItem("predictle_fp_score", String(ns));
      localStorage.setItem("predictle_fp_streak", String(nk));
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

/* -------------------------------------------------------
   Tiny UI Primitives
------------------------------------------------------- */
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


