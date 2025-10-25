import { getTopMarkets } from '@/app/lib/markets';
import MarketCard from '@/app/components/MarketCard';

export const revalidate = 30; // when using real APIs, keep it fresh

export default async function DashboardPage(){
  const markets = await getTopMarkets();

  // Simple sort examples (replace later with interactive controls)
  const byVolume = [...markets].sort((a,b)=> (b.volume24hUsd ?? 0) - (a.volume24hUsd ?? 0));
  const byChange = [...markets].sort((a,b)=> Math.abs(b.change24h) - Math.abs(a.change24h));

  return (
    <div className="grid" style={{gap:22}}>
      <div>
        <div className="kicker">Predictist Dashboard</div>
        <h1 className="h1">Real-time market intelligence</h1>
        <p className="p-lg">Trending markets, probability moves, and liquidity snapshots. (Mock data for now.)</p>
      </div>

      <section className="grid" style={{gap:12}}>
        <div className="row" style={{justifyContent:'space-between'}}>
          <div className="kicker">Top by 24h Volume</div>
          <div className="kicker" style={{color:'var(--muted)'}}>Data sources: Polymarket, Manifold, Kalshi</div>
        </div>
        <div className="grid grid-3">
          {byVolume.slice(0,6).map(m => <MarketCard key={m.id} m={m} />)}
        </div>
      </section>

      <section className="grid" style={{gap:12}}>
        <div className="kicker">Biggest 24h Probability Movers</div>
        <div className="grid grid-3">
          {byChange.slice(0,6).map(m => <MarketCard key={m.id} m={m} />)}
        </div>
      </section>
    </div>
  );
}
