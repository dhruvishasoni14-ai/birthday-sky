import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect
} from 'react';

import {
  WishCard,
  Story,
  NebulaWordEntry,
  VoiceNote,
  SecretStar,
  UserAccount,
  BlackHoleWish,
  ModalType
} from '../types/celestial';

import { DEFAULT_SECRET_STARS } from '../config/secretStars';
import { DEFAULT_ACCENT_COLOR } from '../services/storage';
import { findSafeSkyPosition } from '../utils/objectPlacement';
import { db, STORES } from '../lib/db';

// ── Flag keys ──────────────────────────────────────────
// ── Legacy localStorage key (one-time migration) ───────
const LEGACY_ACCOUNT_KEY = 'birthday-sky-accounts-v2';

interface SkyContextType {
  currentUser: UserAccount | null;
  registeredAccounts: UserAccount[];

  signUp: (
    username: string,
    password: string,
    avatarUrl: string
  ) => {
    success: boolean;
    error?: string;
  };

  login: (
    username: string,
    password: string
  ) => {
    success: boolean;
    error?: string;
  };

  logout: () => void;

  accentColor: string;

  panOffset: {
    x: number;
    y: number;
  };

  setPanOffset: React.Dispatch<
    React.SetStateAction<{
      x: number;
      y: number;
    }>
  >;

  zoom: number;

  setZoom: React.Dispatch<
    React.SetStateAction<number>
  >;

  focusOnCoordinates: (
    xPercent: number,
    yPercent: number
  ) => void;

  wishes: WishCard[];
  stories: Story[];
  nebulaWords: NebulaWordEntry[];
  voiceNotes: VoiceNote[];
  secretStars: SecretStar[];
  blackHoleWishes: BlackHoleWish[];

  isNebulaOpened: boolean;
  isBlackHoleOpened: boolean;
  isMoonOpened: boolean;

  addWish: (wish: WishCard) => void;
  openWish: (id: string) => void;
  deleteWish: (id: string) => boolean;
  moveWish: (
    id: string,
    x: number,
    y: number
  ) => boolean;
  moveStory: (id: string, x: number, y: number) => boolean;
  moveVoiceNote: (id: string, x: number, y: number) => boolean;
  arrangeMode: boolean;
  unlockArrangeMode: (passcode: string) => boolean;
  lockArrangeMode: () => void;

  addStory: (story: Story) => void;
  openStory: (id: string) => void;
  deleteStory: (id: string) => boolean;

  addNebulaWord: (
    word: string,
    explanation: string
  ) => {
    success: boolean;
    error?: string;
  };

  deleteNebulaWord: (id: string) => boolean;
  openNebula: () => void;
  openNebulaWord: (id: string) => void;

  addVoiceNote: (note: VoiceNote) => void;
  openVoiceNote: (id: string) => void;
  markVoiceNoteHeard: (id: string) => void;
  deleteVoiceNote: (id: string) => boolean;

  discoverSecretStar: (id: string) => void;

  addBlackHoleWish: (
    wishText: string
  ) => {
    success: boolean;
    error?: string;
  };

  deleteBlackHoleWish: (
    id: string
  ) => boolean;

  openBlackHole: () => void;
  markBlackHolePrayersOpened: () => void;
  refreshProgress: () => Promise<void>;
  isItemOpened: (key: string) => boolean;
  openMoon: () => void;

  addUploadedSticker: (
    stickerUrl: string
  ) => void;

  activeModal: ModalType;
  setActiveModal: (
    modal: ModalType
  ) => void;

  authNotice: string | null;
  setAuthNotice: (
    notice: string | null
  ) => void;

  authMode:
  | 'choice'
  | 'login'
  | 'signup';

  setAuthMode: (
    mode:
      | 'choice'
      | 'login'
      | 'signup'
  ) => void;

  activeWishId: string | null;
  setActiveWishId: (
    id: string | null
  ) => void;

  activeStoryId: string | null;
  setActiveStoryId: (
    id: string | null
  ) => void;

  activeVoiceNoteId: string | null;
  setActiveVoiceNoteId: (
    id: string | null
  ) => void;

  activeSecretStarId: string | null;
  setActiveSecretStarId: (
    id: string | null
  ) => void;

  friendsCount: number;
  unopenedCount: number;

