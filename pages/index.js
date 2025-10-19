// pages/index.js
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900">
      <h1 className="text-4xl font-bold mb-4">Predictist</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        Welcome to Predictist — your hub for prediction markets, insights, and games.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/predictle"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Play Predictle
        </Link>
        <Link
          href="/subscribe"
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
        >
          Subscribe to The Implied
        </Link>
      </div>

      <footer className="mt-16 text-gray-500 text-sm">
        Built by Predictist © {new Date().getFullYear()}
      </footer>
    </main>
  );
}
