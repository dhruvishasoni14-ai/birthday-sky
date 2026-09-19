import React, { useEffect, useState, useRef } from 'react';
import { useSky } from '../../context/SkyContext';
import {
  WishCard,
  StickerItem,
  ConstellationPoint,
  ConstellationConnection,
  CardTextBox
} from '../../types/celestial';
import { RichTextToolbar } from '../shared/RichTextToolbar';
import { StickerBar } from '../shared/StickerBar';
import { StickerCanvasOverlay } from '../shared/StickerCanvasOverlay';
import { CardTextBoxItem } from '../shared/CardTextBoxItem';
import { toggleSelectionFormatting } from '../../utils/textFormatting';
import { X, Sparkles, Plus, Link2, Trash2, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { findSafeSkyPosition } from '../../utils/objectPlacement';

export const WishStudioModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    addWish,
    accentColor,
    currentUser,
    wishes,
    stories,
    voiceNotes,
    secretStars
  } = useSky();

  const [activeTab, setActiveTab] = useState<
    'card' | 'constellation' | 'styling' | 'stickers'
  >('card');

  const [selectedTextBoxId, setSelectedTextBoxId] = useState<
    'title' | 'body' | 'from' | null
  >(null);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const bodyInputRef = useRef<HTMLTextAreaElement>(null);
  const fromInputRef = useRef<HTMLInputElement>(null);

  const [titleBox, setTitleBox] = useState<CardTextBox>({
    text: 'Happy Birthday! ✨',
    x: 16,
    y: 20,
    width: 328,
    height: 45,
    style: {
      font: 'elegant',
      color: '#FFE58A',
      size: 22,
      bold: true,
      italic: false,
      underline: false
    }
  });

  const [bodyBox, setBodyBox] = useState<CardTextBox>({
    text: 'Wishing you infinite joy, love, and starlight on your special day! 🌟',
    x: 16,
    y: 70,
    width: 328,
    height: 125,
    style: {
      font: 'modern',
      color: '#ffffff',
      size: 18,
      bold: false,
      italic: false,
      underline: false
    }
  });

  const [fromBox, setFromBox] = useState<CardTextBox>({
    text: currentUser ? `— ${currentUser.username}` : '— Your bestie ♡',
    x: 16,
    y: 202,
    width: 328,
    height: 38,
    style: {
      font: 'cursive',
      color: '#FF9FCB',
      size: 16,
      bold: false,
      italic: true,
      underline: false
    }
  });

  const [cardAccentColor, setCardAccentColor] = useState(
    accentColor || '#B89CFF'
  );

  const [bgGradientFrom, setBgGradientFrom] = useState('#1e1b4b');
  const [bgGradientTo, setBgGradientTo] = useState('#0a0e27');

  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [selectedStickerId, setSelectedStickerId] =
    useState<string | null>(null);

  const [activeTool, setActiveTool] = useState<
    'add' | 'join' | 'remove'
  >('add');

  const [constellationPoints, setConstellationPoints] =
    useState<ConstellationPoint[]>([]);

  const [connections, setConnections] =
    useState<ConstellationConnection[]>([]);

  const [selectedJoinPointId, setSelectedJoinPointId] =
    useState<number | null>(null);

  const constellationCanvasRef = useRef<HTMLDivElement>(null);

  /*
   * Every time the Wish Studio is opened, start completely fresh.
   * This also protects against old unsent edits surviving after closing.
   */
  useEffect(() => {
    if (activeModal !== 'wish-studio') return;

    setActiveTab('card');
    setSelectedTextBoxId(null);

    setTitleBox({
      text: 'Happy Birthday! ✨',
      x: 16,
      y: 20,
      width: 328,
      height: 45,
      style: {
        font: 'elegant',
        color: '#FFE58A',
        size: 22,
        bold: true,
        italic: false,
        underline: false
      }
    });

    setBodyBox({
      text: 'Wishing you infinite joy, love, and starlight on your special day! 🌟',
      x: 16,
      y: 70,
      width: 328,
      height: 125,
      style: {
        font: 'modern',
        color: '#ffffff',
        size: 18,
        bold: false,
        italic: false,
        underline: false
      }
    });

    setFromBox({
      text: currentUser
        ? `— ${currentUser.username}`
        : '— Your bestie ♡',
      x: 16,
      y: 202,
      width: 328,
      height: 38,
      style: {
        font: 'cursive',
        color: '#FF9FCB',
        size: 16,
        bold: false,
        italic: true,
        underline: false
      }
    });

    setCardAccentColor(accentColor || '#B89CFF');
    setBgGradientFrom('#1e1b4b');
    setBgGradientTo('#0a0e27');

    setStickers([]);
    setSelectedStickerId(null);

    setActiveTool('add');
    setConstellationPoints([]);
    setConnections([]);
    setSelectedJoinPointId(null);
  }, [activeModal]);

  if (activeModal !== 'wish-studio') return null;

  const handleFormatToggle = (
    target: 'title' | 'body' | 'from',
    format: 'bold' | 'italic' | 'underline'
  ) => {
    let inputEl: HTMLInputElement | HTMLTextAreaElement | null = null;
    let box = titleBox;
    let setBox = setTitleBox;

    if (target === 'title') {
      inputEl = titleInputRef.current;
      box = titleBox;
      setBox = setTitleBox;
    } else if (target === 'body') {
      inputEl = bodyInputRef.current;
      box = bodyBox;
      setBox = setBodyBox;
    } else {
      inputEl = fromInputRef.current;
      box = fromBox;
      setBox = setFromBox;
    }

    if (
      inputEl &&
      inputEl.selectionStart !== null &&
      inputEl.selectionEnd !== null &&
      inputEl.selectionStart !== inputEl.selectionEnd
    ) {
      const newText = toggleSelectionFormatting(
        box.text,
        inputEl.selectionStart,
        inputEl.selectionEnd,
        format
      );

      setBox({
        ...box,
        text: newText
      });
    } else {
      setBox({
        ...box,
        style: {
          ...box.style,
          [format]: !box.style[format]
        }
      });
    }
  };

  const handleCanvasClick = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (
      activeTool !== 'add' ||
      !constellationCanvasRef.current
    ) {
      return;
    }

    const rect =
      constellationCanvasRef.current.getBoundingClientRect();

    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    const newId = Date.now();

    const newPoint: ConstellationPoint = {
      id: newId,
      x,
      y
    };

    setConstellationPoints((prev) => [
      ...prev,
      newPoint
    ]);
  };

  const handleStarNodeClick = (
    e: React.MouseEvent,
    ptId: number
  ) => {
    e.stopPropagation();

    if (activeTool === 'remove') {
      setConstellationPoints((prev) =>
        prev.filter((p) => p.id !== ptId)
      );

      setConnections((prev) =>
        prev.filter(
          (c) =>
            c.fromId !== ptId &&
            c.toId !== ptId
        )
      );

      if (selectedJoinPointId === ptId) {
        setSelectedJoinPointId(null);
      }

      return;
    }

    if (activeTool === 'join') {
      if (selectedJoinPointId === null) {
        setSelectedJoinPointId(ptId);
      } else if (selectedJoinPointId === ptId) {
        setSelectedJoinPointId(null);
      } else {
        const exists = connections.some(
          (c) =>
            (c.fromId === selectedJoinPointId &&
              c.toId === ptId) ||
            (c.fromId === ptId &&
              c.toId === selectedJoinPointId)
        );

        if (!exists) {
          setConnections((prev) => [
            ...prev,
            {
              fromId: selectedJoinPointId,
              toId: ptId
            }
          ]);
        }

        setSelectedJoinPointId(null);
      }
    }
  };

  const handleStartOver = (
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    setConstellationPoints([]);
    setConnections([]);
    setSelectedJoinPointId(null);
  };

  const handleAddSticker = (
    symbol: string,
    isCustom = false,
    customUrl?: string
  ) => {
    const newSticker: StickerItem = {
      id: `stk-${Date.now()}`,
      symbol,
      isCustom,
      customUrl,
      x: 35 + Math.random() * 30,
      y: 35 + Math.random() * 30,
      scale: 1,
      rotation: 0
    };

    setStickers((prev) => [
      ...prev,
      newSticker
    ]);

    setSelectedStickerId(newSticker.id);
  };

  const handleCreateWishAndConstellation = () => {
    const position = findSafeSkyPosition('wish', [
      ...wishes.map((item) => ({
        x: item.x,
        y: item.y,
        kind: 'wish' as const
      })),

      ...stories.map((item) => ({
        x: item.x,
        y: item.y,
        kind: 'story' as const
      })),

      ...voiceNotes.map((item) => ({
        x: item.x,
        y: item.y,
        kind: 'voice' as const
      })),

      ...secretStars.map((item) => ({
        x: item.x,
        y: item.y,
        kind: 'secret' as const
      }))
    ]);

    const plainTitle = titleBox.text.replace(
      /<[^>]*>/g,
      ''
    );

    const plainBody = bodyBox.text.replace(
      /<[^>]*>/g,
      ''
    );

    const plainFrom = fromBox.text.replace(
      /<[^>]*>/g,
      ''
    );

    const newWish: WishCard = {
      id: `wish-${Date.now()}`,
      creatorId: currentUser?.id,
      creatorName: currentUser?.username,
      creatorAvatar: currentUser?.avatarUrl,

      title:
        plainTitle ||
        'Happy Birthday! ✨',

      titleStyle: titleBox.style,

      body:
        plainBody ||
        'Wishing you infinite joy!',

      bodyStyle: bodyBox.style,

      from:
        plainFrom ||
        '— From',

      fromStyle: fromBox.style,

      titleBox,
      bodyBox,
      fromBox,

      accentColor: cardAccentColor,
      bgGradientFrom,
      bgGradientTo,

      stickers,

      x: position.x,
      y: position.y,

      points: constellationPoints,
      connections,

      unopened: true,
      createdAt: Date.now()
    };

    addWish(newWish);

    /*
     * Reset immediately after submission.
     * The next time + is clicked, there is no old content.
     */
    setActiveTab('card');
    setSelectedTextBoxId(null);

    setTitleBox({
      text: 'Happy Birthday! ✨',
      x: 16,
      y: 20,
      width: 328,
      height: 45,
      style: {
        font: 'elegant',
        color: '#FFE58A',
        size: 22,
        bold: true,
        italic: false,
        underline: false
      }
    });

    setBodyBox({
      text: 'Wishing you infinite joy, love, and starlight on your special day! 🌟',
      x: 16,
      y: 70,
      width: 328,
      height: 125,
      style: {
        font: 'modern',
        color: '#ffffff',
        size: 18,
        bold: false,
        italic: false,
        underline: false
      }
    });

    setFromBox({
      text: currentUser
        ? `— ${currentUser.username}`
        : '— Your bestie ♡',
      x: 16,
      y: 202,
      width: 328,
      height: 38,
      style: {
        font: 'cursive',
        color: '#FF9FCB',
        size: 16,
        bold: false,
        italic: true,
        underline: false
      }
    });

    setCardAccentColor(
      accentColor || '#B89CFF'
    );

    setBgGradientFrom('#1e1b4b');
    setBgGradientTo('#0a0e27');

    setStickers([]);
    setSelectedStickerId(null);

    setActiveTool('add');
    setConstellationPoints([]);
    setConnections([]);
    setSelectedJoinPointId(null);

    setActiveModal(null);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const selectedStickerObj = stickers.find(
    (s) => s.id === selectedStickerId
  );

  return (
    <div className="modal-backdrop">
      <div className="modal-content compact-studio-window glass-panel animate-scale-in">

        <div className="compact-studio-header">
          <div className="header-titles">
            <span className="eyebrow">
              CREATE WISH CARD & CONSTELLATION
            </span>

            <h2>Wish Studio ✦</h2>
          </div>

          <div className="studio-tab-switches">
            <button
              type="button"
              className={`studio-tab-pill ${activeTab === 'card' ? 'active' : ''
                }`}
              onClick={() => setActiveTab('card')}
            >
              1. Card Text
            </button>

            <button
              type="button"
              className={`studio-tab-pill ${activeTab === 'constellation'
                  ? 'active'
                  : ''
                }`}
              onClick={() =>
                setActiveTab('constellation')
              }
            >
              2. Draw Constellation
            </button>

            <button
              type="button"
              className={`studio-tab-pill ${activeTab === 'styling'
                  ? 'active'
                  : ''
                }`}
              onClick={() =>
                setActiveTab('styling')
              }
            >
              3. Gradient & Glow
            </button>

            <button
              type="button"
              className={`studio-tab-pill ${activeTab === 'stickers'
                  ? 'active'
                  : ''
                }`}
              onClick={() =>
                setActiveTab('stickers')
              }
            >
              4. Stickers
            </button>
          </div>

          <button
            type="button"
            className="close-modal-btn"
            onClick={() =>
              setActiveModal(null)
            }
          >
            <X size={20} />
          </button>
        </div>

        <div className="compact-studio-grid">

          <div className="compact-left-controls">

            {activeTab === 'card' && (
              <div className="compact-tab-pane animate-fade-in">

                <div className="compact-input-group">
                  <label className="input-label">
                    Greeting Box (Title)
                  </label>

                  <input
                    ref={titleInputRef}
                    type="text"
                    className="studio-text-input compact"
                    value={titleBox.text}
                    onFocus={() =>
                      setSelectedTextBoxId('title')
                    }
                    onChange={(e) =>
                      setTitleBox({
                        ...titleBox,
                        text: e.target.value
                      })
                    }
                  />

                  <RichTextToolbar
                    styleConfig={titleBox.style}
                    onChange={(style) =>
                      setTitleBox({
                        ...titleBox,
                        style
                      })
                    }
                    onFormatToggle={(fmt) =>
                      handleFormatToggle(
                        'title',
                        fmt
                      )
                    }
                    showSize={true}
                    minSize={10}
                    maxSize={36}
                  />
                </div>

                <div
                  className="compact-input-group"
                  style={{ marginTop: '10px' }}
                >
                  <label className="input-label">
                    Birthday Message Box (Body)
                  </label>

                  <textarea
                    ref={bodyInputRef}
                    className="studio-textarea compact"
                    rows={3}
                    value={bodyBox.text}
                    onFocus={() =>
                      setSelectedTextBoxId('body')
                    }
                    onChange={(e) =>
                      setBodyBox({
                        ...bodyBox,
                        text: e.target.value
                      })
                    }
                  />

                  <RichTextToolbar
                    styleConfig={bodyBox.style}
                    onChange={(style) =>
                      setBodyBox({
                        ...bodyBox,
                        style
                      })
                    }
                    onFormatToggle={(fmt) =>
                      handleFormatToggle(
                        'body',
                        fmt
                      )
                    }
                    showSize={true}
                    minSize={9}
                    maxSize={28}
                  />
                </div>

                <div
                  className="compact-input-group"
                  style={{ marginTop: '10px' }}
                >
                  <label className="input-label">
                    Signature Box (From)
                  </label>

                  <input
                    ref={fromInputRef}
                    type="text"
                    className="studio-text-input compact"
                    value={fromBox.text}
                    onFocus={() =>
                      setSelectedTextBoxId('from')
                    }
                    onChange={(e) =>
                      setFromBox({
                        ...fromBox,
                        text: e.target.value
                      })
                    }
                  />

                  <RichTextToolbar
                    styleConfig={fromBox.style}
                    onChange={(style) =>
                      setFromBox({
                        ...fromBox,
                        style
                      })
                    }
                    onFormatToggle={(fmt) =>
                      handleFormatToggle(
                        'from',
                        fmt
                      )
                    }
                    showSize={true}
                    minSize={10}
                    maxSize={32}
                  />
                </div>

              </div>
            )}

            {activeTab === 'constellation' && (
              <div className="compact-tab-pane animate-fade-in">

                <div className="canvas-tools-toolbar">

                  <div className="tool-buttons-cluster">

                    <button
                      type="button"
                      className={`canvas-tool-pill ${activeTool === 'add'
                          ? 'active'
                          : ''
                        }`}
                      onClick={() => {
                        setActiveTool('add');
                        setSelectedJoinPointId(null);
                      }}
                    >
                      <Plus size={14} />
                      <span>Add Star</span>
                    </button>

                    <button
                      type="button"
                      className={`canvas-tool-pill ${activeTool === 'join'
                          ? 'active'
                          : ''
                        }`}
                      onClick={() => {
                        setActiveTool('join');
                        setSelectedJoinPointId(null);
                      }}
                    >
                      <Link2 size={14} />
                      <span>Join</span>
                    </button>

                    <button
                      type="button"
                      className={`canvas-tool-pill ${activeTool === 'remove'
                          ? 'active'
                          : ''
                        }`}
                      onClick={() => {
                        setActiveTool('remove');
                        setSelectedJoinPointId(null);
                      }}
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>

                  </div>

                  <button
                    type="button"
                    className="clear-canvas-btn"
                    onClick={handleStartOver}
                  >
                    <RotateCcw size={12} />
                    <span>Start Over</span>
                  </button>

                </div>

                <div className="canvas-mode-instruction">
                  {activeTool === 'add' &&
                    '✦ Click anywhere inside the canvas to place a star at that exact coordinate.'}

                  {activeTool === 'join' &&
                    (selectedJoinPointId === null
                      ? '✦ Click the FIRST star you want to connect.'
                      : '✦ Now click the SECOND star to draw a connecting line.')}

                  {activeTool === 'remove' &&
                    '✦ Click any star to delete it and remove its connections.'}
                </div>

                <div
                  ref={constellationCanvasRef}
                  className={`interactive-constellation-canvas mode-${activeTool}`}
                  onClick={handleCanvasClick}
                >
                  <svg className="canvas-lines-svg">

                    {connections.map(
                      (conn, idx) => {
                        const p1 =
                          constellationPoints.find(
                            (p) =>
                              p.id === conn.fromId
                          );

                        const p2 =
                          constellationPoints.find(
                            (p) =>
                              p.id === conn.toId
                          );

                        if (!p1 || !p2) {
                          return null;
                        }

                        return (
                          <line
                            key={`c-${idx}`}
                            x1={p1.x}
                            y1={p1.y}
                            x2={p2.x}
                            y2={p2.y}
                            stroke={cardAccentColor}
                            strokeWidth="2"
                            strokeOpacity="0.85"
                          />
                        );
                      }
                    )}

                  </svg>

                  {constellationPoints.map(
                    (pt) => {
                      const isSelected =
                        selectedJoinPointId ===
                        pt.id;

                      return (
                        <div
                          key={pt.id}
                          className={`canvas-star-node ${isSelected
                              ? 'selected'
                              : ''
                            }`}
                          style={{
                            left: `${pt.x}px`,
                            top: `${pt.y}px`,
                            borderColor:
                              isSelected
                                ? '#ffffff'
                                : cardAccentColor
                          }}
                          onClick={(e) =>
                            handleStarNodeClick(
                              e,
                              pt.id
                            )
                          }
                        >
                          <span
                            className="star-core"
                            style={{
                              backgroundColor:
                                isSelected
                                  ? '#ffffff'
                                  : cardAccentColor
                            }}
                          />
                        </div>
                      );
                    }
                  )}

                </div>

              </div>
            )}

            {activeTab === 'styling' && (
              <div className="compact-tab-pane animate-fade-in">

                <div className="styling-section-block">
                  <span className="sub-label">
                    Center Element & Glow Accent
                  </span>

                  <p className="tab-hint-text">
                    Controls the star halo, central star mark, and card glow.
                  </p>

                  <div
                    className="accent-color-row"
                    style={{ marginTop: '8px' }}
                  >
                    {[
                      '#B89CFF',
                      '#FF9FCB',
                      '#73D4E7',
                      '#FFB27D',
                      '#A7E89B',
                      '#FFE58A'
                    ].map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`color-dot-large ${cardAccentColor === c
                            ? 'active'
                            : ''
                          }`}
                        style={{
                          backgroundColor: c
                        }}
                        onClick={() =>
                          setCardAccentColor(c)
                        }
                      />
                    ))}

                    <label
                      className="custom-color-input-btn"
                      title="Custom accent color"
                    >
                      <input
                        type="color"
                        value={cardAccentColor}
                        onChange={(e) =>
                          setCardAccentColor(
                            e.target.value
                          )
                        }
                        className="hidden-color-input"
                      />

                      <span>+</span>
                    </label>
                  </div>
                </div>

                <div
                  className="styling-section-block"
                  style={{ marginTop: '16px' }}
                >
                  <span className="sub-label">
                    Card Background Gradient (Color A → Color B)
                  </span>

                  <div
                    className="gradient-controls-row"
                    style={{
                      marginTop: '8px',
                      display: 'flex',
                      gap: '16px'
                    }}
                  >
                    <div>
                      <span className="tiny-color-label">
                        Color A (Start)
                      </span>

                      <div className="color-picker-input-wrap">
                        <input
                          type="color"
                          value={bgGradientFrom}
                          onChange={(e) =>
                            setBgGradientFrom(
                              e.target.value
                            )
                          }
                          className="studio-color-square"
                        />

                        <span className="color-hex-val">
                          {bgGradientFrom}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="tiny-color-label">
                        Color B (End)
                      </span>

                      <div className="color-picker-input-wrap">
                        <input
                          type="color"
                          value={bgGradientTo}
                          onChange={(e) =>
                            setBgGradientTo(
                              e.target.value
                            )
                          }
                          className="studio-color-square"
                        />

                        <span className="color-hex-val">
                          {bgGradientTo}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="preset-gradients-row"
                    style={{ marginTop: '12px' }}
                  >
                    <span className="tiny-color-label">
                      Preset Cosmic Gradients:
                    </span>

                    <div className="preset-gradient-buttons">
                      {[
                        {
                          from: '#1e1b4b',
                          to: '#0a0e27',
                          label: 'Midnight'
                        },
                        {
                          from: '#2e1065',
                          to: '#0f172a',
                          label: 'Twilight'
                        },
                        {
                          from: '#3b0764',
                          to: '#18181b',
                          label: 'Stardust'
                        },
                        {
                          from: '#1e293b',
                          to: '#020617',
                          label: 'Deep Sky'
                        },
                        {
                          from: '#4c0519',
                          to: '#09090b',
                          label: 'Cosmic Rose'
                        }
                      ].map(
                        (preset, idx) => (
                          <button
                            key={`grad-${idx}`}
                            type="button"
                            className="gradient-preset-pill"
                            style={{
                              background: `linear-gradient(135deg, ${preset.from}, ${preset.to})`
                            }}
                            onClick={() => {
                              setBgGradientFrom(
                                preset.from
                              );
                              setBgGradientTo(
                                preset.to
                              );
                            }}
                          >
                            {preset.label}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'stickers' && (
              <div className="compact-tab-pane animate-fade-in">
                <StickerBar
                  onAddSticker={handleAddSticker}
                  selectedSticker={selectedStickerObj}
                  onUpdateSelectedSticker={(upd) =>
                    setStickers((prev) =>
                      prev.map((s) =>
                        s.id ===
                          selectedStickerId
                          ? { ...s, ...upd }
                          : s
                      )
                    )
                  }
                  onDeleteSelectedSticker={() => {
                    setStickers((prev) =>
                      prev.filter(
                        (s) =>
                          s.id !==
                          selectedStickerId
                      )
                    );

                    setSelectedStickerId(null);
                  }}
                />
              </div>
            )}

          </div>

          <div className="compact-right-preview">
            <div className="preview-card-wrapper">

              <div
                className="compact-wish-card"
                style={{
                  borderColor: cardAccentColor,
                  background: `linear-gradient(135deg, ${bgGradientFrom} 0%, ${bgGradientTo} 100%)`,
                  boxShadow: `0 0 30px ${cardAccentColor}44, inset 0 0 20px rgba(255, 255, 255, 0.05)`
                }}
              >

                <div
                  className="card-top-icon"
                  style={{
                    color: cardAccentColor
                  }}
                >
                  ✦
                </div>

                <CardTextBoxItem
                  id="title"
                  box={titleBox}
                  onChange={setTitleBox}
                  isSelected={
                    selectedTextBoxId === 'title'
                  }
                  onSelect={() =>
                    setSelectedTextBoxId(
                      'title'
                    )
                  }
                  isEditable={true}
                />

                <CardTextBoxItem
                  id="body"
                  box={bodyBox}
                  onChange={setBodyBox}
                  isSelected={
                    selectedTextBoxId === 'body'
                  }
                  onSelect={() =>
                    setSelectedTextBoxId(
                      'body'
                    )
                  }
                  isEditable={true}
                />

                <CardTextBoxItem
                  id="from"
                  box={fromBox}
                  onChange={setFromBox}
                  isSelected={
                    selectedTextBoxId === 'from'
                  }
                  onSelect={() =>
                    setSelectedTextBoxId(
                      'from'
                    )
                  }
                  isEditable={true}
                />

                <div
                  className="card-bottom-accent"
                  style={{
                    backgroundColor:
                      cardAccentColor
                  }}
                />

                <StickerCanvasOverlay
                  stickers={stickers}
                  selectedStickerId={
                    selectedStickerId
                  }
                  onSelectSticker={
                    setSelectedStickerId
                  }
                  onUpdateSticker={(
                    id,
                    upd
                  ) =>
                    setStickers((prev) =>
                      prev.map((s) =>
                        s.id === id
                          ? {
                            ...s,
                            ...upd
                          }
                          : s
                      )
                    )
                  }
                  isEditable={true}
                />

              </div>

            </div>
          </div>
        </div>

        <div className="compact-studio-footer">

          <span className="footer-info">
            Places your constellation in the sky for this session ✦
          </span>

          <button
            type="button"
            className="continue-button"
            onClick={
              handleCreateWishAndConstellation
            }
          >
            <span>Create Constellation</span>
            <Sparkles size={16} />
          </button>

        </div>

      </div>
    </div>
  );
};