// pages/api/polymarket.js
export default async function handler(req, res) {
  try {
    const limit = 500; // max allowed per request
    const pages = 3;   // get up to ~1500 active events
    let all = [];

    for (let i = 0; i < pages; i++) {
      const url = new URL("https://gamma-api.polymarket.com/events");
      url.searchParams.set("order", "id");
      url.searchParams.set("ascending", "false");
      url.searchParams.set("closed", "false");
      url.searchParams.set("limit", limit.toString());
      url.searchParams.set("offset", (i * limit).toString());
      url.searchParams.set("_", Date.now().toString()); // cache-busting

      const r = await fetch(url.toString(), {
        headers: { accept: "application/json" },
        cache: "no-store",
      });

      if (!r.ok) {
        console.warn(`Gamma API returned ${r.status}`);
        break;
      }

      const data = await r.json();
      const events = Array.isArray(data) ? data : Array.isArray(data?.events) ? data.events : [];
      if (!events.length) break;

      all = all.concat(events);
      if (events.length < limit) break; // last page
    }

    // Filter to usable active events
    const cleaned = all.filter(
      (m) =>
        m &&
        !m.closed &&
        !m.resolved &&
        !m.archived &&
        (m.markets?.length > 0 || m.outcomes?.length > 0)
    );

    console.log(`✅ Gamma API fetched ${cleaned.length} active events`);
    res.status(200).json(cleaned);
  } catch (err) {
    console.error("Gamma API fetch error:", err);
    res.status(500).json({ error: "Server error fetching Polymarket markets" });
  }
}



