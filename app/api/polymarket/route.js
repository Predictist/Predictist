// app/api/polymarket/route.js
import { NextResponse } from 'next/server';
import { fetchPolymarketMarkets } from '@/lib/polymarket';

export async function GET() {
  try {
    console.log('🌐 Fetching fresh Polymarket data…');

    const markets = await fetchPolymarketMarkets();

    console.log(`✅ Fetched ${markets.length} markets`);
    const playable = markets.filter(
      (m) =>
        m.active &&
        !m.archived &&
        m.outcomePrices &&
        m.outcomePrices.length === 2 &&
        m.outcomePrices[0] !== null
    );

    console.log(`🎯 normalizeMarkets → ${playable.length} playable`);

    return NextResponse.json(
      {
        count: playable.length,
        markets: playable.map((m) => ({
          id: m.id || m.condition_id,
          question: m.question,
          yesPrice: parseFloat(m.outcomePrices?.[0]) || null,
          noPrice: parseFloat(m.outcomePrices?.[1]) || null,
          volume24h: m.volume24hrs || null,
          slug: m.slug,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error in /api/polymarket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Polymarket data', details: error.message },
      { status: 500 }
    );
  }
}
