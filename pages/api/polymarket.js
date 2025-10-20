// pages/api/polymarket.js
export default async function handler(req, res) {
  try {
    // Polymarket's active market data endpoint
    const url = `https://api.polymarket.com/markets-data?limit=1000&_=${Date.now()}`;
    
    const r = await fetch(url, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    if (!r.ok) {
      return res.status(r.status).json({ error: `Polymarket returned ${r.status}` });
    }

    const body = await r.json();
    const markets = Array.isArray(body)
      ? body
      : Array.isArray(body?.markets)
      ? body.markets
      : [];

    // Clean out stale / resolved / empty markets
    const cleaned = markets.filter(
      (m) =>
        m &&
        !m.resolved &&
        !m.closed &&
        !m.archived &&
        (m.outcomes?.length > 0 || m.tokens?.length > 0)
    );

    return res.status(200).json(cleaned);
  } catch (err) {
    console.error("API route error:", err);
    return res.status(500).json({ error: "Server error fetching Polymarket markets" });
  }
}


