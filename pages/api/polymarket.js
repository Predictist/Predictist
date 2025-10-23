// pages/api/polymarket.js

// In-memory cache for 5 minutes
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  try {
    const now = Date.now();

    // 🧠 Serve from cache if fresh
    if (cachedData && now - cacheTimestamp < CACHE_DURATION_MS) {
      console.log("⚡ Using cached Polymarket data");
      return res.status(200).json(cachedData);
    }

    console.log("🌐 Fetching fresh Polymarket data...");

    // --- 1️⃣ Fetch Gamma (structure)
    const gammaURL =
      "https://gamma-api.polymarket.com/events?limit=1000&closed=false";
    const gammaRes = await fetch(gammaURL, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    const gammaBody = await gammaRes.json().catch(() => []);
    const gammaEvents = Array.isArray(gammaBody) ? gammaBody : [];
    console.log(`✅ Gamma fetched ${gammaEvents.length}`);

    // --- 2️⃣ Fetch CLOB (live prices)
    const clobURL = "https://clob.polymarket.com/markets?limit=1000";
    const clobRes = await fetch(clobURL, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    const clobBody = await clobRes.json().catch(() => []);
    const clobMarkets = Array.isArray(clobBody)
      ? clobBody
      : Array.isArray(clobBody?.data)
      ? clobBody.data
      : [];
    console.log(`✅ CLOB fetched ${clobMarkets.length}`);

    // --- 3️⃣ Merge & normalize
    const playable = [];

    for (const e of gammaEvents) {
      const market = e.markets?.[0];
      if (!market) continue;

      // Parse outcomes (Gamma gives string)
      let outcomesArr = [];
      try {
        outcomesArr = JSON.parse(market.outcomes);
      } catch {
        outcomesArr = Array.isArray(market.outcomes) ? market.outcomes : [];
      }
      if (!Array.isArray(outcomesArr) || outcomesArr.length < 2) continue;

      // Match CLOB by slug/id
      const clobMatch =
        clobMarkets.find(
          (m) =>
            m.slug === e.slug ||
            m.slug === market.slug ||
            m.id === e.id ||
            m.id === market.id
        ) || null;

      const o0 = clobMatch?.outcomes?.[0];
      const o1 = clobMatch?.outcomes?.[1];

      // ---  💰 Extract prices more intelligently
const extractPrice = (outcome) => {
  if (!outcome) return null;

  // Common Polymarket fields
  if (typeof outcome.price === "number") return outcome.price;
  if (typeof outcome.last_price === "number") return outcome.last_price;
  if (typeof outcome.midPrice === "number") return outcome.midPrice;
  if (typeof outcome?.price?.mid === "number") return outcome.price.mid;

  // Sometimes price data is nested in bids/asks
  if (typeof outcome.bestBid === "number" && typeof outcome.bestAsk === "number")
    return (outcome.bestBid + outcome.bestAsk) / 2;

  // Fallback if string
  if (typeof outcome.price === "string") {
    const val = parseFloat(outcome.price);
    if (!isNaN(val)) return val;
  }

  return null;
};

let yes = extractPrice(o0);
let no = extractPrice(o1);

// If only one side has price, infer the other
if (yes == null && no != null) yes = 1 - no;
if (no == null && yes != null) no = 1 - yes;

// Final fallback
if (yes == null || no == null) {
  yes = 0.5;
  no = 0.5;
}

// Clamp to [0, 1]
yes = Math.max(0, Math.min(1, yes));
no = Math.max(0, Math.min(1, no));

      // Skip invalid or nonsensical markets
      const q =
        market.question || e.title || e.name || e.slug || "Untitled Market";
      const lowerQ = q.toLowerCase();
      if (
        lowerQ.includes("test") ||
        lowerQ.includes("archive") ||
        /\b(2018|2019|2020|2021|2022|2023)\b/.test(lowerQ)
      )
        continue;

      // Add to playable list
      playable.push({
        id: e.id || market.id,
        question: q.trim(),
        outcomes: [
          { name: outcomesArr[0] || "Yes", price: yes },
          { name: outcomesArr[1] || "No", price: no },
        ],
      });
    }

    // --- 4️⃣ Clean & sort
    const clean = playable
      .filter(
        (p) =>
          p.question &&
          p.question.length > 6 &&
          p.outcomes.every((o) => o.price > 0 && o.price < 1)
      )
      .sort(() => Math.random() - 0.5); // shuffle for variety

    console.log(`🎯 normalizeMarkets → ${clean.length} playable`);
    clean.slice(0, 3).forEach((m) =>
      console.log(
        `• ${m.question} (${(m.outcomes[0].price * 100).toFixed(0)}%)`
      )
    );

    // --- 5️⃣ Cache and return
    cachedData = clean;
    cacheTimestamp = now;
    return res.status(200).json(clean);
  } catch (err) {
    console.error("❌ API route error:", err);
    return res.status(500).json({ error: err.message });
  }
}



