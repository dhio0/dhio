import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/*
 * One small connection pool per server instance. `prepare: false` keeps it
 * compatible with Neon's pooled (PgBouncer) connection string on Vercel.
 * When DATABASE_URL is not set, `db` is null and the site falls back to the
 * content in src/lib/data.ts (read-only).
 */

const url = process.env.DATABASE_URL;

const globalForDb = globalThis as unknown as { pg?: ReturnType<typeof postgres> };

function client() {
  if (!url) return null;
  if (!globalForDb.pg) {
    globalForDb.pg = postgres(url, { prepare: false, max: 3, idle_timeout: 20 });
  }
  return globalForDb.pg;
}

const sql = client();
export const db = sql ? drizzle(sql, { schema }) : null;
export const hasDb = db !== null;
export { schema };
