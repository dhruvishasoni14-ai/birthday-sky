import React from 'react';
import { Story } from '../../types/celestial';
import { useSky } from '../../context/SkyContext';

interface PlanetObjectProps {
  story: Story;
}

export const PlanetObject: React.FC<PlanetObjectProps> = ({ story }) => {
  const { openStory } = useSky();
  const design = story.planetDesign;
  const isUnopened = story.unopened;

  const accentColor = design?.accentColor || 'var(--accent-color)';

  return (
    <div
      className={`sky-planet-wrapper ${isUnopened ? 'unopened-planet' : 'opened-planet'}`}
      style={{
        position: 'absolute',
        left: `${story.x}%`,
        top: `${story.y}%`,
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        zIndex: 16
      }}
      onClick={(e) => {
        e.stopPropagation();
        openStory(story.id);
      }}
      title={`${story.title || 'Relive a Day'} (${isUnopened ? 'Unopened story' : 'Story'})`}
    >
      {/* Planetary Outer Glow */}
      <div
        className="planet-halo-glow"
        style={{
          boxShadow: isUnopened
            ? `0 0 45px ${accentColor}, 0 0 90px ${accentColor}`
            : `0 0 20px ${accentColor}`
        }}
      />

      {/* Circular Planet Body */}
      <div className="planet-body">
        {design?.canvasDataUrl ? (
          <img
            src={design.canvasDataUrl}
            alt="Custom Designed Planet"
            className="planet-texture-img"
          />
        ) : (
          <div
            className="planet-default-surface"
            style={{
              background: `radial-gradient(circle at 30% 30%, #ffd166, #f78c6b 60%, #8338ec)`
            }}
          />
        )}
        {/* Planet shadow overlay for 3D realism */}
        <div className="planet-3d-shadow" />
      </div>

      {design?.hasRings && (
        <div
          className="planet-ring"
          style={{
            borderColor: accentColor,
            boxShadow: `0 0 10px ${accentColor}88`
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
