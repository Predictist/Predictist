// pages/predictle/index.js
import Link from 'next/link';

export default function Predictle() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900">
      <h1 className="text-4xl font-bold mb-4">Predictle</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        A daily prediction challenge. Coming soon.
      </p>

      <Link
        href="/"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Back to Home
      </Link>
    </main>
  );
}
