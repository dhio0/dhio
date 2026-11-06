/*
 * Copies the current site content from src/lib/data.ts into the database.
 *   npm run db:seed            only fills empty tables
 *   npm run db:seed -- --force wipes projects, roles and certifications first
 * Reads DATABASE_URL from the environment or .env.local.
 */
import { existsSync } from "node:fs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { certifications, experience, projects } from "../src/lib/data";
import { parseMonthYear } from "../src/lib/month";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (add it to .env.local).");
  process.exit(1);
}

const force = process.argv.includes("--force");
const sql = postgres(url, { prepare: false, max: 1 });
const db = drizzle(sql, { schema });

async function isEmpty(table: typeof schema.projects | typeof schema.roles | typeof schema.certifications) {
  const rows = await db.select().from(table).limit(1);
  return rows.length === 0;
}

try {
  if (force) {
    await db.delete(schema.projects);
    await db.delete(schema.roles);
    await db.delete(schema.certifications);
    console.log("Cleared existing rows.");
  }

  if (await isEmpty(schema.projects)) {
    await db.insert(schema.projects).values(
      projects.map((p, i) => ({
        slug: p.slug,
        code: p.code,
        title: p.title,
        tagline: p.tagline,
        year: p.year,
        kind: p.kind,
        problem: p.problem,
        approach: p.approach,
        evidence: p.evidence,
        stack: p.stack,
        links: p.links,
        showcase: p.showcase ?? null,
        pipeline: p.pipeline ?? null,
        cover: p.cover ?? null,
        sortOrder: i + 1,
      })),
    );
    console.log(`Projects: ${projects.length}`);
  } else console.log("Projects: already filled, skipped");

  if (await isEmpty(schema.roles)) {
    const rows = experience.flatMap((org) =>
      org.roles.map((r) => ({
        org: org.org,
        orgNote: org.orgNote,
        location: org.location,
        type: org.type,
        title: r.title,
        start: r.start,
        end: r.end,
        summary: r.summary,
        skills: r.skills,
      })),
    );
    await db.insert(schema.roles).values(rows);
    console.log(`Roles: ${rows.length}`);
  } else console.log("Roles: already filled, skipped");

  if (await isEmpty(schema.certifications)) {
    await db.insert(schema.certifications).values(
      certifications.map((c, i) => ({
        title: c.title,
        issuer: c.issuer,
        issued: parseMonthYear(c.issued),
        credentialId: c.credentialId ?? null,
        idLabel: c.idLabel ?? null,
        verifyUrl: c.verifyUrl ?? null,
        fileUrl: c.file ?? null,
        image: c.image ?? null,
        grade: c.grade ?? null,
        courses: c.courses ?? null,
        summary: c.summary,
        sortOrder: i + 1,
      })),
    );
    console.log(`Certifications: ${certifications.length}`);
  } else console.log("Certifications: already filled, skipped");
} finally {
  await sql.end();
}
