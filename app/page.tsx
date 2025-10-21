import Link from 'next/link';
import NewsletterCTA from '@/components/NewsletterCTA';
import MarketCard from '@/components/MarketCard';
import { getTopMarkets } from '@/lib/markets';

export default async function HomePage(){
  const markets = await getTopMarkets();

  return (
    <div className="grid" style={{gap:28}}>
      {/* HERO */}
      <section className="grid" style={{gap:14}}>
        <span className="badge">Prediction-Market Media & Data</span>
        <h1 className="h1">What the world believes will happen.</h1>
        <p className="p-lg" style={{maxWidth:760}}>
          Predictist combines real-time market data, sharp analysis, and interactive play.
          Explore live probabilities, read the signal, then test your intuition with Predictle.
        </p>
        <div className="row" style={{marginTop:6}}>
          <Link href="/predictle"><button>Play Predictle</button></Link>
          <Link href="/dashboard"><button className="ghost">Open Dashboard</button></Link>
          <Link href="/subscribe"><button className="ghost">Subscribe</button></Link>
        </div>
      </section>

      {/* PREVIEW STRIP */}
      <section className="grid" style={{gap:12}}>
        <div className="row" style={{justifyContent:'space-between'}}>
          <div className="kicker">Live Market Snapshot</div>
          <Link href="/dashboard" className="kicker" style={{color:'var(--accent)'}}>View full dashboard →</Link>
        </div>
        <div className="grid grid-3">
          {markets.slice(0,3).map(m => <MarketCard key={m.id} m={m} />)}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section>
        <NewsletterCTA />
      </section>

      {/* TRUST STRIP */}
      <section className="card" style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap'}}>
        <div className="kicker">Powered by markets</div>
        <div className="row" style={{gap:14, color:'var(--muted)'}}>
          <span>Polymarket</span>•<span>Manifold</span>•<span>Kalshi</span>
        </div>
      </section>
    </div>
  );
}
