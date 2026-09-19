import React from 'react';
import { WishCard } from '../../types/celestial';
import { useSky } from '../../context/SkyContext';

interface ConstellationObjectProps {
  wish: WishCard;
}

export const ConstellationObject: React.FC<ConstellationObjectProps> = ({ wish }) => {
  const { openWish } = useSky();

  const points = wish.points && wish.points.length > 0 ? wish.points : [{ id: 1, x: 20, y: 20 }];
  const connections = wish.connections || [];

  // Calculate SVG bounds
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs) - 20;
  const minY = Math.min(...ys) - 20;
  const maxX = Math.max(...xs) + 20;
  const maxY = Math.max(...ys) + 20;
  const width = Math.max(90, maxX - minX);
  const height = Math.max(90, maxY - minY);

  const isUnopened = wish.unopened;
  const accent = wish.accentColor || 'var(--accent-color)';

  return (
    <div
      className={`sky-constellation ${isUnopened ? 'unopened-bright' : 'opened-subtle'}`}
      style={{
        position: 'absolute',
        left: `${wish.x}%`,
        top: `${wish.y}%`,
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        zIndex: 15
      }}
      onClick={(e) => {
        e.stopPropagation();
        openWish(wish.id);
      }}
      title="Wish Constellation"
    >
      <svg
        width={width}
        height={height}
        viewBox={`${minX} ${minY} ${width} ${height}`}
        className="constellation-svg"
      >
        <defs>
          <filter id={`glow-${wish.id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={isUnopened ? '4' : '1.5'} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Custom Drawn Connections */}
        {connections.map((conn, idx) => {
          const p1 = points.find((p) => p.id === conn.fromId);
          const p2 = points.find((p) => p.id === conn.toId);
          if (!p1 || !p2) return null;
          return (
            <line
              key={`line-${idx}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={accent}
              strokeWidth={isUnopened ? 2.5 : 1.2}
              strokeOpacity={isUnopened ? 0.95 : 0.45}
              filter={`url(#glow-${wish.id})`}
            />
          );
        })}

        {/* Star Nodes */}
        {points.map((pt) => (
          <g key={`node-${pt.id}`} transform={`translate(${pt.x}, ${pt.y})`}>
            <circle
              r={isUnopened ? 6 : 3}
              fill={accent}
              fillOpacity={isUnopened ? 0.5 : 0.2}
              className={isUnopened ? 'pulse-star-halo' : ''}
            />
            <circle
              r={isUnopened ? 3 : 1.8}
              fill="#ffffff"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};