  /** True while the DB is loading initial data */
  dbReady: boolean;
}

const SkyContext =
  createContext<SkyContextType | null>(null);

const COLOR_PALETTE = [
  '#f472b6',
  '#c084fc',
  '#60a5fa',
  '#38bdf8',
  '#4ade80',
  '#facc15',
  '#fb923c',
  '#e879f9',
  '#a78bfa',
  '#f87171'
];

// ── Helpers ────────────────────────────────────────────

/** Build the initial SecretStar array from config (positions only, no discovered state yet) */
function buildDefaultSecretStars(): SecretStar[] {
  // Keep the programmer-defined coordinates fixed across reloads.
  return DEFAULT_SECRET_STARS.map((star) => ({ ...star }));
}

// ── Provider ───────────────────────────────────────────

export const SkyProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {

  // ── DB ready gate ──────────────────────────────────
  const [dbReady, setDbReady] = useState(false);

  // ── Auth ───────────────────────────────────────────
  const [currentUser, setCurrentUser] =
    useState<UserAccount | null>(null);

  const [registeredAccounts, setRegisteredAccounts] =
    useState<UserAccount[]>([]);

  const [authNotice, setAuthNotice] =
    useState<string | null>(null);

  const [authMode, setAuthMode] =
    useState<'choice' | 'login' | 'signup'>('choice');

  // ── Camera ─────────────────────────────────────────
  const accentColor = DEFAULT_ACCENT_COLOR;

  const [panOffset, setPanOffset] =
    useState({ x: 0, y: 0 });

  const [zoom, setZoom] =
    useState(1);

  // ── Content ────────────────────────────────────────
  const [wishes, setWishes] =
    useState<WishCard[]>([]);

  const [stories, setStories] =
    useState<Story[]>([]);

  const [nebulaWords, setNebulaWords] =
    useState<NebulaWordEntry[]>([]);

  const [voiceNotes, setVoiceNotes] =
    useState<VoiceNote[]>([]);

  const [secretStars, setSecretStars] =
    useState<SecretStar[]>(buildDefaultSecretStars);

  const [arrangeMode, setArrangeMode] = useState(false);

  const [blackHoleWishes, setBlackHoleWishes] =
    useState<BlackHoleWish[]>([]);

  // ── UI flags ───────────────────────────────────────
  const [isNebulaOpened, setIsNebulaOpened] =
    useState(false);

  const [isBlackHoleOpened, setIsBlackHoleOpened] =
    useState(false);

  const [isMoonOpened, setIsMoonOpened] = useState(false);
  const [activeNebulaWordId, setActiveNebulaWordId] = useState<string | null>(null);
  const [openedKeys, setOpenedKeys] = useState<Set<string>>(new Set());

  // ── Modal state ────────────────────────────────────
  const [activeModal, setActiveModal] =
    useState<ModalType>(null);

  const [activeWishId, setActiveWishId] =
    useState<string | null>(null);

  const [activeStoryId, setActiveStoryId] =
    useState<string | null>(null);

  const [activeVoiceNoteId, setActiveVoiceNoteId] =
    useState<string | null>(null);

  const [activeSecretStarId, setActiveSecretStarId] =
    useState<string | null>(null);

  const unlockArrangeMode = useCallback((passcode: string) => {
    const configured = (import.meta.env.VITE_ARRANGE_PASSCODE as string | undefined)?.trim() || 'sky-arrange-2026';
    const success = passcode === configured;
    setArrangeMode(success);
    return success;
  }, []);

  const lockArrangeMode = useCallback(() => setArrangeMode(false), []);

  // ── DB bootstrap: load all data on mount ───────────
  useEffect(() => {
    let cancelled = false;

    async function loadFromDb() {
      try {
        // ── Accounts: migrate from localStorage if needed ──
        const dbAccounts = await db.getAll(STORES.accounts);
        let accounts = dbAccounts;

        if (dbAccounts.length === 0) {
          // One-time migration from old localStorage key
          try {
            const raw = window.localStorage.getItem(LEGACY_ACCOUNT_KEY);
            if (raw) {
              const legacy: UserAccount[] = JSON.parse(raw);
              if (legacy.length > 0) {
                await Promise.all(legacy.map((a) => db.put(STORES.accounts, a)));
                accounts = legacy;
                window.localStorage.removeItem(LEGACY_ACCOUNT_KEY);
              }
            }
          } catch {
            // ignore migration errors
          }
        }

        // ── Content collections ────────────────────────
        const [
          dbWishes,
          dbStories,
          dbNebulaWords,
          dbVoiceNotes,
          dbBlackHoleWishes,
        ] = await Promise.all([
          db.getAll(STORES.wishes),
          db.getAll(STORES.stories),
          db.getAll(STORES.nebulaWords),
          db.getAll(STORES.voiceNotes),
          db.getAll(STORES.blackHoleWishes),
        ]);

        const validAccounts = ((accounts ?? []) as UserAccount[]).filter(
          (a) => a && typeof a === 'object' && typeof a.username === 'string'
        );

        // Apply to state
        setRegisteredAccounts(validAccounts);
        setWishes(dbWishes as WishCard[]);
        setStories(dbStories as Story[]);
        setNebulaWords(dbNebulaWords as NebulaWordEntry[]);
        setVoiceNotes(dbVoiceNotes as VoiceNote[]);
        setBlackHoleWishes(dbBlackHoleWishes as BlackHoleWish[]);

        // The opened/unopened state is intentionally session-only, exactly like
        // the logged-out experience. Content is shared through the database,
        // but which items have been opened is never restored after a page reload.
        const sessionUserId = window.localStorage.getItem('birthday-sky-current-user-id');

        if (sessionUserId) {
          const sessionAccount = validAccounts.find(
            (account) => account.id === sessionUserId
          );

          if (sessionAccount && !cancelled) {
            setCurrentUser(sessionAccount);
            setOpenedKeys(new Set());
            setIsNebulaOpened(false);
            setIsBlackHoleOpened(false);
            setIsMoonOpened(false);
          }
        }

        setDbReady(true);
      } catch (err) {
        console.error('[db] Failed to load from IndexedDB:', err);
        // Still mark ready so the app doesn't freeze
        if (!cancelled) setDbReady(true);
      }
    }

    loadFromDb();
    return () => { cancelled = true; };
  }, []);

  // Opened/unopened progress is intentionally kept only in React state.
  // This is the same behavior as logged-out mode: it lasts for the current
  // page session and naturally resets when the page is refreshed or reopened.
  const refreshProgress = useCallback(async () => {
    setOpenedKeys(new Set());
    setIsNebulaOpened(false);
    setIsBlackHoleOpened(false);
    setIsMoonOpened(false);
  }, []);

  const markOpened = useCallback((key: string) => {
    setOpenedKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const isItemOpened = useCallback((key: string) => openedKeys.has(key), [openedKeys]);

  // ── Camera helper ──────────────────────────────────

  const focusOnCoordinates = useCallback(
    (xPercent: number, yPercent: number) => {
      if (typeof window === 'undefined') return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const legacyOrigin = 1.5;
      const legacySize = 3;
      const worldOrigin = -2.5;
      const worldSize = 6;

      const targetX =
        (worldOrigin + legacyOrigin + (xPercent / 100) * legacySize) * viewportWidth;

      const targetY =
        (worldOrigin + legacyOrigin + (yPercent / 100) * legacySize) * viewportHeight;

      const viewportCenterX = viewportWidth / 2;
      const viewportCenterY = viewportHeight / 2;

      const unclamped = {
        x: viewportCenterX - targetX,
        y: viewportCenterY - targetY,
      };

      const minX = viewportWidth - viewportWidth * (worldSize + worldOrigin) * zoom;
      const maxX = -viewportWidth * worldOrigin * zoom;
      const minY = viewportHeight - viewportHeight * (worldSize + worldOrigin) * zoom;
      const maxY = -viewportHeight * worldOrigin * zoom;

      setPanOffset({
        x: Math.min(maxX, Math.max(minX, unclamped.x)),
        y: Math.min(maxY, Math.max(minY, unclamped.y)),
      });
    },
    [zoom]
  );

  // ─────────────────────────────────────────────────────
  // ACCOUNT
  // ─────────────────────────────────────────────────────

  const signUp = useCallback(
    (username: string, password: string, avatarUrl: string) => {
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
        (acc) => acc?.username?.toLowerCase() === trimmedUsername.toLowerCase()
      );

      if (exists) {
        return {
          success: false,
          error: 'This username is already taken in this session. Please choose another.',
        };
      }

      const newAccount: UserAccount = {
        id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        username: trimmedUsername,
        password: password.trim(),
        avatarUrl: avatarUrl.trim(),
        createdAt: Date.now(),
      };

      setRegisteredAccounts((prev) => [...prev, newAccount]);
      setCurrentUser(newAccount);
      setOpenedKeys(new Set());
      setIsNebulaOpened(false);
      setIsBlackHoleOpened(false);
      setIsMoonOpened(false);
      window.localStorage.setItem('birthday-sky-current-user-id', newAccount.id);
      setAuthNotice(null);

      // Persist to DB
      db.put(STORES.accounts, newAccount).catch(console.error);

      return { success: true };
    },
    [registeredAccounts]
  );

  const login = useCallback(
    (username: string, password: string) => {
      const trimmedUsername = username.trim();

      if (!trimmedUsername) {
        return { success: false, error: 'Please enter your username.' };
      }
      if (!password) {
        return { success: false, error: 'Please enter your password.' };
      }

      const matchedAccount = registeredAccounts.find(
        (acc) => acc?.username?.toLowerCase() === trimmedUsername.toLowerCase()
      );

      if (!matchedAccount) {
        return {
          success: false,
          error: 'No account found with this username. Please sign up first.',
        };
      }

      if (matchedAccount.password !== password.trim()) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      setCurrentUser(matchedAccount);
      setOpenedKeys(new Set());
      setIsNebulaOpened(false);
      setIsBlackHoleOpened(false);
      setIsMoonOpened(false);
      window.localStorage.setItem('birthday-sky-current-user-id', matchedAccount.id);
      setAuthNotice(null);

      return { success: true };
    },
    [registeredAccounts]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    window.localStorage.removeItem('birthday-sky-current-user-id');
    setOpenedKeys(new Set());
    setIsNebulaOpened(false);
    setIsBlackHoleOpened(false);
    setIsMoonOpened(false);
  }, []);

  // ─────────────────────────────────────────────────────
  // WISHES
  // ─────────────────────────────────────────────────────

  const addWish = useCallback(
    async (wish: WishCard) => {
      console.log('[v0] Submitting wish to database', { id: wish.id });
      try {
        const savedWish = await db.put(STORES.wishes, wish);
        setWishes((prev) => [...prev, savedWish ?? wish]);
        console.log('[v0] Wish submission synced', { id: wish.id });
        window.setTimeout(() => focusOnCoordinates(wish.x, wish.y), 100);
      } catch (error) {
        console.error('[v0] Wish submission failed', { id: wish.id, error });
        throw error;
      }
    },
    [focusOnCoordinates]
  );

  const openWish = (id: string) => {
    markOpened(`wish:${id}`);
    setActiveWishId(id);
    setActiveModal('wish-view');
  };

  const deleteWish = useCallback(
    (id: string) => {
      if (!currentUser) return false;

      let deleted = false;

      setWishes((prev) => {
        const item = prev.find((w) => w.id === id);
        if (!item || item.creatorId !== currentUser.id) return prev;

        deleted = true;
        db.remove(STORES.wishes, id).catch(console.error);
        return prev.filter((w) => w.id !== id);
      });

      return deleted;
    },
    [currentUser]
  );

  const moveWish = useCallback(
    (id: string, x: number, y: number) => {
      if (!arrangeMode) return false;
      let moved = false;
      setWishes((prev) => prev.map((item) => {
        if (item.id !== id) return item;
        moved = true;
        const updated = { ...item, x, y };
        db.put(STORES.wishes, updated).catch(console.error);
        return updated;
      }));
      return moved;
    },
    [arrangeMode]
  );

  const moveStory = useCallback((id: string, x: number, y: number) => {
    if (!arrangeMode) return false;
    let moved = false;
    setStories((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      moved = true;
      const updated = { ...item, x, y };
      db.put(STORES.stories, updated).catch(console.error);
      return updated;
    }));
    return moved;
  }, [arrangeMode]);

  const moveVoiceNote = useCallback((id: string, x: number, y: number) => {
    if (!arrangeMode) return false;
    let moved = false;
    setVoiceNotes((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      moved = true;
      const updated = { ...item, x, y };
      db.put(STORES.voiceNotes, updated).catch(console.error);
      return updated;
    }));
    return moved;
  }, [arrangeMode]);

  // ─────────────────────────────────────────────────────
  // STORIES
  // ─────────────────────────────────────────────────────

  const addStory = useCallback(
    (story: Story) => {
      setStories((prev) => [...prev, story]);
      db.put(STORES.stories, story).catch(console.error);

      window.setTimeout(() => {
        focusOnCoordinates(story.x, story.y);
      }, 100);
    },
    [focusOnCoordinates]
  );

  const openStory = (id: string) => {
    markOpened(`story:${id}`);
    setActiveStoryId(id);
    setActiveModal('story-view');
  };

  const deleteStory = useCallback(
    (id: string) => {
      if (!currentUser) return false;

      let deleted = false;

      setStories((prev) => {
        const item = prev.find((s) => s.id === id);
        if (!item || item.creatorId !== currentUser.id) return prev;

        deleted = true;
        db.remove(STORES.stories, id).catch(console.error);
        return prev.filter((s) => s.id !== id);
      });

      return deleted;
    },
    [currentUser]
  );

  // ─────────────────────────────────────────────────────
  // NEBULA WORDS
  // ─────────────────────────────────────────────────────

  const addNebulaWord = useCallback(
    (word: string, explanation: string) => {
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

      const randomColor =
        COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];

      const newEntry: NebulaWordEntry = {
        id: `word-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        word: trimmedWord,
        explanation: trimmedExpl,
        creatorId: currentUser.id,
        creatorName: currentUser.username,
        creatorAvatar: currentUser.avatarUrl,
        createdAt: Date.now(),
        x: 18 + Math.random() * 64,
        y: 22 + Math.random() * 56,
        color: randomColor,
        floatDelay: Math.random() * 4,
        floatDuration: 5 + Math.random() * 4,
      };

      setNebulaWords((prev) => [...prev, newEntry]);
      db.put(STORES.nebulaWords, newEntry).catch(console.error);

      window.setTimeout(() => {
        focusOnCoordinates(newEntry.x, newEntry.y);
      }, 100);

      return { success: true };
    },
    [currentUser, focusOnCoordinates]
  );

  const deleteNebulaWord = useCallback(
    (id: string) => {
      if (!currentUser) return false;

      let deleted = false;

      setNebulaWords((prev) => {
        const item = prev.find((w) => w.id === id);
        if (!item || item.creatorId !== currentUser.id) return prev;

        deleted = true;
        db.remove(STORES.nebulaWords, id).catch(console.error);
        return prev.filter((w) => w.id !== id);
      });

      return deleted;
    },
    [currentUser]
  );

  const openNebula = () => {
    setActiveNebulaWordId(null);
    setActiveModal('nebula');
  };

  const openNebulaWord = (id: string) => {
    markOpened(`nebula:${id}`);
    setActiveNebulaWordId(id);
    setActiveModal('nebula');
  };

  // ─────────────────────────────────────────────────────
  // VOICE NOTES
  // ─────────────────────────────────────────────────────

  const addVoiceNote = useCallback(
    (note: VoiceNote) => {
      setVoiceNotes((prev) => [...prev, note]);
      db.put(STORES.voiceNotes, note).catch(console.error);

      window.setTimeout(() => {
        focusOnCoordinates(note.x, note.y);
      }, 100);
    },
    [focusOnCoordinates]
  );

  const openVoiceNote = (id: string) => {
    markOpened(`voice:${id}`);
    setActiveVoiceNoteId(id);
    setActiveModal('voice-probe');
  };

  const markVoiceNoteHeard = (id: string) => {
    markOpened(`voice:${id}`);
  };

  const deleteVoiceNote = useCallback(
    (id: string) => {
      if (!currentUser) return false;

      let deleted = false;

      setVoiceNotes((prev) => {
        const item = prev.find((v) => v.id === id);
        if (!item || item.creatorId !== currentUser.id) return prev;

        deleted = true;
        db.remove(STORES.voiceNotes, id).catch(console.error);
        return prev.filter((v) => v.id !== id);
      });

      return deleted;
    },
    [currentUser]
  );

  // ─────────────────────────────────────────────────────
  // SECRET STARS
  // ─────────────────────────────────────────────────────

  const discoverSecretStar = (id: string) => {
    markOpened(`secret:${id}`);
    setActiveSecretStarId(id);
    setActiveModal('secret-star');
  };

  // ─────────────────────────────────────────────────────
  // BLACK HOLE
  // ─────────────────────────────────────────────────────

  const addBlackHoleWish = useCallback(
    (wishText: string) => {
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
        createdAt: Date.now(),
      };

      setBlackHoleWishes((prev) => [...prev, newWish]);
      db.put(STORES.blackHoleWishes, newWish).catch(console.error);

      return { success: true };
    },
    [currentUser]
  );

  const deleteBlackHoleWish = useCallback(
    (id: string) => {
      if (!currentUser) return false;

      let deleted = false;

      setBlackHoleWishes((prev) => {
        const item = prev.find((w) => w.id === id);
        if (!item || item.creatorId !== currentUser.id) return prev;

        deleted = true;
        db.remove(STORES.blackHoleWishes, id).catch(console.error);
        return prev.filter((w) => w.id !== id);
      });

      return deleted;
    },
    [currentUser]
  );

  // ─────────────────────────────────────────────────────
  // UPLOADED STICKERS
  // ─────────────────────────────────────────────────────

  const addUploadedSticker = useCallback(
    (stickerUrl: string) => {
      if (!currentUser) return;

      setCurrentUser((prev) => {
        if (!prev) return prev;
        const existing = prev.uploadedStickers || [];
        if (existing.includes(stickerUrl)) return prev;

        const updated = {
          ...prev,
          uploadedStickers: [stickerUrl, ...existing],
        };
        db.put(STORES.accounts, updated).catch(console.error);
        return updated;
      });
    },
    [currentUser]
  );

  // ─────────────────────────────────────────────────────
  // OTHER OBJECTS
  // ─────────────────────────────────────────────────────

  const openMoon = () => {
    markOpened('moon');
    setIsMoonOpened(true);
    setActiveModal('moon-message');
  };

  const openBlackHole = () => {
    setIsBlackHoleOpened(true);
    setActiveModal('black-hole');
  };

  const markBlackHolePrayersOpened = () => {
    markOpened('blackhole:prayers');
  };

  // ─────────────────────────────────────────────────────
  // DERIVED
  // ─────────────────────────────────────────────────────

  const friendsCount = registeredAccounts.length;

  const unopenedCount =
    wishes.filter((w) => !isItemOpened(`wish:${w.id}`)).length +
    stories.filter((s) => !isItemOpened(`story:${s.id}`)).length +
    voiceNotes.filter((v) => !isItemOpened(`voice:${v.id}`)).length +
    nebulaWords.filter((w) => !isItemOpened(`nebula:${w.id}`)).length +
    secretStars.filter((s) => !isItemOpened(`secret:${s.id}`)).length +
    (isItemOpened('moon') ? 0 : 1) +
    (blackHoleWishes.length > 0 && !isItemOpened('blackhole:prayers')
      ? blackHoleWishes.length
      : 0);

  // ─────────────────────────────────────────────────────

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
        nebulaWords,
        voiceNotes,
        secretStars,
        blackHoleWishes,

        isNebulaOpened,
        isBlackHoleOpened,
        isMoonOpened,

        openMoon,

        addWish,
        openWish,
        deleteWish,
        moveWish,
        moveStory,
        moveVoiceNote,
        arrangeMode,
        unlockArrangeMode,
        lockArrangeMode,

        addStory,
        openStory,
        deleteStory,

        addNebulaWord,
        deleteNebulaWord,
        openNebula,
        openNebulaWord,

        addVoiceNote,
        openVoiceNote,
        markVoiceNoteHeard,
        deleteVoiceNote,

        discoverSecretStar,

        addBlackHoleWish,
        deleteBlackHoleWish,
        openBlackHole,
        markBlackHolePrayersOpened,
        refreshProgress,
        isItemOpened,

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
        unopenedCount,

        dbReady,
      }}
    >
      {children}
    </SkyContext.Provider>
  );
};

export const useSky = () => {
  const context = useContext(SkyContext);

  if (!context) {
    throw new Error(
      'useSky must be used within a SkyProvider'
    );
  }

  return context;
};
