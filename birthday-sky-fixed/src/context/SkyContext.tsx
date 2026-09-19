import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  WishCard,
  Story,
  PersonalityWordEntry,
  VoiceNote,
  SecretStar,
  UserAccount,
  BlackHoleWish,
  ModalType
} from '../types/celestial';
import { DEFAULT_SECRET_STARS } from '../config/secretStars';
import { DEFAULT_ACCENT_COLOR } from '../services/storage';
import { findSafeSkyPosition } from '../utils/objectPlacement';

interface SkyContextType {
  // Session Authentication & Current User
  currentUser: UserAccount | null;
  registeredAccounts: UserAccount[];
  signUp: (username: string, password: string, avatarUrl: string) => { success: boolean; error?: string };
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  accentColor: string;

  // Sky coordinates & viewport
  panOffset: { x: number; y: number };
  setPanOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  focusOnCoordinates: (xPercent: number, yPercent: number) => void;

  // Celestial objects (In-Memory Session Only)
  wishes: WishCard[];
  stories: Story[];
  personalityWords: PersonalityWordEntry[];
  voiceNotes: VoiceNote[];
  secretStars: SecretStar[];
  blackHoleWishes: BlackHoleWish[];
  isNebulaOpened: boolean;
  isBlackHoleOpened: boolean;

  // Actions
  addWish: (wish: WishCard) => void;
  openWish: (id: string) => void;
  deleteWish: (id: string) => boolean;
  moveWish: (id: string, x: number, y: number) => boolean;

  addStory: (story: Story) => void;
  openStory: (id: string) => void;
  deleteStory: (id: string) => boolean;

  addPersonalityWord: (word: string, explanation: string) => { success: boolean; error?: string };
  deletePersonalityWord: (id: string) => boolean;
  openPersonality: () => void;

  addVoiceNote: (note: VoiceNote) => void;
  openVoiceNote: (id: string) => void;
  markVoiceNoteHeard: (id: string) => void;
  deleteVoiceNote: (id: string) => boolean;

  discoverSecretStar: (id: string) => void;

  addBlackHoleWish: (wishText: string) => { success: boolean; error?: string };
  deleteBlackHoleWish: (id: string) => boolean;
  openBlackHole: () => void;

  addUploadedSticker: (stickerUrl: string) => void;

  // Modals & Active objects
  activeModal: ModalType;
  setActiveModal: (modal: ModalType) => void;
  authNotice: string | null;
  setAuthNotice: (notice: string | null) => void;
  authMode: 'choice' | 'login' | 'signup';
  setAuthMode: (mode: 'choice' | 'login' | 'signup') => void;

  activeWishId: string | null;
  setActiveWishId: (id: string | null) => void;

  activeStoryId: string | null;
  setActiveStoryId: (id: string | null) => void;

  activeVoiceNoteId: string | null;
  setActiveVoiceNoteId: (id: string | null) => void;

  activeSecretStarId: string | null;
  setActiveSecretStarId: (id: string | null) => void;

  // Dynamic statistics
  friendsCount: number;
  unopenedCount: number;
}

const SkyContext = createContext<SkyContextType | null>(null);

const COLOR_PALETTE = [
  '#f472b6', '#c084fc', '#60a5fa', '#38bdf8', '#4ade80',
  '#facc15', '#fb923c', '#e879f9', '#a78bfa', '#f87171'
];

