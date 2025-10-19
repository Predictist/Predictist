export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch("https://gamma-api.polymarket.com/markets", {
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      console.error("❌ Polymarket API fetch failed:", response.status);
      return res
        .status(response.status)
        .json({ error: `Polymarket API returned ${response.status}` });
    }

    const data = await response.json();
    const tickers = Array.isArray(data)
      ? data
      : data.tickers || data.data || [];
      console.log("🧪 Sample market object:", tickers[0]);


    if (!Array.isArray(tickers)) {
      console.error("❌ Unexpected Polymarket data structure:", data);
      return res
        .status(500)
        .json({ error: "Unexpected Polymarket data structure" });
    }

  const markets = tickers.filter(
  (m) =>
    m.question &&
    Array.isArray(m.outcomes) &&
    m.outcomes.length >= 2 &&
    typeof m.outcomes[0].price === "number" &&
    typeof m.outcomes[1].price === "number"
);

    res.status(200).json(markets);
  } catch (err) {
    console.error("❌ API route error:", err);
    res.status(500).json({ error: "Server error fetching Polymarket markets" });
  }
}
