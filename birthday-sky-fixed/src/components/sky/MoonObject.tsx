import React from 'react';
import { useSky } from '../../context/SkyContext';

/**
 * The moon uses the supplied transparent PNG instead of the old procedural SVG.
 * This keeps the moon visually clean and avoids the over-detailed/warped look.
 */
export const MoonObject: React.FC = () => {
  const { setActiveModal } = useSky();

  return (
    <div
      className="moon-wrapper simple-moon-interactive"
      style={{
        position: 'absolute',
        left: '52%',
        top: '18%',
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        zIndex: 20
      }}
      onClick={(e) => {
        e.stopPropagation();
        setActiveModal('moon-message');
      }}
      title="The Moon"
      aria-label="The Moon"
      role="button"
    >
      <img
        src="/images/moon.png"
        alt="Moon"
        className="moon-supplied-image"
        draggable={false}
      />
    </div>
  );
};
