import React, { useState, useRef } from 'react';
import { useSky } from '../../context/SkyContext';
import { X, Camera, Lock, User, LogIn, UserPlus, LogOut, CheckCircle, AlertCircle, Trash2, Star, BookOpen, Radio, MessageSquare, CircleDot } from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    currentUser,
    signUp,
    login,
    logout,
    authNotice,
    setAuthNotice,
    authMode,
    setAuthMode,
    wishes,
    deleteWish,
    stories,
    deleteStory,
    voiceNotes,
    deleteVoiceNote,
    personalityWords,
    deletePersonalityWord,
    blackHoleWishes,
    deleteBlackHoleWish,
    openWish,
    openStory,
    openVoiceNote
  } = useSky();

  // Sign Up form state (ALL 3 REQUIRED)
  const [signupAvatar, setSignupAvatar] = useState<string>('');
  const [signupUsername, setSignupUsername] = useState<string>('');
  const [signupPassword, setSignupPassword] = useState<string>('');

  // Login form state
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  // Status and error messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (activeModal !== 'profile' && activeModal !== 'auth') return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setSignupAvatar(dataUrl);
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // ALL THREE FIELDS ARE STRICTLY COMPULSORY
    if (!signupAvatar) {
      setErrorMessage('1. Profile photo is COMPULSORY. Please upload a profile picture.');
      return;
    }
    if (!signupUsername.trim()) {
      setErrorMessage('2. Username/Name is COMPULSORY. Please enter your name.');
      return;
    }
    if (!signupPassword.trim()) {
      setErrorMessage('3. Password is COMPULSORY. Please create a password.');
      return;
    }

    const res = signUp(signupUsername, signupPassword, signupAvatar);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to create account.');
    } else {
      setSuccessMessage(`Welcome, ${signupUsername.trim()}! You are now logged in.`);
      setTimeout(() => {
        setActiveModal(null);
        setSuccessMessage(null);
      }, 1000);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginUsername.trim()) {
      setErrorMessage('Please enter your username.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    const res = login(loginUsername, loginPassword);
    if (!res.success) {
      setErrorMessage(res.error || 'Invalid credentials.');
    } else {
      setSuccessMessage(`Welcome back, ${loginUsername.trim()}!`);
      setTimeout(() => {
        setActiveModal(null);
        setSuccessMessage(null);
      }, 800);
    }
  };

  const handleLogout = () => {
    logout();
    setSuccessMessage('Logged out successfully.');
    setTimeout(() => {
      setSuccessMessage(null);
    }, 1200);
  };

  // Filter content owned by current user
  const userWishes = currentUser ? wishes.filter((w) => w.creatorId === currentUser.id) : [];
  const userStories = currentUser ? stories.filter((s) => s.creatorId === currentUser.id) : [];
  const userVoiceNotes = currentUser ? voiceNotes.filter((v) => v.creatorId === currentUser.id) : [];
  const userWords = currentUser ? personalityWords.filter((p) => p.creatorId === currentUser.id) : [];
  const userBlackHoles = currentUser ? blackHoleWishes.filter((b) => b.creatorId === currentUser.id) : [];
  const userStickers = currentUser?.uploadedStickers || [];

  const totalUserCreations =
    userWishes.length +
    userStories.length +
    userVoiceNotes.length +
    userWords.length +
    userBlackHoles.length;

  return (
    <div
      className="modal-backdrop"
      onClick={() => {
        setAuthNotice(null);
        setActiveModal(null);
      }}
    >
      <div
        className="modal-content auth-modal-window glass-panel animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="auth-header">
          <div>
            <div className="eyebrow">ASTRONOMICAL CITIZEN PROFILE</div>
            <h2>{currentUser ? 'Your Account & Creations' : 'Account'}</h2>
            {!currentUser && (
              <p className="auth-modal-subtext">
                {authMode === 'choice'
                  ? 'Sign up or log in to manage your own creations across the sky.'
                  : authMode === 'signup'
                  ? 'Create your account with a required profile picture.'
                  : 'Log in to access your existing creations.'}
              </p>
            )}
          </div>
          <button
            type="button"
            className="close-modal-btn"
            onClick={() => {
              setAuthNotice(null);
              setActiveModal(null);
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notice from failed action attempt */}
        {authNotice && (
          <div className="auth-notice-banner animate-fade-in">
            <Lock size={16} />
            <span>{authNotice}</span>
          </div>
        )}

        {/* Error / Success Feedback */}
        {errorMessage && (
          <div className="auth-feedback error animate-fade-in">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="auth-feedback success animate-fade-in">
            <CheckCircle size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {currentUser ? (
          /* Currently Logged In View: Profile + Content Ownership */
          <div className="auth-logged-in-view animate-fade-in">
            <div className="auth-user-card">
              <div className="auth-avatar-display-lg">
                {currentUser.avatarUrl.startsWith('emoji:') ? (
                  <span className="auth-emoji-display">{currentUser.avatarUrl.replace('emoji:', '')}</span>
                ) : (
                  <img src={currentUser.avatarUrl} alt={currentUser.username} className="auth-avatar-img-lg" />
                )}
              </div>
              <div className="auth-user-info">
                <h3>{currentUser.username}</h3>
                <span className="auth-session-badge">Verified Creator ✦</span>
              </div>
            </div>

            {/* OWNED CONTENT SECTION (Ownership enforced) */}
            <div className="user-creations-manager">
              <div className="creations-header">
                <h4>Your Cosmic Creations ({totalUserCreations})</h4>
                <span className="creations-subtitle">You can view and delete items created by your account</span>
              </div>

              {totalUserCreations === 0 && userStickers.length === 0 ? (
                <div className="empty-creations-box">
                  <p>You haven't placed any celestial objects in the sky yet. Click <strong>+</strong> in the sky to begin!</p>
                </div>
              ) : (
                <div className="creations-list-scroll">
                  {/* Constellations */}
                  {userWishes.map((w) => (
                    <div key={w.id} className="creation-row-item">
                      <div className="creation-meta">
                        <Star size={16} className="creation-icon star-icon" />
                        <div>
                          <strong className="creation-title">{w.title || 'Wish Constellation'}</strong>
                          <span className="creation-detail">{w.points?.length || 0} stars · Created {new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <div className="creation-actions">
                        <button
                          type="button"
                          className="sub-action-btn view-btn"
                          onClick={() => {
                            setActiveModal(null);
                            openWish(w.id);
                          }}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="sub-action-btn delete-btn"
                          onClick={() => deleteWish(w.id)}
                          title="Delete this constellation"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Stories */}
                  {userStories.map((s) => (
                    <div key={s.id} className="creation-row-item">
                      <div className="creation-meta">
                        <BookOpen size={16} className="creation-icon planet-icon" />
                        <div>
                          <strong className="creation-title">{s.title || 'Relive a Day Story'}</strong>
                          <span className="creation-detail">{s.pages?.length || 1} pages · Created {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <div className="creation-actions">
                        <button
                          type="button"
                          className="sub-action-btn view-btn"
                          onClick={() => {
                            setActiveModal(null);
                            openStory(s.id);
                          }}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="sub-action-btn delete-btn"
                          onClick={() => deleteStory(s.id)}
                          title="Delete this story"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Voice Notes / Probes */}
                  {userVoiceNotes.map((v) => (
                    <div key={v.id} className="creation-row-item">
                      <div className="creation-meta">
                        <Radio size={16} className="creation-icon probe-icon" />
                        <div>
                          <strong className="creation-title">{v.title || 'Space Probe'}</strong>
                          <span className="creation-detail">{v.heard ? 'Signal Heard' : 'Unopened Transmission'}</span>
                        </div>
                      </div>
                      <div className="creation-actions">
                        <button
                          type="button"
                          className="sub-action-btn view-btn"
                          onClick={() => {
                            setActiveModal(null);
                            openVoiceNote(v.id);
                          }}
                        >
                          Play
                        </button>
                        <button
                          type="button"
                          className="sub-action-btn delete-btn"
                          onClick={() => deleteVoiceNote(v.id)}
                          title="Delete this probe"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Nebula Words */}
                  {userWords.map((p) => (
                    <div key={p.id} className="creation-row-item">
                      <div className="creation-meta">
                        <MessageSquare size={16} className="creation-icon nebula-icon" />
                        <div>
                          <strong className="creation-title">"{p.word}"</strong>
                          <span className="creation-detail">{p.explanation}</span>
                        </div>
                      </div>
                      <div className="creation-actions">
                        <button
                          type="button"
                          className="sub-action-btn delete-btn"
                          onClick={() => deletePersonalityWord(p.id)}
                          title="Delete this word"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Black Hole Prayers */}
                  {userBlackHoles.map((b) => (
                    <div key={b.id} className="creation-row-item">
                      <div className="creation-meta">
                        <CircleDot size={16} className="creation-icon black-hole-icon" />
                        <div>
                          <strong className="creation-title">Void Prayer</strong>
                          <span className="creation-detail">"{b.wishText}"</span>
                        </div>
                      </div>
                      <div className="creation-actions">
                        <button
                          type="button"
                          className="sub-action-btn delete-btn"
                          onClick={() => deleteBlackHoleWish(b.id)}
                          title="Delete this prayer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Uploaded Personal Stickers */}
                  {userStickers.length > 0 && (
                    <div className="user-stickers-cluster">
                      <span className="cluster-title">Your Saved Custom Stickers ({userStickers.length})</span>
                      <div className="saved-stickers-row">
                        {userStickers.map((stk, idx) => (
                          <div key={`stk-${idx}`} className="saved-sticker-thumb">
                            <img src={stk} alt="Custom sticker" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="auth-actions-row">
              <button
                type="button"
                className="secondary-action-btn"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>

              <button
                type="button"
                className="continue-button"
                onClick={() => setActiveModal(null)}
              >
                <span>Continue Exploring</span>
              </button>
            </div>
          </div>
        ) : (
          /* Authentication Choices: Login vs Sign Up */
          <div className="auth-forms-container">
            {authMode === 'choice' ? (
              <div className="auth-choice-view animate-fade-in">
                <button type="button" className="account-choice-pill" onClick={() => setAuthMode('signup')}>Sign up</button>
                <button type="button" className="account-choice-pill" onClick={() => setAuthMode('login')}>Log in</button>
              </div>
            ) : null}
            {authMode !== 'choice' && <>
            <div className="auth-choice-tabs">
              <button
                type="button"
                className={`auth-choice-tab ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage(null);
                }}
              >
                <UserPlus size={16} />
                <span>Sign Up</span>
              </button>
              <button
                type="button"
                className={`auth-choice-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage(null);
                }}
              >
                <LogIn size={16} />
                <span>Login</span>
              </button>
            </div>

            {authMode === 'signup' ? (
              /* SIGN UP FORM (ALL 3 FIELDS COMPULSORY) */
              <form onSubmit={handleSignUpSubmit} className="auth-form animate-fade-in">
                {/* 1. Compulsory Profile Picture */}
                <div className="auth-field-section">
                  <label className="input-label required-label">
                    Choose profile picture <span className="compulsory-tag">*Required</span>
                  </label>

                  <small className="profile-photo-notice">Upload a profile picture. A real photo is used here instead of a decorative sticker/avatar.</small>
                  <div className="avatar-selection-cluster">
                    <div className="avatar-preview-box">
                      {signupAvatar ? (
                        <img src={signupAvatar} alt="Avatar" className="custom-avatar-thumb" />
                      ) : (
                        <User size={24} className="signup-empty-avatar-icon" />
                      )}
                    </div>

                    <button
                      type="button"
                      className="upload-photo-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera size={15} />
                      <span>{signupAvatar ? 'Change photo' : 'Upload profile picture'}</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>

                {/* 2. Compulsory Username */}
                <div className="auth-field-section">
                  <label className="input-label required-label">
                    2. Username <span className="compulsory-tag">*Compulsory</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <User size={16} className="auth-input-icon" />
                    <input
                      type="text"
                      className="studio-text-input auth-input"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      placeholder="Your name"
                      maxLength={30}
                    />
                  </div>
                </div>

                {/* 3. Compulsory Password */}
                <div className="auth-field-section">
                  <label className="input-label required-label">
                    3. Password <span className="compulsory-tag">*Compulsory</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      type="password"
                      className="studio-text-input auth-input"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Create a passcode"
                    />
                  </div>
                </div>

                <div className="auth-submit-row">
                  <span className="auth-runtime-note">Stored for this website session only</span>
                  <button type="submit" className="continue-button">
                    <span>Create account ✦</span>
                    <UserPlus size={16} />
                  </button>
                </div>
              </form>
            ) : (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="auth-form animate-fade-in">
                <div className="auth-field-section">
                  <label className="input-label">Username</label>
                  <div className="auth-input-wrapper">
                    <User size={16} className="auth-input-icon" />
                    <input
                      type="text"
                      className="studio-text-input auth-input"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Your session username..."
                      autoFocus
                    />
                  </div>
                </div>

                <div className="auth-field-section">
                  <label className="input-label">Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      type="password"
                      className="studio-text-input auth-input"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Your passcode"
                    />
                  </div>
                </div>

                <div className="auth-submit-row">
                  <button
                    type="button"
                    className="auth-switch-prompt-btn"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMessage(null);
                    }}
                  >
                    Don't have an account? Sign Up
                  </button>
                  <button type="submit" className="continue-button">
                    <span>Login</span>
                    <LogIn size={16} />
                  </button>
                </div>
              </form>
            )}
            </>}
          </div>
        )}
      </div>
    </div>
  );
};
