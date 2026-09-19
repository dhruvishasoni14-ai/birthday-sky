import React, { useRef, useState, useEffect } from 'react';
import { useSky } from '../../context/SkyContext';
import { PlanetDesign } from '../../types/celestial';
import { X, Sparkles, RefreshCw, Disc, ArrowRight } from 'lucide-react';

const PLANET_PALETTE = [
  '#f97316', // Orange
  '#ef4444', // Red
  '#eab308', // Yellow
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#64748b', // Slate
  '#ffffff'  // White
];

interface PlanetDesignerModalProps {
  onCompleteDesign?: (design: PlanetDesign) => void;
}

export const PlanetDesignerModal: React.FC<PlanetDesignerModalProps> = ({ onCompleteDesign }) => {
  const { activeModal, setActiveModal, accentColor } = useSky();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushMode, setBrushMode] = useState<'spray' | 'smooth'>('smooth');
  const [brushColor, setBrushColor] = useState('#f97316');
  const [brushSize, setBrushSize] = useState(24);
  const [hasRings, setHasRings] = useState(true);
  const [planetAccentColor, setPlanetAccentColor] = useState(accentColor);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize white circular canvas
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Fill circular planet base
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
  };

  useEffect(() => {
    if (activeModal === 'planet-designer') {
      setTimeout(initCanvas, 50);
    }
  }, [activeModal]);

  if (activeModal !== 'planet-designer') return null;

  // Painting functions strictly constrained inside circular planet
  const paintOnCanvas = (x: number, y: number, isMove = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    // Clip strictly to circular planet boundary
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
    ctx.clip();

    if (brushMode === 'smooth') {
      ctx.fillStyle = brushColor;
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (isMove && lastPosRef.current) {
        ctx.beginPath();
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Spray paint brush effect
      const density = brushSize * 1.5;
      ctx.fillStyle = brushColor;
      for (let i = 0; i < density; i++) {
        const offsetX = (Math.random() - 0.5) * brushSize * 2;
        const offsetY = (Math.random() - 0.5) * brushSize * 2;
        const dist = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
        if (dist <= brushSize) {
          const radius = Math.random() * 2 + 0.5;
          ctx.beginPath();
          ctx.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
    lastPosRef.current = { x, y };
  };

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);
    lastPosRef.current = { x, y };
    paintOnCanvas(x, y, false);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getCanvasCoords(e);
    paintOnCanvas(x, y, true);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(false);
    lastPosRef.current = null;
  };

  const handleProceedToStory = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas ? canvas.toDataURL() : '';

    const design: PlanetDesign = {
      canvasDataUrl: dataUrl,
      hasRings,
      accentColor: planetAccentColor
    };

    if (onCompleteDesign) {
      onCompleteDesign(design);
    }
    setActiveModal('story-studio');
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content planet-designer-window glass-panel animate-scale-in">
        {/* Header */}
        <div className="studio-header">
          <div>
            <div className="eyebrow">RELIVE A DAY · STEP 1</div>
            <h2>Planet Designer 🪐</h2>
            <p>Customize your planet canvas with spray paint, rings, and glowing accents.</p>
          </div>
          <button
            type="button"
            className="close-modal-btn"
            onClick={() => setActiveModal(null)}
          >
            <X size={22} />
          </button>
        </div>

        <div className="planet-designer-body">
          {/* Controls Panel */}
          <div className="designer-tools-panel">
            {/* Color Palette */}
            <div className="designer-tool-section">
              <label className="input-label">Spray Paint Palette</label>
              <div className="color-palette-grid">
                {PLANET_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`palette-color-btn ${brushColor === c ? 'active' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setBrushColor(c)}
                    title={c}
                  />
                ))}
                <label className="custom-color-input-btn" title="Custom color picker">
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="hidden-color-input"
                  />
                  <span>+</span>
                </label>
              </div>
            </div>

            {/* Brush Mode Switcher */}
            <div className="designer-tool-section">
              <label className="input-label">Brush Type</label>
              <div className="brush-mode-switches">
                <button
                  type="button"
                  className={`studio-tab-pill ${brushMode === 'smooth' ? 'active' : ''}`}
                  onClick={() => setBrushMode('smooth')}
                >
                  Smooth Brush
                </button>
                <button
                  type="button"
                  className={`studio-tab-pill ${brushMode === 'spray' ? 'active' : ''}`}
                  onClick={() => setBrushMode('spray')}
                >
                  Cosmic Spray
                </button>
              </div>
            </div>

            {/* Brush Size Slider */}
            <div className="designer-tool-section">
              <div className="label-with-val">
                <label className="input-label">{brushMode === 'smooth' ? 'Smooth Brush' : 'Spray Brush'} Size</label>
                <span className="val-badge">{brushSize}px</span>
              </div>
              <input
                type="range"
                min={8}
                max={60}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="size-slider full-width"
              />
            </div>

            {/* Planetary Rings Toggle */}
            <div className="designer-tool-section">
              <label className="input-label">Planetary Features</label>
              <label className="toggle-checkbox-row">
                <input
                  type="checkbox"
                  checked={hasRings}
                  onChange={(e) => setHasRings(e.target.checked)}
                />
                <span>Include Planetary Rings</span>
              </label>
            </div>

            {/* Accent Color (Controls Planet Glow & Ring Color) */}
            <div className="designer-tool-section">
              <label className="input-label">Planet Glow & Ring Accent</label>
              <div className="accent-color-row">
                {['#B89CFF', '#FF9FCB', '#73D4E7', '#FFB27D', '#A7E89B', '#FFE58A'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`color-dot-large ${planetAccentColor === c ? 'active' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setPlanetAccentColor(c)}
                  />
                ))}
                <label className="custom-color-input-btn" title="Custom accent color">
                  <input
                    type="color"
                    value={planetAccentColor}
                    onChange={(e) => setPlanetAccentColor(e.target.value)}
                    className="hidden-color-input"
                  />
                  <span>+</span>
                </label>
              </div>
            </div>

            {/* Clear / Reset Canvas */}
            <button
              type="button"
              className="secondary-action-btn"
              onClick={initCanvas}
            >
              <RefreshCw size={15} />
              <span>Reset Canvas</span>
            </button>
          </div>

          {/* Planet Circular Canvas Viewport */}
          <div className="designer-canvas-viewport">
            <div
              className="planet-render-wrapper"
              style={{
                boxShadow: `0 0 50px ${planetAccentColor}44, 0 0 100px ${planetAccentColor}22`
              }}
            >
              {/* Planetary Ring Preview */}
              {hasRings && (
                <div
                  className="planet-ring-preview"
                  style={{
                    borderColor: planetAccentColor,
                    boxShadow: `0 0 16px ${planetAccentColor}`
                  }}
                />
              )}

              {/* HTML5 Circular Canvas */}
              <canvas
                ref={canvasRef}
                width={280}
                height={280}
                className="circular-planet-canvas"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              />
            </div>
            <div className="canvas-helper-text">
              ✨ Click and drag over the planet to spray paint your custom world!
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="studio-footer">
          <span className="footer-info">
            Step 1 of 2: Design your planet world before authoring your story
          </span>
          <button
            type="button"
            className="continue-button"
            onClick={handleProceedToStory}
          >
            <span>Proceed to Story Studio</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
