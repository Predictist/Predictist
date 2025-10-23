// pages/api/polymarket.js
// Hybrid Polymarket feed + data confidence check

let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  try {
    const now = Date.now();
    if (cachedData && now - cacheTimestamp < CACHE_DURATION_MS) {
      console.log("⚡ Using cached data");
      return res.status(200).json(cachedData);
    }

    console.log("🌐 Fetching fresh Polymarket data…");

    // 1️⃣ Pull active markets from Gamma
    const gammaRes = await fetch(
      "https://gamma-api.polymarket.com/markets?limit=1000&active=true&closed=false"
    );
    const gammaData = await gammaRes.json();
    const markets = gammaData.markets || [];
    console.log(`✅ Gamma fetched ${markets.length}`);

    // 2️⃣ Collect all token IDs for prices
    const tokenIds = markets
      .flatMap((m) => m.tokens?.map((t) => t.token_id))
      .filter(Boolean)
      .slice(0, 1000);

    console.log(`💰 Fetching live /prices for ${tokenIds.length} tokens…`);
    const pricesRes = await fetch(
      `https://clob.polymarket.com/prices?token_ids=${tokenIds.join(",")}`
    );
    const prices = await pricesRes.json();
    const priceCount = Object.keys(prices).length;
    console.log(`📊 Price data received for ${priceCount} tokens`);

    // 3️⃣ Merge prices + compute odds
    let playable = [];
    let validCount = 0;

    playable = markets
      .filter((m) => m.active && !m.closed && m.tokens?.length === 2)
      .map((m) => {
        const [yesToken, noToken] = m.tokens;
        const yesData = prices[yesToken.token_id];
        const noData = prices[noToken.token_id];

        const yes =
          yesData && yesData.BUY && yesData.SELL
            ? ((parseFloat(yesData.BUY) + parseFloat(yesData.SELL)) / 2) / 100
            : null;
        const no =
          noData && noData.BUY && noData.SELL
            ? ((parseFloat(noData.BUY) + parseFloat(noData.SELL)) / 2) / 100
            : yes !== null
            ? 1 - yes
            : null;

        const valid =
          yes !== null && no !== null && yes > 0 && no > 0 && yes < 1 && no < 1;

        if (valid) validCount++;

        return {
          id: m.id,
          question: m.question,
          image: m.image,
          valid,
          outcomes: [
            { name: yesToken.outcome || "Yes", price: yes },
            { name: noToken.outcome || "No", price: no },
          ],
        };
      })
      .filter((m) => m.valid)
      .sort(() => Math.random() - 0.5);

    // 4️⃣ Confidence report
    const confidence = {
      totalMarkets: markets.length,
      totalTokens: tokenIds.length,
      totalPrices: priceCount,
      validMarkets: validCount,
      confidencePct: ((validCount / (markets.length || 1)) * 100).toFixed(1) + "%",
      timestamp: new Date().toISOString(),
    };

    console.log("📈 Data Quality Report:", confidence);
    console.log(`🎯 normalizeMarkets → ${playable.length} playable`);

    cachedData = { playable, confidence };
    cacheTimestamp = now;

    res.status(200).json({ playable, confidence });
  } catch (err) {
    console.error("❌ API route error:", err);
    res.status(500).json({ error: err.message });
  }
}



