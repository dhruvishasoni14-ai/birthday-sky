import React, { useState } from 'react';
import { useSky } from '../../context/SkyContext';
import { X, Sparkles, Send, AlertCircle, RefreshCw, History, User } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BlackHoleModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    currentUser,
    addBlackHoleWish,
    blackHoleWishes,
    setAuthNotice
  } = useSky();

  const [wishText, setWishText] = useState('');
  const [isSucking, setIsSucking] = useState(false);
  const [suckedText, setSuckedText] = useState('');
  const [suckedCreator, setSuckedCreator] = useState<{ name: string; avatar?: string } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [viewHistory, setViewHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (activeModal !== 'black-hole') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentUser) {
      setAuthNotice('Please Log In or Sign Up to release your intention into the Black Hole.');
      setActiveModal('auth');
      return;
    }

    const trimmed = wishText.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your wish, prayer, or burden before releasing.');
      return;
    }

    setSuckedText(trimmed);
    setSuckedCreator({ name: currentUser.username, avatar: currentUser.avatarUrl });
    setIsSucking(true);

    // Save in session state (chronological order)
    addBlackHoleWish(trimmed);

    // Cinematic multi-stage sequence: card appears, floats toward void, curves/rotates, shrinks, disappears
    setTimeout(() => {
      setIsSucking(false);
      setIsCompleted(true);
      setWishText('');

      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.5 },
        colors: ['#a855f7', '#38bdf8', '#f59e0b', '#ec4899', '#B89CFF']
      });
    }, 2800);
  };

  const handleReset = () => {
    setIsCompleted(false);
    setIsSucking(false);
    setWishText('');
    setErrorMessage(null);
  };

  return (
    <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
      <div
        className="modal-content black-hole-modal-window glass-panel animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="black-hole-header">
          <div>
            <div className="eyebrow">COSMIC SINGULARITY · SACRED DISSOLUTION</div>
            <h2>Wishes, Prayers & Release for Her</h2>
          </div>

          <div className="black-hole-header-actions">
            <button
              type="button"
              className={`sub-nav-btn ${viewHistory ? 'active' : ''}`}
              onClick={() => setViewHistory(!viewHistory)}
            >
              <History size={15} />
              <span>History ({blackHoleWishes.length})</span>
            </button>

            <button
              type="button"
              className="close-modal-btn"
              onClick={() => setActiveModal(null)}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="black-hole-content-area">
          {/* Central Animated Singularity Visual */}
          <div className="black-hole-visual-center">
            <div className={`singularity-core ${isSucking ? 'active-vortex' : ''}`}>
              <div className="singularity-glow-outer" />
              <div className="singularity-event-horizon" />
              <div className="singularity-spiral-rays" />
            </div>

            {/* Cinematic Floating Card Suction Sequence */}
            {isSucking && (
              <div className="cinematic-suck-card animate-cinematic-pull">
                <div className="suck-card-quote">"{suckedText}"</div>
                {suckedCreator && (
                  <div className="suck-card-creator">
                    {suckedCreator.avatar?.startsWith('emoji:') ? (
                      <span>{suckedCreator.avatar.replace('emoji:', '')}</span>
                    ) : (
                      <img src={suckedCreator.avatar} alt="Avatar" />
                    )}
                    <span>{suckedCreator.name}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {viewHistory ? (
            /* History of all submitted prayers/wishes in chronological order (oldest first) */
            <div className="black-hole-history-pane animate-fade-in">
              <div className="history-header-row">
                <span className="history-title">Released into the Void ({blackHoleWishes.length})</span>
                <span className="history-sub">Chronological order · Oldest intentions first</span>
              </div>

              {blackHoleWishes.length === 0 ? (
                <div className="empty-void-state">
                  <p>No prayers or burdens have been surrendered to the singularity yet.</p>
                </div>
              ) : (
                <div className="history-spiral-list">
                  {blackHoleWishes.map((item, idx) => (
                    <div key={item.id} className="history-wish-chip animate-fade-in">
                      <span className="history-index">#{idx + 1}</span>
                      <p className="history-text">"{item.wishText}"</p>
                      <div className="history-creator-pill">
                        {item.creatorAvatar?.startsWith('emoji:') ? (
                          <span className="mini-tag-emoji">{item.creatorAvatar.replace('emoji:', '')}</span>
                        ) : item.creatorAvatar ? (
                          <img src={item.creatorAvatar} alt={item.creatorName} className="mini-tag-avatar" />
                        ) : (
                          <User size={12} />
                        )}
                        <span>{item.creatorName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="secondary-action-btn"
                style={{ marginTop: '16px' }}
                onClick={() => setViewHistory(false)}
              >
                Return to Submit Form
              </button>
            </div>
          ) : !currentUser ? (
            /* Logged-Out Prompt */
            <div className="black-hole-auth-required animate-fade-in">
              <p className="void-quote">
                "Whatever is worrying or hurting her can disappear into the Black Hole. Leave prayers, heartfelt wishes, and burdens here to be dissolved into cosmic light."
              </p>
              <div className="auth-prompt-card">
                <AlertCircle size={20} className="icon-amber" />
                <p>Log in or sign up to release a prayer into the Black Hole.</p>
                <button
                  type="button"
                  className="continue-button"
                  onClick={() => {
                    setAuthNotice('Log in to release your prayer or wish into the Black Hole.');
                    setActiveModal('auth');
                  }}
                >
                  <span>Log In / Sign Up</span>
                </button>
              </div>
            </div>
          ) : isCompleted ? (
            /* Completed Disappearance Confirmation */
            <div className="black-hole-completed-pane animate-fade-in">
              <div className="void-absorbed-icon">✦</div>
              <h3>Absorbed & Dissolved into the Singularity</h3>
              <p className="void-blessing-text">
                Your prayer and worry have crossed the event horizon. All heaviness is gently pulled away, dissolved into stardust and infinite warmth for her upcoming year.
              </p>

              <div className="black-hole-actions-row">
                <button
                  type="button"
                  className="secondary-action-btn"
                  onClick={handleReset}
                >
                  <RefreshCw size={15} />
                  <span>Release Another Wish</span>
                </button>

                <button
                  type="button"
                  className="continue-button"
                  onClick={() => setActiveModal(null)}
                >
                  <span>Return to Sky</span>
                </button>
              </div>
            </div>
          ) : !isSucking ? (
            /* Input Form */
            <form onSubmit={handleSubmit} className="black-hole-form animate-fade-in">
              <p className="black-hole-prompt-desc">
                Release a wish, prayer, worry, or heavy thought for the birthday girl. Whatever troubles her will be pulled into the singularity and dissolved.
              </p>

              {errorMessage && (
                <div className="auth-feedback error animate-fade-in">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="prayer-input-container">
                <textarea
                  className="studio-textarea black-hole-input"
                  rows={4}
                  value={wishText}
                  onChange={(e) => setWishText(e.target.value)}
                  placeholder="e.g. May all stress, anxiety, and pain leave her life, replaced by peace and infinite joy..."
                  maxLength={350}
                  autoFocus
                />
              </div>

              <div className="black-hole-submit-footer">
                <div className="contributor-tag-subtle">
                  <span>Releasing as: <strong>{currentUser.username}</strong></span>
                </div>

                <button
                  type="submit"
                  className="continue-button black-hole-pull-btn"
                  disabled={!wishText.trim()}
                >
                  <span>Release into the Void</span>
                  <Send size={16} />
                </button>
              </div>
            </form>
          ) : (
            <div className="sucking-status-text">
              <span>Gravity pulling into the singularity...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
