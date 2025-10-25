// lib/polymarket.js
export async function fetchPolymarketMarkets(limit = 1000) {
  const baseUrl = 'https://gamma-api.polymarket.com/markets';
  const url = `${baseUrl}?active=true&limit=${limit}&closed=false&archived=false`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Predictist Dashboard' },
      next: { revalidate: 60 }, // cache for 60 seconds
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    return data.markets || [];
  } catch (error) {
    console.error('❌ Error fetching from Gamma API:', error.message);
    return [];
  }
}
