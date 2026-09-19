import React, { useEffect, useMemo, useState } from 'react';
import { useSky } from '../../context/SkyContext';
import {
  AlertCircle,
  ArrowLeft,
  History,
  Send,
  User,
  X,
  Sparkles
} from 'lucide-react';

type Panel = 'main' | 'add' | 'prayers';

export const BlackHoleModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    currentUser,
    addBlackHoleWish,
    blackHoleWishes,
    setAuthNotice
  } = useSky();

  const [panel, setPanel] = useState<Panel>('main');
  const [wishText, setWishText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [incomingId, setIncomingId] = useState<string | null>(null);

  useEffect(() => {
    if (activeModal === 'black-hole') {
      setPanel('main');
      setWishText('');
      setErrorMessage(null);
      setIncomingId(null);
    }
  }, [activeModal]);

  const animatedPrayers = useMemo(
    () => blackHoleWishes.slice(-6),
    [blackHoleWishes]
  );

  if (activeModal !== 'black-hole') return null;

  const openAddPrayer = () => {
    if (!currentUser) {
      setAuthNotice('Please Log In or Sign Up to add a prayer.');
      setActiveModal('auth');
      return;
    }

    setErrorMessage(null);
    setPanel('add');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentUser) return;

    const text = wishText.trim();

    if (!text) {
      setErrorMessage('Write a prayer before submitting.');
      return;
    }

    const id = `prayer-${Date.now()}`;

    setIncomingId(id);
    addBlackHoleWish(text);
    setWishText('');
    setPanel('main');

    window.setTimeout(() => setIncomingId(null), 5200);
  };

  const close = () => {
    setPanel('main');
    setActiveModal(null);
  };

  return (
    <div
      className="modal-backdrop black-hole-backdrop"
      onClick={close}
      style={{
        padding: '16px',
        boxSizing: 'border-box'
      }}
    >
      <div
        className="black-hole-modal-window glass-panel animate-scale-in"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 'min(680px, 94vw)',
          maxHeight: 'calc(100vh - 32px)',
          overflow: 'hidden',
          padding: '24px',
          boxSizing: 'border-box',
          borderRadius: '24px'
        }}
      >
        <header
          className="black-hole-header"
          style={{
            paddingBottom: '16px',
            marginBottom: '16px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px'
          }}
        >
          <div
            className="black-hole-title-block"
            style={{
              flex: 1,
              minWidth: 0
            }}
          >
            <span
              className="eyebrow"
              style={{
                display: 'block',
                marginBottom: '5px',
                fontSize: '10px',
                letterSpacing: '1.5px',
                opacity: 0.6
              }}
            >
              A COSMIC PLACE TO LET GO
            </span>

            <h2
              style={{
                margin: 0,
                fontSize: 'clamp(21px, 4vw, 28px)',
                lineHeight: 1.2
              }}
            >
              {panel === 'main'
                ? 'Send a Prayer into the Universe'
                : panel === 'add'
                  ? 'Add a Prayer'
                  : 'See the Prayers'}
            </h2>

            <p
              style={{
                margin: '7px 0 0',
                fontSize: '13px',
                lineHeight: 1.45,
                opacity: 0.65
              }}
            >
              {panel === 'main'
                ? 'Words of hope are gently pulled into the Black Hole for her upcoming year.'
                : panel === 'add'
                  ? 'Write a prayer for her upcoming year.'
                  : 'Every prayer released into the Black Hole, held with care.'}
            </p>
          </div>

          <button
            type="button"
            className="close-modal-btn"
            onClick={close}
            aria-label="Close Black Hole"
          >
            <X size={20} />
          </button>
        </header>

        {panel === 'main' && (
          <main
            className="black-hole-main-panel"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            {/* BLACK HOLE STAGE */}
            <div
              aria-label="Prayers traveling into the Black Hole"
              style={{
                position: 'relative',
                width: '100%',
                height: 'clamp(190px, 31vh, 250px)',
                minHeight: '190px',
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  'radial-gradient(circle at center, #171126 0%, #0b0b19 55%, #05050d 100%)'
              }}
            >
              {/* OUTER GLOW */}
              <div
                style={{
                  position: 'absolute',
                  width: '170px',
                  height: '170px',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle, transparent 43%, rgba(255,180,50,0.22) 51%, rgba(255,130,20,0.12) 60%, transparent 73%)',
                  filter: 'blur(2px)',
                  zIndex: 1
                }}
              />

              {/* ACCRETION RING */}
              <div
                style={{
                  position: 'absolute',
                  width: '142px',
                  height: '142px',
                  borderRadius: '50%',
                  border: '3px solid rgba(255,193,58,0.65)',
                  boxShadow:
                    '0 0 12px rgba(255,190,50,0.75), 0 0 28px rgba(255,130,20,0.35)',
                  zIndex: 2
                }}
              />

              {/* PURPLE OUTER RING */}
              <div
                style={{
                  position: 'absolute',
                  width: '158px',
                  height: '158px',
                  borderRadius: '50%',
                  border: '1px solid rgba(156,100,255,0.35)',
                  boxShadow:
                    '0 0 25px rgba(130,80,255,0.25)',
                  zIndex: 2
                }}
              />

              {/* BLACK CENTER */}
              <div
                style={{
                  position: 'absolute',
                  width: '82px',
                  height: '82px',
                  borderRadius: '50%',
                  background: '#000000',
                  boxShadow:
                    '0 0 18px rgba(0,0,0,1), 0 0 35px rgba(0,0,0,0.95)',
                  zIndex: 4
                }}
              />

              {/* INNER GOLDEN EDGE */}
              <div
                style={{
                  position: 'absolute',
                  width: '88px',
                  height: '88px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,204,75,0.75)',
                  boxShadow:
                    '0 0 10px rgba(255,190,40,0.8)',
                  zIndex: 3
                }}
              />

              {/* PRAYERS */}
              {animatedPrayers.map((prayer, index) => (
                <div
                  key={prayer.id}
                  className={`black-hole-prayer-traveler ${incomingId === prayer.id ? 'is-new' : ''
                    }`}
                  style={
                    {
                      '--prayer-index': index,
                      '--prayer-x': `${((index * 29) % 70) - 35}px`,
                      '--prayer-y': `${((index * 43) % 100) - 50}px`,
                      position: 'absolute',
                      zIndex: 6
                    } as React.CSSProperties
                  }
                >
                  <span>{prayer.wishText}</span>
                </div>
              ))}

              {blackHoleWishes.length === 0 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 7,
                    fontSize: '11px',
                    opacity: 0.5,
                    whiteSpace: 'nowrap'
                  }}
                >
                  Prayers will travel here
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            <div
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '0 16px',
                textAlign: 'center',
                overflow: 'hidden'
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  lineHeight: 1.55,
                  opacity: 0.7,
                  overflowWrap: 'anywhere'
                }}
              >
                Write something hopeful. As it travels inward, the Black Hole
                absorbs the weight and leaves only warmth for her year ahead.
              </p>
            </div>

            {/* ACTIONS */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}
            >
              <button
                type="button"
                className="continue-button"
                onClick={openAddPrayer}
                style={{
                  minHeight: '48px',
                  borderRadius: '14px',
                  padding: '12px 16px',
                  justifyContent: 'center',
                  boxShadow:
                    '0 8px 24px rgba(139,92,246,0.25)'
                }}
              >
                <Send size={17} />
                <span>Add a Prayer</span>
              </button>

              <button
                type="button"
                onClick={() => setPanel('prayers')}
                style={{
                  minHeight: '48px',
                  borderRadius: '14px',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '9px',
                  cursor: 'pointer',
                  color: '#fff',
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.035))',
                  border: '1px solid rgba(255,255,255,0.14)',
                  boxShadow:
                    '0 8px 24px rgba(0,0,0,0.2)'
                }}
              >
                <History size={17} />
                <span>See the Prayers</span>

                <span
                  style={{
                    minWidth: '22px',
                    height: '22px',
                    padding: '0 6px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: 'rgba(255,255,255,0.1)'
                  }}
                >
                  {blackHoleWishes.length}
                </span>
              </button>
            </div>

            {/* FOOTER */}
            <div
              style={{
                paddingTop: '10px',
                borderTop:
                  '1px solid rgba(255,255,255,0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                opacity: 0.4,
                fontSize: '9px',
                letterSpacing: '1px'
              }}
            >
              <Sparkles size={10} />
              RELEASE • RECEIVE • REMEMBER
              <Sparkles size={10} />
            </div>
          </main>
        )}

        {panel === 'add' && (
          <form
            className="black-hole-prayer-form"
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <button
              type="button"
              className="black-hole-back-button"
              onClick={() => setPanel('main')}
            >
              <ArrowLeft size={16} />
              Back to Black Hole
            </button>

            {errorMessage && (
              <div className="auth-feedback error">
                <AlertCircle size={16} />
                {errorMessage}
              </div>
            )}

            <label
              htmlFor="black-hole-prayer"
              style={{
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              Write a prayer for her upcoming year
            </label>

            <textarea
              id="black-hole-prayer"
              value={wishText}
              onChange={(event) => {
                setWishText(event.target.value);
                setErrorMessage(null);
              }}
              placeholder="I hope this year brings you peace and happiness..."
              maxLength={350}
              autoFocus
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '16px',
                boxSizing: 'border-box',
                borderRadius: '16px',
                resize: 'vertical',
                fontSize: '14px',
                lineHeight: 1.6,
                color: '#fff',
                background: 'rgba(255,255,255,0.055)',
                border: '1px solid rgba(255,255,255,0.12)',
                outline: 'none'
              }}
            />

            <div
              className="black-hole-form-footer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap'
              }}
            >
              <span className="contributor-tag-subtle">
                Submitting as{' '}
                <strong>{currentUser?.username}</strong>
              </span>

              <button
                type="submit"
                className="continue-button"
                disabled={!wishText.trim()}
                style={{
                  borderRadius: '14px',
                  padding: '12px 18px'
                }}
              >
                Submit Prayer
                <Send size={16} />
              </button>
            </div>
          </form>
        )}

        {panel === 'prayers' && (
          <section
            className="black-hole-prayers-panel"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              minHeight: 0
            }}
          >
            <button
              type="button"
              className="black-hole-back-button"
              onClick={() => setPanel('main')}
            >
              <ArrowLeft size={16} />
              Back to Black Hole
            </button>

            {blackHoleWishes.length === 0 ? (
              <div className="black-hole-empty-list">
                <History size={28} />
                <p>No prayers have been submitted yet.</p>
              </div>
            ) : (
              <div
                className="black-hole-prayer-list"
                style={{
                  maxHeight: 'calc(100vh - 230px)',
                  overflowY: 'auto',
                  padding: '2px 4px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {blackHoleWishes.map((prayer) => (
                  <article
                    className="black-hole-prayer-entry"
                    key={prayer.id}
                    style={{
                      padding: '15px 16px',
                      borderRadius: '15px'
                    }}
                  >
                    <p
                      style={{
                        margin: '0 0 12px',
                        lineHeight: 1.55
                      }}
                    >
                      {prayer.wishText}
                    </p>

                    <div className="black-hole-prayer-sender">
                      {prayer.creatorAvatar ? (
                        <img
                          src={prayer.creatorAvatar}
                          alt=""
                        />
                      ) : (
                        <span>
                          <User size={14} />
                        </span>
                      )}

                      <strong>{prayer.creatorName}</strong>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};