'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Load saved theme if exists
    const saved = localStorage.getItem('predictist-theme') as 'light' | 'dark' | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    // Apply to HTML
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('predictist-theme', theme);
  }, [theme]);

  return (
    <button
      className="ghost"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
