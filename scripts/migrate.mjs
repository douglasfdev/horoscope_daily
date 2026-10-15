import 'dotenv/config';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';

const { Pool } = pg;

function resolveDatabaseUrl() {
  const {
    DATABASE_URL,
    SUPABASE_DB_URL,
    POSTGRES_URL,
    SUPABASE_URL,
    SUPABASE_DB_PASSWORD,
    POSTGRES_PASSWORD,
    SUPABASE_DB_USER,
    SUPABASE_DB_NAME,
    SUPABASE_DB_PORT,
    SUPABASE_DB_HOST,
  } = process.env;

  const explicit = DATABASE_URL || SUPABASE_DB_URL || POSTGRES_URL;
  if (explicit) return explicit;

  const password = SUPABASE_DB_PASSWORD || POSTGRES_PASSWORD;
  if (SUPABASE_URL && password) {
    const ref = SUPABASE_URL.match(/^https?:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (ref) {
      const user = SUPABASE_DB_USER || 'postgres';
      const db = SUPABASE_DB_NAME || 'postgres';
      const port = SUPABASE_DB_PORT || '5432';
      const host = SUPABASE_DB_HOST || `db.${ref}.supabase.co`;
      // Force IPv4 by using hostname resolution
      const enc = encodeURIComponent(password);
      // Try with explicit IPv4 preference by using the hostname
      return `postgresql://${user}:${enc}@${host}:${port}/${db}?sslmode=require`;
    }
  }

  return null;
}

async function runMigrations() {
  const databaseUrl = resolveDatabaseUrl();
  if (!databaseUrl) {
    console.error('[migration] No database connection string found.');
    console.error(
      '[migration] Set DATABASE_URL (e.g. postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres)'
    );
    console.error(
      '[migration] or set SUPABASE_URL + SUPABASE_DB_PASSWORD to let the runner build it automatically.'
    );
    process.exit(1);
  }

  // Force IPv4 connection
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    family: 4,  // Force IPv4
  });

  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.schema_migrations (
          version text PRIMARY KEY,
          applied_at timestamptz NOT NULL DEFAULT now()
        )
      `);

      const { rows } = await client.query(
        'SELECT version FROM public.schema_migrations'
      );
      const applied = new Set(rows.map((r) => r.version));

      const migrationsDir = join(process.cwd(), 'migrations');
      const files = readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort((a, b) => a.localeCompare(b));

      if (files.length === 0) {
        console.log('[migration] no .sql files found in migrations/');
      }

      for (const file of files) {
        const version = file.replace(/\.sql$/, '');
        if (applied.has(version)) {
          console.log(`[migration] skipped ${file} (already applied)`);
          continue;
        }

        const sql = readFileSync(join(migrationsDir, file), 'utf8');
        console.log(`[migration] applying ${file} ...`);
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query(
            'INSERT INTO public.schema_migrations(version) VALUES ($1)',
            [version]
          );
          await client.query('COMMIT');
          console.log(`[migration] applied ${file}`);
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        }
      }
    } finally {
      client.release();
    }
    console.log('[migration] done');
  } catch (err) {
    console.error('[migration] failed:', err.message || err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runMigrations();
