import type {
  WishCard,
  Story,
  NebulaWordEntry,
  VoiceNote,
  BlackHoleWish,
  UserAccount,
} from '../types/celestial';

export const STORES = {
  accounts: 'accounts', wishes: 'wishes', stories: 'stories', nebulaWords: 'nebulaWords',
  voiceNotes: 'voiceNotes', blackHoleWishes: 'blackHoleWishes', discoveredStars: 'discoveredStars', flags: 'flags',
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];
type StoreRecordMap = {
  accounts: UserAccount; wishes: WishCard; stories: Story; nebulaWords: NebulaWordEntry;
  voiceNotes: VoiceNote; blackHoleWishes: BlackHoleWish; discoveredStars: { id: string };
  flags: { id: string; value: boolean | number };
};

const apiUrl = (store: string, id?: string) => store === STORES.wishes
  ? `/api/wishes${id ? `/${encodeURIComponent(id)}` : ''}`
  : `/api/records/${encodeURIComponent(store)}${id ? `/${encodeURIComponent(id)}` : ''}`;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    const err = new Error(body?.error ?? `Database request failed (${response.status})`);
    (err as { status?: number }).status = response.status;
    throw err;
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

async function getAll<K extends keyof StoreRecordMap>(store: K) {
  console.log('[v0] Fetching records', { store });
  const records = await request<StoreRecordMap[K][]>(apiUrl(store));
  console.log('[v0] Fetched records', { store, count: records.length });
  return records;
}

async function get<K extends keyof StoreRecordMap>(store: K, id: string) {
  try { return await request<StoreRecordMap[K]>(apiUrl(store, id)); }
  catch (error) {
    if (error instanceof Error && ((error as { status?: number }).status === 404 || error.message.includes('404') || error.message.toLowerCase().includes('not found'))) {
      return undefined;
    }
    throw error;
  }
}

async function put<K extends keyof StoreRecordMap>(store: K, data: StoreRecordMap[K]) {
  console.log('[v0] Saving record', { store, id: data.id });
  try {
    const result = await request<StoreRecordMap[K]>(apiUrl(store), { method: 'POST', body: JSON.stringify(data) });
    console.log('[v0] Record saved', { store, id: data.id });
    return result;
  } catch (error) {
    console.error('[v0] Record save failed', { store, id: data.id, error });
    throw error;
  }
}

async function remove<K extends keyof StoreRecordMap>(store: K, id: string) {
  await request(apiUrl(store, id), { method: 'DELETE' });
}

async function clear<K extends keyof StoreRecordMap>(store: K) {
  const records = await getAll(store);
  await Promise.all(records.map((item) => remove(store, item.id)));
}

async function getFlag(key: string) {
  const record = await get(STORES.flags, key);
  return record?.value ?? null;
}

async function setFlag(key: string, value: boolean | number) {
  await put(STORES.flags, { id: key, value });
}

async function getProgress(userId: string) {
  return await request<string[]>(`/api/progress/${encodeURIComponent(userId)}`);
}

async function setProgress(userId: string, itemKey: string, opened = true) {
  return await request<{ userId: string; itemKey: string; opened: boolean }>(
    `/api/progress/${encodeURIComponent(userId)}/${encodeURIComponent(itemKey)}`,
    { method: 'POST', body: JSON.stringify({ opened }) }
  );
}

export const db = { getAll, get, put, remove, clear, getFlag, setFlag, getProgress, setProgress };
