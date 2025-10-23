// pages/api/polymarket.js
// ✅ Polymarket Live Markets API for Predictle
// Combines caching, filtering, and real price parsing from CLOB endpoint

// In-memory cache (5 minutes)
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 min

export default async function handler(req, res) {
  try {
    const now = Date.now();

    // 🧠 Serve from cache if recent
    if (cachedData && now - cacheTimestamp < CACHE_DURATION_MS) {
      console.log("⚡ Using cached Polymarket data");
      return res.status(200).json(cachedData);
    }

    console.log("🌐 Fetching fresh Polymarket data…");

    // --- 1️⃣ Fetch live markets from Polymarket CLOB REST API
    const url = "https://clob.polymarket.com/markets?active=true&closed=false&archived=false&limit=1000";
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    const body = await response.json();
    const markets = body?.data || body || [];
    console.log(`✅ Pulled ${markets.length} markets`);

    // --- 2️⃣ Normalize and filter
const playable = [];

for (const m of markets) {
  if (!m?.question || !m?.tokens || m.tokens.length < 2) continue;

  const outcomes = m.tokens.map((t) => t.outcome);
  const yes = typeof m.tokens[0].price === "number" ? m.tokens[0].price : 0.5;
  const no = typeof m.tokens[1].price === "number" ? m.tokens[1].price : 1 - yes;

  const q = m.question.trim();
  const lowerQ = q.toLowerCase();

  // ⛔ Skip test/archive/old markets
  if (
    lowerQ.includes("test") ||
    lowerQ.includes("archive") ||
    /\b(2018|2019|2020|2021|2022|2023|2024)\b/.test(lowerQ)
  ) continue;

  // 🕒 Skip markets that have already ended
  const endTime = m.end_date_iso ? new Date(m.end_date_iso).getTime() : null;
  const now = Date.now();
  if (endTime && endTime < now) continue;

  // ✅ Add only future/active markets
  playable.push({
    id: m.condition_id || m.id,
    question: q,
    outcomes: [
      { name: outcomes[0] || "Yes", price: yes },
      { name: outcomes[1] || "No", price: no },
    ],
  });
}


    // --- 3️⃣ Clean and shuffle
    const clean = playable
      .filter(
        (p) =>
          p.outcomes.every((o) => o.price > 0 && o.price < 1) &&
          p.question.length > 6
      )
      .sort(() => Math.random() - 0.5);

    console.log(`🎯 normalizeMarkets → ${clean.length} playable`);
    clean.slice(0, 3).forEach((m) =>
      console.log(
        `• ${m.question} (${(m.outcomes[0].price * 100).toFixed(0)}%)`
      )
    );

    // --- 4️⃣ Cache and respond
    cachedData = clean;
    cacheTimestamp = now;
    return res.status(200).json(clean);
  } catch (err) {
    console.error("❌ API route error:", err);
    return res.status(500).json({ error: err.message });
  }
}

