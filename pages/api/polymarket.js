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
function normalizeMarkets(events) {
  // Helper: pick a market object from either an event (Gamma) or a market (CLOB)
  const pickMarket = (e) => {
    if (e && Array.isArray(e.markets) && e.markets.length) return e.markets[0]; // Gamma
    return e; // CLOB already is the market object
  };

  // Helper: get an array of outcome-like objects from a market object
  const getOutcomeArray = (m) => {
    if (!m) return [];
    if (Array.isArray(m.outcomes)) return m.outcomes;
    if (Array.isArray(m.tokens)) return m.tokens;
    if (Array.isArray(m.order_books)) return m.order_books;
    return [];
  };

  // Helper: extract a usable probability (0..1) from many possible fields
  const readPrice = (o) => {
    if (typeof o?.price === "number") return o.price;
    if (typeof o?.last_price === "number") return o.last_price;
    if (typeof o?.price?.mid === "number") return o.price.mid;
    if (typeof o?.price?.yes === "number") return o.price.yes;
    if (typeof o?.price?.no === "number") return 1 - o.price.no;
    if (typeof o?.best_bid === "number" && typeof o?.best_ask === "number") {
      // order_books style — midpoint of bid/ask
      return (o.best_bid + o.best_ask) / 2;
    }
    if (typeof o?.bid_price === "number") return o.bid_price;
    if (typeof o?.ask_price === "number") return o.ask_price; // will be clamped later
    return undefined;
  };

  const playable = [];

  for (const e of events || []) {
    // Question text (Gamma: e.question/title; CLOB: e.question/title/condition_title/slug)
    const q =
      (e?.question ||
        e?.title ||
        e?.condition_title ||
        e?.slug ||
        "").toString().trim();
    if (q.length < 5) continue;

    const m = pickMarket(e);
    if (!m) continue;

    // Basic resolved/closed flags when present
    const resolved = !!m.resolved || !!e.resolved;
    const closed = !!m.closed || !!e.closed;
    if (resolved || closed) continue;

    // Pull outcomes safely
    const outcomesArr = getOutcomeArray(m);
    if (!Array.isArray(outcomesArr) || outcomesArr.length < 2) continue;

    // We only need the top two; many polymarket events still are binary, but guard anyway
    const o0 = outcomesArr[0];
    const o1 = outcomesArr[1];

    let p0 = readPrice(o0);
    let p1 = readPrice(o1);

    // If one side missing, infer from the other
    if (typeof p0 === "number" && typeof p1 !== "number") p1 = 1 - p0;
    if (typeof p1 === "number" && typeof p0 !== "number") p0 = 1 - p1;

    // Clamp any ask-only/bid-only numbers into [0,1]
    const clamp01 = (x) =>
      typeof x === "number" ? Math.max(0, Math.min(1, x)) : x;
    p0 = clamp01(p0);
    p1 = clamp01(p1);

    const pricesValid =
      typeof p0 === "number" &&
      typeof p1 === "number" &&
      p0 > 0 &&
      p0 < 1 &&
      p1 > 0 &&
      p1 < 1;

    if (!pricesValid) continue;

    // Light content filters
    const lowerQ = q.toLowerCase();
    if (lowerQ.includes("test") || lowerQ.includes("archive")) continue;
    if (/\b(2018|2019|2020|2021|2022|2023)\b/.test(lowerQ)) continue;

    playable.push({
      id: e.id || m.id || `${q}-${Math.random().toString(36).slice(2, 8)}`,
      question: q,
      markets: [
        {
          slug: m.slug || m.id || e.id,
          outcomes: [
            { name: o0?.name || o0?.token_name || "Yes", price: p0 },
            { name: o1?.name || o1?.token_name || "No", price: p1 },
          ],
        },
      ],
    });
  }

  console.log(`🎯 normalizeMarkets → ${playable.length} playable`);
  // Log a couple examples to verify shape
  playable.slice(0, 3).forEach((m) => {
    const [a, b] = m.markets[0].outcomes;
    console.log(
      `• ${m.question} (${(a.price * 100).toFixed(0)}% / ${(b.price * 100).toFixed(0)}%)`
    );
  });

  return playable;
}








