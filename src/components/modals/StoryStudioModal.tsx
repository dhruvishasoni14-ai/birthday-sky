import React, { useEffect, useState, useRef } from 'react';
import { useSky } from '../../context/SkyContext';
import { Story, StoryPage, StoryLayoutType, PageThemeType, PlanetDesign, StickerItem } from '../../types/celestial';
import { RichTextToolbar } from '../shared/RichTextToolbar';
import { StickerBar } from '../shared/StickerBar';
import { StickerCanvasOverlay } from '../shared/StickerCanvasOverlay';
import { X, ChevronLeft, ChevronRight, Plus, Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { findSafeSkyPosition } from '../../utils/objectPlacement';
import { CardTextBoxItem } from '../shared/CardTextBoxItem';

interface StoryStudioModalProps {
  initialPlanetDesign?: PlanetDesign | null;
  onSubmitted?: () => void;
}

const PAGE_THEMES: { id: PageThemeType; label: string; className: string }[] = [
  { id: 'midnight', label: 'Midnight', className: 'theme-midnight' },
  { id: 'stardust', label: 'Stardust', className: 'theme-stardust' },
  { id: 'parchment', label: 'Parchment', className: 'theme-parchment' },
  { id: 'blossom', label: 'Blossom', className: 'theme-blossom' },
  { id: 'cosmic', label: 'Cosmic', className: 'theme-cosmic' },
  { id: 'sunset', label: 'Sunset', className: 'theme-sunset' }
];

export const StoryStudioModal: React.FC<StoryStudioModalProps> = ({ initialPlanetDesign, onSubmitted }) => {
  const { activeModal, setActiveModal, addStory, currentUser, wishes, stories, voiceNotes, secretStars } = useSky();

  const [activeTab, setActiveTab] = useState<'layout' | 'content' | 'theme' | 'stickers'>('layout');
  const [storyTitle, setStoryTitle] = useState('Relive a Day ✨');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const [pages, setPages] = useState<StoryPage[]>([
    {
      id: 'page-1',
      layout: 1,
      text: 'Our favorite memory together...',
      textStyle: {
        font: 'handwritten',
        color: '#ffffff',
        size: 18,
        bold: false,
        italic: false,
        underline: false
      },
      textBoxX: 20,
      textBoxY: 20,
      textBoxWidth: 320,
      textBoxHeight: 120,

      imageUrl: '',
      imageX: 20,
      imageY: 40,
      imageWidth: 150,
      imageHeight: 180,
      stickers: [],
      theme: 'midnight'
    }
  ]);

  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [customGradientFrom, setCustomGradientFrom] = useState('#1a1033');
  const [customGradientTo, setCustomGradientTo] = useState('#4b2a7b');


  const currentPage = pages[currentPageIndex] || pages[0];



  useEffect(() => {
    if (activeModal === 'story-studio') {
      setActiveTab('layout');
      setCurrentPageIndex(0);
      setSelectedStickerId(null);
      setCustomGradientFrom('#1a1033');
      setCustomGradientTo('#4b2a7b');

      setStoryTitle('Relive a Day ✨');
      setPages([{
        id: `page-${Date.now()}`,
        layout: 1,
        text: '',
        textStyle: {
          font: 'handwritten',
          color: '#ffffff',
          size: 18,
          bold: false,
          italic: false,
          underline: false
        },
        textBoxX: 20,
        textBoxY: 20,
        textBoxWidth: 320,
        textBoxHeight: 120,
        imageUrl: '',
        imageX: 20,
        imageY: 40,
        imageWidth: 150,
        imageHeight: 180,
        stickers: [],
        theme: 'midnight'
      }]);
    }
  }, [activeModal]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (activeModal !== 'story-studio') return null;



  const updateCurrentPage = (updated: Partial<StoryPage>) => {
    setPages((prev) =>
      prev.map((p, idx) => (idx === currentPageIndex ? { ...p, ...updated } : p))
    );
    setValidationError(null);
  };

  const isPageEmpty = (page: StoryPage) => {
    const hasText = Boolean(page.text && page.text.trim().length > 0);
    const hasImage = Boolean(page.imageUrl && page.imageUrl.trim().length > 0);
    const hasStickers = Boolean(page.stickers && page.stickers.length > 0);
    return !hasText && !hasImage && !hasStickers;
  };

  const handleAddPage = () => {
    if (isPageEmpty(currentPage)) {
      setValidationError('Please add text, an image, or a decoration to this page before adding another.');
      return;
    }

    const newPage: StoryPage = {
      id: `page-${Date.now()}`,
      layout: 1,
      text: '',
      textStyle: {
        font: 'modern',
        color: '#ffffff',
        size: 16,
        bold: false,
        italic: false,
        underline: false
      },
      textBoxX: 20,
      textBoxY: 20,
      textBoxWidth: 320,
      textBoxHeight: 120,
      imageUrl: '',
      imageX: 20,
      imageY: 40,
      imageWidth: 150,
      imageHeight: 180,
      stickers: [],
      theme: currentPage.theme
    };

    const newPages = [...pages, newPage];
    setPages(newPages);
    setCurrentPageIndex(newPages.length - 1);
    setSelectedStickerId(null);
    setValidationError(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateCurrentPage({ imageUrl: dataUrl });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddSticker = (symbol: string, isCustom = false, customUrl?: string) => {
    const newSticker: StickerItem = {
      id: `page-stk-${Date.now()}`,
      symbol,
      isCustom,
      customUrl,
      x: 40 + Math.random() * 20,
      y: 40 + Math.random() * 20,
      scale: 1.1,
      rotation: 0
    };
    updateCurrentPage({ stickers: [...(currentPage.stickers || []), newSticker] });
    setSelectedStickerId(newSticker.id);
  };

  const handleFinalSubmit = () => {
    const position = findSafeSkyPosition('story', [
      ...wishes.map((item) => ({ x: item.x, y: item.y, kind: 'wish' as const })),
      ...stories.map((item) => ({ x: item.x, y: item.y, kind: 'story' as const })),
      ...voiceNotes.map((item) => ({ x: item.x, y: item.y, kind: 'voice' as const })),
      ...secretStars.map((item) => ({ x: item.x, y: item.y, kind: 'secret' as const }))
    ]);
    const posX = position.x;
    const posY = position.y;

    const defaultPlanet: PlanetDesign = {
      canvasDataUrl: '',
      hasRings: true,
      accentColor: '#FFB27D'
    };

    const newStory: Story = {
      id: `story-${Date.now()}`,
      creatorId: currentUser?.id,
      creatorName: currentUser?.username,
      creatorAvatar: currentUser?.avatarUrl,
      title: storyTitle || 'Relive a Day',
      planetDesign: initialPlanetDesign || defaultPlanet,
      pages,
      x: posX,
      y: posY,
      unopened: true,
      createdAt: Date.now()
    };

    addStory(newStory);
    onSubmitted?.();
    setActiveModal(null);

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 }
    });
  };

  const selectedStickerObj = (currentPage.stickers || []).find((s) => s.id === selectedStickerId);

  return (
    <div className="modal-backdrop">
      <div className="modal-content compact-studio-window story-studio glass-panel animate-scale-in">
        {/* Header */}
        <div className="compact-studio-header">
          <div className="header-titles">
            <span className="eyebrow">RELIVE A DAY · FLIPBOOK</span>
            <h2>Story Studio 📖</h2>
          </div>

          <div className="studio-tab-switches">
            <button
              type="button"
              className={`studio-tab-pill ${activeTab === 'layout' ? 'active' : ''}`}
              onClick={() => setActiveTab('layout')}
            >
              1. Layout
            </button>
            <button
              type="button"
              className={`studio-tab-pill ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              2. Story Content
            </button>
            <button
              type="button"
              className={`studio-tab-pill ${activeTab === 'theme' ? 'active' : ''}`}
              onClick={() => setActiveTab('theme')}
            >
              3. Theme
            </button>
            <button
              type="button"
              className={`studio-tab-pill ${activeTab === 'stickers' ? 'active' : ''}`}
              onClick={() => setActiveTab('stickers')}
            >
              4. Stickers
            </button>
          </div>

          <button
            type="button"
            className="close-modal-btn"
            onClick={() => setActiveModal(null)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Story Pagination Bar */}
        <div className="compact-story-nav">
          <input
            type="text"
            className="studio-text-input compact story-name-input"
            value={storyTitle}
            onChange={(e) => setStoryTitle(e.target.value)}
            placeholder="Story Title..."
          />

          <div className="compact-pagination-cluster">
            <button
              type="button"
              className="compact-page-btn"
              disabled={currentPageIndex === 0}
              onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
            >
              <ChevronLeft size={16} />
              <span>Prev</span>
            </button>

            <span className="compact-counter-pill">
              {currentPageIndex + 1} / {pages.length}
            </span>

            <button
              type="button"
              className="compact-page-btn"
              disabled={currentPageIndex === pages.length - 1}
              onClick={() => setCurrentPageIndex((prev) => Math.min(pages.length - 1, prev + 1))}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              className="compact-add-page-btn"
              onClick={handleAddPage}
            >
              <Plus size={14} />
              <span>Add Page</span>
            </button>
          </div>
        </div>

        {validationError && (
          <div className="compact-validation-bar animate-fade-in">
            ⚠️ {validationError}
          </div>
        )}

        {/* 2-Column Grid */}
        <div className="compact-studio-grid">
          {/* LEFT: Controls */}
          <div className="compact-left-controls">
            {/* TAB 1: Content (Text & Image) */}
            {activeTab === 'content' && (
              <div className="compact-tab-pane animate-fade-in">
                {(currentPage.layout === 1 || currentPage.layout === 3 || currentPage.layout === 4) && (
                  <div className="compact-input-group">
                    <label className="input-label">Page Story Text</label>
                    <textarea
                      className="studio-textarea compact"
                      rows={3}
                      value={currentPage.text}
                      onChange={(e) => updateCurrentPage({ text: e.target.value })}
                      placeholder="Write memory description..."
                    />
                    <RichTextToolbar
                      styleConfig={currentPage.textStyle}
                      onChange={(st) => updateCurrentPage({ textStyle: st })}
                      showSize={false}
                    />
                  </div>
                )}

                {(currentPage.layout === 2 || currentPage.layout === 3 || currentPage.layout === 4) && (
                  <div className="compact-input-group" style={{ marginTop: '12px' }}>
                    <label className="input-label">Page Image</label>
                    <div className="image-upload-row">
                      <button
                        type="button"
                        className="secondary-action-btn compact"
                        onClick={() => imageInputRef.current?.click()}
                      >
                        <ImageIcon size={14} />
                        <span>{currentPage.imageUrl ? 'Change' : 'Upload Image'}</span>
                      </button>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageUpload}
                      />
                      {currentPage.imageUrl && (
                        <button
                          type="button"
                          className="danger-text-btn"
                          onClick={() => updateCurrentPage({ imageUrl: '' })}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Layout & Themes */}
            {(activeTab === 'layout' || activeTab === 'theme') && (
              <div className="compact-tab-pane animate-fade-in">
                {activeTab === 'layout' && <>
                  <label className="input-label">Page Layout (4 Options)</label>
                  <div className="layout-selector-row compact">
                    {[
                      { id: 1 as StoryLayoutType, label: '1. Text Only' },
                      { id: 2 as StoryLayoutType, label: '2. Image Only' },
                      { id: 3 as StoryLayoutType, label: '3. Text L + Img R' },
                      { id: 4 as StoryLayoutType, label: '4. Img L + Text R' }
                    ].map((ly) => (
                      <button
                        key={ly.id}
                        type="button"
                        className={`layout-option-chip ${currentPage.layout === ly.id ? 'active' : ''}`}
                        onClick={() => updateCurrentPage({ layout: ly.id })}
                      >
                        {ly.label}
                      </button>
                    ))}
                  </div></>}

                {activeTab === 'theme' && <label className="input-label" style={{ marginTop: '12px' }}>Page Theme</label>}
                {activeTab === 'theme' && <div className="theme-options-grid compact">
                  {PAGE_THEMES.map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      className={`theme-chip-btn ${currentPage.theme === th.id ? 'active' : ''}`}
                      onClick={() => updateCurrentPage({ theme: th.id })}
                    >
                      <span className={`theme-color-dot ${th.className}`} />
                      <span>{th.label}</span>
                    </button>
                  ))}

                  <button
                    type="button"
                    className={`theme-chip-btn ${currentPage.theme === 'custom' ? 'active' : ''}`}
                    onClick={() => {
                      updateCurrentPage({
                        theme: 'custom',
                        customGradientFrom,
                        customGradientTo
                      });
                    }}
                  >
                    <span
                      className="theme-color-dot"
                      style={{
                        background: `linear-gradient(135deg, ${customGradientFrom}, ${customGradientTo})`
                      }}
                    />
                    <span>Custom Gradient</span>
                  </button>
                </div>}
                {activeTab === 'theme' && currentPage.theme === 'custom' && (
                  <div style={{ marginTop: '14px' }}>
                    <label className="input-label">Gradient Colors</label>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <label style={{ flex: 1 }}>
                        <span style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                          Start
                        </span>
                        <input
                          type="color"
                          value={customGradientFrom}
                          onChange={(e) => {
                            setCustomGradientFrom(e.target.value);
                            updateCurrentPage({
                              customGradientFrom: e.target.value
                            });
                          }}
                          style={{ width: '100%', height: '38px' }}
                        />
                      </label>

                      <label style={{ flex: 1 }}>
                        <span style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                          End
                        </span>
                        <input
                          type="color"
                          value={customGradientTo}
                          onChange={(e) => {
                            setCustomGradientTo(e.target.value);
                            updateCurrentPage({
                              customGradientTo: e.target.value
                            });
                          }}
                          style={{ width: '100%', height: '38px' }}
                        />
                      </label>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 4: Stickers */}
            {activeTab === 'stickers' && (
              <div className="compact-tab-pane animate-fade-in">
                <StickerBar
                  onAddSticker={handleAddSticker}
                  selectedSticker={selectedStickerObj}
                  onUpdateSelectedSticker={(upd) =>
                    selectedStickerId &&
                    updateCurrentPage({
                      stickers: (currentPage.stickers || []).map((s) =>
                        s.id === selectedStickerId ? { ...s, ...upd } : s
                      )
                    })
                  }
                  onDeleteSelectedSticker={() =>
                    selectedStickerId &&
                    updateCurrentPage({
                      stickers: (currentPage.stickers || []).filter((s) => s.id !== selectedStickerId)
                    })
                  }
                />
              </div>
            )}
          </div>

          {/* RIGHT: Live Flipbook Page Preview */}
          <div className="compact-right-preview">
            <div className={`compact-flipbook-page theme-${currentPage.theme} layout-${currentPage.layout}`} style={
              currentPage.theme === 'custom'
                ? {
                  background: `radial-gradient(circle at 50% 50%, ${currentPage.customGradientFrom || '#1a1033'} 0%, ${currentPage.customGradientTo || '#4b2a7b'} 100%)`
                }
                : undefined
            }>
              {currentPage.layout === 1 && (
                <CardTextBoxItem
                  id="story-text"
                  box={{
                    text: currentPage.text || 'Add your story text in the editor...',
                    x: currentPage.textBoxX,
                    y: currentPage.textBoxY,
                    width: currentPage.textBoxWidth,
                    height: currentPage.textBoxHeight,
                    style: currentPage.textStyle
                  }}
                  onChange={(updatedBox) =>
                    updateCurrentPage({
                      textBoxX: updatedBox.x,
                      textBoxY: updatedBox.y,
                      textBoxWidth: updatedBox.width,
                      textBoxHeight: updatedBox.height
                    })
                  }
                  isSelected={true}
                  isEditable={true}
                  cardWidth={360}
                  cardHeight={260}
                />
              )}

              {currentPage.layout === 2 && (
                <div className="page-image-container full-image">
                  {currentPage.imageUrl ? (
                    <img src={currentPage.imageUrl} alt="Memory" className="story-render-image" />
                  ) : (
                    <div className="image-placeholder-box">
                      <ImageIcon size={28} />
                      <span>Upload image</span>
                    </div>
                  )}
                </div>
              )}

              {currentPage.layout === 3 && (
                <div className="page-split-container compact">
                  <div className="page-split-text">
                    <CardTextBoxItem
                      id="story-text-left"
                      box={{
                        text: currentPage.text || 'Text left...',
                        x: 10,
                        y: 26,
                        width: 160,
                        height: 220,
                        style: currentPage.textStyle
                      }}
                      onChange={(updatedBox) =>
                        updateCurrentPage({
                          textBoxX: updatedBox.x,
                          textBoxY: updatedBox.y,
                          textBoxWidth: updatedBox.width,
                          textBoxHeight: updatedBox.height
                        })
                      }
                      isSelected={true}
                      isEditable={true}
                      cardWidth={360}
                      cardHeight={260}
                    />
                  </div>

                  <div className="page-split-image">
                    {currentPage.imageUrl ? (
                      <img
                        src={currentPage.imageUrl}
                        alt="Story"
                        className="story-render-image"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          display: 'block',
                          maxWidth: '100%',
                          maxHeight: '100%'
                        }}
                      />
                    ) : (
                      <div className="image-placeholder-box">
                        <ImageIcon size={28} />
                        <span>Upload image</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentPage.layout === 4 && (
                <div className="page-split-container compact">
                  {/* IMAGE — LEFT */}
                  <div className="page-split-image">
                    {currentPage.imageUrl ? (
                      <img
                        src={currentPage.imageUrl}
                        alt="Story"
                        className="story-render-image"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          display: 'block'
                        }}
                      />
                    ) : (
                      <div className="image-placeholder-box">
                        <ImageIcon size={28} />
                        <span>Upload image</span>
                      </div>
                    )}
                  </div>

                  {/* TEXT — RIGHT */}
                  <div className="page-split-text">
                    <CardTextBoxItem
                      id="story-text-right"
                      box={{
                        text: currentPage.text || 'Text right...',
                        x: 190,
                        y: 20,
                        width: 160,
                        height: 220,
                        style: currentPage.textStyle
                      }}
                      onChange={(updatedBox) =>
                        updateCurrentPage({
                          textBoxX: updatedBox.x,
                          textBoxY: updatedBox.y,
                          textBoxWidth: updatedBox.width,
                          textBoxHeight: updatedBox.height
                        })
                      }
                      isSelected={true}
                      isEditable={true}
                      cardWidth={360}
                      cardHeight={260}
                    />
                  </div>
                </div>
              )}
              <StickerCanvasOverlay
                stickers={currentPage.stickers || []}
                selectedStickerId={selectedStickerId}
                onSelectSticker={setSelectedStickerId}
                onUpdateSticker={(id, upd) =>
                  updateCurrentPage({
                    stickers: (currentPage.stickers || []).map((s) => (s.id === id ? { ...s, ...upd } : s))
                  })
                }
                isEditable={true}
              />

              <div className="page-footer-number">
                Page {currentPageIndex + 1} of {pages.length}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="compact-studio-footer">
          <span className="footer-info">
            All pages remain editable until submission ✦
          </span>
          <div className="story-footer-actions">

            <button
              type="button"
              className="continue-button"
              onClick={handleFinalSubmit}
            >
              <span>Submit Story</span>
              <Check size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
