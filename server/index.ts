import express from 'express';
import { query } from './db';

export const app = express();
const port = Number(process.env.PORT ?? 8787);

const validStores = new Set([
  'accounts',
  'wishes',
  'stories',
  'nebulaWords',
  'voiceNotes',
  'blackHoleWishes',
  'discoveredStars',
  'flags',
]);

app.use(express.json({ limit: '12mb' }));

/* =========================
   USER PROGRESS
   ========================= */

app.get('/api/progress/:userId', async (req, res) => {
  try {
    const result = await query<{
      data: { itemKey?: string; opened?: boolean };
    }>(
      `SELECT data
       FROM app_records
       WHERE store_name = 'progress'
         AND id LIKE $1
         AND COALESCE((data->>'opened')::boolean, true) = true
       ORDER BY updated_at ASC`,
      [`${req.params.userId}:%`],
    );

    res.json(
      result.rows
        .map((row) => row.data.itemKey)
        .filter((key): key is string => typeof key === 'string'),
    );
  } catch (error) {
    console.error('[api] progress load failed', error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Unable to load progress',
    });
  }
});

/*
 * Reset ONLY the logged-in user's opened progress.
 *
 * This does NOT delete:
 * - wishes
 * - voice notes
 * - stories
 * - nebula words
 * - black-hole prayers
 * - stars
 * - accounts
 *
 * It only removes that user's records from the "progress" store.
 */
app.delete('/api/progress/:userId', async (req, res) => {
  try {
    const userId = String(req.params.userId);

    const result = await query(
      `DELETE FROM app_records
       WHERE store_name = 'progress'
         AND id LIKE $1`,
      [`${userId}:%`],
    );

    console.log('[api] progress reset succeeded', {
      userId,
      deletedCount: result.rowCount,
    });

    res.status(204).end();
  } catch (error) {
    console.error('[api] progress reset failed', error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Unable to reset progress',
    });
  }
});

app.post('/api/progress/:userId/:itemKey', async (req, res) => {
  try {
    const userId = String(req.params.userId);
    const itemKey = String(req.params.itemKey);
    const opened = req.body?.opened !== false;

    const data = {
      id: `${userId}:${itemKey}`,
      userId,
      itemKey,
      opened,
    };

    await saveRecord('progress', data.id, data);

    res.json(data);
  } catch (error) {
    console.error('[api] progress save failed', error);
    res.status(400).json({
      error:
        error instanceof Error
          ? error.message
          : 'Unable to save progress',
    });
  }
});

/* =========================
   HELPERS
   ========================= */

function storeName(value: unknown) {
  if (typeof value !== 'string' || !validStores.has(value)) {
    throw new Error('Invalid store');
  }

  return value;
}

function record(value: unknown) {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    typeof (value as { id?: unknown }).id !== 'string'
  ) {
    throw new Error('A record with a string id is required');
  }

  return value;
}

/* =========================
   WISHES
   ========================= */

app.get('/api/wishes', async (_req, res) => {
  try {
    const result = await query<{
      id: string;
      title: string;
      constellation_data: unknown;
      created_at: string;
    }>(
      'SELECT id, title, constellation_data, created_at FROM wish_cards ORDER BY created_at ASC',
    );

    console.log('[api] SELECT wish_cards succeeded', {
      count: result.rowCount,
    });

    res.json(
      result.rows.map((row) => ({
        ...((row.constellation_data as object) ?? {}),
        id: row.id,
        title: row.title,
        createdAt: row.created_at,
      })),
    );
  } catch (error) {
    console.error('[api] SELECT wish_cards failed', error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Unable to list wishes',
    });
  }
});

app.post('/api/wishes', async (req, res) => {
  try {
    const data = record(req.body) as Record<string, unknown>;

    const title = typeof data.title === 'string' ? data.title : '';
    const userId = typeof data.userId === 'string' ? data.userId : null;

    const {
      id,
      title: _title,
      userId: _userId,
      createdAt: _createdAt,
      ...payload
    } = data;

    const result = await query<{
      id: string;
      title: string;
      constellation_data: unknown;
      created_at: string;
    }>(
      `INSERT INTO wish_cards (
         id,
         user_id,
         title,
         constellation_data,
         created_at,
         updated_at
       )
       VALUES ($1, $2, $3, $4::jsonb, now(), now())
       ON CONFLICT (id)
       DO UPDATE SET
         user_id = EXCLUDED.user_id,
         title = EXCLUDED.title,
         constellation_data = EXCLUDED.constellation_data,
         updated_at = now()
       RETURNING id, title, constellation_data, created_at`,
      [
        id,
        userId,
        title,
        JSON.stringify(payload),
      ],
    );

    console.log('[api] INSERT wish_cards succeeded', {
      id,
      rowCount: result.rowCount,
    });

    const row = result.rows[0];

    res.status(201).json({
      ...((row.constellation_data as object) ?? {}),
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
    });
  } catch (error) {
    console.error('[api] INSERT wish_cards failed', error);
    res.status(400).json({
      error:
        error instanceof Error ? error.message : 'Unable to save wish',
    });
  }
});

