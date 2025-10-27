'use client';

import React from 'react';

export default function GameContainer({
  children,
  isLiveMode,
  title,
}: {
  children: React.ReactNode;
  isLiveMode: boolean;
  title: string;
}) {
  console.log('isLiveMode:', isLiveMode);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-10 text-white bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      {/* Outer game box */}
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-10 w-full max-w-3xl text-center border border-gray-700/40">
        
        {/* Mode Pill */}
        <div
          className={`absolute z-10 top-4 left-4
                      px-3.5 py-1.5 rounded-full text-sm font-semibold
                      shadow-lg ring-1 transition-all duration-300
                      ${
                        isLiveMode
                          ? 'bg-sky-600 text-white ring-sky-400'
                          : 'bg-zinc-800 text-zinc-200 ring-zinc-600'
                      }`}
        >
          {isLiveMode ? 'Live Mode' : 'Demo Mode'}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
          {title}
        </h1>

        {/* Game content */}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}