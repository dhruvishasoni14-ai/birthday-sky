import React, { useState } from 'react';
import { useSky } from '../../context/SkyContext';
import { Plus, X, Star, BookOpen, MessageSquare, Radio, CircleDot } from 'lucide-react';

export const AddMenu: React.FC = () => {
  const { setActiveModal, currentUser, setAuthNotice } = useSky();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (modalType: 'wish-studio' | 'planet-designer' | 'personality' | 'voice-probe' | 'black-hole') => {
    setIsOpen(false);
    if (!currentUser) {
      setAuthNotice('Please Log In or Sign Up before creating celestial content in Birthday Sky.');
      setActiveModal('auth');
      return;
    }
    setActiveModal(modalType);
  };

  return (
    <div className="add-menu-container">
      {/* Expanded Menu Options */}
      {isOpen && (
        <div className="add-menu-dropdown animate-fade-in">
          <div className="add-menu-header">Add to Birthday Sky</div>

          <button
            type="button"
            className="add-option-btn"
            onClick={() => handleSelect('wish-studio')}
          >
            <div className="option-icon star-icon">
              <Star size={18} />
            </div>
            <div className="option-info">
              <span className="option-title">Wish Card</span>
              <span className="option-desc">Create constellation in the sky</span>
            </div>
          </button>

          <button
            type="button"
            className="add-option-btn"
            onClick={() => handleSelect('planet-designer')}
          >
            <div className="option-icon planet-icon">
              <BookOpen size={18} />
            </div>
            <div className="option-info">
              <span className="option-title">Relive a Day (Story)</span>
              <span className="option-desc">Design a planet & flipbook memory</span>
            </div>
          </button>

          <button
            type="button"
            className="add-option-btn"
            onClick={() => handleSelect('personality')}
          >
            <div className="option-icon nebula-icon">
              <MessageSquare size={18} />
            </div>
            <div className="option-info">
              <span className="option-title">Personality Word</span>
              <span className="option-desc">Add one or two personality words</span>
            </div>
          </button>

          <button
            type="button"
            className="add-option-btn"
            onClick={() => handleSelect('voice-probe')}
          >
            <div className="option-icon probe-icon">
              <Radio size={18} />
            </div>
            <div className="option-info">
              <span className="option-title">Space Probe</span>
              <span className="option-desc">Transmit an audio voice note</span>
            </div>
          </button>

          <button
            type="button"
            className="add-option-btn"
            onClick={() => handleSelect('black-hole')}
          >
            <div className="option-icon black-hole-icon">
              <CircleDot size={18} />
            </div>
            <div className="option-info">
              <span className="option-title">Black Hole Prayer</span>
              <span className="option-desc">Send away negativity into the void</span>
            </div>
          </button>
        </div>
      )}

      {/* Main Floating '+' Action Button */}
      <button
        id="addWish"
        type="button"
        className={`floating-add-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close creation menu' : 'Create new celestial item'}
      >
        {isOpen ? <X size={26} /> : <Plus size={28} />}
      </button>
    </div>
  );
};
