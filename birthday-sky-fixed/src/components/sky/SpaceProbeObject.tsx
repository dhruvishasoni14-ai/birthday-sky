import React, { useState } from 'react';
import { VoiceNote } from '../../types/celestial';
import { useSky } from '../../context/SkyContext';

interface SpaceProbeObjectProps {
  probe: VoiceNote;
}

export const SpaceProbeObject: React.FC<SpaceProbeObjectProps> = ({ probe }) => {
  const { openVoiceNote } = useSky();
  const [connectingState, setConnectingState] = useState<'idle' | 'connecting' | 'signal'>('idle');

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (connectingState !== 'idle') return;

    // Sequence Step 1: CONNECTING...
    setConnectingState('connecting');

    // Step 2: SIGNAL RECEIVED
    setTimeout(() => {
      setConnectingState('signal');
    }, 1200);

    // Step 3: Show voice note interface
    setTimeout(() => {
      setConnectingState('idle');
      openVoiceNote(probe.id);
    }, 2200);
  };

  const isHeard = probe.heard;

  return (
    <div
      className={`sky-probe-wrapper ${isHeard ? 'probe-heard' : 'probe-unheard'}`}
      style={{
        position: 'absolute',
        left: `${probe.x}%`,
        top: `${probe.y}%`,
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        zIndex: 18
      }}
      onClick={handleClick}
      title={`${probe.title || 'Voice Note'} (${isHeard ? 'Heard' : 'Unheard'})`}
    >
      {/* Animated Signal / Radar Waves when connecting */}
      {connectingState === 'connecting' && (
        <div className="probe-radar-wave">
          <div className="radar-ring r1" />
          <div className="radar-ring r2" />
        </div>
      )}

      {/* Floating Status Banner */}
      {connectingState === 'connecting' && (
        <div className="probe-status-banner connecting">
          <span>📡 CONNECTING...</span>
        </div>
      )}

      {connectingState === 'signal' && (
        <div className="probe-status-banner signal">
          <span>🟢 SIGNAL RECEIVED</span>
        </div>
      )}

      {/* SVG Space Probe Craft */}
      <svg
        width="68"
        height="68"
        viewBox="0 0 68 68"
        className="space-probe-svg"
      >
        <defs>
          <radialGradient id={`probe-glow-${probe.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent-color)" stopOpacity={isHeard ? '0.3' : '0.8'} />
            <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Glow halo */}
        <circle
          cx="34"
          cy="34"
          r={isHeard ? 26 : 33}
          fill={`url(#probe-glow-${probe.id})`}
          className={!isHeard ? 'probe-unheard-pulse' : ''}
        />

        {/* Main Probe Hull */}
        <rect
          x="26"
          y="26"
          width="16"
          height="16"
          rx="3"
          fill="#cbd5e1"
          stroke="var(--accent-color)"
          strokeWidth="1.5"
        />

        {/* Golden / Accent Solar Panels */}
        <rect
          x="6"
          y="30"
          width="16"
          height="8"
          rx="1"
          fill="#1e293b"
          stroke="var(--accent-color)"
          strokeWidth="1"
        />
        <line x1="14" y1="30" x2="14" y2="38" stroke="var(--accent-color)" strokeWidth="0.8" />

        <rect
          x="46"
          y="30"
          width="16"
          height="8"
          rx="1"
          fill="#1e293b"
          stroke="var(--accent-color)"
          strokeWidth="1"
        />
        <line x1="54" y1="30" x2="54" y2="38" stroke="var(--accent-color)" strokeWidth="0.8" />

        {/* Connecting Struts */}
        <line x1="22" y1="34" x2="26" y2="34" stroke="#94a3b8" strokeWidth="2" />
        <line x1="42" y1="34" x2="46" y2="34" stroke="#94a3b8" strokeWidth="2" />

        {/* High Gain Parabolic Antenna Dish */}
        <path
          d="M24 16 Q34 24 44 16"
          fill="none"
          stroke="var(--accent-color)"
          strokeWidth="2.5"
        />
        <line x1="34" y1="20" x2="34" y2="26" stroke="#94a3b8" strokeWidth="2" />
        <circle cx="34" cy="13" r="2" fill="var(--accent-color)" />

        {/* Pulsing Signal Beacon Light */}
        <circle
          cx="34"
          cy="34"
          r="2.5"
          fill={isHeard ? '#60a5fa' : '#4ade80'}
          className={!isHeard ? 'beacon-flash' : ''}
        />
      </svg>

    </div>
  );
};
