'use client';
import React from 'react';

interface GameContainerProps {
  isLiveMode?: boolean;
  title: string;
  children: React.ReactNode;
}

export default function GameContainer({ isLiveMode = false, title, children }: GameContainerProps) {
  return (
    <div className="relative bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl p-8 shadow-xl w-full max-w-2xl mx-auto mt-6">
      {/* Mode Indicator Pill */}
      <div
        className={`absolute top-4 left-4 px-4 py-1 rounded-full text-sm font-semibold ${
          isLiveMode
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
            : 'bg-gray-700 text-gray-300'
        }`}
      >
        {isLiveMode ? 'Live Mode' : 'Demo Mode'}
      </div>

      {/* Game Title */}
      <h2 className="text-2xl font-bold text-center mb-6">{title}</h2>

      {children}
    </div>
  );
}
