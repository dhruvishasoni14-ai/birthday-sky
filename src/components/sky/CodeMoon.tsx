import React from 'react';

interface CodeMoonProps {
  size?: number;
  unopened?: boolean;
}

export const CodeMoon: React.FC<CodeMoonProps> = ({ size = 135, unopened = true }) => (
  <div className={`code-moon-container ${unopened ? 'moon-unopened' : 'moon-opened'}`} style={{ width: size, height: size }} aria-hidden="true">
    <div className="moon-procedural-glow" />
    <svg className="clean-full-moon" width={size} height={size} viewBox="0 0 200 200" role="presentation">
      <defs>
        <radialGradient id="moonSurface" cx="31%" cy="25%" r="82%">
          <stop offset="0" stopColor="#d9f7ff" />
          <stop offset=".34" stopColor="#8edcf5" />
          <stop offset=".68" stopColor="#329bc8" />
          <stop offset="1" stopColor="#075985" />
        </radialGradient>
        <linearGradient id="moonCoolLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#effcff" stopOpacity=".7" />
          <stop offset=".48" stopColor="#67d9ff" stopOpacity=".16" />
          <stop offset="1" stopColor="#0284c7" stopOpacity=".3" />
        </linearGradient>
        <radialGradient id="moonMare" cx="42%" cy="38%" r="72%">
          <stop offset="0" stopColor="#075985" stopOpacity=".5" />
          <stop offset="1" stopColor="#164e63" stopOpacity=".08" />
        </radialGradient>
        <radialGradient id="moonCrater" cx="32%" cy="25%" r="78%">
          <stop offset="0" stopColor="#d9f7ff" stopOpacity=".48" />
          <stop offset=".42" stopColor="#3b82a8" stopOpacity=".28" />
          <stop offset=".78" stopColor="#075985" stopOpacity=".62" />
          <stop offset="1" stopColor="#022f45" stopOpacity=".72" />
        </radialGradient>
        <filter id="moonTexture" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency=".028" numOctaves="3" seed="8" />
          <feColorMatrix values="0 0 0 0 .45 0 0 0 0 .7 0 0 0 0 .8 0 0 0 .18 0" />
        </filter>
        <filter id="soften" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.2" /></filter>
        <clipPath id="moonClip"><circle cx="100" cy="100" r="98" /></clipPath>
      </defs>
      <g clipPath="url(#moonClip)">
        <circle cx="100" cy="100" r="99" fill="url(#moonSurface)" />
        <ellipse cx="58" cy="63" rx="35" ry="25" fill="url(#moonMare)" opacity=".72" />
        <ellipse cx="126" cy="73" rx="32" ry="20" fill="url(#moonMare)" opacity=".58" />
        <ellipse cx="83" cy="137" rx="42" ry="23" fill="url(#moonMare)" opacity=".56" />
        <ellipse cx="150" cy="125" rx="25" ry="32" fill="url(#moonMare)" opacity=".52" />
        <circle cx="100" cy="100" r="100" fill="url(#moonCoolLight)" />
        <rect width="200" height="200" filter="url(#moonTexture)" opacity=".48" />
        <g fill="url(#moonCrater)" stroke="#c8f3ff" strokeOpacity=".18" strokeWidth="1">
          <ellipse cx="47" cy="49" rx="12" ry="10" />
          <ellipse cx="85" cy="61" rx="7" ry="6" />
          <ellipse cx="132" cy="46" rx="10" ry="8" />
          <ellipse cx="157" cy="83" rx="7" ry="5" />
          <ellipse cx="64" cy="116" rx="11" ry="8" />
          <ellipse cx="111" cy="111" rx="8" ry="7" />
          <ellipse cx="144" cy="151" rx="13" ry="10" />
          <ellipse cx="88" cy="163" rx="6" ry="5" />
        </g>
        <g fill="none" stroke="#b8efff" strokeOpacity=".16" strokeWidth="1.5" filter="url(#soften)">
          <path d="M47 49 L20 29 M47 49 L23 57 M47 49 L32 76 M144 151 L171 169 M144 151 L178 146 M144 151 L165 122" />
        </g>
      </g>
      <circle cx="100" cy="100" r="98" fill="none" stroke="#c8f3ff" strokeOpacity=".28" strokeWidth="1.5" />
    </svg>
  </div>
);

export default CodeMoon;
