export type RawMarket = {
  id: string;
  question: string;
  probability: number;   // 0..100
  change24h: number;     // pp
  volume24hUsd?: number;
  source?: 'Polymarket'|'Manifold'|'Kalshi';
  href?: string;
};

const MOCK: RawMarket[] = [
  {
    id: 'pmkt-1',
    question: 'Will the Fed cut rates at the next meeting?',
    probability: 62,
    change24h: +3.2,
    volume24hUsd: 1423000,
    source: 'Polymarket',
    href: '#'
  },
  {
    id: 'pmkt-2',
    question: 'Will BTC close above $100k this year?',
    probability: 41,
    change24h: -1.5,
    volume24hUsd: 823000,
    source: 'Kalshi',
    href: '#'
  },
  {
    id: 'pmkt-3',
    question: 'Will Team USA win the next World Cup?',
    probability: 18,
    change24h: +0.8,
    volume24hUsd: 273000,
    source: 'Manifold',
    href: '#'
  },
  {
    id: 'pmkt-4',
    question: 'Will Apple release a foldable iPhone by 2026?',
    probability: 35,
    change24h: +2.4,
    volume24hUsd: 151000,
    source: 'Polymarket',
    href: '#'
  },
  {
    id: 'pmkt-5',
    question: 'Will a global carbon price be adopted by 2030?',
    probability: 28,
    change24h: -0.9,
    volume24hUsd: 94000,
    source: 'Manifold',
    href: '#'
  },
  {
    id: 'pmkt-6',
    question: 'Will Nvidia revenue exceed $170B in FY2026?',
    probability: 44,
    change24h: +1.1,
    volume24hUsd: 389000,
    source: 'Kalshi',
    href: '#'
  },
];

// Server-side helper
export async function getTopMarkets(): Promise<RawMarket[]> {
  // TODO: Switch to real APIs when ready.
  // Example Polymarket CLOB idea:
  // const r = await fetch('https://clob.polymarket.com/markets?...', { next: { revalidate: 30 }});
  // const json = await r.json();
  // return transformPolymarket(json);

  await new Promise(r => setTimeout(r, 120)); // tiny shimmer
  return MOCK;
}
