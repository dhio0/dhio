/*
 * Copies the content in src/lib/data.ts into the database.
 * Each table is only filled when it is empty, unless `force` wipes it first,
 * so running this on every deploy never overwrites edits made in /admin.
 */
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../src/db/schema";
import { certifications, experience, projects } from "../src/lib/data";
import { parseMonthYear } from "../src/lib/month";

type Db = PostgresJsDatabase<typeof schema>;

async function isEmpty(db: Db, table: typeof schema.projects | typeof schema.roles | typeof schema.certifications) {
  return (await db.select().from(table).limit(1)).length === 0;
}

export async function seed(db: Db, { force = false } = {}) {
  if (force) {
    await db.delete(schema.projects);
    await db.delete(schema.roles);
    await db.delete(schema.certifications);
    console.log("seed: cleared existing rows");
  }

  if (await isEmpty(db, schema.projects)) {
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
    console.log(`seed: projects +${projects.length}`);
  } else console.log("seed: projects already filled, skipped");

  if (await isEmpty(db, schema.roles)) {
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
    console.log(`seed: roles +${rows.length}`);
  } else console.log("seed: roles already filled, skipped");

  if (await isEmpty(db, schema.certifications)) {
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
    console.log(`seed: certifications +${certifications.length}`);
  } else console.log("seed: certifications already filled, skipped");
}
