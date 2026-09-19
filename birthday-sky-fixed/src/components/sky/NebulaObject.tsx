import React, { useEffect, useRef, useCallback } from 'react';
import { useSky } from '../../context/SkyContext';

// ─────────────────────────────────────────────
// Heart-Spiral Nebula — Canvas Particle Engine
// ─────────────────────────────────────────────

const PARTICLE_COUNT = 1400;
const STAR_COUNT     = 110;

// parametric heart
function heartXY(t: number) {
  return {
    x:  16 * Math.pow(Math.sin(t), 3),
    y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
  };
}

// Nebula colour palette per specification:
// Core: white-gold #FFF8E7, soft #F8BBD0
// Main gas: dusty pink #D81B60, magenta #E91E63
// Outer transition: lavender #B388FF, deep indigo #283593
// Dark dust: #1A002C
const PALETTE = [
  [26,   0,  44],  // dark dust #1A002C
  [40,  53, 147],  // deep indigo #283593
  [179, 136, 255], // lavender #B388FF
  [216,  27,  96], // dusty pink #D81B60
  [233,  30,  99], // vibrant magenta #E91E63
  [248, 187, 208], // soft rose #F8BBD0
  [255, 248, 231], // white-gold core #FFF8E7
];

// Typed arrays
const pOrigX  = new Float32Array(PARTICLE_COUNT);
const pOrigY  = new Float32Array(PARTICLE_COUNT);
const pX      = new Float32Array(PARTICLE_COUNT);
const pY      = new Float32Array(PARTICLE_COUNT);
const pVX     = new Float32Array(PARTICLE_COUNT);
const pVY     = new Float32Array(PARTICLE_COUNT);
const pSize   = new Float32Array(PARTICLE_COUNT);
const pAlpha  = new Float32Array(PARTICLE_COUNT);
const pPhase  = new Float32Array(PARTICLE_COUNT);
const pSpeed  = new Float32Array(PARTICLE_COUNT);
const pR      = new Uint8Array(PARTICLE_COUNT);
const pG      = new Uint8Array(PARTICLE_COUNT);
const pB      = new Uint8Array(PARTICLE_COUNT);

// Stars
const sX     = new Float32Array(STAR_COUNT);
const sY     = new Float32Array(STAR_COUNT);
const sSz    = new Float32Array(STAR_COUNT);
const sAlpha = new Float32Array(STAR_COUNT);
const sPhase = new Float32Array(STAR_COUNT);

