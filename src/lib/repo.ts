import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import * as staticData from "./data";
import { formatPeriod, formatYm } from "./month";
import type { Certification, Experience, Project } from "./types";
import type { CertificationInput, ProjectInput, RoleInput } from "./validation";

/*
 * Data access layer. Pages and API routes only call these functions.
 * Projects, experience and certificates come from Postgres when DATABASE_URL
 * is set, otherwise from the static content in data.ts. Profile, focus areas
 * and skills always come from data.ts.
 */

const { projects: P, roles: R, certifications: C } = schema;

// ---------- static content ----------

export async function getProfile() {
  return staticData.profile;
}

export async function getPillars() {
  return staticData.pillars;
}

export async function listSkills() {
  return staticData.skills;
}

// ---------- projects ----------

type ProjectRow = typeof P.$inferSelect;

function toProject(r: ProjectRow): Project {
  return {
    id: r.id,
    slug: r.slug,
    code: r.code,
    title: r.title,
    tagline: r.tagline,
    year: r.year,
    kind: r.kind,
    problem: r.problem,
    approach: r.approach,
    evidence: r.evidence,
    stack: r.stack,
    links: r.links,
    showcase: (r.showcase as Project["showcase"]) ?? null,
    pipeline: r.pipeline ?? null,
    cover: r.cover ?? null,
  };
}

export async function listProjects() {
  if (!db) return staticData.projects;
  const rows = await db.select().from(P).where(eq(P.published, true)).orderBy(asc(P.sortOrder), asc(P.id));
  return rows.map(toProject);
}

export async function getProject(slug: string) {
  if (!db) return staticData.projects.find((p) => p.slug === slug) ?? null;
  const [row] = await db.select().from(P).where(eq(P.slug, slug)).limit(1);
  return row && row.published ? toProject(row) : null;
}

// ---------- experience ----------

type RoleRow = typeof R.$inferSelect;

/** Current roles first, then most recent start; organisations keep that order, education last. */
function groupRoles(rows: RoleRow[]): Experience[] {
  const sorted = [...rows].sort((a, b) => {
    if ((a.end === null) !== (b.end === null)) return a.end === null ? -1 : 1;
    return b.start.localeCompare(a.start);
  });
  const orgs = new Map<string, Experience>();
  for (const r of sorted) {
    const key = `${r.type}:${r.org}`;
    if (!orgs.has(key)) {
      orgs.set(key, { org: r.org, orgNote: r.orgNote, location: r.location, type: r.type, roles: [] });
    }
    orgs.get(key)!.roles.push({
      id: r.id,
      title: r.title,
      period: formatPeriod(r.start, r.end),
      start: r.start,
      end: r.end,
      summary: r.summary,
      skills: r.skills,
    });
  }
  return [...orgs.values()].sort((a, b) => (a.type === b.type ? 0 : a.type === "work" ? -1 : 1));
}

export async function listExperience() {
  if (!db) return staticData.experience;
  return groupRoles(await db.select().from(R));
}

// ---------- certifications ----------

type CertRow = typeof C.$inferSelect;

function toCert(r: CertRow): Certification {
  return {
    id: r.id,
    title: r.title,
    issuer: r.issuer,
    issued: formatYm(r.issued),
    credentialId: r.credentialId ?? undefined,
    idLabel: r.idLabel ?? undefined,
    verifyUrl: r.verifyUrl ?? undefined,
    file: r.fileUrl ?? undefined,
    image: r.image ?? undefined,
    grade: r.grade ?? undefined,
    courses: r.courses ?? undefined,
    summary: r.summary,
  };
}

export async function listCertifications() {
  if (!db) return staticData.certifications;
  const rows = await db.select().from(C).orderBy(asc(C.sortOrder), desc(C.issued), asc(C.id));
  return rows.map(toCert);
}

// ---------- admin (raw rows and writes) ----------

function requireDb() {
  if (!db) throw new DbMissingError();
  return db;
}

export class DbMissingError extends Error {
  constructor() {
    super("DATABASE_URL is not set");
  }
}

export const admin = {
  async listProjects() {
    return requireDb().select().from(P).orderBy(asc(P.sortOrder), asc(P.id));
  },
  async createProject(input: ProjectInput) {
    const d = requireDb();
    // Next case number after the highest existing one.
    const codes = await d.select({ code: P.code }).from(P);
    const n = Math.max(0, ...codes.map((c) => parseInt(c.code, 10)).filter(Number.isFinite)) + 1;
    const [row] = await d
      .insert(P)
      .values({ ...input, cover: input.cover ?? null, code: String(n).padStart(3, "0") })
      .returning();
    return row;
  },
  async updateProject(id: number, input: ProjectInput) {
    const [row] = await requireDb()
      .update(P)
      .set({ ...input, cover: input.cover ?? null, updatedAt: new Date() })
      .where(eq(P.id, id))
      .returning();
    return row ?? null;
  },
  async deleteProject(id: number) {
    const rows = await requireDb().delete(P).where(eq(P.id, id)).returning({ id: P.id });
    return rows.length > 0;
  },

  async listRoles() {
    return requireDb().select().from(R).orderBy(desc(R.start));
  },
  async createRole(input: RoleInput) {
    const [row] = await requireDb().insert(R).values(input).returning();
    return row;
  },
  async updateRole(id: number, input: RoleInput) {
    const [row] = await requireDb()
      .update(R)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(R.id, id))
      .returning();
    return row ?? null;
  },
  async deleteRole(id: number) {
    const rows = await requireDb().delete(R).where(eq(R.id, id)).returning({ id: R.id });
    return rows.length > 0;
  },

  async listCertifications() {
    return requireDb().select().from(C).orderBy(asc(C.sortOrder), desc(C.issued));
  },
  async createCertification(input: CertificationInput) {
    const [row] = await requireDb().insert(C).values(normCert(input)).returning();
    return row;
  },
  async updateCertification(id: number, input: CertificationInput) {
    const [row] = await requireDb()
      .update(C)
      .set({ ...normCert(input), updatedAt: new Date() })
      .where(eq(C.id, id))
      .returning();
    return row ?? null;
  },
  async deleteCertification(id: number) {
    const rows = await requireDb().delete(C).where(eq(C.id, id)).returning({ id: C.id });
    return rows.length > 0;
  },
};

function normCert(i: CertificationInput) {
  return {
    ...i,
    credentialId: i.credentialId ?? null,
    idLabel: i.idLabel ?? null,
    verifyUrl: i.verifyUrl ?? null,
    fileUrl: i.fileUrl ?? null,
    image: i.image ?? null,
    grade: i.grade ?? null,
    courses: i.courses && i.courses.length ? i.courses : null,
  };
}
