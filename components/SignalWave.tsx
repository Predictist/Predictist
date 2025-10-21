'use client';

type Props = {
  size?: number;        // px
  animated?: boolean;   // enable pulse
  strokeWidth?: number; // px
  opacity?: number;     // 0..1
};

export default function SignalWave({
  size = 28,
  animated = false,
  strokeWidth = 2.5,
  opacity = 0.95,
}: Props) {
  // Using currentColor keeps it perfect in dark/light themes.
  return (
    <svg
      width={size}
      height={Math.round(size * (32 / 120))}
      viewBox="0 0 120 32"
      xmlns="http://www.w3.org/2000/svg"
      className={animated ? 'wave-anim' : undefined}
      aria-hidden="true"
      style={{ display: 'block', color: 'var(--accent)' }}
    >
      <path
        d="M0 16
           C 15 0, 30 32, 45 16
           S 75 0, 90 16
           S 105 32, 120 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity={opacity}
      />
    </svg>
  );
}
