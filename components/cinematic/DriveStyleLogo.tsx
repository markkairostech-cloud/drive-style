import React from "react";

export default function DriveStyleLogo({
  size = 22,
  showText = true,
}: {
  size?: number;
  showText?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="g1" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7dd3fc" stopOpacity="0.95" />
            <stop offset="0.45" stopColor="#60a5fa" stopOpacity="0.65" />
            <stop offset="1" stopColor="#1d4ed8" stopOpacity="0.30" />
          </linearGradient>
          <radialGradient id="g2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20 16) rotate(55) scale(40)">
            <stop stopColor="#e0f2fe" stopOpacity="0.45" />
            <stop offset="1" stopColor="#0b1220" stopOpacity="0" />
          </radialGradient>
          <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.6" result="b" />
            <feColorMatrix
              in="b"
              type="matrix"
              values="0 0 0 0 0.22  0 0 0 0 0.66  0 0 0 0 1  0 0 0 0.85 0"
              result="c"
            />
            <feMerge>
              <feMergeNode in="c" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Badge */}
        <path
          d="M32 4C42 10 50 10 58 12v24c0 14-9 22-26 28C15 58 6 50 6 36V12c8-2 16-2 26-8Z"
          fill="url(#g1)"
          stroke="rgba(255,255,255,0.20)"
          strokeWidth="1.2"
          filter="url(#glow)"
        />
        <path
          d="M32 8c8 5 14 6 22 7v20c0 11-7 18-22 23C17 53 10 46 10 35V15c8-1 14-2 22-7Z"
          fill="url(#g2)"
        />

        {/* Road mark */}
        <path
          d="M22 44c5-10 12-16 20-20"
          stroke="rgba(255,255,255,0.78)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M28 45c4-7 9-12 15-15"
          stroke="rgba(125,211,252,0.78)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M35 30l1 4"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth="2.0"
          strokeLinecap="round"
        />
      </svg>

      {showText && (
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-wide">DRIVESTYLE</div>
          <div className="text-[11px] text-white/70">Vehicle concierge advice • South Africa</div>
        </div>
      )}
    </div>
  );
}
