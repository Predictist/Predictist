// pages/api/polymarket.js
/**
 * Predictist Polymarket API — Stable version
 * Works like your pre-patch build but adds safe caching + optional tickers
 */

let cache = { data: null, timestamp: 0 };

export default async function handler(req, res) {
  const now = Date.now();
  if (cache.data && now - cache.timestamp < 5 * 60 * 1000) {
    console.log("⚡ Using cached Polymarket data");
    return res.status(200).json(cache.data);
  }

  try {
    console.log("🌐 Fetching fresh Polymarket data...");

    // ---- 1. Fetch Gamma
    const gammaRes = await fetch("https://gamma-api.polymarket.com/events?limit=500&active=true", {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    const gammaBody = await gammaRes.json().catch(() => ({}));
    const gamma = Array.isArray(gammaBody)
      ? gammaBody
      : Array.isArray(gammaBody?.data)
      ? gammaBody.data
      : [];
    console.log(`✅ Gamma fetched ${gamma.length}`);

    // ---- 2. Fetch CLOB (primary source)
    const clobRes = await fetch("https://clob.polymarket.com/markets", {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    const clobBody = await clobRes.json().catch(() => []);
    const clob = Array.isArray(clobBody)
      ? clobBody
      : Array.isArray(clobBody?.data)
      ? clobBody.data
      : [];
    console.log(`✅ CLOB fetched ${clob.length}`);
    if (clob.length) console.log("🔍 Example CLOB:", clob[0]?.question);

    // ---- 3. Optional tickers overlay
    let tickers = [];
    try {
      const r = await fetch("https://clob.polymarket.com/tickers?limit=500", {
        headers: { accept: "application/json", referer: "https://polymarket.com" },
        cache: "no-store",
      });
      const tBody = await r.json().catch(() => []);
      tickers = Array.isArray(tBody)
        ? tBody
        : Array.isArray(tBody?.data)
        ? tBody.data
        : [];
      console.log(`📈 Tickers fetched ${tickers.length}`);
    } catch (err) {
      console.warn("⚠️ ticker fetch failed:", err.message);
    }
    const priceMap = new Map();
    for (const t of tickers) {
      const key = (t.market || t.slug || t.condition_id || "").toLowerCase();
      if (key && typeof t.last_price === "number")
        priceMap.set(key, t.last_price);
    }

    // ---- 4. Combine + normalize (loose)
    const combined = [...clob, ...gamma];
    const playable = combined
      .map((m) => {
        const q =
          m.question || m.title || m.name || m.slug || m.id || "Unknown market";
        const id =
          m.condition_id || m.market_slug || m.slug || m.id || q;
        let outcomes = [];
        if (Array.isArray(m.outcomes)) {
          outcomes = m.outcomes;
        } else if (typeof m.outcomes === "string" && m.outcomes.startsWith("[")) {
          try {
            outcomes = JSON.parse(m.outcomes);
          } catch {}
        } else if (Array.isArray(m.tokens)) {
          outcomes = m.tokens.map((t) => t.outcome || t.name);
        }

        const prices =
          Array.isArray(m.tokens) && m.tokens.length >= 2
            ? m.tokens.map((t) =>
                typeof t.price === "number" ? t.price : 0.5
              )
            : [0.5, 0.5];

        // Overlay ticker if available
        const tickerKey = id.toLowerCase();
        const tickerPrice = priceMap.get(tickerKey);
        if (typeof tickerPrice === "number" && tickerPrice > 0 && tickerPrice < 1)
          prices[0] = tickerPrice, (prices[1] = 1 - tickerPrice);

        return {
          id,
          question: q,
          outcomes: [
            { name: outcomes[0] || "Yes", price: prices[0] },
            { name: outcomes[1] || "No", price: prices[1] },
          ],
          closed: m.closed,
          resolved: m.resolved,
        };
      })
      .filter((m) => {
        if (!m.question || m.question.length < 6) return false;
        if (m.closed || m.resolved) return false;
        const v = m.outcomes.some((o) => o.price > 0 && o.price < 1);
        return v;
      });

    // ---- 5. Deduplicate
    const seen = new Set();
    const deduped = playable.filter((m) => {
      const key = m.question.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    cache.data = deduped;
    cache.timestamp = now;

    console.log(`🎯 normalizeMarkets → ${deduped.length} playable`);
    deduped.slice(0, 3).forEach((m) =>
      console.log(`• ${m.question} (${Math.round(m.outcomes[0].price * 100)}%)`)
    );

    res.status(200).json(deduped);
  } catch (err) {
    console.error("❌ Polymarket handler error:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
}



