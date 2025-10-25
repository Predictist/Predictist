'use client';

export default function Feedback({ isCorrect, correctAnswer, onNext }) {
  return (
    <div className="text-center mt-6">
      <h3
        className={`text-2xl font-bold mb-2 ${
          isCorrect ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
      </h3>
      {!isCorrect && (
        <p className="text-gray-500 mb-2">The correct answer was: {correctAnswer}</p>
      )}
      <button
        onClick={onNext}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Next Question
      </button>
    </div>
  );
}

