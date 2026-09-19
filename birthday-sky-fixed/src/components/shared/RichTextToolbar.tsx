import React from 'react';
import { FontType, TextStyleConfig } from '../../types/editor';
import { Bold, Italic, Underline } from 'lucide-react';

interface RichTextToolbarProps {
  styleConfig: TextStyleConfig;
  onChange: (newConfig: TextStyleConfig) => void;
  label?: string;
  showSize?: boolean;
  minSize?: number;
  maxSize?: number;
}

const FONTS: { label: string; value: FontType }[] = [
  { label: 'Elegant', value: 'elegant' },
  { label: 'Modern', value: 'modern' },
  { label: 'Playful', value: 'playful' },
  { label: 'Handwritten', value: 'handwritten' },
  { label: 'Cursive', value: 'cursive' },
  { label: 'Typewriter', value: 'typewriter' }
];

const PRESET_COLORS = [
  '#ffffff',
  '#FFE58A',
  '#FF9FCB',
  '#B89CFF',
  '#73D4E7',
  '#FFB27D',
  '#A7E89B',
  '#1e1b4b'
];

export const RichTextToolbar: React.FC<RichTextToolbarProps> = ({
  styleConfig,
  onChange,
  label,
  showSize = true,
  minSize = 12,
  maxSize = 48
}) => {
  return (
    <div className="rich-text-toolbar">
      {label && <div className="toolbar-label">{label}</div>}

      <div className="toolbar-controls">
        {/* Font Selection */}
        <select
          value={styleConfig.font}
          onChange={(e) => onChange({ ...styleConfig, font: e.target.value as FontType })}
          className="font-select"
          aria-label="Font family"
        >
          {FONTS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        {/* Font Size Slider */}
        {showSize && (
          <div className="size-slider-wrapper" title={`Size: ${styleConfig.size}px`}>
            <input
              type="range"
              min={minSize}
              max={maxSize}
              value={styleConfig.size}
              onChange={(e) => onChange({ ...styleConfig, size: Number(e.target.value) })}
              className="size-slider"
              aria-label="Font size"
            />
            <span className="size-label">{styleConfig.size}px</span>
          </div>
        )}

        {/* Formatting Toggles */}
        <div className="formatting-buttons">
          <button
            type="button"
            className={`tool-btn ${styleConfig.bold ? 'active' : ''}`}
            onClick={() => onChange({ ...styleConfig, bold: !styleConfig.bold })}
            title="Bold"
            aria-label="Bold"
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            className={`tool-btn ${styleConfig.italic ? 'active' : ''}`}
            onClick={() => onChange({ ...styleConfig, italic: !styleConfig.italic })}
            title="Italic"
            aria-label="Italic"
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            className={`tool-btn ${styleConfig.underline ? 'active' : ''}`}
            onClick={() => onChange({ ...styleConfig, underline: !styleConfig.underline })}
            title="Underline"
            aria-label="Underline"
          >
            <Underline size={15} />
          </button>
        </div>

        {/* Color Picker Swatches */}
        <div className="color-palette-small">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`color-dot ${styleConfig.color.toLowerCase() === c.toLowerCase() ? 'selected' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => onChange({ ...styleConfig, color: c })}
              title={c}
              aria-label={`Color ${c}`}
            />
          ))}
          <label className="custom-color-input-btn" title="Custom text color">
            <input
              type="color"
              value={styleConfig.color}
              onChange={(e) => onChange({ ...styleConfig, color: e.target.value })}
              className="hidden-color-input"
            />
            <span>+</span>
          </label>
        </div>
      </div>
    </div>
  );
};
