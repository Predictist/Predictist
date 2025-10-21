export default function Footer(){
  return (
    <footer style={{borderTop:'1px solid var(--card-border)', marginTop:40}}>
      <div className="container" style={{padding:'28px 20px'}}>
        <div style={{display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:14}}>
          <div style={{opacity:.9}}>
            <div style={{fontWeight:900}}>Predictist</div>
            <div style={{color:'var(--muted)'}}>What the world believes will happen.</div>
          </div>
          <div style={{display:'flex', gap:22}}>
            <a href="/subscribe">Newsletters</a>
            <a href="/dashboard">Dashboard</a>
            <a href="/predictle">Predictle</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
