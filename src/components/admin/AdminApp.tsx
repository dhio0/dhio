"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { certifications, projects, roles } from "@/db/schema";
import { formatPeriod, formatYm } from "@/lib/month";
import {
  api,
  CommaInput,
  ErrorBox,
  Field,
  type Img,
  inputCls,
  LinesInput,
  TextArea,
  TextInput,
  Upload,
} from "./fields";

type ProjectRow = typeof projects.$inferSelect;
type RoleRow = typeof roles.$inferSelect;
type CertRow = typeof certifications.$inferSelect;

const TABS = [
  { id: "projects", label: "Projects" },
  { id: "roles", label: "Experience" },
  { id: "certs", label: "Certificates" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export function AdminApp({ blobEnabled }: { blobEnabled: boolean }) {
  const [tab, setTab] = useState<Tab>("projects");

  return (
    <main className="shell pt-10 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="label text-accent">Admin · signed in</p>
          <h1 className="font-display mt-1 text-5xl font-extrabold tracking-[-0.04em]">Case files.</h1>
        </div>
        <div className="flex gap-2">
          <a href="/" target="_blank" className="hx inline-flex h-9 items-center rounded-lg border border-line px-3 font-mono text-[0.7rem] uppercase">
            View site ↗
          </a>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/admin/login";
            }}
            className="hx h-9 rounded-lg bg-ink px-3 font-mono text-[0.7rem] text-paper uppercase hover:bg-accent"
          >
            Log out
          </button>
        </div>
      </div>

      <nav className="mt-6 flex gap-1" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`hx h-9 rounded-lg px-4 font-mono text-[0.75rem] uppercase ${tab === t.id ? "bg-ink text-paper" : "text-ink-3 hover:text-ink"}`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "projects" && <ProjectsManager blob={blobEnabled} />}
        {tab === "roles" && <RolesManager />}
        {tab === "certs" && <CertsManager blob={blobEnabled} />}
      </div>
    </main>
  );
}

// ---------- shared list/editor plumbing ----------

function useCollection<T>(endpoint: string) {
  const [rows, setRows] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    const r = await api<T[]>("GET", endpoint);
    if (r.ok) setRows(r.data);
    else setError(r.error);
  }, [endpoint]);
  useEffect(() => {
    load();
  }, [load]);
  return { rows, error, reload: load };
}

function ListShell({
  title,
  count,
  onNew,
  children,
  error,
}: {
  title: string;
  count: number | null;
  onNew: () => void;
  children: React.ReactNode;
  error: string | null;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em]">
          {title} <span className="font-mono text-sm text-ink-3">{count ?? "…"}</span>
        </h2>
        <button
          type="button"
          onClick={onNew}
          className="hx h-9 rounded-lg bg-accent px-4 font-mono text-[0.72rem] tracking-[0.05em] text-white uppercase"
        >
          + New
        </button>
      </div>
      <ErrorBox error={error} />
      <ul className="divide-y divide-line border-y border-line">{children}</ul>
    </section>
  );
}

function Row({ title, meta, onEdit, onDelete }: { title: string; meta: string; onEdit: () => void; onDelete: () => void }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium">{title}</p>
        <p className="truncate font-mono text-[0.72rem] text-ink-3">{meta}</p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onEdit} className="hx h-8 rounded-md border border-line px-3 font-mono text-[0.68rem] uppercase hover:border-ink">
          Edit
        </button>
        <button type="button" onClick={onDelete} className="hx h-8 rounded-md border border-line px-3 font-mono text-[0.68rem] text-accent uppercase hover:border-accent">
          Delete
        </button>
      </div>
    </li>
  );
}

