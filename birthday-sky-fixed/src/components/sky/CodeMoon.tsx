import React from 'react';

interface CodeMoonProps {
  size?: number;
}

export const CodeMoon: React.FC<CodeMoonProps> = ({ size = 130 }) => {
  return (
    <div
      className="code-moon-container"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}
    >
      {/* Multi-layered atmospheric circular glow (pure circular, no rectangular boundary) */}
      <div
        className="moon-procedural-glow"
        style={{
          position: 'absolute',
          inset: '-20px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(116, 192, 252, 0.45) 0%, rgba(77, 171, 247, 0.3) 35%, rgba(24, 100, 171, 0.18) 55%, rgba(11, 114, 133, 0.08) 70%, transparent 85%)',
          boxShadow: '0 0 45px rgba(77, 171, 247, 0.5), 0 0 90px rgba(24, 100, 171, 0.35), inset 0 0 30px rgba(165, 216, 255, 0.25)',
          filter: 'blur(3px)',
          pointerEvents: 'none'
        }}
      />

      {/* Main Moon SVG Sphere */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        style={{
          borderRadius: '50%',
          display: 'block',
          position: 'relative',
          zIndex: 2,
          overflow: 'hidden'
        }}
      >
        <defs>
          {/* Base Sphere 3D Light to Shadow Gradient */}
          <radialGradient id="moon3dLight" cx="35%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#A5D8FF" />
            <stop offset="55%" stopColor="#74C0FC" />
            <stop offset="78%" stopColor="#1864AB" />
            <stop offset="100%" stopColor="#003566" />
          </radialGradient>

          {/* Mare (Dark Lunar Basins) Gradient */}
          <radialGradient id="mareGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#0a2540" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#06192e" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#001830" stopOpacity="0.9" />
          </radialGradient>

          {/* Crater Shadows */}
          <radialGradient id="craterDark" cx="65%" cy="65%" r="50%">
            <stop offset="0%" stopColor="#001d3d" stopOpacity="0.9" />
            <stop offset="85%" stopColor="#003566" stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Crater Highlights */}
          <linearGradient id="craterRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#A5D8FF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>

          {/* Circular Clip for internal textures */}
          <clipPath id="moonCircleClip">
            <circle cx="100" cy="100" r="99" />
          </clipPath>

          {/* Surface Texture Noise Filter */}
          <filter id="lunarRoughness">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.45   0 0 0 0 0.75   0 0 0 0 0.98  0 0 0 0.22 0"
              result="coloredNoise"
            />
            <feComposite in2="SourceGraphic" in="coloredNoise" operator="in" />
          </filter>
        </defs>

        {/* Clip everything strictly to the circular boundary */}
        <g clipPath="url(#moonCircleClip)">
          {/* Base 3D Sphere */}
          <circle cx="100" cy="100" r="99" fill="url(#moon3dLight)" />

          {/* Texture Overlay */}
          <rect x="0" y="0" width="200" height="200" filter="url(#lunarRoughness)" opacity="0.45" />

          {/* ───────────────────────────────────────────
              LUNAR MARIA (Distinct Geographic Formations)
              ─────────────────────────────────────────── */}
          {/* Oceanus Procellarum (Large Western Sea) */}
          <path
            d="M 35,45 Q 25,75 32,105 Q 40,130 55,125 Q 70,115 65,85 Q 60,55 45,45 Z"
            fill="url(#mareGrad)"
          />

          {/* Mare Imbrium (Sea of Rains, Upper North-Central) */}
          <path
            d="M 55,40 Q 80,30 105,42 Q 110,65 95,78 Q 70,82 58,65 Z"
            fill="url(#mareGrad)"
          />

          {/* Mare Serenitatis (Upper East) */}
          <ellipse cx="120" cy="58" rx="20" ry="16" fill="url(#mareGrad)" />

          {/* Mare Tranquillitatis (Sea of Tranquility, Central East) */}
          <path
            d="M 115,75 Q 145,70 148,92 Q 138,110 115,105 Q 102,95 115,75 Z"
            fill="url(#mareGrad)"
          />

          {/* Mare Fecunditatis & Mare Crisium */}
          <ellipse cx="152" cy="105" rx="14" ry="18" fill="url(#mareGrad)" />
          <ellipse cx="158" cy="62" rx="11" ry="8" fill="url(#mareGrad)" />

          {/* Mare Nubium & Mare Humorum (South-Central) */}
          <path
            d="M 60,115 Q 85,110 98,125 Q 92,148 72,150 Q 55,142 60,115 Z"
            fill="url(#mareGrad)"
          />
          <ellipse cx="48" cy="138" rx="12" ry="10" fill="url(#mareGrad)" />

          {/* ───────────────────────────────────────────
              TYCHO CRATER & BRIGHT RAYS (Lower Southern Region)
              ─────────────────────────────────────────── */}
          {/* Ray Lines radiating outwards across the disc */}
          <g stroke="#ffffff" strokeOpacity="0.45" strokeLinecap="round">
            <line x1="95" y1="162" x2="35" y2="120" strokeWidth="1.6" strokeDasharray="8,4" />
            <line x1="95" y1="162" x2="65" y2="70" strokeWidth="1.8" strokeDasharray="14,3" />
            <line x1="95" y1="162" x2="105" y2="60" strokeWidth="2.0" strokeDasharray="12,4" />
            <line x1="95" y1="162" x2="155" y2="90" strokeWidth="1.5" strokeDasharray="10,5" />
            <line x1="95" y1="162" x2="160" y2="140" strokeWidth="1.6" strokeDasharray="8,4" />
            <line x1="95" y1="162" x2="100" y2="192" strokeWidth="1.8" />
            <line x1="95" y1="162" x2="72" y2="185" strokeWidth="1.4" />
          </g>

          {/* Tycho Central Peak Crater */}
          <circle cx="95" cy="162" r="7" fill="url(#craterDark)" />
          <circle cx="95" cy="162" r="7" fill="none" stroke="url(#craterRim)" strokeWidth="1.8" />
          <circle cx="94.5" cy="161.5" r="1.5" fill="#ffffff" />

          {/* ───────────────────────────────────────────
              PROMINENT CRATERS (Copernicus, Kepler, Plato)
              ─────────────────────────────────────────── */}
          {/* Copernicus Crater (Central bright ray system) */}
          <circle cx="68" cy="85" r="6" fill="url(#craterDark)" />
          <circle cx="68" cy="85" r="6" fill="none" stroke="url(#craterRim)" strokeWidth="1.5" />
          <circle cx="67.5" cy="84.5" r="1.2" fill="#ffffff" />
          <line x1="68" y1="85" x2="48" y2="98" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.2" />
          <line x1="68" y1="85" x2="88" y2="72" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.2" />

          {/* Kepler Crater */}
          <circle cx="42" cy="88" r="4.5" fill="url(#craterDark)" />
          <circle cx="42" cy="88" r="4.5" fill="none" stroke="url(#craterRim)" strokeWidth="1.2" />

          {/* Plato (Dark Flat Floor crater in North) */}
          <ellipse cx="78" cy="35" rx="5.5" ry="3.5" fill="#001830" opacity="0.9" />
          <ellipse cx="78" cy="35" rx="5.5" ry="3.5" fill="none" stroke="#A5D8FF" strokeWidth="1" opacity="0.8" />

          {/* Aristarchus Crater (Extremely Bright Spot) */}
          <circle cx="36" cy="62" r="3.5" fill="#ffffff" opacity="0.95" />
          <circle cx="36" cy="62" r="5" fill="none" stroke="#74C0FC" strokeWidth="0.8" opacity="0.7" />

          {/* Additional crater field clusters */}
          <circle cx="128" cy="135" r="5" fill="url(#craterDark)" />
          <circle cx="128" cy="135" r="5" fill="none" stroke="url(#craterRim)" strokeWidth="1" />

          <circle cx="145" cy="148" r="4" fill="url(#craterDark)" />
          <circle cx="145" cy="148" r="4" fill="none" stroke="url(#craterRim)" strokeWidth="0.9" />

          <circle cx="82" cy="178" r="4" fill="url(#craterDark)" />
          <circle cx="82" cy="178" r="4" fill="none" stroke="url(#craterRim)" strokeWidth="0.9" />

          {/* Limb Lighting / Atmospheric Edge Crescent */}
          <circle
            cx="100"
            cy="100"
            r="98"
            fill="none"
            stroke="url(#craterRim)"
            strokeWidth="2.5"
            opacity="0.85"
          />
        </g>
      </svg>
    </div>
  );
};
