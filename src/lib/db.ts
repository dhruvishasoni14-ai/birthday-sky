export const STORES = {
  accounts: 'accounts',
  wishes: 'wishes',
  stories: 'stories',
  nebulaWords: 'nebulaWords',
  voiceNotes: 'voiceNotes',
  blackHoleWishes: 'blackHoleWishes',
  discoveredStars: 'discoveredStars',
  flags: 'flags',
} as const;

type StoreName = (typeof STORES)[keyof typeof STORES];

async function request<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(
      text || `Request failed with status ${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function getAll<T>(store: StoreName): Promise<T[]> {
  return request<T[]>(
    `/api/records/${encodeURIComponent(store)}`,
  );
}

async function get<T>(
  store: StoreName,
  id: string,
): Promise<T | undefined> {
  try {
    return await request<T>(
      `/api/records/${encodeURIComponent(store)}/${encodeURIComponent(id)}`,
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('404')
    ) {
      return undefined;
    }

    throw error;
  }
}

async function put<T extends { id: string }>(
  store: StoreName,
  data: T,
): Promise<T> {
  return request<T>(
    `/api/records/${encodeURIComponent(store)}/${encodeURIComponent(data.id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
  );
}

async function remove(
  store: StoreName,
  id: string,
): Promise<void> {
  await request<void>(
    `/api/records/${encodeURIComponent(store)}/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    },
  );
}

async function clear(store: StoreName): Promise<void> {
  const records = await getAll<{ id: string }>(store);

  await Promise.all(
    records.map((record) => remove(store, record.id)),
  );
}

async function getFlag(
  key: string,
): Promise<boolean> {
  const record = await get<{ value?: boolean }>(
    STORES.flags,
    key,
  );

  return record?.value === true;
}

async function setFlag(
  key: string,
  value: boolean,
): Promise<void> {
  await put(STORES.flags, {
    id: key,
    value,
  });
}

/* =========================
   USER PROGRESS
   ========================= */

async function getProgress(
  userId: string,
): Promise<string[]> {
  return request<string[]>(
    `/api/progress/${encodeURIComponent(userId)}`,
  );
}

async function setProgress(
  userId: string,
  itemKey: string,
  opened = true,
): Promise<{
  userId: string;
  itemKey: string;
  opened: boolean;
}> {
  return request<{
    userId: string;
    itemKey: string;
    opened: boolean;
  }>(
    `/api/progress/${encodeURIComponent(userId)}/${encodeURIComponent(itemKey)}`,
    {
      method: 'POST',
      body: JSON.stringify({ opened }),
    },
  );
}

/*
 * Resets ONLY the logged-in user's opened progress.
 *
 * This does NOT delete:
 * - wishes
 * - voice notes
 * - stories
 * - nebula words
 * - black-hole prayers
 * - stars
 * - accounts
 */
async function resetProgress(
  userId: string,
): Promise<void> {
  await request<void>(
    `/api/progress/${encodeURIComponent(userId)}`,
    {
      method: 'DELETE',
    },
  );
}

export const db = {
  getAll,
  get,
  put,
  remove,
  clear,
  getFlag,
  setFlag,
  getProgress,
  setProgress,
  resetProgress,
};