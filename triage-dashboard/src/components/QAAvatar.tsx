import React from "react";

export interface QAAvatarProps {
  size?: number; // px
  className?: string;
}

export default function QAAvatar({ size = 64, className = "" }: QAAvatarProps) {
  // width/height are driven by `size` prop
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 120 140"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
    >
      <defs>
        <linearGradient id="g-body" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        <linearGradient id="g-face" x1="0" x2="1">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#1f2937" stopOpacity="0.98" />
        </linearGradient>

        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.25"/>
        </filter>
      </defs>

      {/* CSS animations scoped to this SVG */}
      <style>{`
        .avatar-root { cursor: grab; }
        .head-group { transform-origin: 60px 36px; animation: bob 4s ease-in-out infinite; }
        .eye { transform-origin: center; }
        .eye-lid { transform-origin: center; animation: blink 5s infinite; }
        .pupil { transition: transform 0.16s ease; }
        .check-plate { transform-origin: 60px 96px; animation: pulse 2.4s infinite; }
        .shine { animation: shine 3s linear infinite; opacity: 0.18; }

        @keyframes bob {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(-1deg); }
        }
        @keyframes blink {
          0%, 4%, 100% { transform: scaleY(1); }
          2% { transform: scaleY(0.08); }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        @keyframes shine {
          0% { transform: translateX(-40px); opacity: 0.18; }
          50% { opacity: 0.32; }
          100% { transform: translateX(40px); opacity: 0; }
        }
      `}</style>

      <g className="avatar-root" filter="url(#shadow)">
        {/* antenna */}
        <g className="head-group">
          <rect x="46" y="6" rx="8" ry="8" width="28" height="8" fill="#FDE68A" />
          <circle cx="60" cy="6" r="6" fill="#FDE68A" />

          {/* head */}
          <rect x="20" y="12" rx="20" ry="20" width="80" height="48" fill="url(#g-body)"/>

          {/* face inset */}
          <rect x="30" y="20" rx="12" ry="12" width="60" height="32" fill="url(#g-face)" />

          {/* subtle shine on head */}
          <g className="shine" >
            <ellipse cx="70" cy="18" rx="28" ry="10" fill="#ffffff"/>
          </g>

          {/* eyes */}
          <g transform="translate(0,0)">
            {/* left eye group */}
            <g transform="translate(36,34)">
              <g className="eye">
                <ellipse cx="0" cy="0" rx="6.4" ry="6.4" fill="#ffffff" />
                <g className="eye-lid">
                  <rect x="-6.6" y="-6.6" rx="6.6" ry="6.6" width="13.2" height="13.2" fill="#0f172a" />
                </g>
                <circle className="pupil" cx="-0.5" cy="0.5" r="2.8" fill="#111827"/>
              </g>
            </g>

            {/* right eye group */}
            <g transform="translate(84,34)">
              <g className="eye" transform="translate(-48,0)">
                <ellipse cx="0" cy="0" rx="6.4" ry="6.4" fill="#ffffff" />
                <g className="eye-lid">
                  <rect x="-6.6" y="-6.6" rx="6.6" ry="6.6" width="13.2" height="13.2" fill="#0f172a" />
                </g>
                <circle className="pupil" cx="-0.5" cy="0.5" r="2.8" fill="#111827"/>
              </g>
            </g>
          </g>

          {/* smiling mouth */}
          <path d="M44 44 C 52 52, 68 52, 76 44" stroke="#E6E7EA" strokeWidth="3" strokeLinecap="round" fill="none" />

        </g>

        {/* neck */}
        <rect x="46" y="64" rx="6" ry="6" width="28" height="10" fill="#111827" opacity="0.9" />

        {/* torso */}
        <g>
          <rect x="18" y="76" rx="18" ry="18" width="84" height="56" fill="url(#g-body)" />
          {/* chest plate */}
          <rect x="40" y="88" rx="6" ry="6" width="40" height="28" fill="#FDE68A" className="check-plate" />
          {/* check mark */}
          <path d="M48 104 L56 112 L80 88" stroke="#10B981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          {/* subtle panel lines */}
          <rect x="26" y="86" rx="8" ry="8" width="4" height="8" fill="#ffffff" opacity="0.06" />
          <rect x="90" y="86" rx="8" ry="8" width="4" height="8" fill="#ffffff" opacity="0.06" />
        </g>

        {/* base shadow */}
        <ellipse cx="60" cy="136" rx="28" ry="6" fill="#000" opacity="0.16" />
      </g>
    </svg>
  );
}
