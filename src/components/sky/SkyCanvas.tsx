import React, { useRef, useMemo, useEffect } from 'react';
import { useSky } from '../../context/SkyContext';
import { MoonObject } from './MoonObject';
import { ConstellationObject } from './ConstellationObject';
import { PlanetObject } from './PlanetObject';
import { NebulaObject } from './NebulaObject';
import { SpaceProbeObject } from './SpaceProbeObject';
import { SecretStarObject } from './SecretStarObject';
import { BlackHoleObject } from './BlackHoleObject';

const WORLD_SIZE = 6;
const WORLD_ORIGIN = -2.5;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.2;

function seededRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function generateBackgroundStars(count = 1800) {
  return Array.from({ length: count }, (_, id) => {
    const x = seededRandom(id * 4 + 1) * 100;
    const y = seededRandom(id * 4 + 2) * 100;
    const size = seededRandom(id * 4 + 3) * 4.8 + 1.8;
    const opacity = seededRandom(id * 4 + 4) * 0.5 + 0.2;
    const isTwinkle = seededRandom(id * 4 + 5) < 0.15;
    const isBright = seededRandom(id * 4 + 6) < 0.05;
    const delay = seededRandom(id * 4 + 7) * 3;

    return { id, x, y, size, opacity, isTwinkle, isBright, delay };
  });
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
    nebulaWords,
    focusOnCoordinates,
    arrangeMode,
    moveWish,
    moveStory,
    moveVoiceNote
  } = useSky();

  useEffect(() => {
    focusOnCoordinates(52, 18);
  }, [focusOnCoordinates]);

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

  const backgroundStars = useMemo(() => generateBackgroundStars(1800), []);
  type ArrangeDrag = { pointerId: number; element: HTMLElement; kind: 'wish'|'story'|'voice'; id: string; startX: number; startY: number; originalRect: DOMRect; layerRect: DOMRect; originalTransform: string };
  const arrangeDragRef = useRef<ArrangeDrag | null>(null);

  const collisionFree = (rect: {left:number;top:number;right:number;bottom:number}, dragged: HTMLElement) =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-sky-collidable="true"]')).filter(el => el !== dragged).every(el => {
      const r = el.getBoundingClientRect();
      return rect.right <= r.left || rect.left >= r.right || rect.bottom <= r.top || rect.top >= r.bottom;
    });

  const finishArrangeDrag = (commit: boolean, clientX?: number, clientY?: number) => {
    const d = arrangeDragRef.current; if (!d) return;
    const dx = clientX == null ? 0 : clientX - d.startX, dy = clientY == null ? 0 : clientY - d.startY;
    const rect = {left:d.originalRect.left+dx, top:d.originalRect.top+dy, right:d.originalRect.right+dx, bottom:d.originalRect.bottom+dy};
    const valid = commit && collisionFree(rect, d.element);
    d.element.style.transform = d.originalTransform;
    d.element.classList.remove('sky-arranging','sky-arrange-invalid');
    if (valid) {
      const cx = (rect.left+rect.right)/2, cy = (rect.top+rect.bottom)/2;
      const x = Math.max(4, Math.min(96, ((cx-d.layerRect.left)/d.layerRect.width)*100));
      const y = Math.max(4, Math.min(96, ((cy-d.layerRect.top)/d.layerRect.height)*100));
      if (d.kind === 'wish') moveWish(d.id,x,y); else if (d.kind === 'story') moveStory(d.id,x,y); else moveVoiceNote(d.id,x,y);
    }
    arrangeDragRef.current = null;
  };

  const onArrangePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!arrangeMode || e.button !== 0) return;
    const target = e.target as HTMLElement, el = target.closest<HTMLElement>('[data-sky-movable="true"]');
    if (!el) return;
    const kind = el.dataset.skyKind as ArrangeDrag['kind']|undefined, id = el.dataset.skyId;
    const layer = document.querySelector<HTMLElement>('.legacy-sky-layer');
    if (!kind || !id || !layer) return;
    e.preventDefault(); e.stopPropagation();
    arrangeDragRef.current = {pointerId:e.pointerId,element:el,kind,id,startX:e.clientX,startY:e.clientY,originalRect:el.getBoundingClientRect(),layerRect:layer.getBoundingClientRect(),originalTransform:el.style.transform};
    el.setPointerCapture?.(e.pointerId); el.classList.add('sky-arranging');
  };
  const onArrangePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d=arrangeDragRef.current; if (!d || d.pointerId!==e.pointerId) return;
    e.preventDefault(); e.stopPropagation();
    const dx=e.clientX-d.startX,dy=e.clientY-d.startY,rect={left:d.originalRect.left+dx,top:d.originalRect.top+dy,right:d.originalRect.right+dx,bottom:d.originalRect.bottom+dy};
    d.element.style.transform=`translate(-50%, -50%) translate(${dx}px, ${dy}px)`; d.element.classList.toggle('sky-arrange-invalid',!collisionFree(rect,d.element));
  };
  const onArrangePointerUp = (e: React.PointerEvent<HTMLDivElement>) => { if(!arrangeDragRef.current)return; e.preventDefault();e.stopPropagation();finishArrangeDrag(true,e.clientX,e.clientY); };
  const onArrangePointerCancel = () => finishArrangeDrag(false);

  const clampPan = (next: { x: number; y: number }, nextZoom = zoom) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const minX = viewportWidth - viewportWidth * (WORLD_SIZE + WORLD_ORIGIN) * nextZoom;
    const maxX = -viewportWidth * WORLD_ORIGIN * nextZoom;
    const minY = viewportHeight - viewportHeight * (WORLD_SIZE + WORLD_ORIGIN) * nextZoom;
    const maxY = -viewportHeight * WORLD_ORIGIN * nextZoom;
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
      target.closest('.nebula-nebula')
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
        const newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, touchStateRef.current.initialZoom * scaleFactor));
        setZoom(newZoom);
        setPanOffset((current) => clampPan(current, newZoom));
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
    setZoom((prev) => {
      const nextZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, prev + zoomDelta));
      setPanOffset((current) => clampPan(current, nextZoom));
      return nextZoom;
    });
  };

  return (
    <div
      id="sky"
      className="sky-viewport"
      onPointerDown={onArrangePointerDown}
      onPointerMove={onArrangePointerMove}
      onPointerUp={onArrangePointerUp}
      onPointerCancel={onArrangePointerCancel}
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

        <div className="legacy-sky-layer">
          {/* Nebula and its words are kept inside one bounded area */}
          <div className="nebula-stage">
            <NebulaObject />


          </div>

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
    </div>
  );
};
