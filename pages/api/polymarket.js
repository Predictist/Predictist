// pages/api/polymarket.js
export default async function handler(req, res) {
  try {
    // Cache-busting timestamp to force fresh fetch each time
    const url = `https://clob.polymarket.com/markets?limit=1000&_=${Date.now()}`;

    const r = await fetch(url, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    if (!r.ok) {
      return res.status(r.status).json({ error: `Polymarket returned ${r.status}` });
    }

    const body = await r.json();

    // Normalize: Polymarket returns { data: [], next_cursor, ... }
    const markets = Array.isArray(body)
      ? body
      : Array.isArray(body?.data)
      ? body.data
      : [];

    // Filter out any obvious junk here so the front end doesn't waste time
    const cleaned = markets.filter(
      (m) =>
        m &&
        !m.resolved &&
        !m.closed &&
        !m.archived &&
        (m.outcomes?.length > 0 || m.tokens?.length > 0)
    );

    res.status(200).json(cleaned);
  } catch (err) {
    console.error("API route error:", err);
    res.status(500).json({ error: "Server error fetching Polymarket markets" });
  }
}