/** Slide-over editor panel. */
function Editor({
  open,
  title,
  onClose,
  onSave,
  saving,
  error,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  error: { error: string | null; issues?: { path: string; message: string }[] };
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Close" className="absolute inset-0 bg-ink/40" onClick={onClose} />
          <motion.form
            data-lenis-prevent
            onSubmit={(e) => {
              e.preventDefault();
              onSave();
            }}
            className="relative flex h-full w-full max-w-2xl flex-col bg-paper shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h3 className="font-display text-xl font-extrabold tracking-[-0.02em]">{title}</h3>
              <button type="button" onClick={onClose} className="font-mono text-[0.72rem] text-ink-3 uppercase hover:text-ink">
                Close
              </button>
            </div>
            <div className="grid flex-1 content-start gap-5 overflow-y-auto px-6 py-6 sm:grid-cols-2">{children}</div>
            <div className="grid gap-3 border-t border-line px-6 py-4">
              <ErrorBox error={error.error} issues={error.issues} />
              <button
                type="submit"
                disabled={saving}
                className="hx h-11 rounded-lg bg-ink font-mono text-[0.78rem] tracking-[0.06em] text-paper uppercase hover:bg-accent disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function useEditor<Draft>(endpoint: string, toBody: (d: Draft) => unknown, reload: () => void) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<{ error: string | null; issues?: { path: string; message: string }[] }>({ error: null });

  return {
    draft,
    set: (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d)),
    open: (d: Draft, id: number | null) => {
      setDraft(d);
      setEditId(id);
      setErr({ error: null });
    },
    close: () => setDraft(null),
    editing: editId !== null,
    saving,
    err,
    save: async () => {
      if (!draft) return;
      setSaving(true);
      const r = await api(editId === null ? "POST" : "PUT", editId === null ? endpoint : `${endpoint}/${editId}`, toBody(draft));
      setSaving(false);
      if (r.ok) {
        setDraft(null);
        reload();
      } else setErr({ error: r.error, issues: r.issues });
    },
    remove: async (id: number, label: string) => {
      if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
      const r = await api("DELETE", `${endpoint}/${id}`);
      if (r.ok) reload();
      else alert(r.error);
    },
  };
}

// ---------- projects ----------

