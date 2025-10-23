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
  const playable = [];

  for (const e of events) {
    if (!e || !e.markets || !e.markets.length) continue;
    const q = (e.question || e.title || "").trim();
    if (q.length < 5) continue;

    const m = e.markets[0];
    if (!m) continue;

    // Detect possible outcome arrays
    const outcomes = m.outcomes || m.tokens || m.order_books || [];
    if (outcomes.length < 2) continue;

    // Extract usable prices flexibly
    const parsed = outcomes.map((o) => {
      // Try every possible numeric field
      let price =
        typeof o.price === "number"
          ? o.price
          : typeof o.last_price === "number"
          ? o.last_price
          : typeof o?.price?.mid === "number"
          ? o.price.mid
          : typeof o?.price?.yes === "number"
          ? o.price.yes
          : typeof o?.best_bid === "number"
          ? o.best_bid
          : typeof o?.best_ask === "number"
          ? (o.best_bid + o.best_ask) / 2
          : undefined;
      return price;
    });

    // Recover missing prices (if one side missing)
    if (parsed[0] != null && parsed[1] == null) parsed[1] = 1 - parsed[0];
    if (parsed[1] != null && parsed[0] == null) parsed[0] = 1 - parsed[1];

    // Validate
    const valid = parsed.every((p) => typeof p === "number" && p > 0 && p < 1);
    if (!valid) continue;

    const lowerQ = q.toLowerCase();
    if (lowerQ.includes("test") || lowerQ.includes("archive")) continue;
    const looksOld = /\b(2018|2019|2020|2021|2022|2023)\b/i.test(lowerQ);
    if (looksOld) continue;

    playable.push({
      id: e.id,
      question: q,
      markets: [
        {
          slug: m.slug || m.id || e.id,
          outcomes: [
            { name: outcomes[0]?.name || outcomes[0]?.token_name || "Yes", price: parsed[0] },
            { name: outcomes[1]?.name || outcomes[1]?.token_name || "No", price: parsed[1] },
          ],
        },
      ],
    });
  }

  console.log(`🎯 normalizeMarkets → ${playable.length} playable`);
  // Optional: log a few examples
  playable.slice(0, 3).forEach((m) =>
    console.log(`• ${m.question} (${m.markets[0].outcomes[0].price.toFixed(2)} / ${m.markets[0].outcomes[1].price.toFixed(2)})`)
  );

  return playable;
}