app.get('/api/wishes/:id', async (req, res) => {
  try {
    const result = await query<{
      id: string;
      title: string;
      constellation_data: unknown;
      created_at: string;
    }>(
      'SELECT id, title, constellation_data, created_at FROM wish_cards WHERE id = $1',
      [req.params.id],
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: 'Wish not found' });
    }

    const row = result.rows[0];

    console.log('[api] SELECT wish_cards/:id succeeded', {
      id: req.params.id,
    });

    res.json({
      ...((row.constellation_data as object) ?? {}),
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
    });
  } catch (error) {
    console.error('[api] SELECT wish_cards/:id failed', error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Unable to get wish',
    });
  }
});

app.delete('/api/wishes/:id', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM wish_cards WHERE id = $1',
      [req.params.id],
    );

    console.log('[api] DELETE wish_cards succeeded', {
      id: req.params.id,
      rowCount: result.rowCount,
    });

    res.status(204).end();
  } catch (error) {
    console.error('[api] DELETE wish_cards failed', error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Unable to delete wish',
    });
  }
});
app.get('/api/records/stories/ids', async (_req, res) => {
  try {
    const result = await query<{ id: string }>(
      `SELECT id
       FROM app_records
       WHERE store_name = 'stories'
       ORDER BY created_at ASC`,
    );

    res.json(result.rows.map((row) => row.id));
  } catch (error) {
    console.error('[api] list story ids failed', error);
    res.status(400).json({
      error:
        error instanceof Error
          ? error.message
          : 'Unable to list story ids',
    });
  }
});
/* =========================
   GENERIC RECORDS
   ========================= */

app.get('/api/records/:store', async (req, res) => {
  try {
    const store = storeName(req.params.store);

    const result = await query<{ data: unknown }>(
      `SELECT data
       FROM app_records
       WHERE store_name = $1
       ORDER BY created_at ASC`,
      [store],
    );

    console.log('[api] SELECT records succeeded', {
      store,
      count: result.rowCount,
    });

    res.json(result.rows.map((row) => row.data));
  } catch (error) {
    console.error('[api] list records failed', error);
    res.status(400).json({
      error:
        error instanceof Error
          ? error.message
          : 'Unable to list records',
    });
  }
});

app.get('/api/records/:store/:id', async (req, res) => {
  try {
    const store = storeName(req.params.store);

    const result = await query<{ data: unknown }>(
      `SELECT data
       FROM app_records
       WHERE store_name = $1
         AND id = $2`,
      [store, req.params.id],
    );

    if (!result.rowCount) {
      return res.status(404).json({
        error: 'Record not found',
      });
    }

    res.json(result.rows[0].data);
  } catch (error) {
    console.error('[api] get record failed', error);
    res.status(400).json({
      error:
        error instanceof Error
          ? error.message
          : 'Unable to get record',
    });
  }
});

async function saveRecord(
  store: string,
  id: string,
  data: object,
) {
  const result = await query<{ data: unknown }>(
    `INSERT INTO app_records (
       store_name,
       id,
       data,
       created_at,
       updated_at
     )
     VALUES ($1, $2, $3::jsonb, now(), now())
     ON CONFLICT (store_name, id)
     DO UPDATE SET
       data = EXCLUDED.data,
       updated_at = now()
     RETURNING data`,
    [
      store,
      id,
      JSON.stringify(data),
    ],
  );

  console.log('[api] record saved', {
    store,
    id,
    rowCount: result.rowCount,
  });

  return result.rows[0].data;
}

app.post('/api/records/:store', async (req, res) => {
  try {
    const store = storeName(req.params.store);
    const data = record(req.body);

    console.log('[api] POST record', {
      store,
      id: (data as { id: string }).id,
    });

    res.status(201).json(
      await saveRecord(
        store,
        (data as { id: string }).id,
        data,
      ),
    );
  } catch (error) {
    console.error('[api] POST record failed', error);
    res.status(400).json({
      error:
        error instanceof Error
          ? error.message
          : 'Unable to save record',
    });
  }
});

app.put('/api/records/:store/:id', async (req, res) => {
  try {
    const store = storeName(req.params.store);
    const data = record(req.body);

    if (
      (data as { id: string }).id !== req.params.id
    ) {
      return res.status(400).json({
        error: 'Path id must match record id',
      });
    }

    console.log('[api] PUT record', {
      store,
      id: req.params.id,
    });

    res.json(
      await saveRecord(
        store,
        req.params.id,
        data,
      ),
    );
  } catch (error) {
    console.error('[api] PUT record failed', error);
    res.status(400).json({
      error:
        error instanceof Error
          ? error.message
          : 'Unable to update record',
    });
  }
});

app.delete('/api/records/:store/:id', async (req, res) => {
  try {
    const store = storeName(req.params.store);

    await query(
      `DELETE FROM app_records
       WHERE store_name = $1
         AND id = $2`,
      [store, req.params.id],
    );

    res.status(204).end();
  } catch (error) {
    console.error('[api] delete record failed', error);
    res.status(400).json({
      error:
        error instanceof Error
          ? error.message
          : 'Unable to delete record',
    });
  }
});

/* =========================
   LOCAL SERVER
   ========================= */

if (
  process.env.VERCEL !== '1' &&
  process.env.NETLIFY !== 'true'
) {
  app.listen(port, () => {
    console.log(
      `[api] PostgreSQL API listening on :${port}`,
    );
  });
}

export default app;