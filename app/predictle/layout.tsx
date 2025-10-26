'use client';
import Header from './components/Header';

export default function PredictleLayout({ children }: { children: React.ReactNode }) {
  return (
    <body className="bg-[#0A0C10] text-white min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10">{children}</main>
    </body>
  );
}



