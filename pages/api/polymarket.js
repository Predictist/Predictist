// pages/api/polymarket.js
export default async function handler(req, res) {
  try {
    // --- Primary: Gamma API (recommended) ---
    const gammaMarkets = await fetchGammaMarkets();
    if (gammaMarkets.length > 0) {
      const cleaned = basicClean(gammaMarkets);
      return res.status(200).json(cleaned);
    }

    // --- Fallback 1: markets-data ---
    const md = await fetchJson(`https://data-api.polymarket.com/markets-data?limit=1000&_=${Date.now()}`);
    const mdMarkets = Array.isArray(md) ? md : Array.isArray(md?.markets) ? md.markets : [];
    if (mdMarkets.length > 0) {
      const cleaned = basicClean(mdMarkets);
      return res.status(200).json(cleaned);
    }

    // --- Fallback 2: legacy clob ---
    const clob = await fetchJson(`https://clob.polymarket.com/markets?limit=1000&_=${Date.now()}`);
    const clobMarkets = Array.isArray(clob) ? clob : Array.isArray(clob?.data) ? clob.data : [];
    const cleaned = basicClean(clobMarkets);
    return res.status(200).json(cleaned);
  } catch (err) {
    console.error("API route error:", err);
    return res.status(500).json({ error: "Server error fetching Polymarket markets" });
  }
}

/* ---------------- helpers ---------------- */

async function fetchGammaMarkets() {
  const all = [];
  const limit = 500;     // Gamma supports large pages
  let offset = 0;

  for (let i = 0; i < 4; i++) { // up to ~2000 markets
    const url = new URL("https://gamma-api.polymarket.com/markets");
    url.searchParams.set("closed", "false");     // only active
    url.searchParams.set("order", "id");         // sort by id
    url.searchParams.set("ascending", "false");  // newest first
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("_", String(Date.now())); // cache-bust

    const page = await fetchJson(url.toString());
    const items = Array.isArray(page) ? page : Array.isArray(page?.markets) ? page.markets : [];
    if (!items.length) break;

    all.push(...items);
    if (items.length < limit) break; // last page
    offset += limit;
  }
  return all;
}

async function fetchJson(url) {
  const r = await fetch(url, { headers: { accept: "application/json" }, cache: "no-store" });
  if (!r.ok) throw new Error(`Fetch failed ${r.status} for ${url}`);
  return r.json();
}

function basicClean(markets) {
  // Keep front-end flexible: it already normalizes outcomes/tokens/prices
  return markets.filter(
    (m) =>
      m &&
      !m.resolved &&
      !m.closed &&
      !m.archived &&
      ((Array.isArray(m.outcomes) && m.outcomes.length > 0) ||
        (Array.isArray(m.tokens) && m.tokens.length > 0))
  );
}


