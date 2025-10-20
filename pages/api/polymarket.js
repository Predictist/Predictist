// pages/api/polymarket.js
export default async function handler(req, res) {
  try {
    let markets = [];
    let cursor = null;
    const limit = 500; // maximum allowed

    // Loop through pagination until we have enough markets or no more data
    for (let i = 0; i < 3; i++) { // 3 pages = up to ~1500 markets
      const url = new URL("https://clob.polymarket.com/markets");
      url.searchParams.set("limit", limit);
      if (cursor) url.searchParams.set("cursor", cursor);
      url.searchParams.set("_", Date.now()); // cache-busting

      const r = await fetch(url, {
        headers: { accept: "application/json" },
        cache: "no-store",
      });

      if (!r.ok) {
        console.error("Polymarket fetch failed:", r.status);
        return res.status(r.status).json({ error: `Polymarket returned ${r.status}` });
      }

      const body = await r.json();
      const pageData = Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
        ? body.data
        : [];

      markets = markets.concat(pageData);

      if (!body?.next_cursor) break;
      cursor = body.next_cursor;
    }

    // Basic cleanup
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



