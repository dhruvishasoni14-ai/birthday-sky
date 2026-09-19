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
const FLAG_NEBULA_OPENED     = 'nebulaOpened';
const FLAG_BLACKHOLE_OPENED  = 'blackHoleOpened';
const FLAG_MOON_OPENED       = 'moonOpened';

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
  const placed: { x: number; y: number; kind: 'secret' }[] = [];

  return DEFAULT_SECRET_STARS.map((star) => {
    const position = findSafeSkyPosition('secret', placed);
    placed.push({ ...position, kind: 'secret' });
    return { ...star, ...position };
  });
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

  const [blackHoleWishes, setBlackHoleWishes] =
    useState<BlackHoleWish[]>([]);

  // ── UI flags ───────────────────────────────────────
  const [isNebulaOpened, setIsNebulaOpened] =
    useState(false);

  const [isBlackHoleOpened, setIsBlackHoleOpened] =
    useState(false);

  const [isMoonOpened, setIsMoonOpened] =
    useState(false);

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
          dbDiscoveredStars,
        ] = await Promise.all([
          db.getAll(STORES.wishes),
          db.getAll(STORES.stories),
          db.getAll(STORES.nebulaWords),
          db.getAll(STORES.voiceNotes),
          db.getAll(STORES.blackHoleWishes),
          db.getAll(STORES.discoveredStars),
        ]);

        // ── Flags ──────────────────────────────────────
        const [nebulaFlag, bhFlag, moonFlag] = await Promise.all([
          db.getFlag(FLAG_NEBULA_OPENED),
          db.getFlag(FLAG_BLACKHOLE_OPENED),
          db.getFlag(FLAG_MOON_OPENED),
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

        // Merge discovered star state into the default positions
        if (dbDiscoveredStars.length > 0) {
          const discoveredIds = new Set(
            (dbDiscoveredStars as { id: string }[]).map((s) => s.id)
          );
          setSecretStars((prev) =>
            prev.map((s) =>
              discoveredIds.has(s.id) ? { ...s, discovered: true } : s
            )
          );
        }

        if (nebulaFlag)    setIsNebulaOpened(true);
        if (bhFlag)        setIsBlackHoleOpened(true);
        if (moonFlag)      setIsMoonOpened(true);

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

  // ── Camera helper ──────────────────────────────────

  const focusOnCoordinates = useCallback(
    (xPercent: number, yPercent: number) => {
      if (typeof window === 'undefined') return;

      const viewportWidth  = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const legacyOrigin = 1.5;
      const legacySize   = 3;
      const worldOrigin  = -2.5;
      const worldSize    = 6;

      const targetX =
        (worldOrigin + legacyOrigin + (xPercent / 100) * legacySize) * viewportWidth;

      const targetY =
        (worldOrigin + legacyOrigin + (yPercent / 100) * legacySize) * viewportHeight;

      const viewportCenterX = viewportWidth  / 2;
      const viewportCenterY = viewportHeight / 2;

      const unclamped = {
        x: viewportCenterX - targetX,
        y: viewportCenterY - targetY,
      };

      const minX = viewportWidth  - viewportWidth  * (worldSize + worldOrigin) * zoom;
      const maxX = -viewportWidth  * worldOrigin * zoom;
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
      setAuthNotice(null);

      return { success: true };
    },
    [registeredAccounts]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
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
    setWishes((prev) => {
      const next = prev.map((w) => (w.id === id ? { ...w, unopened: false } : w));
      const updated = next.find((w) => w.id === id);
      if (updated) {
        db.put(STORES.wishes, updated).catch(console.error);
      }
      return next;
    });

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
      if (!currentUser) return false;

      let moved = false;

      setWishes((prev) => {
        const item = prev.find((w) => w.id === id);
        if (!item || item.creatorId !== currentUser.id) return prev;

        moved = true;
        const updated = { ...item, x, y };
        db.put(STORES.wishes, updated).catch(console.error);
        return prev.map((w) => (w.id === id ? updated : w));
      });

      return moved;
    },
    [currentUser]
  );

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
    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, unopened: false };
        db.put(STORES.stories, updated).catch(console.error);
        return updated;
      })
    );

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
    setIsNebulaOpened(true);
    setActiveModal('nebula');
    db.setFlag(FLAG_NEBULA_OPENED, true).catch(console.error);
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
    setActiveVoiceNoteId(id);
    setActiveModal('voice-probe');
  };

  const markVoiceNoteHeard = (id: string) => {
    setVoiceNotes((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        const updated = { ...v, heard: true };
        db.put(STORES.voiceNotes, updated).catch(console.error);
        return updated;
      })
    );
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
    setSecretStars((prev) =>
      prev.map((s) => (s.id === id ? { ...s, discovered: true } : s))
    );

    // Persist discovery
    db.put(STORES.discoveredStars, { id }).catch(console.error);

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
    setIsMoonOpened(true);
    setActiveModal('moon-message');
    db.setFlag(FLAG_MOON_OPENED, true).catch(console.error);
  };

  const openBlackHole = () => {
    setIsBlackHoleOpened(true);
    setActiveModal('black-hole');
    db.setFlag(FLAG_BLACKHOLE_OPENED, true).catch(console.error);
  };

  // ─────────────────────────────────────────────────────
  // DERIVED
  // ─────────────────────────────────────────────────────

  const friendsCount = registeredAccounts.length;

  const unopenedCount =
    wishes.filter((w) => w.unopened).length +
    stories.filter((s) => s.unopened).length +
    voiceNotes.filter((v) => !v.heard).length +
    (isMoonOpened ? 0 : 1) +
    (isNebulaOpened ? 0 : 1) +
    secretStars.filter((s) => !s.discovered).length;

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

        addStory,
        openStory,
        deleteStory,

        addNebulaWord,
        deleteNebulaWord,
        openNebula,

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