function initParticles(W: number, H: number) {
  const cx = W / 2;
  const cy = H / 2;
  const scale = W * 0.024;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Fill the actual heart silhouette.  The previous version added a
    // large spiral displacement, which destroyed the heart shape.
    const t = Math.random() * Math.PI * 2;
    const hp = heartXY(t);
    const fill = Math.sqrt(Math.random()) * 0.94;
    const jitter = (Math.random() - 0.5) * 5;

    const x = cx + hp.x * scale * fill + jitter;
    const y = cy + hp.y * scale * fill + jitter;

    pOrigX[i] = x;
    pOrigY[i] = y;
    pX[i] = x;
    pY[i] = y;
    pVX[i] = 0;
    pVY[i] = 0;

    const dist = Math.hypot(x - cx, y - cy);
    const maxDist = W * 0.46;
    const colorFrac = Math.min(1, dist / maxDist);
    const cIdx = Math.floor(colorFrac * (PALETTE.length - 1));
    const cIdx2 = Math.min(PALETTE.length - 1, cIdx + 1);
    const blend = colorFrac * (PALETTE.length - 1) - cIdx;
    const [r1, g1, b1] = PALETTE[cIdx];
    const [r2, g2, b2] = PALETTE[cIdx2];
    pR[i] = Math.round(r1 + (r2 - r1) * blend);
    pG[i] = Math.round(g1 + (g2 - g1) * blend);
    pB[i] = Math.round(b1 + (b2 - b1) * blend);

    pSize[i] = 0.65 + Math.random() * 2.1;
    pAlpha[i] = 0.2 + Math.random() * 0.55;
    pPhase[i] = Math.random() * Math.PI * 2;
    pSpeed[i] = 0.0001 + Math.random() * 0.00025;
  }

  for (let i = 0; i < STAR_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = (0.15 + Math.random() * 0.82) * (W * 0.43);
    sX[i] = cx + Math.cos(angle) * r;
    sY[i] = cy + Math.sin(angle) * r * 0.85;
    sSz[i] = 0.4 + Math.random() * 1.6;
    sAlpha[i] = 0.3 + Math.random() * 0.7;
    sPhase[i] = Math.random() * Math.PI * 2;
  }
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export const NebulaObject: React.FC = () => {
  const { openPersonality, isNebulaOpened } = useSky();

  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);
  const timeRef    = useRef<number>(0);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr  = Math.min(window.devicePixelRatio || 1, 2);
    const W    = 420;
    const H    = 360;

    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    initParticles(W, H);

    const cx = W / 2;
    const cy = H / 2;
    const REPEL_R  = 95;
    const REPEL_F  = 28;
    const SPRING_A = 0.06;
    const DAMP     = 0.88;

    function drawFrame(t: number) {
      ctx.clearRect(0, 0, W, H);

      const ptr = pointerRef.current;

      // ── 1. Soft cosmic gas clouds ──────────
      ctx.globalCompositeOperation = 'source-over';

      const gasPositions = [
        [cx, cy,          W * 0.40, 'rgba(40,53,147,'],   // deep indigo #283593
        [cx, cy - H*0.14, W * 0.30, 'rgba(179,136,255,'], // lavender #B388FF
        [cx - W*0.12, cy, W * 0.24, 'rgba(216,27,96,'],   // dusty pink #D81B60
        [cx + W*0.12, cy, W * 0.24, 'rgba(233,30,99,'],   // magenta #E91E63
      ];
      for (const [gx, gy, gr, color] of gasPositions) {
        const g = ctx.createRadialGradient(gx as number, gy as number, 0, gx as number, gy as number, gr as number);
        g.addColorStop(0,   `${color}0.14)`);
        g.addColorStop(0.4, `${color}0.07)`);
        g.addColorStop(1,   `${color}0)`);
        ctx.globalAlpha = 1;
        ctx.fillStyle   = g;
        ctx.beginPath();
        ctx.arc(gx as number, gy as number, gr as number, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 2. Particles ───────────────────────
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Spring back to original position
        pVX[i] += (pOrigX[i] - pX[i]) * SPRING_A;
        pVY[i] += (pOrigY[i] - pY[i]) * SPRING_A;
        pVX[i] *= DAMP;
        pVY[i] *= DAMP;

        // Cursor repulsion
        if (ptr) {
          const dx   = pX[i] - ptr.x;
          const dy   = pY[i] - ptr.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < REPEL_R && dist > 0.01) {
            const force = (1 - dist / REPEL_R) * REPEL_F;
            pVX[i] += (dx / dist) * force;
            pVY[i] += (dy / dist) * force;
          }
        }

        pX[i] += pVX[i];
        pY[i] += pVY[i];

        // Slow orbital drift
        const ang    = Math.atan2(pOrigY[i] - cy, pOrigX[i] - cx);
        const r      = Math.hypot(pOrigX[i] - cx, pOrigY[i] - cy);
        const newAng = ang + pSpeed[i];
        pOrigX[i]   = cx + Math.cos(newAng) * r;
        pOrigY[i]   = cy + Math.sin(newAng) * r * 0.95;

        // Brightness pulse
        const alpha = pAlpha[i] * (0.6 + 0.4 * Math.sin(t * 0.0016 + pPhase[i]));

        const sz = pSize[i];
        const g  = ctx.createRadialGradient(pX[i], pY[i], 0, pX[i], pY[i], sz * 3.2);
        g.addColorStop(0, `rgba(${pR[i]},${pG[i]},${pB[i]},${alpha})`);
        g.addColorStop(1, `rgba(${pR[i]},${pG[i]},${pB[i]},0)`);
        ctx.globalAlpha = 1;
        ctx.fillStyle   = g;
        ctx.beginPath();
        ctx.arc(pX[i], pY[i], sz * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 3. Stars with 4-Point Lens Flares ───
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < STAR_COUNT; i++) {
        const tw = 0.55 + 0.45 * Math.sin(t * 0.003 + sPhase[i]);
        const sz = sSz[i];
        const a  = sAlpha[i] * tw;
        ctx.globalAlpha = a;
        ctx.fillStyle   = '#ffffff';
        ctx.beginPath();
        ctx.arc(sX[i], sY[i], sz, 0, Math.PI * 2);
        ctx.fill();

        // 4-point lens flares for a few prominent stars (first 8)
        if (i < 8) {
          const flareLen = sz * 6 * tw;
          ctx.strokeStyle = 'rgba(255, 248, 231, ' + (a * 0.75) + ')';
          ctx.lineWidth   = 0.75;
          ctx.beginPath();
          ctx.moveTo(sX[i] - flareLen, sY[i]);
          ctx.lineTo(sX[i] + flareLen, sY[i]);
          ctx.moveTo(sX[i], sY[i] - flareLen);
          ctx.lineTo(sX[i], sY[i] + flareLen);
          ctx.stroke();
        }
      }

      // ── 4. Central bright core glow ────────
      ctx.globalCompositeOperation = 'lighter';
      const coreG = ctx.createRadialGradient(cx, cy - H * 0.04, 0, cx, cy, W * 0.20);
      coreG.addColorStop(0,   'rgba(255,248,231,0.28)'); // #FFF8E7
      coreG.addColorStop(0.3, 'rgba(248,187,208,0.18)'); // #F8BBD0
      coreG.addColorStop(0.65,'rgba(216,27,96,0.08)');   // #D81B60
      coreG.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle   = coreG;
      ctx.beginPath();
      ctx.arc(cx, cy, W * 0.20, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    function loop() {
      timeRef.current += 1;
      drawFrame(timeRef.current);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    // Touch: passive so it doesn't interfere with sky panning
    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length !== 1) return; // ignore pinch
      const rect  = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      pointerRef.current = {
        x: (touch.clientX - rect.left) * (W / rect.width),
        y: (touch.clientY - rect.top)  * (H / rect.height),
      };
    };
    const handleTouchEnd = () => { pointerRef.current = null; };

    canvas.addEventListener('touchmove', handleTouch, { passive: true });
    canvas.addEventListener('touchend',  handleTouchEnd, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('touchmove', handleTouch);
      canvas.removeEventListener('touchend',  handleTouchEnd);
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const W = 420;
    const H = 360;
    pointerRef.current = {
      x: (e.clientX - rect.left) * (W / rect.width),
      y: (e.clientY - rect.top)  * (H / rect.height),
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    pointerRef.current = null;
  }, []);

  return (
    <div
      className={`personality-nebula ${isNebulaOpened ? 'opened' : 'unopened'}`}
      style={{ left: '24%', top: '48%' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => { e.stopPropagation(); openPersonality(); }}
      title="Personality Nebula"
      aria-label="Open personality nebula"
      role="button"
      tabIndex={0}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', pointerEvents: 'none' }}
      />
    </div>
  );
};
