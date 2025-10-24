// app/layout.js
export const metadata = {
  title: 'Predictist',
  description: 'Prediction markets. Made clear.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
