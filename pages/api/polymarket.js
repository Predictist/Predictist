// pages/api/polymarket.js
export default async function handler(req, res) {
  try {
    // ✅ Use the stable public Gamma API
    const response = await fetch("https://gamma-api.polymarket.com/markets", {
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Polymarket API returned ${response.status}`);
    }

    const data = await response.json();

    // ✅ Normalize to always return an array
    const markets = Array.isArray(data)
      ? data
      : data.markets || data.data?.markets || [];

    console.log("✅ Polymarket API returned:", markets.length, "markets");
    res.status(200).json(markets);
  } catch (error) {
    console.error("❌ Polymarket API fetch failed:", error.message);
    res.status(500).json({ error: "Failed to fetch Polymarket data" });
  }
}
