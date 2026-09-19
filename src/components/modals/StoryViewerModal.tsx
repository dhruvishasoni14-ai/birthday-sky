import React, { useEffect, useState } from 'react';
import { useSky } from '../../context/SkyContext';
import { StickerCanvasOverlay } from '../shared/StickerCanvasOverlay';
import { CardTextBoxItem } from '../shared/CardTextBoxItem';
import { X, ChevronLeft, ChevronRight, User } from 'lucide-react';

export const StoryViewerModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    activeStoryId,
    stories
  } = useSky();

  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const story = stories.find((s) => s.id === activeStoryId);

  useEffect(() => {
    if (activeModal === 'story-view') {
      setCurrentPageIndex(0);
    }
  }, [activeModal, activeStoryId]);

  if (activeModal !== 'story-view' || !story) {
    return null;
  }

  const pages = story.pages || [];
  const currentPage = pages[currentPageIndex];

  if (!currentPage) {
    return null;
  }

  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === pages.length - 1;

  const goPrevious = () => {
    if (!isFirstPage) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const goNext = () => {
    if (!isLastPage) {
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const getPageBackground = () => {
    if (currentPage.theme === 'custom') {
      return `radial-gradient(
        circle at 50% 50%,
        ${currentPage.customGradientFrom || '#1a1033'} 0%,
        ${currentPage.customGradientTo || '#4b2a7b'} 100%
      )`;
    }

    switch (currentPage.theme) {
      case 'stardust':
        return 'linear-gradient(135deg, #17152d 0%, #30255c 100%)';

      case 'parchment':
        return 'linear-gradient(135deg, #f3e7ce 0%, #d8c39d 100%)';

      case 'blossom':
        return 'linear-gradient(135deg, #4b243f 0%, #8f456f 100%)';

      case 'cosmic':
        return 'linear-gradient(135deg, #111b3d 0%, #3b2670 100%)';

      case 'sunset':
        return 'linear-gradient(135deg, #5d2632 0%, #b45d45 100%)';

      case 'midnight':
      default:
        return 'linear-gradient(135deg, #0c0c1d 0%, #21183d 100%)';
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={() => setActiveModal(null)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.78)',
        padding: '20px'
      }}
    >
      <div
        className="story-viewer-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(900px, 94vw)',
          maxHeight: '92vh',
          background: '#11111c',
          borderRadius: '18px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.55)'
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            flexShrink: 0
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              minWidth: 0
            }}
          >
            {story.creatorAvatar ? (
              <img
                src={story.creatorAvatar}
                alt="Creator"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.1)'
                }}
              >
                <User size={19} />
              </div>
            )}

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#fff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {story.creatorName || 'Anonymous'}
              </div>

              <div
                style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.65)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {story.title}
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            aria-label="Close"
            style={{
              width: '38px',
              height: '38px',
              border: 'none',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            height: '1px',
            background: 'rgba(255,255,255,0.08)',
            flexShrink: 0
          }}
        />

        {/* STORY CONTENT */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '24px 16px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%'
            }}
          >
            {/* PAGE */}
            <div
              className="story-viewer-page"
              style={{
                position: 'relative',
                width: '360px',
                height: '260px',
                flexShrink: 0,
                overflow: 'hidden',
                boxSizing: 'border-box',
                background: getPageBackground(),
                borderRadius: '10px',
                boxShadow: '0 12px 35px rgba(0,0,0,0.4)'
              }}
            >
              {/* LAYOUT 1 */}
              {currentPage.layout === 1 && (
                <CardTextBoxItem
                  id={`story-view-text-${currentPage.id}`}
                  box={{
                    text: currentPage.text || '',
                    x: currentPage.textBoxX,
                    y: currentPage.textBoxY,
                    width: currentPage.textBoxWidth,
                    height: currentPage.textBoxHeight,
                    style: currentPage.textStyle
                  }}
                  onChange={() => { }}
                  cardWidth={360}
                  cardHeight={260}
                />
              )}

              {/* LAYOUT 2 */}
              {currentPage.layout === 2 && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '360px',
                    height: '260px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  {currentPage.imageUrl && (
                    <img
                      src={currentPage.imageUrl}
                      alt="Story memory"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block'
                      }}
                    />
                  )}
                </div>
              )}

              {/* LAYOUT 3 */}
              {currentPage.layout === 3 && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '360px',
                    height: '260px'
                  }}
                >
                  <CardTextBoxItem
                    id={`story-text-3-${currentPage.id}`}
                    box={{
                      text:
                        currentPage.text ||
                        'Add your story text in the editor...',
                      x: 10,
                      y: 26,
                      width: 160,
                      height: 220,
                      style: currentPage.textStyle
                    }}
                    onChange={() => { }}
                    cardWidth={360}
                    cardHeight={260}
                  />

                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '180px',
                      height: '260px',
                      overflow: 'hidden'
                    }}
                  >
                    {currentPage.imageUrl && (
                      <img
                        src={currentPage.imageUrl}
                        alt="Story memory"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          display: 'block',
                          maxWidth: '100%',
                          maxHeight: '100%'
                        }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* LAYOUT 4 */}
              {currentPage.layout === 4 && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '360px',
                    height: '260px'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '180px',
                      height: '260px',
                      overflow: 'hidden'
                    }}
                  >
                    {currentPage.imageUrl && (
                      <img
                        src={currentPage.imageUrl}
                        alt="Story memory"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          display: 'block',
                          maxWidth: '100%',
                          maxHeight: '100%'
                        }}
                      />
                    )}
                  </div>
                  <CardTextBoxItem
                    id={`story-text-4-${currentPage.id}`}
                    box={{
                      text:
                        currentPage.text ||
                        'Add your story text in the editor...',
                      x: 190,
                      y: 26,
                      width: 160,
                      height: 220,
                      style: currentPage.textStyle
                    }}
                    onChange={() => { }}
                    cardWidth={360}
                    cardHeight={260}
                  />
                </div>
              )}

              {/* STICKERS */}
              {currentPage.stickers?.length > 0 && (
                <StickerCanvasOverlay
                  stickers={currentPage.stickers}
                />
              )}

              {/* PAGE NUMBER */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: '7px',
                  transform: 'translateX(-50%)',
                  padding: '3px 8px',
                  borderRadius: '10px',
                  background: 'rgba(0,0,0,0.25)',
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: '10px',
                  lineHeight: 1,
                  pointerEvents: 'none',
                  zIndex: 20
                }}
              >
                {currentPageIndex + 1} / {pages.length}
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '18px',
            padding: '14px 18px 18px',
            flexShrink: 0
          }}
        >
          <button
            onClick={goPrevious}
            disabled={isFirstPage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 15px',
              border: 'none',
              borderRadius: '10px',
              background: isFirstPage
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(255,255,255,0.1)',
              color: isFirstPage
                ? 'rgba(255,255,255,0.3)'
                : '#fff',
              cursor: isFirstPage ? 'default' : 'pointer',
              fontSize: '13px'
            }}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div
            style={{
              minWidth: '55px',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '13px'
            }}
          >
            {currentPageIndex + 1} / {pages.length}
          </div>

          <button
            onClick={goNext}
            disabled={isLastPage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 15px',
              border: 'none',
              borderRadius: '10px',
              background: isLastPage
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(255,255,255,0.1)',
              color: isLastPage
                ? 'rgba(255,255,255,0.3)'
                : '#fff',
              cursor: isLastPage ? 'default' : 'pointer',
              fontSize: '13px'
            }}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};