type ProjectDraft = {
  slug: string;
  slugTouched: boolean;
  title: string;
  tagline: string;
  year: string;
  kind: string;
  problem: string;
  approach: string;
  evidence: string[];
  stack: string[];
  links: string[];
  cover: Img | null;
  sortOrder: number;
  published: boolean;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

function ProjectsManager({ blob }: { blob: boolean }) {
  const { rows, error, reload } = useCollection<ProjectRow>("/api/admin/projects");
  const ed = useEditor<ProjectDraft>(
    "/api/admin/projects",
    (d) => ({
      slug: d.slug,
      title: d.title,
      tagline: d.tagline,
      year: d.year,
      kind: d.kind,
      problem: d.problem,
      approach: d.approach,
      evidence: d.evidence,
      stack: d.stack,
      links: d.links
        .map((l) => l.split("|").map((s) => s.trim()))
        .filter(([label, href]) => label && href)
        .map(([label, href]) => ({ label, href })),
      cover: d.cover,
      sortOrder: d.sortOrder,
      published: d.published,
    }),
    reload,
  );

  const blank: ProjectDraft = {
    slug: "",
    slugTouched: false,
    title: "",
    tagline: "",
    year: String(new Date().getFullYear()),
    kind: "",
    problem: "",
    approach: "",
    evidence: [],
    stack: [],
    links: [],
    cover: null,
    sortOrder: (rows?.length ?? 0) + 1,
    published: true,
  };
  const d = ed.draft;

  return (
    <>
      <ListShell title="Projects" count={rows?.length ?? null} onNew={() => ed.open(blank, null)} error={error}>
        {rows?.map((p) => (
          <Row
            key={p.id}
            title={`${p.code} · ${p.title}${p.published ? "" : " (draft)"}`}
            meta={`${p.kind} · ${p.year}${p.showcase ? " · has built-in showcase" : ""}`}
            onEdit={() =>
              ed.open(
                {
                  slug: p.slug,
                  slugTouched: true,
                  title: p.title,
                  tagline: p.tagline,
                  year: p.year,
                  kind: p.kind,
                  problem: p.problem,
                  approach: p.approach,
                  evidence: p.evidence,
                  stack: p.stack,
                  links: p.links.map((l) => `${l.label} | ${l.href}`),
                  cover: p.cover ?? null,
                  sortOrder: p.sortOrder,
                  published: p.published,
                },
                p.id,
              )
            }
            onDelete={() => ed.remove(p.id, p.title)}
          />
        ))}
      </ListShell>

      <Editor open={!!d} title={ed.editing ? "Edit project" : "New project"} onClose={ed.close} onSave={ed.save} saving={ed.saving} error={ed.err}>
        {d && (
          <>
            <Field label="Title">
              <TextInput
                required
                value={d.title}
                onChange={(e) => ed.set({ title: e.target.value, ...(d.slugTouched ? {} : { slug: slugify(e.target.value) }) })}
              />
            </Field>
            <Field label="Slug" hint="Used in the URL, lowercase-with-dashes">
              <TextInput required value={d.slug} onChange={(e) => ed.set({ slug: e.target.value, slugTouched: true })} />
            </Field>
            <Field label="Tagline" wide>
              <TextInput required value={d.tagline} onChange={(e) => ed.set({ tagline: e.target.value })} />
            </Field>
            <Field label="Kind" hint="e.g. Recon tool · Python">
              <TextInput required value={d.kind} onChange={(e) => ed.set({ kind: e.target.value })} />
            </Field>
            <Field label="Year">
              <TextInput required value={d.year} inputMode="numeric" onChange={(e) => ed.set({ year: e.target.value })} />
            </Field>
            <Field label="Problem" wide>
              <TextArea required value={d.problem} onChange={(e) => ed.set({ problem: e.target.value })} />
            </Field>
            <Field label="Approach" wide>
              <TextArea required rows={5} value={d.approach} onChange={(e) => ed.set({ approach: e.target.value })} />
            </Field>
            <Field label="Evidence" hint="One point per line" wide>
              <LinesInput value={d.evidence} onChange={(v) => ed.set({ evidence: v })} />
            </Field>
            <Field label="Stack" hint="Comma separated" wide>
              <CommaInput value={d.stack} onChange={(v) => ed.set({ stack: v })} />
            </Field>
            <Field label="Links" hint="One per line: Label | https://…" wide>
              <LinesInput rows={3} value={d.links} onChange={(v) => ed.set({ links: v })} />
            </Field>
            <Field label="Screenshot" hint="Shown for projects without a built-in showcase" wide>
              <div className="grid gap-3">
                {d.cover && (
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.cover.src} alt="" className="h-16 w-28 rounded border border-line object-cover" />
                    <button type="button" onClick={() => ed.set({ cover: null })} className="font-mono text-[0.7rem] text-accent uppercase">
                      Remove
                    </button>
                  </div>
                )}
                <Upload
                  kind="image"
                  enabled={blob}
                  onUploaded={(r) => r.width && r.height && ed.set({ cover: { src: r.url, width: r.width, height: r.height } })}
                />
              </div>
            </Field>
            <Field label="Order" hint="Lower comes first">
              <TextInput type="number" min={0} value={d.sortOrder} onChange={(e) => ed.set({ sortOrder: Number(e.target.value) })} />
            </Field>
            <Field label="Visibility">
              <label className="flex h-10 items-center gap-2 text-[0.92rem]">
                <input type="checkbox" checked={d.published} onChange={(e) => ed.set({ published: e.target.checked })} />
                Published on the site
              </label>
            </Field>
          </>
        )}
      </Editor>
    </>
  );
}

// ---------- experience ----------

type RoleDraft = {
  org: string;
  orgNote: string;
  location: string;
  type: "work" | "education";
  title: string;
  start: string;
  end: string;
  current: boolean;
  summary: string;
  skills: string[];
};

