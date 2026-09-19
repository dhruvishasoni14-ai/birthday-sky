import React, { useEffect, useRef, useCallback } from 'react';
import { useSky } from '../../context/SkyContext';

const WIDTH = 520;
const HEIGHT = 450;
const PARTICLES = 1600;

type Particle = { x: number; y: number; size: number; alpha: number; hue: number; phase: number };

function seeded(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function heartBoundary(t: number) {
  return { x: 16 * Math.pow(Math.sin(t), 3), y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) };
}

function createParticles(): Particle[] {
  return Array.from({ length: PARTICLES }, (_, index) => {
    const t = seeded(index + 1) * Math.PI * 2;
    const boundary = heartBoundary(t);
    const fill = Math.sqrt(seeded(index * 3 + 17));
    const xNoise = (seeded(index * 7 + 3) - 0.5) * 0.9;
    const yNoise = (seeded(index * 11 + 9) - 0.5) * 0.9;
    const scale = 10.4 * fill;
    const x = WIDTH / 2 + (boundary.x * scale + xNoise * (18 + 32 * fill));
    const y = HEIGHT / 2 + (boundary.y * scale + yNoise * (15 + 28 * fill));
    return {
      x, y,
      size: 0.45 + seeded(index * 13 + 5) * (1.8 + (1 - fill) * 1.8),
      alpha: 0.18 + seeded(index * 17 + 7) * 0.72,
      hue: 285 + seeded(index * 19 + 11) * 65,
      phase: seeded(index * 23 + 13) * Math.PI * 2,
    };
  });
}

const PARTICLE_LAYOUT = createParticles();

export const NebulaObject: React.FC = () => {
  const { openNebula, isNebulaOpened } = useSky();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = WIDTH * dpr;
    canvas.height = HEIGHT * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const draw = (time: number) => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      const pointer = pointerRef.current;
      const centerX = WIDTH / 2;
      const centerY = HEIGHT / 2;
      ctx.globalCompositeOperation = 'lighter';

      const glow = ctx.createRadialGradient(centerX, centerY + 8, 10, centerX, centerY, 220);
      glow.addColorStop(0, 'rgba(255, 140, 225, .24)');
      glow.addColorStop(.35, 'rgba(207, 83, 220, .16)');
      glow.addColorStop(1, 'rgba(53, 20, 104, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      PARTICLE_LAYOUT.forEach((particle, index) => {
        let x = particle.x;
        let y = particle.y;
        if (pointer) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 105 && distance > 0.1) {
            const force = Math.pow(1 - distance / 105, 2) * 18;
            x += (dx / distance) * force;
            y += (dy / distance) * force;
          }
        }
        const pulse = .78 + Math.sin(time * .0012 + particle.phase) * .22;
        const color = `hsla(${particle.hue}, 82%, ${index % 9 === 0 ? 82 : 68}%, ${particle.alpha * pulse})`;
        const radius = particle.size * (index % 17 === 0 ? 1.8 : 1);
        const particleGlow = ctx.createRadialGradient(x, y, 0, x, y, radius * 4);
        particleGlow.addColorStop(0, color);
        particleGlow.addColorStop(1, `hsla(${particle.hue}, 82%, 65%, 0)`);
        ctx.fillStyle = particleGlow;
        ctx.beginPath();
        ctx.arc(x, y, radius * 4, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
      animationRef.current = requestAnimationFrame(draw);
    };
    animationRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const updatePointer = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerRef.current = { x: (event.clientX - rect.left) * WIDTH / rect.width, y: (event.clientY - rect.top) * HEIGHT / rect.height };
  }, []);

  return (
    <div className={`nebula-object ${isNebulaOpened ? 'opened' : ''}`} onMouseMove={updatePointer} onMouseLeave={() => { pointerRef.current = null; }} onClick={(event) => { event.stopPropagation(); openNebula(); }} title="Nebula" aria-label="Open Nebula" role="button" tabIndex={0}>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} aria-hidden="true" />
    </div>
  );
};

export default NebulaObject;
