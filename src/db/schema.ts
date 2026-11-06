import { boolean, index, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

type Link = { label: string; href: string };
type Img = { src: string; width: number; height: number };
type Step = { name: string; note: string };

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  code: text("code").notNull(),
  title: text("title").notNull(),
  tagline: text("tagline").notNull(),
  year: text("year").notNull(),
  kind: text("kind").notNull(),
  problem: text("problem").notNull(),
  approach: text("approach").notNull(),
  evidence: jsonb("evidence").$type<string[]>().notNull().default([]),
  stack: jsonb("stack").$type<string[]>().notNull().default([]),
  links: jsonb("links").$type<Link[]>().notNull().default([]),
  /** Screenshot for projects without a built-in showcase. */
  cover: jsonb("cover").$type<Img | null>(),
  /** Key of a hand-built showcase component, e.g. "webforensics". */
  showcase: text("showcase"),
  pipeline: jsonb("pipeline").$type<Step[] | null>(),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** One row per role; roles are grouped by organisation when read. */
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  org: text("org").notNull(),
  orgNote: text("org_note").notNull().default(""),
  location: text("location").notNull().default(""),
  type: text("type").$type<"work" | "education">().notNull().default("work"),
  title: text("title").notNull(),
  /** YYYY-MM */
  start: text("start").notNull(),
  /** YYYY-MM, or null while the role is current. */
  end: text("end"),
  summary: text("summary").notNull(),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const certifications = pgTable("certifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  issuer: text("issuer").notNull(),
  /** YYYY-MM */
  issued: text("issued").notNull(),
  credentialId: text("credential_id"),
  idLabel: text("id_label"),
  verifyUrl: text("verify_url"),
  fileUrl: text("file_url"),
  image: jsonb("image").$type<Img | null>(),
  grade: text("grade"),
  courses: jsonb("courses").$type<string[] | null>(),
  summary: text("summary").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Failed admin logins, used for rate limiting across serverless instances. */
export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: serial("id").primaryKey(),
    ip: text("ip").notNull(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("login_attempts_ip_at").on(t.ip, t.at)],
);
