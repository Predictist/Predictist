'use client';

export default function Feedback({ zone }: { zone?: string }) {
  const text =
    zone === 'green' ? '✅ Perfect!' :
    zone === 'yellow' ? '🟨 Close!' :
    zone === 'red' ? '❌ Off!' :
    'Feedback placeholder';
    
  return (
    <div className="text-center text-sm text-gray-500 mt-2">
      {text}
    </div>
  );
}