export const SkyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // In-Memory Session Accounts & Login State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [registeredAccounts, setRegisteredAccounts] = useState<UserAccount[]>([]);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'choice' | 'login' | 'signup'>('choice');

  const accentColor = DEFAULT_ACCENT_COLOR;

  // Sky Pan & Zoom with clamping
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // In-Memory Session Data (Resets completely on refresh)
  const [wishes, setWishes] = useState<WishCard[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [personalityWords, setPersonalityWords] = useState<PersonalityWordEntry[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [secretStars, setSecretStars] = useState<SecretStar[]>(() => {
    const placed: { x: number; y: number; kind: 'secret' }[] = [];
    return DEFAULT_SECRET_STARS.map((star) => {
      const position = findSafeSkyPosition('secret', placed);
      placed.push({ ...position, kind: 'secret' });
      return { ...star, ...position };
    });
  });
  const [blackHoleWishes, setBlackHoleWishes] = useState<BlackHoleWish[]>([]);
  const [isNebulaOpened, setIsNebulaOpened] = useState<boolean>(false);
  const [isBlackHoleOpened, setIsBlackHoleOpened] = useState<boolean>(false);

  // Modal State Management
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [activeWishId, setActiveWishId] = useState<string | null>(null);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [activeVoiceNoteId, setActiveVoiceNoteId] = useState<string | null>(null);
  const [activeSecretStarId, setActiveSecretStarId] = useState<string | null>(null);

  // Sign Up Handler
  const signUp = useCallback((username: string, password: string, avatarUrl: string) => {
    const trimmedUsername = username.trim();
    if (!avatarUrl || !avatarUrl.trim()) {
      return { success: false, error: 'A profile picture is required to sign up.' };
    }
    if (!trimmedUsername) {
      return { success: false, error: 'A username is required to sign up.' };
    }
    if (!password || !password.trim()) {
      return { success: false, error: 'A password is required to sign up.' };
    }

    const exists = registeredAccounts.some(
      (acc) => acc.username.toLowerCase() === trimmedUsername.toLowerCase()
    );
    if (exists) {
      return { success: false, error: 'This username is already taken in this session. Please choose another.' };
    }

    const newAccount: UserAccount = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      username: trimmedUsername,
      password: password.trim(),
      avatarUrl: avatarUrl.trim(),
      createdAt: Date.now()
    };

    setRegisteredAccounts((prev) => [...prev, newAccount]);
    setCurrentUser(newAccount);
    setAuthNotice(null);
    return { success: true };
  }, [registeredAccounts]);

  // Login Handler
  const login = useCallback((username: string, password: string) => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      return { success: false, error: 'Please enter your username.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    const matchedAccount = registeredAccounts.find(
      (acc) => acc.username.toLowerCase() === trimmedUsername.toLowerCase()
    );

    if (!matchedAccount) {
      return { success: false, error: 'No session account found with this username. Please sign up first.' };
    }

    if (matchedAccount.password !== password.trim()) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    setCurrentUser(matchedAccount);
    setAuthNotice(null);
    return { success: true };
  }, [registeredAccounts]);

  // Logout Handler
  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const focusOnCoordinates = useCallback((xPercent: number, yPercent: number) => {
    const spaceWidth = window.innerWidth * 8;
    const spaceHeight = window.innerHeight * 8;
    const targetX = (xPercent / 100) * spaceWidth;
    const targetY = (yPercent / 100) * spaceHeight;

    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;

    const newOffsetX = viewportCenterX + window.innerWidth * 2.5 - targetX;
    const newOffsetY = viewportCenterY + window.innerHeight * 2.5 - targetY;

    setPanOffset({ x: newOffsetX, y: newOffsetY });
  }, []);

  const addWish = (wish: WishCard) => {
    // Preserve chronological order
    setWishes((prev) => [...prev, wish]);
  };

  const openWish = (id: string) => {
    setWishes((prev) => prev.map((w) => (w.id === id ? { ...w, unopened: false } : w)));
    setActiveWishId(id);
    setActiveModal('wish-view');
  };

  // Ownership-enforced Delete Wish
  const deleteWish = useCallback((id: string) => {
    if (!currentUser) return false;
    let deleted = false;
    setWishes((prev) => {
      const item = prev.find((w) => w.id === id);
      if (!item || item.creatorId !== currentUser.id) return prev;
      deleted = true;
      return prev.filter((w) => w.id !== id);
    });
    return deleted;
  }, [currentUser]);

  // Ownership-enforced Move Wish
  const moveWish = useCallback((id: string, x: number, y: number) => {
    if (!currentUser) return false;
    let moved = false;
    setWishes((prev) => {
      const item = prev.find((w) => w.id === id);
      if (!item || item.creatorId !== currentUser.id) return prev;
      moved = true;
      return prev.map((w) => (w.id === id ? { ...w, x, y } : w));
    });
    return moved;
  }, [currentUser]);

  const addStory = (story: Story) => {
    setStories((prev) => [...prev, story]);
  };

  const openStory = (id: string) => {
    setStories((prev) => prev.map((s) => (s.id === id ? { ...s, unopened: false } : s)));
    setActiveStoryId(id);
    setActiveModal('story-view');
  };

  // Ownership-enforced Delete Story
  const deleteStory = useCallback((id: string) => {
    if (!currentUser) return false;
    let deleted = false;
    setStories((prev) => {
      const item = prev.find((s) => s.id === id);
      if (!item || item.creatorId !== currentUser.id) return prev;
      deleted = true;
      return prev.filter((s) => s.id !== id);
    });
    return deleted;
  }, [currentUser]);

  // Personality word with compulsory explanation in creation order
  const addPersonalityWord = useCallback((word: string, explanation: string) => {
    if (!currentUser) {
      return { success: false, error: 'You must be logged in to submit a word.' };
    }

    const trimmedWord = word.trim();
    if (!trimmedWord) {
      return { success: false, error: 'Please enter a word describing the birthday girl.' };
    }

    const wordCount = trimmedWord.split(/\s+/).filter(Boolean).length;
    if (wordCount > 2) {
      return { success: false, error: 'Please enter one or two words only.' };
    }

    const trimmedExpl = explanation.trim();
    if (!trimmedExpl) {
      return { success: false, error: 'An explanation of why you chose this word is required.' };
    }

    const randomColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    const newEntry: PersonalityWordEntry = {
      id: `word-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      word: trimmedWord,
      explanation: trimmedExpl,
      creatorId: currentUser.id,
      creatorName: currentUser.username,
      creatorAvatar: currentUser.avatarUrl,
      createdAt: Date.now(),
      x: 15 + Math.random() * 70,
      y: 20 + Math.random() * 60,
      color: randomColor,
      floatDelay: Math.random() * 4,
      floatDuration: 5 + Math.random() * 4
    };

    // Stored strictly in creation order
    setPersonalityWords((prev) => [...prev, newEntry]);
    return { success: true };
  }, [currentUser]);

  const deletePersonalityWord = useCallback((id: string) => {
    if (!currentUser) return false;
    let deleted = false;
    setPersonalityWords((prev) => {
      const item = prev.find((w) => w.id === id);
      if (!item || item.creatorId !== currentUser.id) return prev;
      deleted = true;
      return prev.filter((w) => w.id !== id);
    });
    return deleted;
  }, [currentUser]);

  const openPersonality = () => {
    setIsNebulaOpened(true);
    setActiveModal('personality');
  };

  const addVoiceNote = (note: VoiceNote) => {
    setVoiceNotes((prev) => [...prev, note]);
  };

  const openVoiceNote = (id: string) => {
    setActiveVoiceNoteId(id);
    setActiveModal('voice-probe');
  };

  const markVoiceNoteHeard = (id: string) => {
    setVoiceNotes((prev) => prev.map((v) => (v.id === id ? { ...v, heard: true } : v)));
  };

  const deleteVoiceNote = useCallback((id: string) => {
    if (!currentUser) return false;
    let deleted = false;
    setVoiceNotes((prev) => {
      const item = prev.find((v) => v.id === id);
      if (!item || item.creatorId !== currentUser.id) return prev;
      deleted = true;
      return prev.filter((v) => v.id !== id);
    });
    return deleted;
  }, [currentUser]);

  const discoverSecretStar = (id: string) => {
    setSecretStars((prev) => prev.map((s) => (s.id === id ? { ...s, discovered: true } : s)));
    setActiveSecretStarId(id);
    setActiveModal('secret-star');
  };

  const addBlackHoleWish = useCallback((wishText: string) => {
    if (!currentUser) {
      return { success: false, error: 'You must be logged in to submit to the Black Hole.' };
    }

    const trimmed = wishText.trim();
    if (!trimmed) {
      return { success: false, error: 'Please enter a wish, prayer, or burden to release.' };
    }

    const newWish: BlackHoleWish = {
      id: `bh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      wishText: trimmed,
      creatorId: currentUser.id,
      creatorName: currentUser.username,
      creatorAvatar: currentUser.avatarUrl,
      createdAt: Date.now()
    };

    // Kept in creation order (oldest first in list)
    setBlackHoleWishes((prev) => [...prev, newWish]);
    return { success: true };
  }, [currentUser]);

  const deleteBlackHoleWish = useCallback((id: string) => {
    if (!currentUser) return false;
    let deleted = false;
    setBlackHoleWishes((prev) => {
      const item = prev.find((w) => w.id === id);
      if (!item || item.creatorId !== currentUser.id) return prev;
      deleted = true;
      return prev.filter((w) => w.id !== id);
    });
    return deleted;
  }, [currentUser]);

  // Persist user-uploaded sticker in their session account
  const addUploadedSticker = useCallback((stickerUrl: string) => {
    if (!currentUser) return;
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const existing = prev.uploadedStickers || [];
      if (existing.includes(stickerUrl)) return prev;
      return { ...prev, uploadedStickers: [stickerUrl, ...existing] };
    });
    setRegisteredAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id !== currentUser.id) return acc;
        const existing = acc.uploadedStickers || [];
        if (existing.includes(stickerUrl)) return acc;
        return { ...acc, uploadedStickers: [stickerUrl, ...existing] };
      })
    );
  }, [currentUser]);

  const openBlackHole = () => {
    setIsBlackHoleOpened(true);
    setActiveModal('black-hole');
  };

  // Distinct friends count (contributors)
  const friendsCount = registeredAccounts.length;

  // Dynamic unopened count across universe
  const unopenedCount =
    wishes.filter((w) => w.unopened).length +
    stories.filter((s) => s.unopened).length +
    voiceNotes.filter((v) => !v.heard).length;

  return (
    <SkyContext.Provider
      value={{
        currentUser,
        registeredAccounts,
        signUp,
        login,
        logout,
        accentColor,
        panOffset,
        setPanOffset,
        zoom,
        setZoom,
        focusOnCoordinates,
        wishes,
        stories,
        personalityWords,
        voiceNotes,
        secretStars,
        blackHoleWishes,
        isNebulaOpened,
        isBlackHoleOpened,
        addWish,
        openWish,
        deleteWish,
        moveWish,
        addStory,
        openStory,
        deleteStory,
        addPersonalityWord,
        deletePersonalityWord,
        openPersonality,
        addVoiceNote,
        openVoiceNote,
        markVoiceNoteHeard,
        deleteVoiceNote,
        discoverSecretStar,
        addBlackHoleWish,
        deleteBlackHoleWish,
        openBlackHole,
        addUploadedSticker,
        activeModal,
        setActiveModal,
        authNotice,
        setAuthNotice,
        authMode,
        setAuthMode,
        activeWishId,
        setActiveWishId,
        activeStoryId,
        setActiveStoryId,
        activeVoiceNoteId,
        setActiveVoiceNoteId,
        activeSecretStarId,
        setActiveSecretStarId,
        friendsCount,
        unopenedCount
      }}
    >
      {children}
    </SkyContext.Provider>
  );
};

export const useSky = () => {
  const context = useContext(SkyContext);
  if (!context) {
    throw new Error('useSky must be used within a SkyProvider');
  }
  return context;
};
