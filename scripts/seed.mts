/*
 * Manual seed.
 *   npm run db:seed            only fills empty tables
 *   npm run db:seed -- --force wipes projects, roles and certifications first
 * Reads DATABASE_URL from the environment or .env.local.
 */
import { existsSync } from "node:fs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { seed } from "./seed-lib.mts";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (add it to .env.local).");
  process.exit(1);
}

const sql = postgres(url, { prepare: false, max: 1 });
try {
  await seed(drizzle(sql, { schema }), { force: process.argv.includes("--force") });
} finally {
  await sql.end();
}
