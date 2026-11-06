"use client";

import { useState } from "react";

const ENV_PAGE = "https://vercel.com/rangerdhio-4697/dhio/settings/environment-variables";

export function SetupForm() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"key" | "value" | null>(null);

  async function make(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pw.length < 12) return setError("Minimal 12 karakter.");
    if (pw !== pw2) return setError("Kedua password tidak sama.");
    const res = await fetch("/api/setup-hash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return setError(json.error ?? "Gagal");
    setHash(json.hash);
    setPw("");
    setPw2("");
  }

  async function copy(text: string, which: "key" | "value") {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  }

  const box = "h-11 w-full rounded-lg border border-line bg-paper px-3 font-mono text-sm outline-none focus:border-ink";
  const btn = "hx h-10 shrink-0 rounded-lg bg-ink px-4 font-mono text-[0.72rem] tracking-[0.05em] text-paper uppercase hover:bg-accent";

  if (!hash) {
    return (
      <form onSubmit={make} className="mt-8 grid gap-4">
        <p className="leading-relaxed text-ink-2">
          Ketik password yang mau kamu pakai untuk login admin. Password ini tidak disimpan di mana pun; yang dibuat
          hanya kode acak (hash) untuk ditempel di Vercel.
        </p>
        <label className="grid gap-2">
          <span className="label">Password (min. 12 karakter)</span>
          <input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className={box} />
        </label>
        <label className="grid gap-2">
          <span className="label">Ulangi password</span>
          <input type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} className={box} />
        </label>
        {error && <p className="font-mono text-[0.8rem] text-accent">{error}</p>}
        <button type="submit" className={`${btn} h-11`}>
          Buat kode
        </button>
      </form>
    );
  }

  return (
    <div className="mt-8 grid gap-6">
      <p className="leading-relaxed text-ink-2">Sudah jadi. Sekarang di Vercel:</p>
      <ol className="grid gap-5">
        <li className="grid gap-2">
          <span>
            <b>1.</b> Buka{" "}
            <a href={ENV_PAGE} target="_blank" rel="noreferrer" className="text-accent underline">
              Environment Variables
            </a>{" "}
            lalu klik <b>Add Environment Variable</b>.
          </span>
        </li>
        <li className="grid gap-2">
          <span>
            <b>2.</b> Di kolom <b>Key</b>, tempel ini:
          </span>
          <div className="flex gap-2">
            <code className={`${box} flex items-center`}>ADMIN_PASSWORD_HASH</code>
            <button type="button" onClick={() => copy("ADMIN_PASSWORD_HASH", "key")} className={btn}>
              {copied === "key" ? "Copied" : "Copy"}
            </button>
          </div>
        </li>
        <li className="grid gap-2">
          <span>
            <b>3.</b> Di kolom <b>Value</b>, tempel ini:
          </span>
          <div className="flex gap-2">
            <code className={`${box} flex items-center overflow-hidden text-ellipsis whitespace-nowrap`}>{hash}</code>
            <button type="button" onClick={() => copy(hash, "value")} className={btn}>
              {copied === "value" ? "Copied" : "Copy"}
            </button>
          </div>
        </li>
        <li>
          <b>4.</b> Klik <b>Save</b>, lalu buka tab <b>Deployments</b> → titik tiga di deployment teratas → <b>Redeploy</b>.
        </li>
        <li>
          <b>5.</b> Setelah selesai, login di <span className="font-mono">dhio-eight.vercel.app/admin</span> pakai password
          tadi.
        </li>
      </ol>
      <button type="button" onClick={() => setHash(null)} className="w-fit font-mono text-[0.72rem] text-ink-3 uppercase hover:text-ink">
        ← Buat ulang dengan password lain
      </button>
    </div>
  );
}
