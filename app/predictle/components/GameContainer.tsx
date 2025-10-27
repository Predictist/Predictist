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
                      px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-300
                      ${
                        isLiveMode
                          ? 'bg-blue-500 text-white border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.6)]'
                          : 'bg-gray-100 text-gray-800 border-gray-300 shadow-[0_0_8px_rgba(200,200,200,0.6)]'
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
