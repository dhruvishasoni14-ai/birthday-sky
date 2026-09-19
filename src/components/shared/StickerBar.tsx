import React, { useState, useRef } from 'react';
import { StickerItem } from '../../types/celestial';
import { Sparkles, Upload, Trash2, RotateCw, ZoomIn, ZoomOut, Copy } from 'lucide-react';

interface StickerBarProps {
  onAddSticker: (stickerSymbol: string, isCustom?: boolean, customUrl?: string) => void;
  selectedSticker?: StickerItem | null;
  onUpdateSelectedSticker?: (updated: Partial<StickerItem>) => void;
  onDeleteSelectedSticker?: () => void;
  onDuplicateSelectedSticker?: () => void;
}

const STICKER_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'small', label: 'Small' },
  { id: 'birthday', label: 'Birthday' },
  { id: 'flowers', label: 'Flowers' },
  { id: 'cosmic', label: 'Cosmic' },
  { id: 'custom', label: 'Custom Stickers' }
];

const STICKERS_DATA = [
  { symbol: '🌸', category: 'small' },
  { symbol: '🦋', category: 'small' },
  { symbol: '🎀', category: 'small' },
  { symbol: '💗', category: 'small' },
  { symbol: '✨', category: 'small' },
  { symbol: '💫', category: 'small' },
  { symbol: '🎂', category: 'birthday' },
  { symbol: '🎈', category: 'birthday' },
  { symbol: '🎁', category: 'birthday' },
  { symbol: '🎊', category: 'birthday' },
  { symbol: '🧁', category: 'birthday' },
  { symbol: '🕯️', category: 'birthday' },
  { symbol: '💐', category: 'flowers' },
  { symbol: '🌷', category: 'flowers' },
  { symbol: '🌹', category: 'flowers' },
  { symbol: '🌿', category: 'flowers' },
  { symbol: '🌻', category: 'flowers' },
  { symbol: '⭐', category: 'cosmic' },
  { symbol: '🌙', category: 'cosmic' },
  { symbol: '🪐', category: 'cosmic' },
  { symbol: '🚀', category: 'cosmic' },
  { symbol: '🛸', category: 'cosmic' },
  { symbol: '🌌', category: 'cosmic' }
];

import { useSky } from '../../context/SkyContext';

export const StickerBar: React.FC<StickerBarProps> = ({
  onAddSticker,
  selectedSticker,
  onUpdateSelectedSticker,
  onDeleteSelectedSticker,
  onDuplicateSelectedSticker
}) => {
  const { currentUser, addUploadedSticker } = useSky();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [localCustomStickers, setLocalCustomStickers] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Combine account-persisted stickers with any local session uploads
  const savedStickers = currentUser?.uploadedStickers || [];
  const allCustomStickers = Array.from(new Set([...savedStickers, ...localCustomStickers]));

  const filteredStickers =
    activeCategory === 'all' || activeCategory === 'custom'
      ? (activeCategory === 'custom' ? [] : STICKERS_DATA)
      : STICKERS_DATA.filter((s) => s.category === activeCategory);

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setLocalCustomStickers((prev) => [dataUrl, ...prev]);
        addUploadedSticker(dataUrl);
        onAddSticker('custom', true, dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="sticker-system-wrapper">
      {/* Category Filter Tabs */}
      <div className="sticker-tabs">
        {STICKER_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`sticker-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Stickers Tray & Custom Sticker Area */}
      <div className={`sticker-picker-layout ${activeCategory === 'all' ? 'sticker-picker-all' : 'sticker-picker-category'}`}>
      <div className="sticker-tray-scroll">
        {/* Custom Sticker Upload Button */}
        {activeCategory === 'custom' && <button
          type="button"
          className="sticker-button upload-btn custom-upload-button"
          onClick={() => fileInputRef.current?.click()}
          title="Upload your own custom sticker"
        >
          <Upload size={16} />
          <span>Custom Stickers</span>
        </button>}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleCustomUpload}
        />

        {/* Uploaded Custom Stickers */}
        {allCustomStickers.map((url, idx) => (
          <button
            key={`custom-${idx}`}
            type="button"
            className="sticker-button custom-preview-btn"
            onClick={() => onAddSticker('custom', true, url)}
            title="Add this custom sticker"
          >
            <img src={url} alt="Custom sticker" />
          </button>
        ))}

        {/* Standard Stickers */}
        {filteredStickers.map((s, idx) => (
          <button
            key={`${s.symbol}-${idx}`}
            type="button"
            className="sticker-button"
            onClick={() => onAddSticker(s.symbol, false)}
            title={`Add ${s.symbol}`}
          >
            {s.symbol}
          </button>
        ))}
      </div>
      {selectedSticker && (
        <div className="sticker-selected-preview" aria-label="Selected sticker preview">
          <span className="sticker-preview-label">Selected sticker</span>
          <div className="sticker-preview-art">
            {selectedSticker.isCustom && selectedSticker.customUrl ? (
              <img src={selectedSticker.customUrl} alt="Selected custom sticker" />
            ) : (
              selectedSticker.symbol
            )}
          </div>
        </div>
      )}
      </div>

      {/* Floating Toolbar when a sticker on canvas is selected */}
      {selectedSticker && onUpdateSelectedSticker && (
        <div className="selected-sticker-toolbar">
          <span className="toolbar-info">Editing Sticker:</span>
          
          <button
            type="button"
            onClick={() => onUpdateSelectedSticker({ scale: Math.max(0.5, (selectedSticker.scale || 1) - 0.2) })}
            title="Smaller"
          >
            <ZoomOut size={15} />
          </button>
          
          <button
            type="button"
            onClick={() => onUpdateSelectedSticker({ scale: Math.min(3.5, (selectedSticker.scale || 1) + 0.2) })}
            title="Larger"
          >
            <ZoomIn size={15} />
          </button>

          <button
            type="button"
            onClick={() => onUpdateSelectedSticker({ rotation: ((selectedSticker.rotation || 0) + 15) % 360 })}
            title="Rotate"
          >
            <RotateCw size={15} />
          </button>

          {onDuplicateSelectedSticker && (
            <button
              type="button"
              onClick={onDuplicateSelectedSticker}
              title="Duplicate"
            >
              <Copy size={15} />
            </button>
          )}

          {onDeleteSelectedSticker && (
            <button
              type="button"
              className="danger-btn"
              onClick={onDeleteSelectedSticker}
              title="Delete Sticker"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
