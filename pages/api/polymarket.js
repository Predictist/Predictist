export default async function handler(req, res) {
  try {
    const response = await fetch("https://clob.polymarket.com/markets", {
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      console.error("❌ Polymarket API fetch failed:", response.status);
      return res.status(response.status).json({
        error: `Polymarket API returned ${response.status}`,
      });
    }

    const data = await response.json();

    // ✅ Extract the actual markets array
    const markets = Array.isArray(data)
      ? data
      : Array.isArray(data.data)
      ? data.data
      : [];

    console.log("✅ Total markets fetched:", markets.length);
    console.log("🧪 Sample market:", markets[0]);

    res.status(200).json(markets);
  } catch (err) {
    console.error("❌ API route error:", err);
    res.status(500).json({ error: "Server error fetching Polymarket markets" });
  }
}

