// app/predictle/index.js
'use client';
import Link from "next/link";

export default function PredictleHome() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-500">
      <h1 className="text-5xl font-extrabold mb-4">🎯 Predictle</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-10 text-center max-w-md">
        The world’s first prediction gaming hub — powered by real markets.
      </p>

      <div className="flex flex-col sm:flex-row gap-5">
        <Link
          href="/predictle/daily"
          className="px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md transition"
        >
          🗓️ Daily Challenge
        </Link>

        <Link
          href="/predictle/free"
          className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition"
        >
          🎮 Free Play
        </Link>
      </div>

      <footer className="mt-12 text-sm text-gray-500 dark:text-gray-400 text-center">
        Powered by{" "}
        <a
          href="https://predictist.io"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-500"
        >
          Predictist
        </a>
      </footer>

      <style jsx global>{`
        body {
          font-family: system-ui, sans-serif;
        }
      `}</style>
    </main>
  );
}