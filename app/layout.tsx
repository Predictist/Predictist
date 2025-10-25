import './globals.css';
import type { Metadata } from 'next';
import NavBar from '@components/NavBar';
import Footer from '@components/Footer';

export const metadata: Metadata = {
  title: 'Predictist — What the world believes will happen',
  description: 'Prediction-market news, dashboards, and interactive games.',
  icons: { icon: '/favicon.ico' },
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