function RolesManager() {
  const { rows, error, reload } = useCollection<RoleRow>("/api/admin/roles");
  const ed = useEditor<RoleDraft>(
    "/api/admin/roles",
    (d) => ({
      org: d.org,
      orgNote: d.orgNote,
      location: d.location,
      type: d.type,
      title: d.title,
      start: d.start,
      end: d.current ? null : d.end,
      summary: d.summary,
      skills: d.skills,
    }),
    reload,
  );
  const last = rows?.[0];
  const blank: RoleDraft = {
    org: last?.org ?? "",
    orgNote: last?.orgNote ?? "",
    location: last?.location ?? "",
    type: "work",
    title: "",
    start: "",
    end: "",
    current: true,
    summary: "",
    skills: [],
  };
  const d = ed.draft;

  return (
    <>
      <ListShell title="Experience" count={rows?.length ?? null} onNew={() => ed.open(blank, null)} error={error}>
        {rows?.map((r) => (
          <Row
            key={r.id}
            title={`${r.title}`}
            meta={`${r.org} · ${formatPeriod(r.start, r.end)}`}
            onEdit={() =>
              ed.open(
                { ...r, end: r.end ?? "", current: r.end === null, orgNote: r.orgNote, location: r.location },
                r.id,
              )
            }
            onDelete={() => ed.remove(r.id, r.title)}
          />
        ))}
      </ListShell>

      <Editor open={!!d} title={ed.editing ? "Edit role" : "New role"} onClose={ed.close} onSave={ed.save} saving={ed.saving} error={ed.err}>
        {d && (
          <>
            <Field label="Organisation" hint="Roles with the same name are grouped together">
              <TextInput required value={d.org} onChange={(e) => ed.set({ org: e.target.value })} />
            </Field>
            <Field label="Type">
              <select className={`${inputCls} h-10`} value={d.type} onChange={(e) => ed.set({ type: e.target.value as RoleDraft["type"] })}>
                <option value="work">Organisation / work</option>
                <option value="education">Education</option>
              </select>
            </Field>
            <Field label="Organisation note" hint="e.g. BINUS University student community">
              <TextInput value={d.orgNote} onChange={(e) => ed.set({ orgNote: e.target.value })} />
            </Field>
            <Field label="Location">
              <TextInput value={d.location} onChange={(e) => ed.set({ location: e.target.value })} />
            </Field>
            <Field label="Role title" wide>
              <TextInput required value={d.title} onChange={(e) => ed.set({ title: e.target.value })} />
            </Field>
            <Field label="Start">
              <TextInput required type="month" value={d.start} onChange={(e) => ed.set({ start: e.target.value })} />
            </Field>
            <Field label="End">
              <div className="grid gap-2">
                <TextInput type="month" disabled={d.current} required={!d.current} value={d.end} onChange={(e) => ed.set({ end: e.target.value })} />
                <label className="flex items-center gap-2 text-[0.85rem]">
                  <input type="checkbox" checked={d.current} onChange={(e) => ed.set({ current: e.target.checked })} />
                  I still do this (Present)
                </label>
              </div>
            </Field>
            <Field label="Summary" wide>
              <TextArea required rows={5} value={d.summary} onChange={(e) => ed.set({ summary: e.target.value })} />
            </Field>
            <Field label="Skills" hint="Comma separated" wide>
              <CommaInput value={d.skills} onChange={(v) => ed.set({ skills: v })} />
            </Field>
          </>
        )}
      </Editor>
    </>
  );
}

// ---------- certificates ----------

type CertDraft = {
  title: string;
  issuer: string;
  issued: string;
  credentialId: string;
  idLabel: string;
  verifyUrl: string;
  fileUrl: string;
  image: Img | null;
  grade: string;
  courses: string[];
  summary: string;
  sortOrder: number;
};

