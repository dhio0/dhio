"use client";

import { useState } from "react";

/* Small form building blocks for the admin page. */

export const inputCls =
  "w-full rounded-lg border border-line bg-paper px-3 py-2 text-[0.92rem] outline-none transition-colors focus:border-ink";

export function Field({
  label,
  hint,
  children,
  wide,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`grid content-start gap-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="font-mono text-[0.68rem] text-ink-3">{hint}</span>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} h-10 ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={4} {...props} className={`${inputCls} leading-relaxed ${props.className ?? ""}`} />;
}

/** Edits a string[] as one item per line. */
export function LinesInput({ value, onChange, rows = 4 }: { value: string[]; onChange: (v: string[]) => void; rows?: number }) {
  const [raw, setRaw] = useState(value.join("\n"));
  return (
    <TextArea
      rows={rows}
      value={raw}
      onChange={(e) => {
        setRaw(e.target.value);
        onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean));
      }}
    />
  );
}

/** Edits a string[] as a comma-separated line. */
export function CommaInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [raw, setRaw] = useState(value.join(", "));
  return (
    <TextInput
      value={raw}
      onChange={(e) => {
        setRaw(e.target.value);
        onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean));
      }}
    />
  );
}

export type Img = { src: string; width: number; height: number };

/**
 * Uploads a file to /api/admin/upload. Images report their pixel size so the
 * public page can lay them out without jumping.
 */
export function Upload({
  kind,
  enabled,
  onUploaded,
}: {
  kind: "image" | "pdf";
  enabled: boolean;
  onUploaded: (r: { url: string; width?: number; height?: number }) => void;
}) {
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");
  const [msg, setMsg] = useState("");

  if (!enabled) {
    return (
      <p className="font-mono text-[0.7rem] text-ink-3">
        Upload is off until BLOB_READ_WRITE_TOKEN is set. Paste a URL instead.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="hx inline-flex h-9 cursor-pointer items-center rounded-lg border border-ink px-3 font-mono text-[0.7rem] tracking-[0.05em] uppercase hover:bg-ink hover:text-paper">
        {state === "busy" ? "Uploading…" : kind === "image" ? "Upload image" : "Upload PDF"}
        <input
          type="file"
          className="sr-only"
          accept={kind === "image" ? "image/png,image/jpeg,image/webp" : "application/pdf"}
          disabled={state === "busy"}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setState("busy");
            setMsg("");
            try {
              let size: { width: number; height: number } | undefined;
              if (kind === "image") {
                const bmp = await createImageBitmap(file);
                size = { width: bmp.width, height: bmp.height };
                bmp.close();
              }
              const fd = new FormData();
              fd.append("file", file);
              const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
              const json = await res.json().catch(() => ({}));
              if (!res.ok) throw new Error(json.error ?? "Upload failed");
              onUploaded({ url: json.url, ...size });
              setState("idle");
              setMsg("Uploaded");
            } catch (err) {
              setState("error");
              setMsg((err as Error).message);
            }
          }}
        />
      </label>
      {msg && <span className={`font-mono text-[0.7rem] ${state === "error" ? "text-accent" : "text-ink-3"}`}>{msg}</span>}
    </div>
  );
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; issues?: { path: string; message: string }[] };

export async function api<T>(method: string, url: string, body?: unknown): Promise<ApiResult<T>> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return { ok: true, data: null as T };
  const json = await res.json().catch(() => ({}));
  if (res.status === 401) {
    window.location.href = "/admin/login";
  }
  return res.ok ? { ok: true, data: json.data as T } : { ok: false, error: json.error ?? `Error ${res.status}`, issues: json.issues };
}

export function ErrorBox({ error, issues }: { error: string | null; issues?: { path: string; message: string }[] }) {
  if (!error) return null;
  return (
    <div className="rounded-lg border border-accent bg-accent/10 p-3 font-mono text-[0.75rem] text-accent">
      <p>{error}</p>
      {issues?.map((i) => (
        <p key={i.path + i.message}>
          · {i.path || "form"}: {i.message}
        </p>
      ))}
    </div>
  );
}
