import React, { useEffect, useRef } from 'react';
import { useSky } from '../../context/SkyContext';

// ─────────────────────────────────────────────
// Particle pool using typed arrays (no GC pressure per frame)
// ─────────────────────────────────────────────
const PARTICLE_COUNT = 700;

// angle (rad), radius (px), speed (rad/frame), brightness, size, phase, colorIndex
const pAngle    = new Float32Array(PARTICLE_COUNT);
const pRadius   = new Float32Array(PARTICLE_COUNT);
const pSpeed    = new Float32Array(PARTICLE_COUNT);
const pBright   = new Float32Array(PARTICLE_COUNT);
const pSize     = new Float32Array(PARTICLE_COUNT);
const pPhase    = new Float32Array(PARTICLE_COUNT);
const pColorIdx = new Uint8Array(PARTICLE_COUNT);

// Color stops: radius-dependent (0 = innermost, 5 = outermost)
// white → pale-yellow → golden → amber → orange → copper
const COLOR_INNER = [
  [255, 255, 255], // 0 brilliant white
  [255, 252, 220], // 1 pale yellow-white
  [255, 235, 130], // 2 golden yellow
  [255, 200,  60], // 3 warm amber
  [255, 145,  30], // 4 orange
  [210,  90,  20], // 5 copper/deep orange
];

