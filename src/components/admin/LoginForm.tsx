"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) {
      router.replace("/admin");
      router.refresh();
    } else {
      setError((await res.json().catch(() => null))?.error ?? "Login failed");
      setPassword("");
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-4">
      <label className="grid gap-2">
        <span className="label">Password</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 rounded-lg border border-line bg-paper px-3 font-mono text-sm outline-none focus:border-ink"
        />
      </label>
      {error && <p className="font-mono text-[0.8rem] text-accent">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="hx h-11 rounded-lg bg-ink font-mono text-[0.8rem] tracking-[0.06em] text-paper uppercase hover:bg-accent disabled:opacity-50"
      >
        {busy ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
