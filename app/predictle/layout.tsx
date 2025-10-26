'use client';
import Header from './components/Header';

export default function PredictleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0A0C10] text-white min-h-screen flex flex-col items-center">
        <Header />
        <main className="w-full max-w-3xl mt-10 px-6">{children}</main>
      </body>
    </html>
  );
}

