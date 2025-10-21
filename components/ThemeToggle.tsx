'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle(){
  const [dark, setDark] = useState(true);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  return (
    <button className="ghost" onClick={()=>setDark(d=>!d)} aria-label="Toggle theme">
      {dark ? 'Dark' : 'Light'}
    </button>
  );
}
