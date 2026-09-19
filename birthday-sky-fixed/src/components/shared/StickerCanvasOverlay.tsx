import React, { useRef } from 'react';
import { StickerItem } from '../../types/celestial';

interface StickerCanvasOverlayProps {
  stickers: StickerItem[];
  selectedStickerId?: string | null;
  onSelectSticker?: (id: string | null) => void;
  onUpdateSticker?: (id: string, updated: Partial<StickerItem>) => void;
  isEditable?: boolean;
}

export const StickerCanvasOverlay: React.FC<StickerCanvasOverlayProps> = ({
  stickers,
  selectedStickerId,
  onSelectSticker,
  onUpdateSticker,
  isEditable = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    initX: number;
    initY: number;
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent, sticker: StickerItem) => {
    if (!isEditable) return;
    e.stopPropagation();
    onSelectSticker?.(sticker.id);

    dragRef.current = {
      id: sticker.id,
      startX: e.clientX,
      startY: e.clientY,
      initX: sticker.x,
      initY: sticker.y
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!dragRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = moveEvent.clientX - dragRef.current.startX;
      const deltaY = moveEvent.clientY - dragRef.current.startY;

      const deltaPercentX = (deltaX / rect.width) * 100;
      const deltaPercentY = (deltaY / rect.height) * 100;

      const newX = Math.min(91, Math.max(9, dragRef.current.initX + deltaPercentX));
      const newY = Math.min(91, Math.max(9, dragRef.current.initY + deltaPercentY));

      onUpdateSticker?.(dragRef.current.id, { x: newX, y: newY });
    };

    const handlePointerUp = () => {
      dragRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div
      ref={containerRef}
      className="sticker-canvas-overlay"
      onClick={() => isEditable && onSelectSticker?.(null)}
    >
      {stickers.map((sticker) => {
        const isSelected = isEditable && selectedStickerId === sticker.id;
        return (
          <div
            key={sticker.id}
            className={`placed-sticker ${isSelected ? 'selected' : ''} ${isEditable ? 'editable' : ''}`}
            style={{
              left: `${sticker.x}%`,
              top: `${sticker.y}%`,
              transform: `translate(-50%, -50%) scale(${sticker.scale || 1}) rotate(${sticker.rotation || 0}deg)`
            }}
            onPointerDown={(e) => handlePointerDown(e, sticker)}
            onClick={(e) => e.stopPropagation()}
          >
            {sticker.isCustom && sticker.customUrl ? (
              <img
                src={sticker.customUrl}
                alt="Sticker"
                className="sticker-img"
                draggable={false}
              />
            ) : (
              <span className="sticker-emoji">{sticker.symbol}</span>
            )}
            {isSelected && <div className="sticker-selection-ring" />}
          </div>
        );
      })}
    </div>
  );
};
