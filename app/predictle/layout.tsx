'use client';

import PredictleNav from './components/PredictleNav';
import { motion } from 'framer-motion';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="sticky top-0 z-40 backdrop-blur border-b border-white/10 bg-black/40">
          <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
            <a href="/predictle" className="font-bold text-cyan-300 tracking-wide">PREDICTLE</a>
            <nav className="flex items-center gap-4 text-sm text-gray-300">
              <a href="/predictle/free" className="hover:text-white">Free</a>
              <a href="/predictle/daily" className="hover:text-white">Daily</a>
              <a href="/predictle/slider" className="hover:text-white">Slider</a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}