function CertsManager({ blob }: { blob: boolean }) {
  const { rows, error, reload } = useCollection<CertRow>("/api/admin/certifications");
  const ed = useEditor<CertDraft>(
    "/api/admin/certifications",
    (d) => ({ ...d, courses: d.courses.length ? d.courses : null }),
    reload,
  );
  const blank: CertDraft = {
    title: "",
    issuer: "",
    issued: "",
    credentialId: "",
    idLabel: "",
    verifyUrl: "",
    fileUrl: "",
    image: null,
    grade: "",
    courses: [],
    summary: "",
    sortOrder: 0,
  };
  const d = ed.draft;

  return (
    <>
      <ListShell title="Certificates" count={rows?.length ?? null} onNew={() => ed.open(blank, null)} error={error}>
        {rows?.map((c) => (
          <Row
            key={c.id}
            title={c.title}
            meta={`${c.issuer} · ${formatYm(c.issued)}${c.fileUrl ? " · PDF" : ""}${c.image ? " · image" : ""}`}
            onEdit={() =>
              ed.open(
                {
                  title: c.title,
                  issuer: c.issuer,
                  issued: c.issued,
                  credentialId: c.credentialId ?? "",
                  idLabel: c.idLabel ?? "",
                  verifyUrl: c.verifyUrl ?? "",
                  fileUrl: c.fileUrl ?? "",
                  image: c.image ?? null,
                  grade: c.grade ?? "",
                  courses: c.courses ?? [],
                  summary: c.summary,
                  sortOrder: c.sortOrder,
                },
                c.id,
              )
            }
            onDelete={() => ed.remove(c.id, c.title)}
          />
        ))}
      </ListShell>

      <Editor open={!!d} title={ed.editing ? "Edit certificate" : "New certificate"} onClose={ed.close} onSave={ed.save} saving={ed.saving} error={ed.err}>
        {d && (
          <>
            <Field label="Title" wide>
              <TextInput required value={d.title} onChange={(e) => ed.set({ title: e.target.value })} />
            </Field>
            <Field label="Issuer">
              <TextInput required value={d.issuer} onChange={(e) => ed.set({ issuer: e.target.value })} />
            </Field>
            <Field label="Issued">
              <TextInput required type="month" value={d.issued} onChange={(e) => ed.set({ issued: e.target.value })} />
            </Field>
            <Field label="Credential ID">
              <TextInput value={d.credentialId} onChange={(e) => ed.set({ credentialId: e.target.value })} />
            </Field>
            <Field label="ID label" hint='Defaults to "Credential ID"'>
              <TextInput value={d.idLabel} onChange={(e) => ed.set({ idLabel: e.target.value })} />
            </Field>
            <Field label="Verify URL" wide>
              <TextInput type="url" value={d.verifyUrl} onChange={(e) => ed.set({ verifyUrl: e.target.value })} />
            </Field>
            <Field label="Grade" hint="e.g. High Distinction">
              <TextInput value={d.grade} onChange={(e) => ed.set({ grade: e.target.value })} />
            </Field>
            <Field label="Order" hint="Lower comes first">
              <TextInput type="number" min={0} value={d.sortOrder} onChange={(e) => ed.set({ sortOrder: Number(e.target.value) })} />
            </Field>
            <Field label="Certificate image" hint="Shown on the card" wide>
              <div className="grid gap-3">
                {d.image && (
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.image.src} alt="" className="h-16 w-24 rounded border border-line object-cover" />
                    <button type="button" onClick={() => ed.set({ image: null })} className="font-mono text-[0.7rem] text-accent uppercase">
                      Remove
                    </button>
                  </div>
                )}
                <Upload
                  kind="image"
                  enabled={blob}
                  onUploaded={(r) => r.width && r.height && ed.set({ image: { src: r.url, width: r.width, height: r.height } })}
                />
              </div>
            </Field>
            <Field label="Certificate PDF" hint="Upload, or paste a link" wide>
              <div className="grid gap-2">
                <TextInput value={d.fileUrl} placeholder="https://… or /certs/file.pdf" onChange={(e) => ed.set({ fileUrl: e.target.value })} />
                <Upload kind="pdf" enabled={blob} onUploaded={(r) => ed.set({ fileUrl: r.url })} />
              </div>
            </Field>
            <Field label="Summary" wide>
              <TextArea required value={d.summary} onChange={(e) => ed.set({ summary: e.target.value })} />
            </Field>
            <Field label="Courses" hint="Optional, one per line (drawn as a progress track)" wide>
              <LinesInput value={d.courses} onChange={(v) => ed.set({ courses: v })} />
            </Field>
          </>
        )}
      </Editor>
    </>
  );
}
