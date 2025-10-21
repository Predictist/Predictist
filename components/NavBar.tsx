'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/', label: 'Home' },
  { href: '/predictle', label: 'Predictle' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/subscribe', label: 'Subscribe' },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header style={{
      position:'sticky', top:0, zIndex:50, backdropFilter:'blur(8px)',
      borderBottom: '1px solid var(--card-border)', background:'rgba(14,17,22,0.6)'
    }}>
      <div className="container" style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px'}}>
        <Link href="/" style={{fontWeight:900, letterSpacing:'.5px'}}>Predictist</Link>
        <nav style={{display:'flex', gap:18}}>
          {links.map(l => (
            <Link key={l.href} href={l.href}
              style={{
                color: pathname === l.href ? 'var(--accent)' : 'var(--text)',
                fontWeight: pathname === l.href ? 700 : 600
              }}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="row">
          <Link href="/predictle"><button className="ghost">Play Predictle</button></Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
