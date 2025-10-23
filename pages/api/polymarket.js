// pages/api/polymarket.js
/**
 * Predictle Market Fetcher (resilient version)
 * - Primary: Gamma API (freshest, structured)
 * - Fallback: CLOB API (legacy, simple)
 * - Auto-trims to avoid 4MB limit
 * - Filters for playable binary markets
 * - Caches for 5 minutes in memory
 */

let cached = { data: null, timestamp: 0 };

export default async function handler(req, res) {
  try {
    const now = Date.now();

    // ---------- Cache Check ----------
    if (cached.data && now - cached.timestamp < 5 * 60 * 1000) {
      console.log("⚡ Using cached Polymarket data");
      return res.status(200).json(cached.data);
    }

    console.log("🌐 Fetching fresh Polymarket data...");

    // ---------- 1. Try Gamma API ----------
    let events = await tryGammaAPI();
    let source = "Gamma";

    // ---------- 2. Fallback to CLOB API ----------
    if (!events?.length) {
      console.warn("⚠️ Gamma API failed, falling back to CLOB...");
      events = await tryClobAPI();
      source = "CLOB";
    }

    // ---------- 3. If both fail ----------
    if (!events?.length) {
      console.error("❌ No markets fetched from Gamma or CLOB!");
      return res.status(502).json({ error: "Failed to fetch any markets." });
    }

    // ---------- 4. Normalize & Trim ----------
    const playable = normalizeMarkets(events);

    console.log(
      `✅ ${source} fetched ${events.length} • playable ${playable.length} • ${new Date().toISOString()}`
    );

    // ---------- 5. Cache Result ----------
    cached = { data: playable, timestamp: now };

    return res.status(200).json(playable);
  } catch (err) {
    console.error("❌ API route error:", err);
    return res.status(500).json({ error: "Server error fetching Polymarket markets" });
  }
}

/* -------------------------------------------------------
   Gamma API — paginated fetch (modern Polymarket)
------------------------------------------------------- */
async function tryGammaAPI() {
  const limitPerPage = 200;
  const maxPages = 3;
  const allEvents = [];

  for (let page = 0; page < maxPages; page++) {
    const offset = page * limitPerPage;
    const url = `https://gamma-api.polymarket.com/events?closed=false&limit=${limitPerPage}&ascending=false&offset=${offset}`;

    // pages/api/polymarket.js
    try {
      console.log("🌐 Fetching fresh Polymarket data...");
      const url = "https://gamma-api.polymarket.com/events?order=id&ascending=false&closed=false&limit=1500";
      const r = await fetch(url, { headers: { accept: "application/json" }, cache: "no-store" });

      if (!r.ok) throw new Error(`Gamma API returned ${r.status}`);

      const body = await r.json();
      if (!Array.isArray(body)) throw new Error("Gamma response not array");

      // Log one sample safely
      if (body.length > 0) console.log("🔍 Example raw event:", JSON.stringify(body[0], null, 2));

      const events = body;
      const normalized = normalizeMarkets(events);

      if (!normalized.length) throw new Error("Gamma returned 0 playable");

      console.log(`✅ Gamma fetched ${events.length} • playable ${normalized.length}`);
      return res.status(200).json(normalized);
    } catch (err) {
      console.warn("⚠️ Gamma API failed, falling back to CLOB...", err.message);
    }

  }
  return allEvents;
}

/* -------------------------------------------------------
   CLOB API — backup source (legacy Polymarket)
------------------------------------------------------- */
async function tryClobAPI() {
  try {
    const r = await fetch("https://clob.polymarket.com/markets", {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`CLOB API HTTP ${r.status}`);
    const data = await r.json();
    return Array.isArray(data) ? data : data?.data || [];
  } catch (err) {
    console.error("CLOB API fetch failed:", err);
    return [];
  }
}

/* -------------------------------------------------------
   Normalize + Filter
   Ensures we only return playable binary markets
------------------------------------------------------- */
// pages/api/polymarket.js
export default async function handler(req, res) {
  try {
    console.log("🌐 Fetching fresh Polymarket data...");

    // --- 1️⃣ Gamma (structure only)
    const gammaURL = "https://gamma-api.polymarket.com/events?limit=1000&closed=false";
    const gammaRes = await fetch(gammaURL, { headers: { accept: "application/json" } });
    const gammaBody = await gammaRes.json();
    const gammaEvents = Array.isArray(gammaBody) ? gammaBody : [];
    console.log(`✅ Gamma fetched ${gammaEvents.length}`);

    // --- 2️⃣ CLOB (for live odds/prices)
    const clobURL = "https://clob.polymarket.com/markets?limit=1000";
    const clobRes = await fetch(clobURL, { headers: { accept: "application/json" } });
    const clobBody = await clobRes.json();
    const clobMarkets = Array.isArray(clobBody) ? clobBody : [];
    console.log(`✅ CLOB fetched ${clobMarkets.length}`);

    // --- 3️⃣ Merge + normalize
    const playable = [];

    for (const e of gammaEvents) {
      const market = e.markets?.[0];
      if (!market) continue;

      // Outcomes (stringified JSON)
      let outcomesArr = [];
      try {
        outcomesArr = JSON.parse(market.outcomes);
      } catch {
        outcomesArr = Array.isArray(market.outcomes) ? market.outcomes : [];
      }
      if (!Array.isArray(outcomesArr) || outcomesArr.length < 2) continue;

      // Match with CLOB by slug or id
      const clobMatch =
        clobMarkets.find((m) => m.slug === e.slug || m.slug === market.slug) || null;

      const yesPrice =
        typeof clobMatch?.outcomes?.[0]?.price === "number"
          ? clobMatch.outcomes[0].price
          : 0.5;
      const noPrice = 1 - yesPrice;

      // Build playable record
      playable.push({
        id: e.id || market.id,
        question: market.question || e.title || e.slug,
        outcomes: [
          { name: outcomesArr[0] || "Yes", price: yesPrice },
          { name: outcomesArr[1] || "No", price: noPrice },
        ],
      });
    }

    // Filter out nonsense / empty ones
    const clean = playable.filter(
      (p) =>
        p.question &&
        p.question.length > 6 &&
        p.outcomes.every((o) => o.price > 0 && o.price < 1)
    );

    console.log(`🎯 normalizeMarkets → ${clean.length} playable`);
    if (clean.length) {
      clean.slice(0, 3).forEach((m) =>
        console.log(`• ${m.question} (${(m.outcomes[0].price * 100).toFixed(0)}%)`)
      );
    }

    res.status(200).json(clean);
  } catch (err) {
    console.error("❌ API route error:", err);
    res.status(500).json({ error: err.message });
  }
}
