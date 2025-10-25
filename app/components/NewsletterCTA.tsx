'use client';

import { useState } from 'react';

export default function NewsletterCTA(){
  const [email, setEmail] = useState('');
  const [list, setList] = useState<'edge'|'odds'>('odds');
  const [status, setStatus] = useState<'idle'|'loading'|'ok'|'error'>('idle');

  async function onSubmit(e: React.FormEvent){
    e.preventDefault();
    try{
      setStatus('loading');
      const r = await fetch('/api/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email, list }),
      });
      if(!r.ok) throw new Error('Failed');
      setStatus('ok');
      setEmail('');
    }catch(e){
      setStatus('error');
    }
  }

  return (
    <div className="card">
      <div className="kicker">Subscribe</div>
      <div className="h1" style={{fontSize:24, marginTop:8}}>Stay in the flow of markets</div>
      <p className="p-lg" style={{marginBottom:14}}>Pick your newsletter and get sharp, actionable prediction-market insight.</p>

      <form onSubmit={onSubmit} className="grid" style={{gap:12}}>
        <div className="row" style={{gap:8}}>
          <label className="badge" style={{cursor:'pointer'}}>
            <input
              type="radio"
              name="list"
              checked={list==='odds'}
              onChange={()=>setList('odds')}
              style={{accentColor:'var(--accent)'}}
            />
            <span>⚡ Odds On (daily-ish)</span>
          </label>
          <label className="badge" style={{cursor:'pointer'}}>
            <input
              type="radio"
              name="list"
              checked={list==='edge'}
              onChange={()=>setList('edge')}
              style={{accentColor:'var(--accent)'}}
            />
            <span>🧠 The Edge (1–2×/week)</span>
          </label>
        </div>

        <div className="row" style={{gap:10}}>
          <input required type="email" className="input" placeholder="you@domain.com" value={email} onChange={e=>setEmail(e.target.value)} />
          <button type="submit" disabled={status==='loading'}>{status==='loading' ? 'Subscribing…' : 'Subscribe'}</button>
          {status==='ok' && <span style={{color:'var(--success)', fontWeight:700}}>You’re in!</span>}
          {status==='error' && <span style={{color:'var(--danger)', fontWeight:700}}>Try again</span>}
        </div>
      </form>
    </div>
  );
}
