// pages/api/polymarket.js
export default async function handler(req, res) {
  try {
    const response = await fetch("https://clob.polymarket.com/markets", {
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      console.error("❌ Polymarket API fetch failed:", response.status);
      return res
        .status(response.status)
        .json({ error: `Polymarket API returned ${response.status}` });
    }

    const data = await response.json();
    console.log("✅ Raw API data keys:", Object.keys(data));

    const markets = Array.isArray(data)
      ? data
      : data.data || data.markets || [];

    if (!Array.isArray(markets)) {
      console.error("❌ Unexpected Polymarket data structure:", data);
      return res
        .status(500)
        .json({ error: "Unexpected Polymarket data structure" });
    }

    // ✅ Filter for clean, active, 2-outcome binary markets
    const filtered = markets.filter((m) => {
      let question = m.question || m.title || m.condition_title || "";
      question = question.replace(/^arch/i, "").trim(); // remove 'arch' prefix

      const tokens = Array.isArray(m.tokens) ? m.tokens : [];
      const hasTwoOutcomes = tokens.length === 2;

      const hasValidPrices = tokens.every(
        (t) => typeof t.price === "number" && t.price >= 0 && t.price <= 1
      );

      const isActive =
        (m.closed === false || !m.closed) &&
        (!m.archived && !m.resolved && !m.winner);

      // Only recent markets (last 120 days)
      const createdAt = new Date(m.created_at || m.createdAt || 0);
      const daysOld = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
      const isRecent = isNaN(daysOld) || daysOld < 120;

      return question && hasTwoOutcomes && hasValidPrices && isActive && isRecent;
    });

    console.log("✅ Returning markets:", filtered.length);
    if (filtered.length > 0) console.log("🧪 Example market:", filtered[0]);

    res.status(200).json(filtered);
  } catch (err) {
    console.error("❌ API route error:", err);
    res.status(500).json({ error: "Server error fetching Polymarket markets" });
  }
}

