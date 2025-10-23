// pages/api/polymarket.js

let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  try {
    const now = Date.now();

    if (cachedData && now - cacheTimestamp < CACHE_DURATION_MS) {
      console.log("⚡ Using cached Polymarket data");
      return res.status(200).json(cachedData);
    }

    console.log("🌐 Fetching fresh Polymarket data...");

    // 1) Gamma (structure)
    const gammaURL = "https://gamma-api.polymarket.com/events?limit=1000&closed=false";
    const gammaRes = await fetch(gammaURL, { headers: { accept: "application/json" }, cache: "no-store" });
    const gammaBody = await gammaRes.json().catch(() => []);
    const gammaEvents = Array.isArray(gammaBody) ? gammaBody : [];
    console.log(`✅ Gamma fetched ${gammaEvents.length}`);

    // 2) CLOB (prices)
    const clobURL = "https://clob.polymarket.com/markets?limit=1000";
    const clobRes = await fetch(clobURL, { headers: { accept: "application/json" }, cache: "no-store" });
    const clobBody = await clobRes.json().catch(() => []);
    const clobMarketsRaw = Array.isArray(clobBody) ? clobBody :
      (Array.isArray(clobBody?.data) ? clobBody.data : []);
    console.log(`✅ CLOB fetched ${clobMarketsRaw.length}`);

    // --- Build CLOB indices for robust matching
    const idxBySlug = new Map();
    const idxById = new Map();
    const idxByCondition = new Map();
    const idxByQuestion = new Map();
    const idxByHash = new Map();

    for (const m of clobMarketsRaw) {
      const slug = (m.slug || "").toLowerCase();
      const id = (m.id || "").toString().toLowerCase();
      const conditionId = (m.conditionId || m.condition_id || "").toLowerCase();
      const questionId = (m.questionId || m.question_id || "").toLowerCase();
      const hash = (m.marketHash || m.market_hash || "").toLowerCase();

      if (slug) idxBySlug.set(slug, m);
      if (id) idxById.set(id, m);
      if (conditionId) idxByCondition.set(conditionId, m);
      if (questionId) idxByQuestion.set(questionId, m);
      if (hash) idxByHash.set(hash, m);
    }

    const matchClob = (gammaEvent, gammaMarket) => {
      const slugCandidates = [
        gammaEvent?.slug, gammaMarket?.slug, gammaEvent?.market_slug, gammaMarket?.market_slug
      ].filter(Boolean).map((s) => s.toLowerCase());
      const idCandidates = [gammaEvent?.id, gammaMarket?.id].filter(Boolean).map((s) => s.toString().toLowerCase());
      const condCandidates = [
        gammaMarket?.condition_id, gammaEvent?.condition_id
      ].filter(Boolean).map((s) => s.toLowerCase());
      const qidCandidates = [
        gammaMarket?.question_id, gammaEvent?.question_id
      ].filter(Boolean).map((s) => s.toLowerCase());
      const hashCandidates = [
        gammaMarket?.market_hash, gammaEvent?.market_hash
      ].filter(Boolean).map((s) => s.toLowerCase());

      for (const c of condCandidates) if (idxByCondition.has(c)) return idxByCondition.get(c);
      for (const c of qidCandidates) if (idxByQuestion.has(c)) return idxByQuestion.get(c);
      for (const c of hashCandidates) if (idxByHash.has(c)) return idxByHash.get(c);
      for (const s of slugCandidates) if (idxBySlug.has(s)) return idxBySlug.get(s);
      for (const i of idCandidates) if (idxById.has(i)) return idxById.get(i);
      return null;
    };

    // --- Price extractor (market-level first, then outcomes)
    const extractNumeric = (v) => {
      if (typeof v === "number") return v;
      if (typeof v === "string") {
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : null;
      }
      return null;
    };

    const extractPrices = (clobMarket, o0, o1) => {
      let yes = null;
      let no = null;

      if (clobMarket) {
        // Common market-level shapes
        yes = yes ?? extractNumeric(clobMarket.yesPrice);
        no  = no  ?? extractNumeric(clobMarket.noPrice);

        if (clobMarket.prices) {
          yes = yes ?? extractNumeric(clobMarket.prices.yes);
          no  = no  ?? extractNumeric(clobMarket.prices.no);
        }

        // Some feeds use mid/bbo on market
        const mid = extractNumeric(clobMarket.midPrice);
        const bb  = extractNumeric(clobMarket.bestBid);
        const ba  = extractNumeric(clobMarket.bestAsk);
        if (yes == null && (mid != null || (bb != null && ba != null))) {
          const m = mid ?? ((bb + ba) / 2);
          if (m != null) {
            // assume outcome[0] is "Yes" orientation
            yes = m;
            no = 1 - m;
          }
        }
      }

      // Outcome-level fallbacks
      const pickOutcome = (outcome) => {
        if (!outcome) return null;
        return (
          extractNumeric(outcome.price) ??
          extractNumeric(outcome.last_price) ??
          extractNumeric(outcome.midPrice) ??
          (outcome.bestBid != null && outcome.bestAsk != null
            ? (extractNumeric(outcome.bestBid) + extractNumeric(outcome.bestAsk)) / 2
            : null) ??
          (outcome.price && typeof outcome.price === "object"
            ? extractNumeric(outcome.price.mid)
            : null)
        );
      };

      yes = yes ?? pickOutcome(o0);
      no  = no  ?? pickOutcome(o1);

      if (yes == null && no != null) yes = 1 - no;
      if (no == null && yes != null) no = 1 - yes;

      // As a last resort, still null -> return nulls, caller will skip
      return { yes, no };
    };

    const playable = [];
    let firstDebugPrinted = false;

    for (const e of gammaEvents) {
      const market = e.markets?.[0];
      if (!market) continue;

      // Parse outcomes
      let outcomesArr = [];
      try {
        outcomesArr = JSON.parse(market.outcomes);
      } catch {
        outcomesArr = Array.isArray(market.outcomes) ? market.outcomes : [];
      }
      if (!Array.isArray(outcomesArr) || outcomesArr.length < 2) continue;

      // Robust match
      const clobMatch = matchClob(e, market);

      const o0 = clobMatch?.outcomes?.[0] ?? null;
      const o1 = clobMatch?.outcomes?.[1] ?? null;

      let { yes, no } = extractPrices(clobMatch, o0, o1);

      // Skip if still unknown (prevents 50/50 spam)
      if (yes == null || no == null) continue;

      // Clamp
      yes = Math.max(0, Math.min(1, yes));
      no  = Math.max(0, Math.min(1, no));

      const q = (market.question || e.title || e.name || e.slug || "Untitled Market").trim();
      const lowerQ = q.toLowerCase();
      if (
        lowerQ.includes("test") ||
        lowerQ.includes("archive") ||
        /\b(2018|2019|2020|2021|2022|2023)\b/.test(lowerQ)
      ) continue;

      const record = {
        id: e.id || market.id || clobMatch?.id,
        question: q,
        outcomes: [
          { name: outcomesArr[0] || "Yes", price: yes },
          { name: outcomesArr[1] || "No",  price: no  },
        ],
      };

      if (!firstDebugPrinted && clobMatch) {
        firstDebugPrinted = true;
        console.log("🔗 Matched CLOB via keys:", {
          slugGamma: e.slug || market.slug,
          clobSlug: clobMatch.slug,
          conditionGamma: market.condition_id || e.condition_id,
          conditionClob: clobMatch.conditionId || clobMatch.condition_id,
          questionGamma: market.question_id || e.question_id,
          questionClob: clobMatch.questionId || clobMatch.question_id,
          usedPrices: {
            yes, no,
            marketFields: {
              yesPrice: clobMatch.yesPrice,
              noPrice: clobMatch.noPrice,
              prices: clobMatch.prices,
              midPrice: clobMatch.midPrice,
              bestBid: clobMatch.bestBid,
              bestAsk: clobMatch.bestAsk,
            },
            outcome0: o0,
            outcome1: o1,
          },
        });
      }

      playable.push(record);
    }

    const clean = playable
      .filter(
        (p) =>
          p.question &&
          p.question.length > 6 &&
          p.outcomes.every((o) => o.price > 0 && o.price < 1)
      )
      .sort(() => Math.random() - 0.5);

    console.log(`🎯 normalizeMarkets → ${clean.length} playable`);
    clean.slice(0, 3).forEach((m) =>
      console.log(`• ${m.question} (${(m.outcomes[0].price * 100).toFixed(0)}%)`)
    );

    cachedData = clean;
    cacheTimestamp = now;
    return res.status(200).json(clean);
  } catch (err) {
    console.error("❌ API route error:", err);
    return res.status(500).json({ error: err.message });
  }
}




