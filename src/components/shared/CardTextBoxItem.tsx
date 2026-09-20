import React, { useRef, useState, useLayoutEffect } from 'react';
import { CardTextBox } from '../../types/celestial';

interface CardTextBoxItemProps {
  id: string;
  box: CardTextBox;
  onChange: (updatedBox: CardTextBox) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  isEditable?: boolean;
  cardWidth?: number;
  cardHeight?: number;
  minWidth?: number;
  minHeight?: number;
}

export const CardTextBoxItem: React.FC<CardTextBoxItemProps> = ({
  id,
  box,
  onChange,
  isSelected = false,
  onSelect,
  isEditable = false,
  cardWidth = 360,
  cardHeight = 260,
  minWidth = 60,
  minHeight = 24
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [fittedFontSize, setFittedFontSize] = useState(
    box.style?.size || 14
  );

  const SAFE_MARGIN = 8;

  const isDraggingRef = useRef(false);
  const dragStartPos = useRef({
    x: 0,
    y: 0,
    boxX: 0,
    boxY: 0
  });

  const isResizingRef = useRef(false);
  const resizeStartPos = useRef({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    dir: ''
  });

  /*
   * AUTO FIT
   *
   * Measures both width AND height.
   * The previous version only reliably checked height,
   * which allowed long words/HTML content to overflow.
   */
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const requestedSize = Number(box.style?.size) || 14;
    const MIN_FONT_SIZE = 8;

    const paddingX = SAFE_MARGIN * 2;
    const paddingY = SAFE_MARGIN;

    const availableWidth = Math.max(
      1,
      box.width - paddingX
    );

    const availableHeight = Math.max(
      1,
      box.height - paddingY
    );

    const measure = document.createElement('div');

    const computed = window.getComputedStyle(el);

    measure.innerHTML = box.text || '';

    measure.style.position = 'fixed';
    measure.style.left = '-100000px';
    measure.style.top = '0';

    measure.style.width = `${availableWidth}px`;
    measure.style.height = 'auto';

    measure.style.boxSizing = 'border-box';
    measure.style.padding = '0';

    measure.style.fontFamily = computed.fontFamily;
    measure.style.fontWeight = box.style?.bold ? '700' : '400';
    measure.style.fontStyle = box.style?.italic ? 'italic' : 'normal';
    measure.style.textDecoration = box.style?.underline
      ? 'underline'
      : 'none';

    measure.style.textAlign = 'center';

    measure.style.whiteSpace = 'pre-wrap';
    measure.style.overflowWrap = 'anywhere';
    measure.style.wordBreak = 'break-word';

    measure.style.lineHeight =
      id === 'body' ? '1.35' : '1.2';

    document.body.appendChild(measure);

    let size = requestedSize;

    const fits = () => {
      measure.style.fontSize = `${size}px`;

      return (
        measure.scrollWidth <= availableWidth + 1 &&
        measure.scrollHeight <= availableHeight + 1
      );
    };

    /*
     * Shrink until the COMPLETE text fits.
     */
    while (size > MIN_FONT_SIZE && !fits()) {
      size -= 0.5;
    }

    /*
     * If it still doesn't fit at minimum size,
     * use the minimum rather than allowing overflow.
     */
    size = Math.max(MIN_FONT_SIZE, size);

    document.body.removeChild(measure);

    setFittedFontSize(size);
  }, [
    box.text,
    box.width,
    box.height,
    box.style?.size,
    box.style?.font,
    box.style?.bold,
    box.style?.italic,
    box.style?.underline,
    id
  ]);

  // DRAG
  const handlePointerDownDrag = (e: React.PointerEvent) => {
    if (!isEditable) return;

    if (
      (e.target as HTMLElement).classList.contains(
        'resize-handle'
      )
    ) {
      return;
    }

    e.preventDefault();

    onSelect?.();

    isDraggingRef.current = true;

    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      boxX: box.x,
      boxY: box.y
    };

    const handlePointerMove = (me: PointerEvent) => {
      if (!isDraggingRef.current) return;

      const dx =
        me.clientX - dragStartPos.current.x;

      const dy =
        me.clientY - dragStartPos.current.y;

      const newX = Math.max(
        SAFE_MARGIN,
        Math.min(
          cardWidth -
          SAFE_MARGIN -
          box.width,
          dragStartPos.current.boxX + dx
        )
      );

      const newY = Math.max(
        SAFE_MARGIN,
        Math.min(
          cardHeight -
          SAFE_MARGIN -
          box.height,
          dragStartPos.current.boxY + dy
        )
      );

      onChange({
        ...box,
        x: Math.round(newX),
        y: Math.round(newY)
      });
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // RESIZE
  const handlePointerDownResize = (
    e: React.PointerEvent,
    dir: string
  ) => {
    if (!isEditable) return;

    e.preventDefault();
    e.stopPropagation();

    onSelect?.();

    isResizingRef.current = true;

    resizeStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: box.width,
      height: box.height,
      dir
    };

    const handlePointerMove = (me: PointerEvent) => {
      if (!isResizingRef.current) return;

      const dx =
        me.clientX -
        resizeStartPos.current.x;

      const dy =
        me.clientY -
        resizeStartPos.current.y;

      let newWidth =
        resizeStartPos.current.width;

      let newHeight =
        resizeStartPos.current.height;

      const maxWidth = Math.max(
        minWidth,
        cardWidth -
        SAFE_MARGIN -
        box.x
      );

      const maxHeight = Math.max(
        minHeight,
        cardHeight -
        SAFE_MARGIN -
        box.y
      );

      if (dir.includes('e')) {
        newWidth = Math.max(
          minWidth,
          Math.min(
            maxWidth,
            resizeStartPos.current.width + dx
          )
        );
      }

      if (dir.includes('s')) {
        newHeight = Math.max(
          minHeight,
          Math.min(
            maxHeight,
            resizeStartPos.current.height + dy
          )
        );
      }

      onChange({
        ...box,
        width: Math.round(newWidth),
        height: Math.round(newHeight)
      });
    };

    const handlePointerUp = () => {
      isResizingRef.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const fontClass = `font-${box.style?.font ||
    (id === 'title'
      ? 'elegant'
      : id === 'body'
        ? 'modern'
        : 'cursive')
    }`;

  return (
    <div
      ref={containerRef}
      className={`card-text-box-wrapper ${isSelected ? 'active-selection' : ''
        } ${isEditable ? 'editable' : ''}`}
      style={{
        position: 'absolute',
        left: `${box.x}px`,
        top: `${box.y}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
        boxSizing: 'border-box',
        cursor: isEditable ? 'move' : 'default',
        zIndex: isSelected ? 12 : 10
      }}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); handlePointerDownDrag(e); }}
      onClick={() =>
        isEditable && onSelect?.()
      }
    >
      <div
        ref={contentRef}
        className={`card-text-box-content ${fontClass}`}
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',

          color:
            box.style?.color || '#ffffff',

          fontSize: `${fittedFontSize}px`,

          fontWeight:
            box.style?.bold
              ? 'bold'
              : 'normal',

          fontStyle:
            box.style?.italic
              ? 'italic'
              : 'normal',

          textDecoration:
            box.style?.underline
              ? 'underline'
              : 'none',

          lineHeight:
            id === 'body' ? 1.35 : 1.2,

          textAlign: 'center',

          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',

          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',

          overflow: 'hidden',

          padding: `${SAFE_MARGIN / 2}px ${SAFE_MARGIN}px`
        }}
        dangerouslySetInnerHTML={{
          __html: box.text || ''
        }}
      />

      {isEditable && isSelected && (
        <>
          <div className="card-box-outline-ring" />

          <div
            className="resize-handle handle-se"
            onPointerDown={(e) =>
              handlePointerDownResize(e, 'se')
            }
            title="Resize text box"
          />

          <div
            className="resize-handle handle-e"
            onPointerDown={(e) =>
              handlePointerDownResize(e, 'e')
            }
            title="Resize width"
          />

          <div
            className="resize-handle handle-s"
            onPointerDown={(e) =>
              handlePointerDownResize(e, 's')
            }
            title="Resize height"
          />
        </>
      )}
    </div>
  );
};