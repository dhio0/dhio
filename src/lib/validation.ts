import { z } from "zod";

/*
 * Input rules for the admin API. Everything coming from the admin form is
 * validated here before it reaches the database.
 */

const ym = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM");
const text = (max: number) => z.string().trim().min(1).max(max);
const optText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional();
/** http(s) links, or site-relative paths for files under /public. */
const url = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v.startsWith("/") || /^https?:\/\//i.test(v), "Must be an http(s) URL or a /path");
const optUrl = z
  .union([url, z.literal("")])
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional();
const list = (maxItems: number, maxLen: number) => z.array(z.string().trim().min(1).max(maxLen)).max(maxItems);
const img = z.object({ src: url, width: z.number().int().positive(), height: z.number().int().positive() });

export const projectInput = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes")
    .max(60),
  title: text(80),
  tagline: text(200),
  year: z.string().regex(/^\d{4}$/),
  kind: text(80),
  problem: text(1500),
  approach: text(2000),
  evidence: list(12, 300),
  stack: list(16, 40),
  links: z.array(z.object({ label: text(40), href: url })).max(6),
  cover: img.nullable().optional(),
  sortOrder: z.number().int().min(0).max(999).default(0),
  published: z.boolean().default(true),
});

export const roleInput = z
  .object({
    org: text(100),
    orgNote: z.string().trim().max(150).default(""),
    location: z.string().trim().max(100).default(""),
    type: z.enum(["work", "education"]),
    title: text(120),
    start: ym,
    end: ym.nullable(),
    summary: text(1200),
    skills: list(10, 50),
  })
  .refine((r) => !r.end || r.end >= r.start, { message: "End must be after start", path: ["end"] });

export const certificationInput = z.object({
  title: text(150),
  issuer: text(100),
  issued: ym,
  credentialId: optText(120),
  idLabel: optText(40),
  verifyUrl: optUrl,
  fileUrl: optUrl,
  image: img.nullable().optional(),
  grade: optText(60),
  courses: list(20, 120).nullable().optional(),
  summary: text(800),
  sortOrder: z.number().int().min(0).max(999).default(0),
});

export type ProjectInput = z.infer<typeof projectInput>;
export type RoleInput = z.infer<typeof roleInput>;
export type CertificationInput = z.infer<typeof certificationInput>;
