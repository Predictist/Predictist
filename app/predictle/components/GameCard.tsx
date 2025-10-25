'use client';

export default function GameCard({ children }: { children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-6 shadow-sm bg-white dark:bg-gray-800 dark:text-gray-100">
      {children ?? 'GameCard placeholder'}
    </div>
  );
}
