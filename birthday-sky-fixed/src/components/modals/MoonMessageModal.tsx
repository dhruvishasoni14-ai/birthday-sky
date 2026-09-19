import React from 'react';
import { useSky } from '../../context/SkyContext';
import { PROGRAMMER_CENTRAL_MESSAGE } from '../../services/storage';
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
            {PROGRAMMER_CENTRAL_MESSAGE.text}
          </p>
        </div>
      </div>
    </div>
  );
};
