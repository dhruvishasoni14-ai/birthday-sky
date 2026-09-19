import React, { useRef, useMemo } from 'react';
import { useSky } from '../../context/SkyContext';
import { MoonObject } from './MoonObject';
import { ConstellationObject } from './ConstellationObject';
import { PlanetObject } from './PlanetObject';
import { NebulaObject } from './NebulaObject';
import { SpaceProbeObject } from './SpaceProbeObject';
import { SecretStarObject } from './SecretStarObject';
import { BlackHoleObject } from './BlackHoleObject';

function generateBackgroundStars(count = 2600) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 4.8 + 1.8;
    const opacity = Math.random() * 0.5 + 0.2;
    const isTwinkle = Math.random() < 0.15;
    const isBright = Math.random() < 0.05;
    const delay = Math.random() * 3;

    stars.push({ id: i, x, y, size, opacity, isTwinkle, isBright, delay });
  }
  return stars;
}

export const SkyCanvas: React.FC = () => {
  const {
    panOffset,
    setPanOffset,
    zoom,
    setZoom,
    wishes,
    stories,
    voiceNotes,
    secretStars,
    personalityWords
  } = useSky();

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const touchStateRef = useRef<{
    isPinching: boolean;
    initialDistance: number;
    initialZoom: number;
    pinchCenter: { x: number; y: number };
    lastTouchPos: { x: number; y: number };
  }>({
    isPinching: false,
    initialDistance: 0,
    initialZoom: 1,
    pinchCenter: { x: 0, y: 0 },
    lastTouchPos: { x: 0, y: 0 }
  });

  const backgroundStars = useMemo(() => generateBackgroundStars(2600), []);

  // The universe is 600vw x 600vh and starts at -250vw/-250vh.
  // These limits keep the viewport completely inside the star field, so
  // the user never reaches an empty black area outside the playable sky.
  const clampPan = (next: { x: number; y: number }) => {
    const maxX = window.innerWidth * 2.42;
    const minX = -window.innerWidth * 5.42;
    const maxY = window.innerHeight * 2.42;
    const minY = -window.innerHeight * 5.42;
    return {
      x: Math.min(maxX, Math.max(minX, next.x)),
      y: Math.min(maxY, Math.max(minY, next.y))
    };
  };

  const shouldIgnoreTarget = (target: HTMLElement | null) => {
    if (!target) return false;
    return Boolean(
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('select') ||
      target.closest('.modal-backdrop') ||
      target.closest('.modal-content') ||
      target.closest('.bottom-left-unopened-badge') ||
      target.closest('.statistics') ||
      target.closest('.add-menu-container') ||
      target.closest('.sky-constellation') ||
      target.closest('.sky-planet-wrapper') ||
      target.closest('.sky-probe-wrapper') ||
      target.closest('.secret-star-node') ||
      target.closest('.simple-moon-interactive') ||
      target.closest('.personality-nebula')
    );
  };

  // Mouse Drag Handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (shouldIgnoreTarget(e.target as HTMLElement)) return;
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    setPanOffset(clampPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    }));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Touch Handling for One-Finger Pan & Two-Finger Pinch Zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (shouldIgnoreTarget(e.target as HTMLElement)) return;

    if (e.touches.length === 1) {
      // 1 Touch: Panning
      const touch = e.touches[0];
      touchStateRef.current.isPinching = false;
      touchStateRef.current.lastTouchPos = { x: touch.clientX, y: touch.clientY };
      dragStartRef.current = {
        x: touch.clientX - panOffset.x,
        y: touch.clientY - panOffset.y
      };
      isDraggingRef.current = true;
    } else if (e.touches.length === 2) {
      // 2 Touches: Pinch Zooming
      isDraggingRef.current = false;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const centerX = (t1.clientX + t2.clientX) / 2;
      const centerY = (t1.clientY + t2.clientY) / 2;

      touchStateRef.current = {
        isPinching: true,
        initialDistance: dist,
        initialZoom: zoom,
        pinchCenter: { x: centerX, y: centerY },
        lastTouchPos: { x: centerX, y: centerY }
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDraggingRef.current && !touchStateRef.current.isPinching) {
      // One-finger Pan
      const touch = e.touches[0];
      setPanOffset(clampPan({
        x: touch.clientX - dragStartRef.current.x,
        y: touch.clientY - dragStartRef.current.y
      }));
    } else if (e.touches.length === 2 && touchStateRef.current.isPinching) {
      // Two-finger Pinch Zoom (Pinch OUT = zoom IN, Pinch IN = zoom OUT)
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

      if (touchStateRef.current.initialDistance > 0) {
        const scaleFactor = currentDist / touchStateRef.current.initialDistance;
        const newZoom = Math.min(2.2, Math.max(0.5, touchStateRef.current.initialZoom * scaleFactor));
        setZoom(newZoom);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      isDraggingRef.current = false;
      touchStateRef.current.isPinching = false;
    } else if (e.touches.length === 1) {
      // Transition from pinch back to 1-finger drag
      const touch = e.touches[0];
      touchStateRef.current.isPinching = false;
      dragStartRef.current = {
        x: touch.clientX - panOffset.x,
        y: touch.clientY - panOffset.y
      };
      isDraggingRef.current = true;
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (shouldIgnoreTarget(e.target as HTMLElement)) return;
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.06 : 0.06;
    setZoom((prev) => Math.min(2.2, Math.max(0.5, prev + zoomDelta)));
  };

  return (
    <div
      id="sky"
      className="sky-viewport"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onWheel={handleWheel}
    >
      <div
        id="space"
        className="space-universe"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transition: isDraggingRef.current ? 'none' : 'transform 0.08s ease-out'
        }}
      >
        {/* Dense background star field */}
        {backgroundStars.map((star) => (
          <div
            key={star.id}
            className={`star ${star.isTwinkle ? 'twinkle' : ''} ${star.isBright ? 'bright-star' : ''}`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: star.isTwinkle ? `${star.delay}s` : undefined
            }}
          />
        ))}

        {/* Dense Star Concentration Nebula */}
        <NebulaObject />

        {/* Personality words are intentionally kept inside the Nebula list modal. */}

        {/* Central Moon */}
        <MoonObject />

        {/* Wish Constellations */}
        {wishes.map((wish) => (
          <ConstellationObject key={wish.id} wish={wish} />
        ))}

        {/* Stories / Planets */}
        {stories.map((story) => (
          <PlanetObject key={story.id} story={story} />
        ))}

        {/* Space Probes */}
        {voiceNotes.map((probe) => (
          <SpaceProbeObject key={probe.id} probe={probe} />
        ))}

        {/* Programmer Secret Stars */}
        {secretStars.map((star) => (
          <SecretStarObject key={star.id} star={star} />
        ))}

        {/* Wish and prayer void */}
        <BlackHoleObject />
      </div>
    </div>
  );
};
