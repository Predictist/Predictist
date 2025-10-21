import React from 'react';

export type Market = {
  id: string;
  question: string;
  probability: number;      // 0..100
  change24h: number;        // percentage points
  volume24hUsd?: number;
  source?: 'Polymarket'|'Manifold'|'Kalshi';
  href?: string;
};

function ChangePill({delta}:{delta:number}){
  const up = delta >= 0;
  return (
    <span className="badge" style={{
      borderColor: up ? 'rgba(46,204,113,.3)' : 'rgba(255,92,92,.3)',
      background: up ? 'rgba(46,204,113,.08)' : 'rgba(255,92,92,.08)',
      color: up ? 'var(--success)' : 'var(--danger)'
    }}>
      {up ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}pp
    </span>
  );
}

export default function MarketCard({ m }: { m: Market }){
  return (
    <a href={m.href ?? '#'} className="card" style={{display:'block'}}>
      <div className="row" style={{justifyContent:'space-between'}}>
        <div style={{maxWidth:'80%'}}>
          <div className="kicker">{m.source ?? 'Market'}</div>
          <div style={{fontSize:18, fontWeight:700, marginTop:6, lineHeight:1.25}}>
            {m.question}
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:28, fontWeight:900}}>
            {Math.round(m.probability)}%
          </div>
          <div style={{marginTop:6}}>
            <ChangePill delta={m.change24h}/>
          </div>
        </div>
      </div>
      {m.volume24hUsd !== undefined && (
        <div style={{marginTop:10, color:'var(--muted)', fontSize:13}}>
          24h Vol: ${m.volume24hUsd.toLocaleString()}
        </div>
      )}
    </a>
  );
}
