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
      <body>
        <NavBar />
        <main className="container">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
