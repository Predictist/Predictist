// pages/api/polymarket.js

// In-memory cache for 5 minutes
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  try {
    const now = Date.now();

    // 🧠 Serve from cache if fresh
    if (cachedData && now - cacheTimestamp < CACHE_DURATION_MS) {
      console.log("⚡ Using cached Polymarket data");
      return res.status(200).json(cachedData);
    }

    console.log("🌐 Fetching fresh Polymarket data...");

    // --- 1️⃣ Fetch Gamma (market structure)
    const gammaURL =
      "https://gamma-api.polymarket.com/events?limit=1000&closed=false";
    const gammaRes = await fetch(gammaURL, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    const gammaBody = await gammaRes.json().catch(() => []);
    const gammaEvents = Array.isArray(gammaBody) ? gammaBody : [];
    console.log(`✅ Gamma fetched ${gammaEvents.length}`);

    // --- 2️⃣ Fetch CLOB (live prices) from mirror API
const clobURL =
  "https://r.jina.ai/https://clob.polymarket.com/markets?limit=1000";
const clobRes = await fetch(clobURL, {
  headers: { accept: "application/json" },
  cache: "no-store",
});

const clobBody = await clobRes.json().catch(() => []);
const clobMarkets = Array.isArray(clobBody)
  ? clobBody
  : Array.isArray(clobBody?.data)
  ? clobBody.data
  : [];
console.log(`✅ CLOB fetched ${clobMarkets.length}`);

    // --- 3️⃣ Merge & normalize
    const playable = [];

    for (const e of gammaEvents) {
      const market = e.markets?.[0];
      if (!market) continue;

      // Parse outcomes (Gamma gives string)
      let outcomesArr = [];
      try {
        outcomesArr = JSON.parse(market.outcomes);
      } catch {
        outcomesArr = Array.isArray(market.outcomes) ? market.outcomes : [];
      }
      if (!Array.isArray(outcomesArr) || outcomesArr.length < 2) continue;

      // Match GraphQL market by conditionId or slug
      const clobMatch =
        clobMarkets.find(
          (m) =>
            m.conditionId === market.condition_id ||
            m.slug === market.slug ||
            m.id === market.id
        ) || null;

      // Pull real prices if available
      let yes =
  typeof clobMatch?.prices?.yes === "number"
    ? clobMatch.prices.yes
    : typeof clobMatch?.latestPrice === "number"
    ? clobMatch.latestPrice
    : 0.5;

let no =
  typeof clobMatch?.prices?.no === "number"
    ? clobMatch.prices.no
    : 1 - yes;

      // Clamp to [0,1]
      yes = Math.max(0, Math.min(1, yes));
      no = Math.max(0, Math.min(1, no));

      // Skip test/archive markets
      const q =
        market.question || e.title || e.name || e.slug || "Untitled Market";
      const lowerQ = q.toLowerCase();
      if (
        lowerQ.includes("test") ||
        lowerQ.includes("archive") ||
        /\b(2018|2019|2020|2021|2022|2023)\b/.test(lowerQ)
      )
        continue;

      playable.push({
        id: e.id || market.id,
        question: q.trim(),
        outcomes: [
          { name: outcomesArr[0] || "Yes", price: yes },
          { name: outcomesArr[1] || "No", price: no },
        ],
      });
    }

    // --- 4️⃣ Clean & shuffle
    const clean = playable
      .filter(
        (p) =>
          p.question &&
          p.question.length > 6 &&
          p.outcomes.every((o) => o.price > 0 && o.price < 1)
      )
      .sort(() => Math.random() - 0.5);

    console.log(`🎯 normalizeMarkets → ${clean.length} playable`);
    clean.slice(0, 3).forEach((m) =>
      console.log(
        `• ${m.question} (${(m.outcomes[0].price * 100).toFixed(0)}%)`
      )
    );

    // --- 5️⃣ Cache and return
    cachedData = clean;
    cacheTimestamp = now;
    return res.status(200).json(clean);
  } catch (err) {
    console.error("❌ API route error:", err);
    return res.status(500).json({ error: err.message });
  }
}