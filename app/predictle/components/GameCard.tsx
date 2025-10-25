'use client';
import { useState } from 'react';

export default function GameCard({ question, options, onSubmit }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 w-full max-w-xl">
      <h2 className="text-xl font-semibold mb-4">{question}</h2>
      <div className="flex flex-col gap-2 mb-6">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => setSelected(opt)}
            className={`border rounded-lg py-2 px-3 transition-all ${
              selected === opt
                ? 'bg-blue-600 text-white border-blue-600'
                : 'hover:bg-blue-100 dark:hover:bg-gray-800'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <button
        onClick={() => selected && onSubmit(selected)}
        disabled={!selected}
        className="bg-blue-600 text-white rounded-lg px-4 py-2 disabled:opacity-40"
      >
        Submit
      </button>
    </div>
  );
}
