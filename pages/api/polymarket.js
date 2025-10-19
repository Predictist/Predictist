// pages/api/polymarket.js
export default async function handler(req, res) {
  try {
    const r = await fetch("https://clob.polymarket.com/markets", {
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    if (!r.ok) {
      return res.status(r.status).json({ error: `Polymarket returned ${r.status}` });
    }

    const body = await r.json();
    // The CLOB endpoint returns { data: [...], next_cursor, limit, count }
    const markets = Array.isArray(body)
      ? body
      : Array.isArray(body?.data)
      ? body.data
      : [];

    return res.status(200).json(markets);
  } catch (err) {
    console.error("API route error:", err);
    return res.status(500).json({ error: "Server error fetching Polymarket markets" });
  }
}


