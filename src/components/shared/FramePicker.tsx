import React from 'react';

interface FramePickerProps {
  selectedFrame: string;
  onChange: (frame: string) => void;
}

export const AVAILABLE_FRAMES = [
  { id: 'none', label: 'Minimal', preview: 'border-simple' },
  { id: 'ornate-gold', label: 'Golden Ornate', image: '/frames/download.png' },
  { id: 'celestial-arch', label: 'Celestial Arch', image: '/frames/download (1).png' },
  { id: 'vintage-scroll', label: 'Vintage Scroll', image: '/frames/download (2).png' },
  { id: 'royal-crest', label: 'Royal Crest', image: '/frames/download (3).png' },
  { id: 'starlight-border', label: 'Starlight', image: '/frames/download (4).png' },
  { id: 'cosmic-glow', label: 'Cosmic Border', preview: 'border-glow' }
];

export const FramePicker: React.FC<FramePickerProps> = ({ selectedFrame, onChange }) => {
  return (
    <div className="frame-picker-container">
      <div className="sub-label">Select Frame</div>
      <div className="frame-options-grid">
        {AVAILABLE_FRAMES.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`frame-card-option ${selectedFrame === f.id ? 'active' : ''}`}
            onClick={() => onChange(f.id)}
            title={f.label}
          >
            <div className="frame-thumb-box">
              {f.image ? (
                <img src={f.image} alt={f.label} className="frame-thumb-img" />
              ) : (
                <div className={`frame-thumb-css ${f.preview || ''}`} />
              )}
            </div>
            <span className="frame-name">{f.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
