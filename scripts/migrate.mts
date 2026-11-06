/*
 * Runs before every build (see "build" in package.json):
 *   1. applies any new SQL migrations from ./drizzle (already-applied ones are skipped),
 *   2. fills empty tables from src/lib/data.ts.
 * Does nothing when DATABASE_URL is not set, so builds without a database still work.
 * Uses the direct (unpooled) connection when Neon provides one, as migrations
 * should not run through the pooler.
 */
import { existsSync } from "node:fs";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { seed } from "./seed-lib.mts";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!url) {
  console.log("migrate: DATABASE_URL not set, skipping (site uses static content)");
  process.exit(0);
}

const sql = postgres(url, { max: 1, onnotice: () => {} });
try {
  const db = drizzle(sql, { schema });
  await migrate(db, { migrationsFolder: "drizzle" });
  console.log("migrate: schema up to date");
  await seed(db);
} finally {
  await sql.end();
}
