import React from 'react';
import { useSky } from '../../context/SkyContext';
import { User, LogIn, ChevronDown } from 'lucide-react';

export const HeaderStats: React.FC = () => {
  const { currentUser, setActiveModal, setAuthMode, authNotice, setAuthNotice } = useSky();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="header-bar-container">
      {/* Auth Notice Toast if logged-out user tries to create content */}
      {authNotice && (
        <div className="auth-notice-toast animate-fade-in" onClick={() => setAuthNotice(null)}>
          <span>🔒 {authNotice}</span>
          <button
            type="button"
            className="auth-toast-btn"
            onClick={(e) => {
              e.stopPropagation();
              setAuthNotice(null);
              setActiveModal('auth');
            }}
          >
            Log In / Sign Up
          </button>
        </div>
      )}

      {/* Top-Right: Authentication / Profile Button */}
      <div className="header-profile-action account-menu-wrap">
        <button
          type="button"
          className={`create-profile-btn ${currentUser ? 'logged-in' : 'logged-out'}`}
          onClick={() => { setAuthMode('choice'); setActiveModal('auth'); setIsOpen(false); }}
          title="Accounts"
          aria-expanded={false}
        >
          {currentUser?.avatarUrl && !currentUser.avatarUrl.startsWith('emoji:') ? (
            <img src={currentUser.avatarUrl} alt="Avatar" className="header-avatar-thumb" />
          ) : currentUser?.avatarUrl?.startsWith('emoji:') ? (
            <span className="header-avatar-emoji">{currentUser.avatarUrl.replace('emoji:', '')}</span>
          ) : (
            <User size={16} />
          )}

          <span className="header-btn-label">
            {currentUser ? currentUser.username : 'Accounts'}
          </span>
          {!currentUser && <LogIn size={14} className="header-login-icon" />}
          <ChevronDown size={14} />
        </button>
      </div>
    </header>
  );
};
