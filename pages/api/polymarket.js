export default async function handler(req, res) {
  try {
    const response = await fetch("https://gamma-api.polymarket.com/tickers", {
      headers: {
        "accept": "application/json",
      },
    });

    if (!response.ok) {
      console.error("❌ Polymarket API fetch failed:", response.status);
      return res.status(response.status).json({
        error: `Polymarket API returned ${response.status}`,
      });
    }

    const data = await response.json();
    console.log("✅ Raw data keys:", Object.keys(data));

    // ✅ Some responses come nested (like data.tickers)
    const tickers = Array.isArray(data)
      ? data
      : data.tickers || data.data || [];

    if (!Array.isArray(tickers)) {
      console.error("❌ Unexpected API shape:", data);
      return res.status(500).json({ error: "Unexpected Polymarket data shape" });
    }

    // ✅ Filter for binary markets with both prices
    const markets = tickers.filter(
      (m) =>
        m.ticker &&
        typeof m.ticker === "string" &&
        m.ticker.includes("/") &&
        m.price_yes != null &&
        m.price_no != null
    );

    console.log("✅ Returning markets:", markets.length);
    res.status(200).json(markets);
  } catch (err) {
    console.error("❌ API route error:", err);
    res.status(500).json({ error: "Server error fetching Polymarket markets" });
  }
}