import React, { useEffect, useRef, useState } from 'react';
import { useSky } from '../../context/SkyContext';
import { PlanetDesign } from '../../types/celestial';
import { X, Undo2, Eraser, ArrowRight, RotateCcw } from 'lucide-react';

const COLORS = ['#f97316', '#ef4444', '#facc15', '#38bdf8', '#4ade80', '#a855f7', '#ec4899', '#ffffff'];
const ACCENTS = ['#B89CFF', '#FF9FCB', '#73D4E7', '#FFB27D', '#A7E89B', '#FFE58A'];
type Brush = 'normal' | 'translucent' | 'sparkle' | 'blend';

interface PlanetDesignerModalProps { onCompleteDesign?: (design: PlanetDesign) => void; }

export const PlanetDesignerModal: React.FC<PlanetDesignerModalProps> = ({ onCompleteDesign }) => {
  const { activeModal, setActiveModal, accentColor } = useSky();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const history = useRef<ImageData[]>([]);
  const [brush, setBrush] = useState<Brush>('normal');
  const [color, setColor] = useState('#f97316');
  const [size, setSize] = useState(24);
  const [eraserSize, setEraserSize] = useState(28);
  const [eraser, setEraser] = useState(false);
  const [accent, setAccent] = useState(accentColor);
  const [hasRings, setHasRings] = useState(true);

  const planetPath = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.beginPath(); ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
  };
  const paintBase = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    planetPath(ctx, canvas);
    ctx.fillStyle = '#fff';
    ctx.fill();

    history.current = [];
  };
  useEffect(() => { if (activeModal === 'planet-designer') setTimeout(paintBase, 40); }, [activeModal]);

  const snapshot = () => {
    const canvas = drawingCanvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (canvas && ctx) {
      history.current.push(
        ctx.getImageData(0, 0, canvas.width, canvas.height)
      );
    }
  };
  const coords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = drawingCanvasRef.current!;
    const r = c.getBoundingClientRect();

    return {
      x: (e.clientX - r.left) * c.width / r.width,
      y: (e.clientY - r.top) * c.height / r.height
    };
  }; const draw = (x: number, y: number, moving: boolean) => {
    const c = drawingCanvasRef.current;
    if (!c) return;

    const ctx = c.getContext('2d');
    if (!ctx) return;

    const radius = eraser ? eraserSize / 2 : size / 2;

    ctx.save();

    // Keep every brush inside the planet.
    planetPath(ctx, c);
    ctx.clip();

    // ─────────────────────────────────────────
    // ERASER
    // ─────────────────────────────────────────
    if (eraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1;
      ctx.lineWidth = eraserSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (moving && lastPoint.current) {
        ctx.beginPath();
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ─────────────────────────────────────────
    // NORMAL — smooth solid paint
    // ─────────────────────────────────────────
    else if (brush === 'normal') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (moving && lastPoint.current) {
        ctx.beginPath();
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ─────────────────────────────────────────
    // TRANSLUCENT — soft transparent paint
    // ─────────────────────────────────────────
    else if (brush === 'translucent') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (moving && lastPoint.current) {
        ctx.beginPath();
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    }

    // ─────────────────────────────────────────
    // SPARKLE — scattered tiny stars
    // ─────────────────────────────────────────
    else if (brush === 'sparkle') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = color;

      const count = moving ? 4 : 9;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius * 1.4;

        const px = x + Math.cos(angle) * distance;
        const py = y + Math.sin(angle) * distance;

        const dotSize = Math.max(
          1.5,
          size * (0.06 + Math.random() * 0.08)
        );

        ctx.beginPath();
        ctx.arc(px, py, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Small bright center
      ctx.beginPath();
      ctx.arc(x, y, Math.max(2, size / 10), 0, Math.PI * 2);
      ctx.fill();
    }

    // ─────────────────────────────────────────
    // BLEND — softly mixes nearby paint
    // ─────────────────────────────────────────
    else if (brush === 'blend') {
      const blendSize = Math.max(8, size);

      /*
       * We temporarily sample the drawing underneath the brush,
       * blur it slightly, then paint that blended result back.
       * This creates a soft local colour-mixing effect rather
       * than simply painting another colour on top.
       */

      const sampleSize = Math.ceil(blendSize * 1.5);
      const sx = Math.max(
        0,
        Math.min(c.width - sampleSize, x - sampleSize / 2)
      );
      const sy = Math.max(
        0,
        Math.min(c.height - sampleSize, y - sampleSize / 2)
      );

      const temp = document.createElement('canvas');
      temp.width = sampleSize;
      temp.height = sampleSize;

      const tempCtx = temp.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(
          c,
          sx,
          sy,
          sampleSize,
          sampleSize,
          0,
          0,
          sampleSize,
          sampleSize
        );

        tempCtx.globalAlpha = 0.8;
        tempCtx.filter = `blur(${Math.max(2, blendSize / 7)}px)`;

        tempCtx.drawImage(
          temp,
          0,
          0,
          sampleSize,
          sampleSize
        );

        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.65;

        ctx.drawImage(
          temp,
          0,
          0,
          sampleSize,
          sampleSize,
          sx,
          sy,
          sampleSize,
          sampleSize
        );

        ctx.globalAlpha = 1;
      }
    }

    ctx.restore();

    lastPoint.current = { x, y };
  };
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => { snapshot(); drawingRef.current = true; lastPoint.current = coords(e); draw(lastPoint.current.x, lastPoint.current.y, false); e.currentTarget.setPointerCapture(e.pointerId); };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => { if (drawingRef.current) { const p = coords(e); draw(p.x, p.y, true); } };
  const up = () => { drawingRef.current = false; lastPoint.current = null; };
  const undo = () => {
    const c = drawingCanvasRef.current;
    const ctx = c?.getContext('2d');
    const state = history.current.pop();

    if (c && ctx && state) {
      ctx.putImageData(state, 0, 0);
    }
  };
  const proceed = () => {
    const baseCanvas = canvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;

    if (!baseCanvas || !drawingCanvas) return;

    const composite = document.createElement('canvas');
    composite.width = baseCanvas.width;
    composite.height = baseCanvas.height;

    const ctx = composite.getContext('2d');
    if (!ctx) return;

    // Draw the white planet base
    ctx.drawImage(baseCanvas, 0, 0);

    // Draw the user's artwork on top
    ctx.drawImage(drawingCanvas, 0, 0);

    const design: PlanetDesign = {
      canvasDataUrl: composite.toDataURL('image/png'),
      hasRings,
      accentColor: accent
    };

    onCompleteDesign?.(design);
    setActiveModal('story-studio');
  };
  if (activeModal !== 'planet-designer') return null;

  const brushes: { id: Brush; label: string; mark: string }[] = [
    { id: 'normal', label: 'Normal', mark: '●' },
    { id: 'translucent', label: 'Translucent', mark: '◐' },
    { id: 'sparkle', label: 'Sparkle', mark: '✦' },
    { id: 'blend', label: 'Blend', mark: '◌' }
  ];
  return <div className="modal-backdrop"><div className="modal-content planet-designer-window glass-panel animate-scale-in">
    <header className="studio-header"><div><div className="eyebrow">RELIVE A DAY · STEP 1</div><h2>Planet Designer</h2><p>Paint a small world for your story.</p></div><button type="button" className="close-modal-btn" onClick={() => setActiveModal(null)} aria-label="Close"><X size={22} /></button></header>
    <div className="planet-editor-layout"><aside className="planet-tool-panel">
      <section className="planet-tool-section"><h3>Brush</h3><div className="planet-brush-grid">{brushes.map((b) => <button type="button" key={b.id} className={`planet-brush-btn ${!eraser && brush === b.id ? 'active' : ''}`} onClick={() => { setBrush(b.id); setEraser(false); }}><span>{b.mark}</span>{b.label}</button>)}</div></section>
      <section className="planet-tool-section"><h3>Brush Color</h3><div className="planet-color-row">{COLORS.map(c => <button type="button" key={c} aria-label={`Color ${c}`} className={`planet-color-swatch ${color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => { setColor(c); setEraser(false); }} />)}<label className="planet-color-picker"><input type="color" value={color} onChange={e => { setColor(e.target.value); setEraser(false); }} />+</label></div></section>
      <section className="planet-tool-section"><div className="planet-section-heading"><h3>Brush Size</h3><output>{size}px</output></div><input aria-label="Brush size" type="range" min="6" max="56" value={size} onChange={e => setSize(Number(e.target.value))} /></section>
      <section className="planet-tool-section"><button type="button" className="planet-undo-btn" disabled={!history.current.length} onClick={undo}><Undo2 size={16} /> Undo</button></section>
      <section className="planet-tool-section">
        <div className="planet-section-heading">
          <h3>Eraser</h3>
          <output>{eraserSize}px</output>
        </div>

        <input
          aria-label="Eraser size"
          type="range"
          min="6"
          max="60"
          value={eraserSize}
          onChange={e => {
            setEraserSize(Number(e.target.value));
            setEraser(true);
          }}
        />
      </section>      <section className="planet-tool-section"><h3>Accent Color</h3><div className="planet-color-row">{ACCENTS.map(c => <button type="button" key={c} aria-label={`Accent ${c}`} className={`planet-color-swatch ${accent === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setAccent(c)} />)}<label className="planet-color-picker"><input type="color" value={accent} onChange={e => setAccent(e.target.value)} />+</label></div></section>
      <label className="planet-rings-toggle"><input type="checkbox" checked={hasRings} onChange={e => setHasRings(e.target.checked)} /> Planetary rings</label>
    </aside>

      <section className="planet-canvas-panel">
        <div
          className="planet-canvas-stage"
          style={{ '--planet-accent': accent } as React.CSSProperties}
        >
          {hasRings && (
            <div
              className="planet-ring-preview"
              style={{
                borderColor: accent,
                boxShadow: `0 0 18px ${accent}`
              }}
            />
          )}

          <div className="planet-canvas-stack">
            <canvas
              ref={canvasRef}
              width={420}
              height={420}
              className="circular-planet-canvas planet-base-canvas"
            />

            <canvas
              ref={drawingCanvasRef}
              width={420}
              height={420}
              className="circular-planet-canvas planet-drawing-canvas"
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
            />
          </div>
        </div>

        <p>
          Draw inside the planet surface.{' '}
          {eraser ? 'Eraser active.' : 'Choose a brush and color.'}
        </p>

        <div className="planet-studio-actions">
          <button
            type="button"
            className="studio-primary-btn"
            onClick={proceed}
          >
            Next
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  </div>
  </div>;
};

export default PlanetDesignerModal; 