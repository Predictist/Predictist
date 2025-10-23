// pages/api/polymarket.js
export default async function handler(req, res) {
  try {
    const limitPerPage = 200; // safe limit per request
    const maxPages = 3; // fetch up to 600 markets total
    const allEvents = [];

    for (let page = 0; page < maxPages; page++) {
      const offset = page * limitPerPage;
      const url = `https://gamma-api.polymarket.com/events?closed=false&limit=${limitPerPage}&ascending=false&offset=${offset}`;

      const r = await fetch(url, {
        headers: { accept: "application/json" },
        cache: "no-store",
      });

      if (!r.ok) {
        console.error(`❌ Gamma API returned ${r.status} at page ${page + 1}`);
        break;
      }

      const body = await r.json();
      const events = Array.isArray(body)
        ? body
        : body?.data || body?.events || [];

      // Stop if no more data
      if (!events.length) break;

      allEvents.push(...events);

      // safety stop if we somehow get massive payloads
      if (allEvents.length >= 1000) break;
    }

    // Trim and normalize data for Predictle
    const slimmed = allEvents
      .filter((e) => e.markets && e.markets.length > 0)
      .map((e) => ({
        id: e.id,
        question: e.question || e.title || "",
        markets: e.markets.slice(0, 1).map((m) => ({
          slug: m.slug,
          outcomes: m.outcomes || [],
        })),
      }))
      .filter((e) => e.question && e.question.length > 5);

    console.log(
      `✅ Gamma API fetched ${allEvents.length} total events → trimmed to ${slimmed.length} usable entries`
    );

    return res.status(200).json(slimmed);
  } catch (err) {
    console.error("❌ API route error:", err);
    return res
      .status(500)
      .json({ error: "Server error fetching Polymarket markets" });
  }
}





