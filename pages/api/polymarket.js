// pages/api/polymarket.js
/**
 * Predictist Polymarket Aggregator API
 * Combines Gamma + CLOB + Tickers endpoints to produce playable markets.
 * Fully updated for 2025 schemas.
 */

export default async function handler(req, res) {
  try {
    console.log("🌐 Fetching fresh Polymarket data...");

    /* -----------------------------------------------------
       1. Gamma API
    ----------------------------------------------------- */
    const gammaURL = "https://gamma-api.polymarket.com/events?limit=500&active=true";
    let gammaEvents = [];
    try {
      const r = await fetch(gammaURL, {
        headers: { accept: "application/json" },
        cache: "no-store",
      });
      if (r.ok) {
        const body = await r.json();
        gammaEvents = Array.isArray(body) ? body : body.data || [];
        console.log(`✅ Gamma fetched ${gammaEvents.length}`);
      } else {
        console.warn("⚠️ Gamma API failed:", r.status);
      }
    } catch (err) {
      console.warn("⚠️ Gamma API error:", err.message);
    }

    /* -----------------------------------------------------
       2. CLOB API
    ----------------------------------------------------- */
    const clobURL = "https://clob.polymarket.com/markets";
    let clobMarkets = [];
    try {
      const clobRes = await fetch(clobURL, {
        headers: { accept: "application/json" },
        cache: "no-store",
      });
      const clobBody = await clobRes.json().catch(() => []);
      clobMarkets = Array.isArray(clobBody)
        ? clobBody
        : Array.isArray(clobBody?.data)
        ? clobBody.data
        : [];
      console.log(`✅ CLOB fetched ${clobMarkets.length}`);
      if (clobMarkets.length > 0) {
        console.log("🔍 Example CLOB market:", JSON.stringify(clobMarkets[0], null, 2));
      }
    } catch (err) {
      console.warn("⚠️ CLOB fetch failed:", err.message);
    }

    /* -----------------------------------------------------
       3. Tickers API (for live prices)
    ----------------------------------------------------- */
    const tickerURL = "https://clob.polymarket.com/tickers";
    let priceMap = new Map();
    try {
      const tickerRes = await fetch(tickerURL, {
        headers: { accept: "application/json" },
        cache: "no-store",
      });
      const tickerData = await tickerRes.json().catch(() => []);
      console.log(`📈 Tickers fetched ${Array.isArray(tickerData) ? tickerData.length : 0}`);

      if (Array.isArray(tickerData)) {
        for (const t of tickerData) {
          const key =
            (t.market || t.slug || t.condition_id || t.token_yes || t.token_no || "").toLowerCase();
          if (key && typeof t.last_price === "number") {
            priceMap.set(key, {
              yes: t.last_price,
              bid: t.best_bid,
              ask: t.best_ask,
            });
          }
        }
      }
    } catch (err) {
      console.warn("⚠️ Tickers fetch failed:", err.message);
    }

    /* -----------------------------------------------------
       4. Merge + Normalize
    ----------------------------------------------------- */
    const merged = [...gammaEvents, ...clobMarkets];

    function extractOutcomes(market) {
      const outcomes =
        Array.isArray(market.outcomes) && market.outcomes.length
          ? market.outcomes
          : Array.isArray(market.tokens)
          ? market.tokens.map((t) => ({
              name: t.name || t.outcome || "Option",
              price: typeof t.price === "number" ? t.price : undefined,
            }))
          : [];

      return outcomes.filter((o) => typeof o.price === "number");
    }

    const normalizeMarket = (raw) => {
      const marketObj =
        Array.isArray(raw.markets) && raw.markets.length > 0 ? raw.markets[0] : raw;

      const q =
        raw.question ||
        raw.title ||
        raw.name ||
        marketObj.question ||
        marketObj.title ||
        "Untitled market";

      const outcomes = extractOutcomes(marketObj);
      const id =
        marketObj.condition_id ||
        raw.condition_id ||
        marketObj.slug ||
        raw.slug ||
        raw.id ||
        q;

      // Determine prices
      const o0 = outcomes[0];
      const o1 = outcomes[1];

      let yes =
        typeof o0?.price === "number"
          ? o0.price
          : typeof o0?.last_price === "number"
          ? o0.last_price
          : 0.5;
      let no =
        typeof o1?.price === "number"
          ? o1.price
          : typeof o1?.last_price === "number"
          ? o1.last_price
          : 1 - yes;

      // Overlay live ticker data if present
      const tickerKey = (marketObj.market_slug || marketObj.slug || marketObj.condition_id || "")
        .toLowerCase();
      const ticker = priceMap.get(tickerKey);
      if (ticker && typeof ticker.yes === "number" && ticker.yes > 0 && ticker.yes < 1) {
        yes = ticker.yes;
        no = 1 - yes;
      }

      // Clamp + cleanup
      yes = Math.max(0, Math.min(1, yes));
      no = Math.max(0, Math.min(1, no));

      return {
        id,
        question: q.trim(),
        outcomes: [
          { name: "Yes", price: yes },
          { name: "No", price: no },
        ],
        image: raw.image || marketObj.image || null,
        closed: raw.closed || marketObj.closed || false,
        resolved: raw.resolved || false,
      };
    };

    const normalized = merged
      .map(normalizeMarket)
      .filter((m) => {
        if (!m.question || m.question.length < 8) return false;
        if (m.closed || m.resolved) return false;
        if (m.outcomes.some((o) => o.price === 0.5)) return true; // allow but lower priority
        const valid = m.outcomes.some((o) => o.price > 0 && o.price < 1);
        return valid;
      });

    /* -----------------------------------------------------
       5. Deduplicate
    ----------------------------------------------------- */
    const seen = new Set();
    const deduped = normalized.filter((m) => {
      const key = m.question.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    /* -----------------------------------------------------
       6. Respond
    ----------------------------------------------------- */
    console.log(`🎯 normalizeMarkets → ${deduped.length} playable`);
    deduped.slice(0, 3).forEach((m) => {
      const yes = Math.round(m.outcomes[0].price * 100);
      console.log(`• ${m.question} (${yes}%)`);
    });

    res.status(200).json(deduped);
  } catch (err) {
    console.error("❌ Polymarket handler error:", err);
    res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}


