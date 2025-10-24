'use client';

export default function PredictleLeaderboard() {
  const leaders = [
    { name: 'Analytica', score: 98 },
    { name: 'FutureFlow', score: 96 },
    { name: 'DataDove', score: 94 },
    { name: 'MarketMaven', score: 92 },
  ];

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 50% 20%, #0A0E1A, #05070D 80%)',
        color: '#F8FAFC',
        padding: '6rem 2rem',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontSize: '3rem',
          fontWeight: 800,
          marginBottom: '1rem',
          color: '#00E5FF',
          textShadow: '0 0 20px rgba(0,229,255,0.5)',
        }}
      >
        Leaderboard
      </h1>
      <p
        style={{
          color: '#94A3B8',
          marginBottom: '3rem',
          fontSize: '1.1rem',
        }}
      >
        See who’s mastering the markets today.
      </p>

      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          border: '1px solid #1A1A1A',
          borderRadius: '12px',
          background: 'rgba(16,20,31,0.9)',
          padding: '2rem',
          boxShadow: '0 0 25px rgba(0,229,255,0.05)',
        }}
      >
        {leaders.map((player, index) => (
          <div
            key={player.name}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '1rem',
              borderBottom:
                index < leaders.length - 1 ? '1px solid #1A1A1A' : 'none',
              color: index === 0 ? '#00E5FF' : '#F8FAFC',
              fontWeight: index === 0 ? 700 : 500,
            }}
          >
            <span>
              #{index + 1} {player.name}
            </span>
            <span>{player.score} pts</span>
          </div>
        ))}
      </div>
    </main>
  );
}
