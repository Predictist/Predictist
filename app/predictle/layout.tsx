'use client';

import PredictleNav from './components/PredictleNav';
import { motion } from 'framer-motion';

export default function PredictleLayout({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white"
    >
      <div className="flex flex-col items-center pt-6">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
          Predictle
        </h1>
        <p className="text-gray-400 text-sm mb-4">Prediction markets. Reimagined.</p>
        <PredictleNav />
      </div>

      <main className="w-full flex justify-center px-4 pb-12">{children}</main>
    </motion.div>
  );
}
