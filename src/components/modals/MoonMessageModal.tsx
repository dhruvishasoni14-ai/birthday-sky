import React from 'react';
import { useSky } from '../../context/SkyContext';
import { X } from 'lucide-react';

export const MoonMessageModal: React.FC = () => {
  const { activeModal, setActiveModal } = useSky();

  if (activeModal !== 'moon-message') return null;

  return (
    <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
      <div
        className="modal-content moon-minimal-window glass-panel animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="close-modal-btn top-right"
          onClick={() => setActiveModal(null)}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="moon-message-content-area">
          <p className="moon-minimal-text">
            <span style={{ fontWeight: 700 }}>
              Happy Birthday Summm💋💕
            </span>
            <span>Welcome to this little sky which was made for you filled with wishes, memories and pieces of everyone who cares about you✨</span>
            <span>So move around and find elements which shine a bit more than the others 😋</span>
            <span>Hint: The unopened bar in the bottom left corner is there to help you😉</span>
          </p>
        </div>
      </div>
    </div>
  );
};
