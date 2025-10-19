export default async function handler(req, res) {
  try {
    // Fetch full markets with prices
    const response = await fetch("https://gamma-api.polymarket.com/tickers");
    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    const data = await response.json();

    // Each item has: { question, token_yes, token_no, price_yes, price_no, ... }
    const markets = data.filter(
      (m) =>
        m.ticker &&
        typeof m.ticker === "string" &&
        m.ticker.toLowerCase().includes("/") && // ensures YES/NO type
        m.price_yes != null &&
        m.price_no != null
    );

    res.status(200).json(markets);
  } catch (err) {
    console.error("❌ Polymarket API error:", err);
    res.status(500).json({ error: "Failed to fetch Polymarket markets" });
  }
}

