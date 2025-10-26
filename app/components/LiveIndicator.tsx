'use client';

type Props = {
  source?: string;
};

export default function LiveIndicator({ source }: Props) {
  const isLive = source === 'CLOB';
  const color = isLive ? 'bg-blue-500 animate-pulse' : 'bg-gray-500';
  const label = isLive ? 'Live Markets' : 'Demo Mode';

  return (
    <div className="flex items-center gap-2 text-sm text-gray-400 absolute top-3 right-4">
      <span className={`h-3 w-3 rounded-full ${color}`}></span>
      <span>{label}</span>
    </div>
  );
}
