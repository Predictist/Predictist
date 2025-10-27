import './globals.css';
import type { Metadata } from 'next';
import NavBar from '@components/NavBar';
import Footer from '@components/Footer';

export const metadata = {
  title: {
    default: "Predictist",
    template: "%s | Predictist",
  },
  description: "Prediction markets. Reimagined.",
  openGraph: {
    siteName: "Predictist",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@PredictistHQ",
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
  <body className="antialiased bg-[#0A0C10] text-white min-h-screen">
    <NavBar />
    <main className="container mx-auto px-6 py-10">{children}</main>
    <Footer />
  </body>
</html>
  );
}
