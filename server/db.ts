import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL && fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = (match[2] || '').trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = process.env[key] ?? value;
    }
  }
}

function getSslConfig() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return undefined;

  const localCaPath = path.join(process.cwd(), 'ca.pem');
  if (fs.existsSync(localCaPath)) {
    try {
      return {
        rejectUnauthorized: false,
        ca: fs.readFileSync(localCaPath, 'utf8'),
      };
    } catch {}
  }

  return { rejectUnauthorized: false };
}

let pool: pg.Pool | undefined;

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured. Add the Aiven PostgreSQL connection string.');
  }

  const connectionString = process.env.DATABASE_URL
    .replace(/([?&])sslmode=[^&]*&?/g, '$1')
    .replace(/([?&])sslrootcert=[^&]*&?/g, '$1')
    .replace(/[?&]$/, '');

  pool ??= new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
  });

  return pool;
}

export async function query<T extends pg.QueryResultRow>(text: string, values: unknown[] = []) {
  const client = await getPool().connect();
  try {
    return await client.query<T>(text, values);
  } finally {
    client.release();
  }
}

export async function closePool() {
  await pool?.end();
  pool = undefined;
}
