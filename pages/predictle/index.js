import { useEffect, useMemo, useState } from "react";

/* -------------------- utilities -------------------- */
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

/* -------------------- confetti -------------------- */
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

/* -------------------- main page -------------------- */
export default function Predictle() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState("daily");
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [tLeft, setTLeft] = useState({ h: "00", m: "00", s: "00" });

  useEffect(() => {
    const saved = localStorage.getItem("predictle_theme");
    if (saved === "dark") setDark(true);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setFetchError("");
      try {
        const res = await fetch("/api/polymarket");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        console.log("✅ Raw markets:", data.length);

        /* ---------- filtering ---------- */
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

            const hasYesNo =
              tokens.some((t) => /yes/i.test(t.outcome || "")) &&
              tokens.some((t) => /no/i.test(t.outcome || ""));
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

        console.log("✅ Filtered markets:", filtered.length);
        if (filtered.length > 0)
          console.log("🧪 Example:", filtered[0].question);

        if (mounted) setMarkets(filtered);
      } catch (e) {
        console.error("❌ Error fetching markets:", e);
        if (mounted) setFetchError("Failed to fetch markets.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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

      <div className="mx-auto max-w-4xl mt-6">
        {tab === "daily" ? (
          <DailyChallenge dark={dark} markets={markets} loading={loading} fetchError={fetchError} />
        ) : (
          <FreePlay dark={dark} markets={markets} loading={loading} fetchError={fetchError} />
        )}
      </div>

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
    </main>
  );
}

/* ------------------ Reusable UI ------------------ */
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

function Button({ children, onClick, color = "blue" }) {
  const colorMap = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    red: "bg-red-600 hover:bg-red-700",
  };
  return (
    <button
      onClick={onClick}
      className={`${colorMap[color]} text-white px-5 py-3 rounded-lg transition`}
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
      <p className={`${text} text-2xl font-semibold`}>{value}</p>
    </div>
  );
}

