import { useState, useEffect } from "react";

/* -------------------- toast (no deps) -------------------- */
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

/* -------------------- helper functions -------------------- */
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

export default function Predictle() {
  const [markets, setMarkets] = useState([]);
  const [dailyMarkets, setDailyMarkets] = useState([]);
  const [freeMarkets, setFreeMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState("daily");
  const [locked, setLocked] = useState(false);
  const [step, setStep] = useState(1);

  /* -------------------- fetch markets -------------------- */
  useEffect(() => {
    let mounted = true;
    let retryTimer = null;
    let retryCount = 0;

    const fetchMarkets = async (manual = false) => {
      try {
        if (manual) showToast("Refreshing markets…");
        console.log(manual ? "🔁 Manual refresh triggered" : "🔄 Fetching Polymarket markets...");
        if (!manual) setLoading(true);
        setFetchError("");

        const res = await fetch("/api/polymarket");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log("✅ Raw markets:", data.length);

        const filtered = data
          .filter((m) => {
            const q = m.question || m.title || m.condition_title || m.slug || "";
            const cleanQ = q
              .replace(/^arch/i, "")
              .replace(/^[^A-Za-z0-9]+/, "")
              .replace(/\s+/g, " ")
              .trim();

            const tokens = Array.isArray(m.tokens) ? m.tokens : [];
            if (tokens.length < 2) return false;

            const yesOutcome = tokens.find((t) =>
              /yes/i.test(t.outcome || t.name || "")
            );
            const noOutcome = tokens.find((t) =>
              /no/i.test(t.outcome || t.name || "")
            );

            const hasYesNo = !!(yesOutcome && noOutcome);
            const isBinary =
              hasYesNo ||
              (tokens.length === 2 &&
                tokens.every((t) => typeof t.outcome === "string"));

            const createdAt = new Date(
              m.created_at ||
                m.start_date ||
                m.createdAt ||
                m.timestamp ||
                Date.now()
            );
            const daysOld =
              (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

            const isActive =
              !m.closed &&
              !m.resolved &&
              !m.archived &&
              !q.toLowerCase().includes("test");

            return (
              isBinary &&
              hasYesNo &&
              isActive &&
              cleanQ.length > 10 &&
              daysOld < 365
            );
          })
          .map((m) => ({
            ...m,
            question:
              (m.question ||
                m.title ||
                m.condition_title ||
                m.slug ||
                "")
                .replace(/^arch/i, "")
                .replace(/^[^A-Za-z0-9]+/, "")
                .replace(/\s+/g, " ")
                .trim(),
          }));

        // 🧹 Deduplicate
        const seen = new Set();
        const deduped = filtered.filter((m) => {
          const key = m.question.toLowerCase().slice(0, 60);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        console.log(`🧩 Deduped markets: ${deduped.length}`);
        if (mounted) {
          if (deduped.length === 0) {
            retryCount++;
            const delay = Math.min(5, retryCount * 2 - 1) * 60 * 1000;
            console.warn(`⚠️ No valid markets found — retrying in ${delay / 60000} min...`);
            if (manual) showToast(`No markets found. Retrying in ${delay / 60000} min`);
            retryTimer = setTimeout(() => fetchMarkets(false), delay);
          } else {
            retryCount = 0;

            // 🔀 Split markets into two pools
            const shuffled = shuffle(deduped);
            const splitIndex = Math.floor(shuffled.length * 0.6);
            const dailyPool = shuffled.slice(0, splitIndex);
            const freePool = shuffled.slice(splitIndex);

            setMarkets(deduped);
            setDailyMarkets(dailyPool);
            setFreeMarkets(freePool);

            if (manual)
              showToast(
                `✅ Updated • ${deduped.length} markets (${dailyPool.length} daily / ${freePool.length} free)`
              );
          }
        }
      } catch (e) {
        console.error("❌ Error fetching markets:", e);
        if (mounted) {
          retryCount++;
          const delay = Math.min(5, retryCount * 2 - 1) * 60 * 1000;
          setFetchError(`Fetch failed. Retrying in ${delay / 60000} minutes...`);
          if (manual) showToast(`❌ Fetch failed • retry in ${delay / 60000} min`);
          retryTimer = setTimeout(() => fetchMarkets(false), delay);
        }
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

  /* -------------------- handle guess -------------------- */
  const handleGuess = (choice) => {
    const activePool = tab === "daily" ? dailyMarkets : freeMarkets;
    if (!activePool.length || locked) return;

    const current = activePool[step - 1];
    if (!current) return;

    const outcomes = Array.isArray(current.outcomes)
      ? current.outcomes
      : current.tokens || [];

    const yesOutcome =
      outcomes.find((o) => /yes/i.test(o.name || o.outcome || "")) ||
      outcomes[0];
    const noOutcome =
      outcomes.find((o) => /no/i.test(o.name || o.outcome || "")) ||
      outcomes[1];

    const yes = Number(yesOutcome?.price ?? 0);
    const no = Number(noOutcome?.price ?? 0);
    const favored = yes > no ? "YES" : "NO";
    const correct = choice === favored;

    showToast(correct ? "✅ Correct!" : "❌ Not this time!");
    setLocked(true);
    setTimeout(() => {
      setLocked(false);
      setStep((s) => (s < 5 ? s + 1 : 1));
    }, 1200);
  };

  /* -------------------- render -------------------- */
  const activePool = tab === "daily" ? dailyMarkets : freeMarkets;

  return (
    <main
      className={`min-h-screen ${
        dark ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div className="flex justify-between items-center p-4">
        <h1 className="text-3xl font-bold">Predictle</h1>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setTab("daily")}
            className={`px-3 py-1 rounded-md ${
              tab === "daily" ? "bg-green-500 text-white" : "bg-gray-300"
            }`}
          >
            Daily Challenge
          </button>
          <button
            onClick={() => setTab("free")}
            className={`px-3 py-1 rounded-md ${
              tab === "free" ? "bg-pink-500 text-white" : "bg-gray-300"
            }`}
          >
            Free Play
          </button>
          <button
            onClick={() => (window.refreshMarkets(), showToast("Refreshing markets…"))}
            className="ml-4 px-3 py-1 text-sm border rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            🔁 Refresh Markets
          </button>
          <button
            onClick={() => setDark((d) => !d)}
            className="ml-4 px-3 py-1 border rounded-md"
          >
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4">
        {loading ? (
          <p className="text-gray-500">Loading markets...</p>
        ) : fetchError ? (
          <p className="text-red-500">{fetchError}</p>
        ) : activePool.length === 0 ? (
          <p className="text-gray-500">
            No {tab === "daily" ? "daily" : "free play"} markets available.
          </p>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">
              {tab === "daily" ? "Daily Challenge" : "Free Play"} — {step}/5
            </h2>
            <p className="mb-4">
              {activePool[step - 1]?.question || "Loading question..."}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                onClick={() => handleGuess("YES")}
                disabled={locked}
              >
                YES
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
                onClick={() => handleGuess("NO")}
                disabled={locked}
              >
                NO
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🧁 Toast styles */}
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

