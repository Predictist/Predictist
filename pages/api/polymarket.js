// pages/api/polymarket.js
// ✅ Live Polymarket market odds using public endpoints only (no auth)
// Works perfectly for Predictle, Dashboard, and TrendBot

let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // cache for 5 min

export default async function handler(req, res) {
  try {
    const now = Date.now();
    if (cachedData && now - cacheTimestamp < CACHE_DURATION_MS) {
      console.log("⚡ Using cached data");
      return res.status(200).json(cachedData);
    }

    console.log("🌐 Fetching fresh Polymarket data…");

    // 1️⃣ Fetch all active CLOB markets (main feed)
    const marketsRes = await fetch(
      "https://clob.polymarket.com/markets?active=true&limit=1000"
    );
    const { data: { markets = [] } = {} } = await marketsRes.json();

    console.log(`✅ Pulled ${markets.length} markets`);

    // 2️⃣ Collect all token_ids from those markets
    const tokenIds = markets
      .flatMap((m) => m.tokens?.map((t) => t.token_id))
      .filter(Boolean)
      .slice(0, 1000); // limit for performance

    // 3️⃣ Fetch live prices for those tokens
    console.log(`💰 Fetching /prices for ${tokenIds.length} tokens…`);
    const pricesRes = await fetch(
      `https://clob.polymarket.com/prices?token_ids=${tokenIds.join(",")}`
    );
    const prices = await pricesRes.json();
    console.log(`📊 Prices returned for ${Object.keys(prices).length} tokens`);

    // 4️⃣ Normalize & merge prices into clean, playable markets
    const playable = markets
      .filter((m) => m.active && !m.closed && m.tokens?.length === 2)
      .map((m) => {
        const [yesToken, noToken] = m.tokens;
        const yesPrice = prices[yesToken.token_id];
        const noPrice = prices[noToken.token_id];

        // calculate midpoint of BUY/SELL (convert to 0–1 probability)
        const yes =
          yesPrice && yesPrice.BUY && yesPrice.SELL
            ? ((parseFloat(yesPrice.BUY) + parseFloat(yesPrice.SELL)) / 2) / 100
            : null;

        const no =
          noPrice && noPrice.BUY && noPrice.SELL
            ? ((parseFloat(noPrice.BUY) + parseFloat(noPrice.SELL)) / 2) / 100
            : yes !== null
            ? 1 - yes
            : null;

        return {
          id: m.id,
          question: m.question,
          image: m.image,
          outcomes: [
            { name: yesToken.outcome || "Yes", price: yes },
            { name: noToken.outcome || "No", price: no },
          ],
        };
      })
      .filter(
        (m) =>
          m.outcomes.every(
            (o) => o.price !== null && o.price > 0 && o.price < 1
          ) && !m.question.toLowerCase().includes("2023")
      )
      .sort(() => Math.random() - 0.5); // shuffle a bit

    console.log(`🎯 normalizeMarkets → ${playable.length} playable`);

    cachedData = playable;
    cacheTimestamp = now;

    res.status(200).json(playable);
  } catch (err) {
    console.error("❌ API error:", err);
    res.status(500).json({ error: err.message });
  }
}


