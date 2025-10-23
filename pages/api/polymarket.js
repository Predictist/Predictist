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

    try {
      const r = await fetch(url, { headers: { accept: "application/json" }, cache: "no-store" });
      if (!r.ok) break;
      const body = await r.json();
      const events = Array.isArray(body)
        ? body
        : body?.data || body?.events || [];
      if (!events.length) break;
      allEvents.push(...events);
    } catch (e) {
      console.error("Gamma API error:", e);
      break;
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
function normalizeMarkets(events) {
  const slimmed = events
    .filter((e) => e.markets && e.markets.length > 0)
    .map((e) => ({
      id: e.id,
      question: e.question || e.title || "",
      markets: e.markets.slice(0, 1).map((m) => ({
        slug: m.slug,
        outcomes: m.outcomes || m.tokens || [],
        resolved: m.resolved || false,
        closed: m.closed || false,
      })),
    }))
    .filter((e) => e.question && e.question.length > 5);

  // Binary markets only
  const playable = slimmed.filter((e) => {
    const m = e.markets?.[0];
    const outcomes = Array.isArray(m?.outcomes) ? m.outcomes : [];
    if (outcomes.length !== 2) return false;

    const hasPrices = outcomes.every((o) => {
      const p =
        typeof o.price === "number"
          ? o.price
          : typeof o.last_price === "number"
          ? o.last_price
          : typeof o?.price?.mid === "number"
          ? o.price.mid
          : typeof o?.price?.yes === "number"
          ? o.price.yes
          : undefined;
      return typeof p === "number" && p > 0 && p < 1;
    });

    const lowerQ = e.question.toLowerCase();
    const looksOld = /\b(2018|2019|2020|2021|2022|2023)\b/i.test(lowerQ);

    return hasPrices && !m.resolved && !m.closed && !looksOld && !lowerQ.includes("test");
  });

  return playable;
}





