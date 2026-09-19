import React from 'react';
import { SecretStar } from '../../types/celestial';
import { useSky } from '../../context/SkyContext';

interface SecretStarObjectProps {
  star: SecretStar;
}

export const SecretStarObject: React.FC<SecretStarObjectProps> = ({ star }) => {
  const { discoverSecretStar } = useSky();
  const isDiscovered = star.discovered;

  return (
    <div
      className={`secret-star-node ${isDiscovered ? 'discovered' : 'undiscovered'}`}
      style={{
        position: 'absolute',
        left: `${star.x}%`,
        top: `${star.y}%`,
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        zIndex: 12,
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: star.hexColor
      }}
      onClick={(e) => {
        e.stopPropagation();
        discoverSecretStar(star.id);
      }}
      title="Hidden star"
      aria-label="Hidden star"
    >
      <svg className="secret-star-shape" viewBox="0 0 32 32" aria-hidden="true">
        <path
          d="M16 1.8l3.6 8.9 9.6.8-7.3 6.2 2.3 9.3-8.2-5-8.2 5 2.3-9.3-7.3-6.2 9.6-.8L16 1.8z"
          fill={star.hexColor}
          fillOpacity={isDiscovered ? 0.6 : 0.95}
        />
      </svg>
    </div>
  );
};
