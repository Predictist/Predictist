import { NextResponse } from 'next/server';

/**
 * Predictle → Polymarket Fetch Route
 *
 * Works in two modes:
 *  - Public mode: uses open Gamma endpoint (limited data)
 *  - Authenticated mode: uses your CLOB key (for live price & liquidity)
 */

const GAMMA_URL = 'https://gamma-api.polymarket.com/markets';
const CLOB_URL = 'https://clob.polymarket.com/markets';

export async function GET() {
  try {
    const rawKey = (process.env.POLYMARKET_API_KEY || '').trim();
// treat as “auth” only if it looks like a real token (length threshold)
const apiKey = rawKey.length > 20 ? rawKey : '';
const isAuth = apiKey !== '';


    // pick endpoint
    const endpoint = isAuth ? CLOB_URL : GAMMA_URL;

    const res = await fetch(endpoint, {
      headers: isAuth ? { Authorization: `Bearer ${apiKey}` } : {},
      cache: 'no-store',
    });

    if (!res.ok) throw new Error(`Polymarket HTTP ${res.status}`);

    const raw = await res.json();

    // normalize output shape
    const markets = normalizeMarkets(raw);

    return NextResponse.json({ markets, source: isAuth ? 'CLOB' : 'Gamma' });
  } catch (err: any) {
    console.error('[Polymarket API error]', err.message);
    // fallback safe empty array so Predictle still loads
    return NextResponse.json({ markets: [], error: err.message || 'fetch failed' }, { status: 200 });
  }
}

/**
 * Extracts and normalizes markets into a consistent format.
 * Keeps only active, binary markets with valid outcomes.
 */
function normalizeMarkets(raw: any): any[] {
  if (!raw) return [];

  // Some endpoints return { data: [...] }, others return an array directly
  const arr = Array.isArray(raw) ? raw : Array.isArray(raw.data) ? raw.data : [];

  return arr
    .filter(
      (m: any) =>
        m &&
        !m.archived &&
        m.active !== false &&
        m.outcomes &&
        Array.isArray(m.outcomes) &&
        m.outcomes.length === 2 &&
        !/archive|test|2018|2019|2020|2021|2022|2023/i.test(m.question || m.title || '')
    )
    .map((m: any) => {
      const question = m.question || m.title || 'Untitled market';
      const outcomes = m.outcomes.map((o: any) => ({
        name: o.name || o.ticker || 'Option',
        price:
          typeof o.price === 'number'
            ? o.price
            : typeof o.last_price === 'number'
            ? o.last_price
            : typeof o?.price?.mid === 'number'
            ? o.price.mid
            : undefined,
      }));

      // crude “probability” = first outcome price (for grading)
      const probability =
        typeof outcomes[0]?.price === 'number' ? outcomes[0].price : undefined;

      return {
        id: m.id || m.condition_id || question,
        question,
        outcomes,
        probability,
      };
    });
}

