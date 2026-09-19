import React from 'react';
import { useSky } from '../../context/SkyContext';
import { X, Sparkles } from 'lucide-react';

export const SecretStarModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    secretStars,
    activeSecretStarId
  } = useSky();

  if (activeModal !== 'secret-star' || !activeSecretStarId) return null;

  const star = secretStars.find((s) => s.id === activeSecretStarId);
  if (!star) return null;

  const starIndex = secretStars.findIndex(
    (s) => s.id === activeSecretStarId
  );

  const secretStarTitles = [
    '✦ A Curious Discovery ✦',
    '✦ Something Interesting ✦',
    '✦ An Unexpected Find ✦',
    '✦ A Strange Discovery ✦',
    '✦ Hidden Among the Stars ✦',
    '✦ A Celestial Discovery ✦',
    '✦ You Found Something ✦',
    '✦ An Unknown Signal ✦'
  ];

  const secretStarTitle =
    secretStarTitles[starIndex % secretStarTitles.length];

  return (
    <div
      className="modal-backdrop"
      onClick={() => setActiveModal(null)}
    >
      <div
        className="modal-content secret-star-window glass-panel animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          border: `1.5px solid ${star.hexColor}`,
          boxShadow: `0 0 45px ${star.hexColor}44`,
          padding: '32px 34px',
          boxSizing: 'border-box',
          overflow: 'visible'
        }}
      >
        {/* Decorative stars */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'visible'
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '18px',
              left: '28px',
              color: '#ffd166',
              fontSize: '14px'
            }}
          >
            ✦
          </span>

          <span
            style={{
              position: 'absolute',
              top: '72px',
              right: '24px',
              color: '#b98cff',
              fontSize: '10px'
            }}
          >
            ✦
          </span>

          <span
            style={{
              position: 'absolute',
              bottom: '28px',
              left: '22px',
              color: '#6fdcff',
              fontSize: '11px'
            }}
          >
            ✦
          </span>

          <span
            style={{
              position: 'absolute',
              bottom: '18px',
              right: '30px',
              color: '#ff9ed8',
              fontSize: '15px'
            }}
          >
            ✦
          </span>

          <span
            style={{
              position: 'absolute',
              top: '145px',
              left: '12px',
              color: '#9effb4',
              fontSize: '9px'
            }}
          >
            ✦
          </span>

          <span
            style={{
              position: 'absolute',
              top: '185px',
              right: '12px',
              color: '#ffd166',
              fontSize: '8px'
            }}
          >
            ✦
          </span>

          <span
            style={{
              position: 'absolute',
              bottom: '88px',
              left: '48px',
              color: '#c6a0ff',
              fontSize: '8px'
            }}
          >
            ✦
          </span>

          <span
            style={{
              position: 'absolute',
              bottom: '78px',
              right: '52px',
              color: '#7ee8ff',
              fontSize: '10px'
            }}
          >
            ✦
          </span>
        </div>

        {/* Close */}
        <button
          type="button"
          className="close-modal-btn top-right"
          onClick={() => setActiveModal(null)}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Star icon */}
        <div
          className="secret-star-icon-wrap"
          style={{
            backgroundColor: `${star.hexColor}22`,
            margin: '0 auto 18px',
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%'
          }}
        >
          <Sparkles size={32} color={star.hexColor} />
        </div>

        {/* Title */}
        <div
          className="secret-star-tag"
          style={{
            color: star.hexColor,
            margin: '0 0 22px',
            textAlign: 'center',
            width: '100%',
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '0.3px'
          }}
        >
          {secretStarTitle}
        </div>

        {/* Message */}
        <p
          className="secret-star-message"
          style={{
            margin: '22px 18px',
            padding: '18px 20px',
            lineHeight: 1.6,
            textAlign: 'center',
            overflowWrap: 'anywhere'
          }}
        >
          "{star.message}"
        </p>

        {/* Button */}
        <div
          className="secret-star-footer"
          style={{
            marginTop: '24px',
            display: 'flex',
            justifyContent: 'center',
            width: '100%'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveModal(null)}
            style={{
              border: 'none',
              borderRadius: '999px',
              padding: '11px 24px',
              background: `linear-gradient(135deg, ${star.hexColor}, #8b5cf6)`,
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.2px',
              cursor: 'pointer',
              boxShadow: `0 6px 18px ${star.hexColor}55`,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 9px 22px ${star.hexColor}66`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 6px 18px ${star.hexColor}55`;
            }}
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};