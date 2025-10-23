// pages/api/polymarket.js
// ✅ Predictle Live Polymarket API (Gamma + CLOB + /prices fallback)

let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  try {
    const now = Date.now();

    // Serve from cache if recent
    if (cachedData && now - cacheTimestamp < CACHE_DURATION_MS) {
      console.log("⚡ Using cached Polymarket data");
      return res.status(200).json(cachedData);
    }

    console.log("🌐 Fetching fresh Polymarket data…");

    // --- 1️⃣ Gamma: Fetch open events (metadata + structure)
    const gammaURL = "https://gamma-api.polymarket.com/events?closed=false&limit=1000";
    const gammaRes = await fetch(gammaURL, { headers: { accept: "application/json" } });
    const gammaData = await gammaRes.json();
    const gammaEvents = Array.isArray(gammaData) ? gammaData : [];
    console.log(`✅ Gamma fetched ${gammaEvents.length}`);

    // --- 2️⃣ CLOB: Fetch market details (for price/token IDs)
    const clobURL = "https://clob.polymarket.com/markets?limit=1000";
    const clobRes = await fetch(clobURL, { headers: { accept: "application/json" } });
    const clobBody = await clobRes.json();
    const clobMarkets = clobBody?.data || clobBody || [];
    console.log(`✅ CLOB fetched ${clobMarkets.length}`);

    // --- 3️⃣ Collect token IDs for fallback price check (only unresolved)
const tokenIds = clobMarkets
  .filter((m) => m.active && !m.closed && !m.archived)
  .flatMap((m) =>
    (m.tokens || [])
      .filter((t) => typeof t.price !== "number" || t.price === 0)
      .map((t) => t.token_id)
  )
  .filter(Boolean)
  .slice(0, 500); // smaller batch = safer


    // --- 4️⃣ Fetch live prices (POST /prices)
    const pricesURL = "https://clob.polymarket.com/prices";
    const priceRes = await fetch(pricesURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token_ids: tokenIds }),
    });

    const priceData = await priceRes.json();
    const priceMap = Array.isArray(priceData)
      ? Object.fromEntries(priceData.map((p) => [p.token_id, p.price]))
      : {};
    console.log(`📊 Price fallback received ${Object.keys(priceMap).length} tokens`);

    // --- 5️⃣ Merge Gamma + CLOB + Prices
    const playable = [];

    for (const event of gammaEvents) {
      const market = event.markets?.[0];
      if (!market) continue;

      // Find CLOB match
      const clobMatch = clobMarkets.find(
        (m) => m.condition_id === market.condition_id
      );
      if (!clobMatch || !clobMatch.tokens || clobMatch.tokens.length < 2) continue;

      const tokens = clobMatch.tokens;

      // Extract prices — use CLOB first, fallback to /prices
      const yesToken = tokens[0];
      const noToken = tokens[1];
      const yes =
        typeof yesToken.price === "number"
          ? yesToken.price
          : typeof priceMap[yesToken.token_id] === "number"
          ? priceMap[yesToken.token_id]
          : 0.5;
      const no =
        typeof noToken.price === "number"
          ? noToken.price
          : typeof priceMap[noToken.token_id] === "number"
          ? priceMap[noToken.token_id]
          : 1 - yes;

      const q = market.question || event.title || "Untitled Market";
      const lowerQ = q.toLowerCase();

      // Skip test/archive/old markets
      if (
        lowerQ.includes("test") ||
        lowerQ.includes("archive") ||
        /\b(2018|2019|2020|2021|2022|2023|2024)\b/.test(lowerQ)
      )
        continue;

      // Skip expired markets
      const endTime = market.end_date_iso
        ? new Date(market.end_date_iso).getTime()
        : null;
      if (endTime && endTime < now) continue;

      // ✅ Add to playable
      playable.push({
        id: event.id || market.id,
        question: q.trim(),
        outcomes: [
          { name: tokens[0].outcome || "Yes", price: yes },
          { name: tokens[1].outcome || "No", price: no },
        ],
      });
    }

    // --- 6️⃣ Clean, randomize, cache
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

    cachedData = clean;
    cacheTimestamp = now;
    return res.status(200).json(clean);
  } catch (err) {
    console.error("❌ API route error:", err);
    return res.status(500).json({ error: err.message });
  }
}

