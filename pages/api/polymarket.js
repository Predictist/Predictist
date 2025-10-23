// pages/api/polymarket.js

// 🧠 5-minute in-memory cache
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  try {
    const now = Date.now();

    // ⚡ Serve from cache if still fresh
    if (cachedData && now - cacheTimestamp < CACHE_DURATION_MS) {
      console.log("⚡ Using cached Polymarket data");
      return res.status(200).json(cachedData);
    }

    console.log("🌐 Fetching fresh Polymarket data...");

    // --- 1️⃣ Fetch from new CLOB REST API (live data)
    const clobURL = "https://clob.polymarket.com/markets?active=true&closed=false&archived=false&limit=1000";
    const clobRes = await fetch(clobURL, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    if (!clobRes.ok) {
      throw new Error(`CLOB fetch failed: ${clobRes.status}`);
    }

    const clobBody = await clobRes.json();
    const clobMarkets = Array.isArray(clobBody.data)
      ? clobBody.data
      : Array.isArray(clobBody)
      ? clobBody
      : [];

    console.log(`✅ CLOB fetched ${clobMarkets.length} markets`);

    const playable = [];

    // --- 2️⃣ Normalize markets and extract prices
    for (const m of clobMarkets) {
      if (!m.question || !m.tokens || m.tokens.length < 2) continue;

      // Filter only open/active markets
      if (!m.active || m.closed || m.archived) continue;

      const outcomes = m.tokens.map((t) => t.outcome || "Unknown");
      const yesToken = m.tokens[0];
      const noToken = m.tokens[1];

      // Pull live prices directly from tokens[].price
      let yes = typeof yesToken?.price === "number" ? yesToken.price : 0.5;
      let no = typeof noToken?.price === "number" ? noToken.price : 1 - yes;

      // Clamp sanity
      yes = Math.max(0, Math.min(1, yes));
      no = Math.max(0, Math.min(1, no));

      // Skip weird or dead markets
      const q = m.question.trim();
      const lowerQ = q.toLowerCase();
      if (
        lowerQ.includes("test") ||
        lowerQ.includes("archive") ||
        /\b(2020|2021|2022|2023)\b/.test(lowerQ)
      )
        continue;

      playable.push({
        id: m.condition_id || m.id,
        question: q,
        outcomes: [
          { name: outcomes[0] || "Yes", price: yes },
          { name: outcomes[1] || "No", price: no },
        ],
        category: m.category || "General",
        end_date: m.end_date_iso || null,
      });
    }

    // --- 3️⃣ Clean, shuffle, and store
    const clean = playable
      .filter(
        (p) =>
          p.outcomes.every((o) => o.price > 0 && o.price < 1)
      )
      .sort(() => Math.random() - 0.5);

    console.log(`🎯 normalizeMarkets → ${clean.length} playable`);
    clean.slice(0, 3).forEach((m) =>
      console.log(
        `• ${m.question} (${(m.outcomes[0].price * 100).toFixed(0)}%)`
      )
    );

    // --- 4️⃣ Cache and return
    cachedData = clean;
    cacheTimestamp = now;
    return res.status(200).json(clean);

  } catch (err) {
    console.error("❌ API route error:", err);
    return res.status(500).json({ error: err.message });
  }
}
