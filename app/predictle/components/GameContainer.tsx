'use client';

import React from 'react';
import clsx from 'clsx';

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
        {/* Pill — live/demo */}
        <div
  className={clsx(
    'absolute top-4 left-4 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-300',
    isLiveMode
      ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/40'
      : 'bg-gray-700 text-gray-300 border-gray-500 shadow-md shadow-gray-500/30'
  )}
>
  {isLiveMode ? 'Live Mode' : 'Demo Mode'}
</div>

        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
          {title}
        </h1>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

