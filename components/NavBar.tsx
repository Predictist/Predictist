'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { useEffect, useState } from 'react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/predictle', label: 'Predictle' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/subscribe', label: 'Subscribe' },
];

export default function NavBar() {
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 10);
  window.addEventListener('scroll', onScroll);
  return () => window.removeEventListener('scroll', onScroll);
}, []);
  return (
    <header
  style={{
    position: 'sticky',
    top: 0,
    zIndex: 50,
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid var(--card-border)',
    background: scrolled ? 'rgba(14,17,22,0.85)' : 'rgba(14,17,22,0.55)',
    transition: 'background 0.3s ease, border 0.3s ease',
  }}
>
      <div className="container" style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px'}}>
        <Link
  href="/"
  style={{
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: '1.25rem',
    background: 'linear-gradient(90deg, var(--accent), #6aa5ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
  }}
>
  Predictist
</Link>

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
