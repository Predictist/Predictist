// app/api/polymarket/route.ts
import { NextResponse } from "next/server";

// Base endpoints
const PUBLIC_URL = "https://gamma-api.polymarket.com/markets"; // works for public reads
const AUTH_URL = "https://clob.polymarket.com/markets"; // for API key mode

export async function GET() {
  try {
    const url = process.env.POLYMARKET_API_KEY ? AUTH_URL : PUBLIC_URL;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (process.env.POLYMARKET_API_KEY) {
      headers["X-API-Key"] = process.env.POLYMARKET_API_KEY;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.statusText}`);
    }

    const data = await response.json();
    const markets = Array.isArray(data.markets)
      ? data.markets
      : data.data || [];

    // Filter: active + not closed + binary + not expired
    const filtered = markets
      .filter((m: any) => {
        const end = m.end_date_iso || m.endDate || m.resolution_date;
        return (
          m.active === true &&
          m.closed === false &&
          m.archived !== true &&
          Array.isArray(m.outcomes || m.tokens) &&
          (m.outcomes?.length === 2 || m.tokens?.length === 2) &&
          (!end || new Date(end) > new Date())
        );
      })
      .map((m: any) => ({
        id: m.id || m.condition_id,
        question: m.question || m.title,
        outcomes:
          m.outcomes?.map((o: any) => o.name) ||
          m.tokens?.map((t: any) => t.ticker || t.outcome),
        probability:
          m.outcomes?.[0]?.price ||
          m.tokens?.[0]?.lastPrice ||
          m.probability ||
          null,
      }));

    return NextResponse.json({ count: filtered.length, markets: filtered });
  } catch (err) {
    console.error("Error fetching Polymarket data:", err);
    return NextResponse.json({ error: "Failed to fetch markets" }, { status: 500 });
  }
}
