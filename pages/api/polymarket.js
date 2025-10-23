// pages/api/polymarket.js
export default async function handler(req, res) {
  try {
    const r = await fetch(
      "https://gamma-api.polymarket.com/events?closed=false&limit=200&ascending=false",
      { headers: { accept: "application/json" }, cache: "no-store" }
    );

    if (!r.ok) {
      return res.status(r.status).json({ error: `Polymarket returned ${r.status}` });
    }

    const body = await r.json();
    const events = Array.isArray(body) ? body : body?.data || body?.events || [];

    // Only keep essential fields for Predictle
    const slimmed = events
      .filter((e) => e.markets && e.markets.length > 0)
      .map((e) => ({
        id: e.id,
        question: e.question || e.title || "",
        markets: e.markets.slice(0, 1).map((m) => ({
          outcomes: m.outcomes || [],
          slug: m.slug,
        })),
      }));

    console.log(`✅ Gamma API fetched ${events.length} → trimmed to ${slimmed.length}`);
    return res.status(200).json(slimmed);
  } catch (err) {
    console.error("API route error:", err);
    return res.status(500).json({ error: "Server error fetching Polymarket markets" });
  }
}




