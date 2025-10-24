export const metadata = {
  title: 'Predictle',
  description: 'The Predictist Daily Challenge Game',
};

export default function PredictleLayout({ children }) {
  return (
    <section style={{ padding: '2rem', minHeight: '100vh' }}>
      {children}
    </section>
  );
}
