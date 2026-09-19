import React, { useState } from 'react';
import { useSky } from '../../context/SkyContext';
import { X, Plus, List, Sparkles, User, AlertCircle, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * Personality entries live here, not as floating text in the sky.
 * Opening the heart nebula always opens this chronological list.
 */
export const PersonalityModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    personalityWords,
    addPersonalityWord,
    currentUser,
    setAuthNotice
  } = useSky();

  const [isAdding, setIsAdding] = useState(false);
  const [wordInput, setWordInput] = useState('');
  const [explanationInput, setExplanationInput] = useState('');
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (activeModal !== 'personality') return null;

  const handleOpenAdd = () => {
    if (!currentUser) {
      setAuthNotice('Please Log In or Sign Up to add a personality word.');
      setActiveModal('auth');
      return;
    }
    setIsAdding(true);
    setValidationError(null);
  };

  const handleWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedWord = wordInput.trim();
    if (!trimmedWord) {
      setValidationError('Please enter one or two words describing her.');
      return;
    }
    if (trimmedWord.split(/\s+/).filter(Boolean).length > 2) {
      setValidationError('Please enter ONE or TWO words only.');
      return;
    }

    const trimmedExpl = explanationInput.trim();
    if (!trimmedExpl) {
      setValidationError('Please explain why you chose this word.');
      return;
    }

    const res = addPersonalityWord(trimmedWord, trimmedExpl);
    if (!res.success) {
      setValidationError(res.error || 'Failed to add word.');
      return;
    }

    setWordInput('');
    setExplanationInput('');
    setIsAdding(false);

    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
      <div
        className="modal-content personality-universe-window glass-panel animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="personality-universe-header">
          <div className="header-titles">
            <span className="eyebrow">PERSONALITY NEBULA · HEART & SOUL</span>
            <h2>Nebula Words</h2>
            <p className="personality-list-subtitle">
              A little list of the words people chose for you, saved in the order they were added.
            </p>
          </div>

          <div className="personality-header-controls">
            {!isAdding && (
              <button type="button" className="add-word-accent-btn" onClick={handleOpenAdd}>
                <Plus size={16} />
                <span>Add Word</span>
              </button>
            )}
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

        <div className="personality-universe-body">
          {isAdding ? (
            <div className="add-word-dialog-pane animate-fade-in">
              <button
                type="button"
                className="back-btn"
                onClick={() => {
                  setIsAdding(false);
                  setValidationError(null);
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to Nebula Words</span>
              </button>

              <div className="add-word-card">
                <h3>Describe her in one or two words</h3>
                <p className="add-word-subtitle">
                  Pick a meaningful word and tell her why you chose it.
                </p>

                {validationError && (
                  <div className="auth-feedback error animate-fade-in">
                    <AlertCircle size={16} />
                    <span>{validationError}</span>
                  </div>
                )}

                <form onSubmit={handleWordSubmit} className="single-word-form">
                  <div className="nebula-form-group">
                    <label className="input-label required-label">
                      Word <span className="compulsory-tag">*1 or 2 words</span>
                    </label>
                    <input
                      type="text"
                      className="studio-text-input word-input"
                      value={wordInput}
                      onChange={(e) => setWordInput(e.target.value)}
                      placeholder="e.g. Brilliant, Sunshine, Fearless..."
                      maxLength={30}
                      autoFocus
                    />
                  </div>

                  <div className="nebula-form-group" style={{ marginTop: 14 }}>
                    <label className="input-label required-label">
                      Why did you choose this word? <span className="compulsory-tag">*Required</span>
                    </label>
                    <textarea
                      className="studio-textarea compact"
                      rows={4}
                      value={explanationInput}
                      onChange={(e) => setExplanationInput(e.target.value)}
                      placeholder="Share a heartfelt reason or memory..."
                      maxLength={350}
                    />
                  </div>

                  <div className="word-creator-info">
                    <span>Contributing as:</span>
                    <div className="creator-pill">
                      {currentUser?.avatarUrl?.startsWith('emoji:') ? (
                        <span className="creator-pill-emoji">{currentUser.avatarUrl.replace('emoji:', '')}</span>
                      ) : currentUser?.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt="Avatar" className="mini-avatar" />
                      ) : (
                        <User size={14} />
                      )}
                      <strong>{currentUser?.username}</strong>
                    </div>
                  </div>

                  <div className="add-word-actions">
                    <button
                      type="button"
                      className="secondary-action-btn"
                      onClick={() => {
                        setIsAdding(false);
                        setValidationError(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="continue-button">
                      <span>Release into Nebula</span>
                      <Sparkles size={16} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : personalityWords.length === 0 ? (
            <div className="empty-nebula-state animate-fade-in">
              <div className="empty-floating-heart">💖</div>
              <h3>No words added yet</h3>
              <p>Be the first to describe her in the cosmic heart nebula.</p>
              <button type="button" className="continue-button" onClick={handleOpenAdd}>
                <Plus size={16} />
                <span>Add First Word</span>
              </button>
            </div>
          ) : (
            <div className="personality-list-view-container animate-fade-in">
              <div className="list-heading-meta">
                <span><List size={15} /> Words for the Birthday Girl ({personalityWords.length})</span>
                <small>Click a contributor to reveal the reason.</small>
              </div>

              <div className="words-cards-scroll">
                {personalityWords.map((item, idx) => {
                  const isExpanded = expandedEntryId === item.id;
                  return (
                    <div key={item.id} className={`nebula-word-card ${isExpanded ? 'expanded' : ''}`}>
                      <div className="nebula-word-main-row">
                        <div className="word-index-badge">#{idx + 1}</div>
                        <div className="word-prominent-display" style={{ color: item.color }}>
                          {item.word}
                        </div>
                        <button
                          type="button"
                          className="creator-reveal-button"
                          onClick={() => setExpandedEntryId(isExpanded ? null : item.id)}
                          title="Show explanation"
                        >
                          <div className="creator-badge-avatar-wrap">
                            {item.creatorAvatar?.startsWith('emoji:') ? (
                              <span className="creator-badge-emoji-small">
                                {item.creatorAvatar.replace('emoji:', '')}
                              </span>
                            ) : item.creatorAvatar ? (
                              <img src={item.creatorAvatar} alt="" className="creator-badge-avatar-img" />
                            ) : (
                              <User size={13} />
                            )}
                          </div>
                          <span className="creator-reveal-name">{item.creatorName}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="nebula-explanation-drawer animate-fade-in">
                          <div className="drawer-header">Why they chose “{item.word}”</div>
                          <p className="drawer-explanation-text">{item.explanation || 'No reason provided.'}</p>
                          <div className="drawer-timestamp">
                            Added {new Date(item.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {!isAdding && personalityWords.length > 0 && (
          <div className="personality-universe-footer">
            <span className="session-memory-note">✦ Saved in creation order</span>
          </div>
        )}
      </div>
    </div>
  );
};
