'use client';

import { motion } from 'framer-motion';
import Header from './components/Header'; // ✅ new connected-tab header
import './globals.css';

export default function PredictleLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gradient-to-b from-[#0A0C10] to-[#141821] text-white">
        <Header />  {/* replaces your old <header> */}
        {children}
      </body>
    </html>
  );
}


