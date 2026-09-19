import React, { useEffect, useState } from 'react';
import { useSky } from '../../context/SkyContext';
import { StickerCanvasOverlay } from '../shared/StickerCanvasOverlay';
import { X, ChevronLeft, ChevronRight, BookOpen, User } from 'lucide-react';

export const StoryViewerModal: React.FC = () => {
  const { activeModal, setActiveModal, stories, activeStoryId } = useSky();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);

  useEffect(() => {
    // Every newly opened story starts at its cover/first page.
    setCurrentPageIndex(0);
    setFlipDirection(null);
  }, [activeStoryId, activeModal]);

  if (activeModal !== 'story-view' || !activeStoryId) return null;

  const story = stories.find((s) => s.id === activeStoryId);
  if (!story || !story.pages || story.pages.length === 0) return null;

  const pages = story.pages;
  const currentPage = pages[currentPageIndex] || pages[0];
  const creatorName = story.creatorName || 'Cosmic Storyteller';
  const creatorAvatar = story.creatorAvatar;

  const handleNextPage = () => {
    if (currentPageIndex >= pages.length - 1) return;
    setFlipDirection('next');
    setCurrentPageIndex((prev) => Math.min(pages.length - 1, prev + 1));
    window.setTimeout(() => setFlipDirection(null), 420);
  };

  const handlePrevPage = () => {
    if (currentPageIndex <= 0) return;
    setFlipDirection('prev');
    setCurrentPageIndex((prev) => Math.max(0, prev - 1));
    window.setTimeout(() => setFlipDirection(null), 420);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') handleNextPage();
    if (e.key === 'ArrowLeft') handlePrevPage();
    if (e.key === 'Escape') setActiveModal(null);
  };

  return (
    <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
      <div
        className="modal-content story-viewer-window glass-panel animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header with Creator Info */}
        <div className="story-viewer-header">
          <div className="viewer-title-row">
            <BookOpen size={20} className="icon-cyan" />
            <h3>{story.title || 'Relive a Day'}</h3>
          </div>

          <div className="viewer-header-right">
            <div className="creator-profile-badge" title={`Story by ${creatorName}`}>
              {creatorAvatar?.startsWith('emoji:') ? (
                <span className="creator-badge-emoji">{creatorAvatar.replace('emoji:', '')}</span>
              ) : creatorAvatar ? (
                <img src={creatorAvatar} alt={creatorName} className="creator-badge-avatar" />
              ) : (
                <User size={14} className="creator-badge-icon" />
              )}
              <span className="creator-badge-name">{creatorName}</span>
            </div>

            <button
              type="button"
              className="close-modal-btn"
              onClick={() => setActiveModal(null)}
              aria-label="Close story"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Flipbook Page Reader Body with 3D Turn Animation */}
        <div className="flipbook-reader-body">
          <div
            className={`flipbook-book-frame theme-${currentPage.theme} layout-${currentPage.layout} ${
              flipDirection === 'next' ? 'page-flip-next' : flipDirection === 'prev' ? 'page-flip-prev' : ''
            }`}
          >
            {/* Layout 1: Text Only */}
            {currentPage.layout === 1 && (
              <div
                className={`page-text-container font-${currentPage.textStyle.font}`}
                style={{
                  color: currentPage.textStyle.color,
                  fontSize: `${currentPage.textStyle.size}px`,
                  fontWeight: currentPage.textStyle.bold ? 'bold' : 'normal',
                  fontStyle: currentPage.textStyle.italic ? 'italic' : 'normal',
                  textDecoration: currentPage.textStyle.underline ? 'underline' : 'none'
                }}
              >
                {currentPage.text}
              </div>
            )}

            {/* Layout 2: Image Only / Freely positioned */}
            {currentPage.layout === 2 && (
              <div className="page-image-container full-image">
                {currentPage.imageUrl && (
                  <img src={currentPage.imageUrl} alt="Story memory" className="story-render-image" />
                )}
              </div>
            )}

            {/* Layout 3: Text Left + Image Right */}
            {currentPage.layout === 3 && (
              <div className="page-split-container">
                <div
                  className={`page-split-text font-${currentPage.textStyle.font}`}
                  style={{
                    color: currentPage.textStyle.color,
                    fontSize: `${currentPage.textStyle.size}px`,
                    fontWeight: currentPage.textStyle.bold ? 'bold' : 'normal',
                    fontStyle: currentPage.textStyle.italic ? 'italic' : 'normal',
                    textDecoration: currentPage.textStyle.underline ? 'underline' : 'none'
                  }}
                >
                  {currentPage.text}
                </div>
                <div className="page-split-image">
                  {currentPage.imageUrl && (
                    <img src={currentPage.imageUrl} alt="Story memory" className="story-render-image" />
                  )}
                </div>
              </div>
            )}

            {/* Layout 4: Image Left + Text Right */}
            {currentPage.layout === 4 && (
              <div className="page-split-container">
                <div className="page-split-image">
                  {currentPage.imageUrl && (
                    <img src={currentPage.imageUrl} alt="Story memory" className="story-render-image" />
                  )}
                </div>
                <div
                  className={`page-split-text font-${currentPage.textStyle.font}`}
                  style={{
                    color: currentPage.textStyle.color,
                    fontSize: `${currentPage.textStyle.size}px`,
                    fontWeight: currentPage.textStyle.bold ? 'bold' : 'normal',
                    fontStyle: currentPage.textStyle.italic ? 'italic' : 'normal',
                    textDecoration: currentPage.textStyle.underline ? 'underline' : 'none'
                  }}
                >
                  {currentPage.text}
                </div>
              </div>
            )}

            {/* Stickers Overlay */}
            <StickerCanvasOverlay
              stickers={currentPage.stickers || []}
              isEditable={false}
            />

            <div className="page-footer-number">
              {currentPageIndex + 1} / {pages.length}
            </div>
          </div>
        </div>

        {/* Flipbook Navigation Controls */}
        <div className="story-viewer-footer-nav">
          <button
            type="button"
            className="viewer-nav-btn"
            disabled={currentPageIndex === 0}
            onClick={handlePrevPage}
          >
            <ChevronLeft size={20} />
            <span>Previous</span>
          </button>

          <div className="viewer-counter-badge">
            {currentPageIndex + 1} / {pages.length}
          </div>

          <button
            type="button"
            className="viewer-nav-btn"
            disabled={currentPageIndex === pages.length - 1}
            onClick={handleNextPage}
          >
            <span>Next</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
