export type Link = { label: string; href: string };

export type Profile = {
  name: string;
  fullName: string;
  role: string;
  headline: string;
  statement: string;
  location: string;
  university: string;
  program: string;
  since: number;
  focus: string[];
  /** Short list of tools shown under the headline. */
  tools: string[];
  status: string;
  /** Leave empty to hide the email button. */
  email: string;
  /** Same number is used for WhatsApp and LINE. Leave empty to hide. */
  phone: { display: string; e164: string };
  /** Path under /public, e.g. "/cv.pdf". Leave empty to hide the CV link. */
  cvUrl: string;
  links: { github: string; linkedin: string };
};

/** One of the three areas the profile section describes. */
export type Pillar = {
  key: string;
  title: string;
  text: string;
  tools: string[];
};

export type Project = {
  slug: string;
  code: string;
  title: string;
  tagline: string;
  year: string;
  kind: string;
  problem: string;
  approach: string;
  evidence: string[];
  stack: string[];
  links: Link[];
  /** Full-width interactive showcase built from my own screenshots. */
  showcase?: "webforensics" | "registry";
  /** Optional ordered steps drawn as a pipeline. */
  pipeline?: { name: string; note: string }[];
};

export type Role = {
  title: string;
  period: string;
  start: string;
  end: string | null;
  summary: string;
  skills: string[];
};

export type Experience = {
  org: string;
  orgNote: string;
  location: string;
  type: "work" | "education";
  roles: Role[];
};

export type Certification = {
  title: string;
  issuer: string;
  issued: string;
  credentialId?: string;
  idLabel?: string;
  /** Online verification page. */
  verifyUrl?: string;
  /** The certificate itself (PDF under /public) and its preview image. */
  file?: string;
  image?: { src: string; width: number; height: number };
  grade?: string;
  /** Course titles for multi-course programmes, drawn as a completed track. */
  courses?: string[];
  summary: string;
};

export type EvidenceKind = "project" | "lab" | "cert" | "org" | "course";

export type Skill = {
  name: string;
  /** Where the skill was actually used. Skills without evidence are left out. */
  evidence: { label: string; kind: EvidenceKind; href?: string }[];
};

export type SkillGroup = {
  group: string;
  note: string;
  skills: Skill[];
};
