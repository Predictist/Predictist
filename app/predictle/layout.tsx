// predictle/layout.tsx
'use client';

export default function PredictleLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0A0C10] text-white min-h-screen flex flex-col items-center">
        <header className="w-full max-w-3xl px-6 mt-8 mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            PREDICTLE
          </h1>
          <p className="text-gray-400 text-sm">6 guesses. 1 cent. Pure skill.</p>
        </header>
        <main className="w-full max-w-3xl px-6">{children}</main>
      </body>
    </html>
  );
}



