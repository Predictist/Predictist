// pages/api/polymarket.js
export default async function handler(req, res) {
  const endpoints = [
    "https://api.polymarket.com/markets-data",      // primary (new)
    "https://data-api.polymarket.com/markets-data", // backup
    "https://clob.polymarket.com/markets",          // legacy fallback
  ];

  for (const urlBase of endpoints) {
    try {
      const url = `${urlBase}?limit=1000&_=${Date.now()}`;
      const r = await fetch(url, {
        headers: { accept: "application/json" },
        cache: "no-store",
      });

      if (!r.ok) {
        console.warn(`Polymarket endpoint failed (${urlBase}):`, r.status);
        continue; // try next endpoint
      }

      const body = await r.json();

      // normalize different shapes
      const markets = Array.isArray(body)
        ? body
        : Array.isArray(body?.markets)
        ? body.markets
        : Array.isArray(body?.data)
        ? body.data
        : [];

      // if we got some markets, clean and return them
      if (markets.length > 0) {
        const cleaned = markets.filter(
          (m) =>
            m &&
            !m.resolved &&
            !m.closed &&
            !m.archived &&
            (m.outcomes?.length > 0 || m.tokens?.length > 0)
        );

        console.log(`✅ Using Polymarket endpoint: ${urlBase} (${cleaned.length} markets)`);
        return res.status(200).json(cleaned);
      }
    } catch (err) {
      console.warn(`Error with ${urlBase}:`, err.message);
      continue; // try next endpoint
    }
  }

  // If all fail:
  return res
    .status(500)
    .json({ error: "Server error fetching Polymarket markets (all endpoints failed)" });
}


