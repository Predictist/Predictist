// pages/subscribe.js
import Head from 'next/head';

export default function Subscribe() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center justify-center px-6">
      <Head>
        <title>Subscribe | The Implied</title>
      </Head>

      <h1 className="text-4xl font-bold mb-4">Subscribe to The Implied</h1>
      <p className="text-gray-600 mb-6 text-center max-w-lg">
        Get weekly insights into prediction markets — what traders are thinking, 
        how sentiment shifts, and where probabilities don’t line up with reality.
      </p>

      <div className="w-full max-w-md flex justify-center">
        <iframe
          src="https://embeds.beehiiv.com/abc123?slim=true"
          data-test-id="beehiiv-embed"
          height="52"
          frameBorder="0"
          scrolling="no"
          style={{ borderRadius: '4px', width: '100%' }}
        ></iframe>
      </div>

      <p className="text-sm text-gray-500 mt-3">Powered by Beehiiv</p>
    </main>
  );
}
