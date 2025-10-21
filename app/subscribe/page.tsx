'use client';

import { useState } from 'react';

export default function SubscribePage(){
  const [active, setActive] = useState<'odds'|'edge'>('odds');

  return (
    <div className="grid" style={{gap:22}}>
      <div>
        <div className="kicker">Subscribe</div>
        <h1 className="h1">Pick your lens on the future.</h1>
        <p className="p-lg">Choose one—or both.</p>
      </div>

      <div className="grid" style={{gap:18}}>
        <div className="row" style={{gap:8}}>
          <button className={active==='odds'?'':'ghost'} onClick={()=>setActive('odds')}>⚡ Odds On</button>
          <button className={active==='edge'?'':'ghost'} onClick={()=>setActive('edge')}>🧠 The Edge</button>
        </div>

        {active==='odds' ? (
          <div className="card grid" style={{gap:12}}>
            <div>
              <div className="kicker">Odds On</div>
              <div style={{fontWeight:800, fontSize:22, marginTop:6}}>Fun, accessible, and viral—daily market stories.</div>
              <ul style={{margin:'10px 0 0 18px', color:'var(--muted)'}}>
                <li>Top stories from sports, politics, pop culture</li>
                <li>Shareable charts & snackable takes</li>
                <li>Perfect for casual readers & traders</li>
              </ul>
            </div>
            <SubForm list="odds" />
          </div>
        ) : (
          <div className="card grid" style={{gap:12}}>
            <div>
              <div className="kicker">The Edge</div>
              <div style={{fontWeight:800, fontSize:22, marginTop:6}}>Professional, analytical, data-first.</div>
              <ul style={{margin:'10px 0 0 18px', color:'var(--muted)'}}>
                <li>Structure, liquidity, and model accuracy</li>
                <li>Macro implication of market moves</li>
                <li>For quants, researchers, industry insiders</li>
              </ul>
            </div>
            <SubForm list="edge" />
          </div>
        )}
      </div>
    </div>
  );
}

function SubForm({ list }: { list: 'odds'|'edge' }){
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'ok'|'err'>('idle');

  async function submit(e: React.FormEvent){
    e.preventDefault();
    setStatus('loading');
    try{
      const r = await fetch('/api/subscribe', { method:'POST', body: JSON.stringify({ email, list }) });
      if(!r.ok) throw new Error('bad');
      setStatus('ok'); setEmail('');
    }catch(_){ setStatus('err'); }
  }

  return (
    <form onSubmit={submit} className="row" style={{gap:10}}>
      <input required type="email" className="input" placeholder="you@domain.com" value={email} onChange={e=>setEmail(e.target.value)} />
      <button disabled={status==='loading'}>{status==='loading'?'Subscribing…':'Subscribe'}</button>
      {status==='ok' && <span style={{color:'var(--success)', fontWeight:700}}>Subscribed</span>}
      {status==='err' && <span style={{color:'var(--danger)', fontWeight:700}}>Try again</span>}
    </form>
  );
}