function initParticles(W: number) {
  const coreR   = W * 0.155; // event horizon radius
  const maxR    = W * 0.475; // outer disk edge
  const diskH   = W * 0.07;  // vertical half-thickness of disk at outer edge

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const r = coreR + Math.pow(Math.random(), 0.6) * (maxR - coreR);
    pRadius[i]   = r;
    pAngle[i]    = Math.random() * Math.PI * 2;
    // Faster inner orbits (Keplerian: ω ∝ r^-1.5)
    pSpeed[i]    = (0.0003 + 0.0008 / (r / coreR)) * (Math.random() * 0.4 + 0.8);
    pBright[i]   = 0.35 + Math.random() * 0.65;
    pSize[i]     = 0.5 + Math.random() * (r < coreR * 2.5 ? 2.0 : 1.2);
    pPhase[i]    = Math.random() * Math.PI * 2;

    // color index based on radius fraction
    const frac = (r - coreR) / (maxR - coreR);
    pColorIdx[i] = Math.min(5, Math.floor(frac * 6));
  }
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export const BlackHoleObject: React.FC = () => {
  const { openBlackHole, isBlackHoleOpened } = useSky();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const timeRef   = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr  = Math.min(window.devicePixelRatio || 1, 2);
    const SIZE = 300; // logical size in px
    canvas.width  = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width  = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;

    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const cx    = SIZE / 2;   // canvas center X
    const cy    = SIZE / 2;   // canvas center Y
    const coreR = SIZE * 0.155;
    const maxR  = SIZE * 0.475;

    initParticles(SIZE);

    // ── helpers ──────────────────────────────
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    function drawRadialGlow(
      x: number, y: number,
      inner: number, outer: number,
      colorInner: string, colorOuter: string,
      alpha: number
    ) {
      const g = ctx.createRadialGradient(x, y, inner, x, y, outer);
      g.addColorStop(0, colorInner);
      g.addColorStop(1, colorOuter);
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = g;
      ctx.beginPath();
      ctx.arc(x, y, outer, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── draw one frame ────────────────────────
    function draw(t: number) {
      ctx.clearRect(0, 0, SIZE, SIZE);

      // ── 1. Deep space warp halo ──
      ctx.globalCompositeOperation = 'source-over';
      drawRadialGlow(cx, cy, coreR * 1.0, coreR * 3.2,
        'rgba(0,0,0,0)', 'rgba(0,0,12,0)', 0);

      // very subtle blue-navy outer glow suggesting spacetime distortion
      const warpG = ctx.createRadialGradient(cx, cy, coreR * 1.5, cx, cy, maxR * 1.15);
      warpG.addColorStop(0, 'rgba(6,10,40,0)');
      warpG.addColorStop(0.5, 'rgba(10,15,60,0.18)');
      warpG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = warpG;
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // ── 2. Accretion disk particles ─────────
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        pAngle[i] += pSpeed[i];

        const angle  = pAngle[i];
        const r      = pRadius[i];
        // Disk is tilted ~15°: project y by 0.26 (sin15°≈0.26)
        const px     = cx + r * Math.cos(angle);
        const py     = cy + r * Math.sin(angle) * 0.26;

        // Brightness flicker
        const bright = pBright[i] * (0.7 + 0.3 * Math.sin(t * 0.0018 + pPhase[i]));

        const [R, G, B] = COLOR_INNER[pColorIdx[i]];
        const sz        = pSize[i];
        const radiusFrac = (r - coreR) / (maxR - coreR);
        // Inner particles contribute more to the overall brightness
        const basealpha = lerp(0.8, 0.18, radiusFrac) * bright;

        const g = ctx.createRadialGradient(px, py, 0, px, py, sz * 2.8);
        g.addColorStop(0, `rgba(${R},${G},${B},${basealpha})`);
        g.addColorStop(1, `rgba(${R},${G},${B},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, sz * 2.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 3. Inner hot corona ring (bright band just outside event horizon) ──
      ctx.globalCompositeOperation = 'lighter';
      const coronaG = ctx.createRadialGradient(cx, cy, coreR * 0.9, cx, cy, coreR * 1.9);
      coronaG.addColorStop(0,   'rgba(255,255,220,0)');
      coronaG.addColorStop(0.35,'rgba(255,255,180,0.28)');
      coronaG.addColorStop(0.6, 'rgba(255,210, 80,0.15)');
      coronaG.addColorStop(1,   'rgba(255,120, 20,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = coronaG;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 1.9, 0, Math.PI * 2);
      ctx.fill();

      // ── 4. Gravitational lensing arcs (bent disk above & below) ──
      // These simulate how a disk behind the hole appears as arcs curving above/below
      ctx.globalCompositeOperation = 'lighter';

      // Upper arc
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy - coreR * 0.22, coreR * 1.72, coreR * 0.62, 0, Math.PI, Math.PI * 2);
      const arcUpG = ctx.createLinearGradient(cx - coreR * 1.7, cy, cx + coreR * 1.7, cy);
      arcUpG.addColorStop(0,   'rgba(255,200,60,0)');
      arcUpG.addColorStop(0.25,'rgba(255,240,160,0.55)');
      arcUpG.addColorStop(0.5, 'rgba(255,255,210,0.75)');
      arcUpG.addColorStop(0.75,'rgba(255,240,160,0.55)');
      arcUpG.addColorStop(1,   'rgba(255,200,60,0)');
      ctx.strokeStyle = arcUpG;
      ctx.lineWidth   = coreR * 0.22;
      ctx.globalAlpha = 0.9;
      ctx.shadowColor = 'rgba(255,240,120,0.9)';
      ctx.shadowBlur  = 12;
      ctx.stroke();
      ctx.restore();

      // Lower arc (slightly dimmer, represents the disk bent below)
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy + coreR * 0.22, coreR * 1.72, coreR * 0.62, 0, 0, Math.PI);
      const arcDnG = ctx.createLinearGradient(cx - coreR * 1.7, cy, cx + coreR * 1.7, cy);
      arcDnG.addColorStop(0,   'rgba(255,130,20,0)');
      arcDnG.addColorStop(0.25,'rgba(255,180,70,0.40)');
      arcDnG.addColorStop(0.5, 'rgba(255,220,120,0.55)');
      arcDnG.addColorStop(0.75,'rgba(255,180,70,0.40)');
      arcDnG.addColorStop(1,   'rgba(255,130,20,0)');
      ctx.strokeStyle = arcDnG;
      ctx.lineWidth   = coreR * 0.18;
      ctx.globalAlpha = 0.70;
      ctx.shadowColor = 'rgba(255,160,40,0.7)';
      ctx.shadowBlur  = 10;
      ctx.stroke();
      ctx.restore();

      // ── 5. Central black void (event horizon) ──
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;
      ctx.fillStyle   = '#000000';
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      // ── 6. Photon ring (thin, brilliant, tight to the void) ──
      ctx.globalCompositeOperation = 'lighter';
      const shimmer = 0.72 + 0.28 * Math.sin(t * 0.0025);

      // Outer soft photon halo
      ctx.save();
      const photonHaloG = ctx.createRadialGradient(cx, cy, coreR * 0.92, cx, cy, coreR * 1.22);
      photonHaloG.addColorStop(0, `rgba(255,255,255,${0.0})`);
      photonHaloG.addColorStop(0.5,`rgba(255,255,220,${0.35 * shimmer})`);
      photonHaloG.addColorStop(1,  `rgba(255,200,100,${0.0})`);
      ctx.fillStyle   = photonHaloG;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 1.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Hard thin ring on top
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.beginPath();
      ctx.arc(cx, cy, coreR + 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,240,${0.6 * shimmer})`;
      ctx.lineWidth   = 2.2;
      ctx.shadowColor = 'rgba(255,255,200,0.8)';
      ctx.shadowBlur  = 6;
      ctx.globalAlpha = 1;
      ctx.stroke();
      ctx.restore();

      // ── 7. Re-draw void on top so photon ring doesn't bleed inward ──
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;
      ctx.fillStyle   = '#000000';
      ctx.beginPath();
      ctx.arc(cx, cy, coreR - 0.5, 0, Math.PI * 2);
      ctx.fill();

      // ── 8. Subtle outer disk fade (very soft outermost glow) ──
      ctx.globalCompositeOperation = 'lighter';
      const outerG = ctx.createRadialGradient(cx, cy, maxR * 0.55, cx, cy, maxR * 1.08);
      outerG.addColorStop(0, 'rgba(200,80,10,0.12)');
      outerG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle   = outerG;
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * 1.08, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;
    }

    // ── animation loop ─────────────────────────
    function loop() {
      timeRef.current += 1;
      draw(timeRef.current);
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className={`sky-black-hole-wrapper ${isBlackHoleOpened ? 'opened' : 'unopened'}`}
      style={{
        position: 'absolute',
        left: '84%',
        top: '82%',
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        zIndex: 16,
        width: '300px',
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
      onClick={(e) => {
        e.stopPropagation();
        openBlackHole();
      }}
      title="Wish & Prayer Void"
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', pointerEvents: 'none' }}
      />
    </div>
  );
};
