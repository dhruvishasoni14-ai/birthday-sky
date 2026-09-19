import React from 'react';
import { useSky } from '../../context/SkyContext';
import { X, Sparkles } from 'lucide-react';

export const SecretStarModal: React.FC = () => {
  const { activeModal, setActiveModal, secretStars, activeSecretStarId } = useSky();

  if (activeModal !== 'secret-star' || !activeSecretStarId) return null;

  const star = secretStars.find((s) => s.id === activeSecretStarId);
  if (!star) return null;

  return (
    <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
      <div
        className="modal-content secret-star-window glass-panel animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          border: `1.5px solid ${star.hexColor}`,
          boxShadow: `0 0 45px ${star.hexColor}44`
        }}
      >
        <button
          type="button"
          className="close-modal-btn top-right"
          onClick={() => setActiveModal(null)}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="secret-star-icon-wrap" style={{ backgroundColor: `${star.hexColor}22` }}>
          <Sparkles size={32} color={star.hexColor} />
        </div>

        <div className="secret-star-tag" style={{ color: star.hexColor }}>
          🌟 {star.colorName} SECRET STAR
        </div>

        <p className="secret-star-message">
          "{star.message}"
        </p>

        <div className="secret-star-footer">
          <button
            type="button"
            className="continue-button small"
            style={{ backgroundColor: star.hexColor, color: '#ffffff' }}
            onClick={() => setActiveModal(null)}
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
