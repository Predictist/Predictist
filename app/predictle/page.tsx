'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PredictleHub() {
  const Tile = ({
    href,
    title,
    subtitle,
    emoji,
  }: {
    href: string;
    title: string;
    subtitle: string;
    emoji: string;
  }) => (
    <Link href={href} className="group">
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/30 shadow-xl p-6"
      >
        <div className="text-3xl mb-3">{emoji}</div>
        <div className="text-xl font-semibold text-white">{title}</div>
        <div className="text-sm text-gray-400 mt-1">{subtitle}</div>
        <div className="mt-4 inline-flex items-center gap-2 text-cyan-300">
          <span>Play</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </motion.div>
    </Link>
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          PREDICTLE
        </h1>
        <p className="text-gray-400 mb-8">
          Learn to think in probabilities. Practice with real markets.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          <Tile
            href="/predictle/free"
            title="Free Play"
            subtitle="Unlimited practice. Uses live markets or demo."
            emoji="🎮"
          />
          <Tile
            href="/predictle/daily"
            title="Daily Challenge"
            subtitle="5 questions. Same for everyone. Resets at UTC."
            emoji="📅"
          />
          <Tile
            href="/predictle/slider"
            title="Slider Mode"
            subtitle="Guess the probability (0–100). Score by accuracy."
            emoji="🎚️"
          />
        </div>
      </div>
    </main>
  );
}
