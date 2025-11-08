// predictle/layout.tsx
'use client';

export default function PredictleLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style jsx global>{`
          .slider-glow::-webkit-slider-thumb {
            appearance: none;
            width: 32px;
            height: 32px;
            background: radial-gradient(circle at center, #06d6d6, #0891b2);
            border-radius: 50%;
            cursor: grab;
            box-shadow: 0 0 20px #06d6d6, 0 0 40px #06d6d6;
            transition: all 0.2s;
          }
          .slider-glow::-webkit-slider-thumb:active {
            box-shadow: 0 0 30px #06d6d6, 0 0 60px #06d6d6;
            transform: scale(1.1);
          }
          .slider-glow::-moz-range-thumb {
            width: 32px;
            height: 32px;
            background: radial-gradient(circle at center, #06d6d6, #0891b2);
            border-radius: 50%;
            cursor: grab;
            border: none;
            box-shadow: 0 0 20px #06d6d6;
          }
          .text-glow {
            text-shadow: 0 0 10px rgba(6, 214, 214, 0.8), 0 0 20px rgba(6, 214, 214, 0.5);
          }
        `}</style>
      </head>
      <body className="bg-[#0a0e1a] text-white min-h-screen flex flex-col items-center">
        <header className="w-full max-w-3xl px-6 mt-8 mb-4 text-center">
          <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg text-glow">
            PREDICTLE
          </h1>
          <p className="text-cyan-300 text-sm mt-2 font-medium tracking-wider text-glow">
            6 GUESSES • 1 CENT • PURE SKILL
          </p>
        </header>
        <main className="w-full max-w-3xl px-6 flex-1">{children}</main>
      </body>
    </html>
  );
}
