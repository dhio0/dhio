"use client";

import { useEffect, useRef } from "react";

/*
 * Full-page background:
 *  - a dot grid, drawn once into a tile and painted as a pattern (cheap),
 *  - dots near the cursor swell, turn accent and get pushed aside,
 *  - a slow scanner line sweeps down the screen,
 *  - "pings" fire on random dots with a tiny attack label (T1190, 401, ...),
 *  - a small HUD in the corner shows cursor position and scroll depth.
 * Only the dots near the cursor and the scan line are redrawn per frame.
 * Static grid when the visitor prefers reduced motion.
 */

const GAP = 26;
const RADIUS = 160;
const SCAN_MS = 9000;
const LABELS = ["T1190", "401", "GET /admin", "UNION SELECT", ":22 ssh", "4625", ".env", "sqlmap", "../../", "T1505.003", "403", "POST /upload"];

type Ping = { x: number; y: number; t0: number; label: string | null };

export function Backdrop() {
  const ref = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let colors = readColors();
    let pattern: CanvasPattern | null = null;
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    const pings: Ping[] = [];
    let nextPing = performance.now() + 1500;
    let hudTick = 0;

    function readColors() {
      const s = getComputedStyle(document.documentElement);
      const dark = document.documentElement.classList.contains("dark");
      return {
        ink: hexToRgb(s.getPropertyValue("--ink").trim()) ?? [21, 20, 15],
        accent: hexToRgb(s.getPropertyValue("--accent").trim()) ?? [212, 67, 28],
        base: dark ? 0.13 : 0.11,
      };
    }

    function buildPattern() {
      const tile = document.createElement("canvas");
      tile.width = Math.round(GAP * dpr);
      tile.height = Math.round(GAP * dpr);
      const t = tile.getContext("2d")!;
      t.scale(dpr, dpr);
      const [r, g, b] = colors.ink;
      t.fillStyle = `rgba(${r},${g},${b},${colors.base})`;
      t.beginPath();
      t.arc(GAP / 2, GAP / 2, 0.9, 0, Math.PI * 2);
      t.fill();
      pattern = ctx!.createPattern(tile, "repeat");
      pattern?.setTransform(new DOMMatrix().scale(1 / dpr));
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildPattern();
      if (reduce) draw(performance.now());
    }

    function dot(x: number, y: number, near: number, scan: number) {
      const { ink, accent, base } = colors;
      let px = x;
      let py = y;
      if (near > 0) {
        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const d = Math.hypot(dx, dy) || 1;
        const push = near * near * 7;
        px += (dx / d) * push;
        py += (dy / d) * push;
      }
      const r = 0.9 + near * 1.6 + scan * 0.4;
      const a = Math.min(1, base + near * 0.55 + scan * 0.18);
      const m = near * near;
      ctx!.fillStyle = `rgba(${(ink[0] + (accent[0] - ink[0]) * m) | 0},${(ink[1] + (accent[1] - ink[1]) * m) | 0},${
        (ink[2] + (accent[2] - ink[2]) * m) | 0
      },${a})`;
      ctx!.beginPath();
      ctx!.arc(px, py, r, 0, Math.PI * 2);
      ctx!.fill();
    }

    function draw(now: number) {
      ctx!.clearRect(0, 0, w, h);
      const { accent } = colors;
      mouse.x += (mouse.tx - mouse.x) * 0.18;
      mouse.y += (mouse.ty - mouse.y) * 0.18;

      const offY = -((window.scrollY * 0.18) % GAP);
      const scanY = reduce ? -9999 : ((now % SCAN_MS) / SCAN_MS) * (h + 240) - 120;

      // Base grid as one pattern fill.
      if (pattern) {
        ctx!.save();
        ctx!.translate(0, offY);
        ctx!.fillStyle = pattern;
        ctx!.fillRect(0, -GAP, w, h + GAP * 2);
        ctx!.restore();
      }

      // Scanner line: a faint accent rule plus brighter dots in its band.
      if (!reduce) {
        const grad = ctx!.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, `rgba(${accent[0]},${accent[1]},${accent[2]},0)`);
        grad.addColorStop(0.5, `rgba(${accent[0]},${accent[1]},${accent[2]},0.10)`);
        grad.addColorStop(1, `rgba(${accent[0]},${accent[1]},${accent[2]},0)`);
        ctx!.fillStyle = grad;
        ctx!.fillRect(0, scanY, w, 1);
        const r0 = Math.floor((scanY - 90 - offY) / GAP);
        const r1 = Math.ceil((scanY + 90 - offY) / GAP);
        for (let row = r0; row <= r1; row++) {
          const y = row * GAP + GAP / 2 + offY;
          const scan = Math.max(0, 1 - Math.abs(y - scanY) / 90);
          if (scan <= 0) continue;
          for (let x = GAP / 2; x < w + GAP; x += GAP) {
            if (Math.hypot(x - mouse.x, y - mouse.y) < RADIUS) continue;
            dot(x, y, 0, scan);
          }
        }
      }

      // Dots around the cursor.
      if (mouse.x > -1000) {
        const c0 = Math.floor((mouse.x - RADIUS) / GAP);
        const c1 = Math.ceil((mouse.x + RADIUS) / GAP);
        const r0 = Math.floor((mouse.y - RADIUS - offY) / GAP);
        const r1 = Math.ceil((mouse.y + RADIUS - offY) / GAP);
        for (let row = r0; row <= r1; row++) {
          for (let col = c0; col <= c1; col++) {
            const x = col * GAP + GAP / 2;
            const y = row * GAP + GAP / 2 + offY;
            const d = Math.hypot(x - mouse.x, y - mouse.y);
            if (d >= RADIUS) continue;
            const scan = Math.max(0, 1 - Math.abs(y - scanY) / 90);
            dot(x, y, 1 - d / RADIUS, scan);
          }
        }
      }

      // Pings with an occasional label.
      if (!reduce && now > nextPing) {
        pings.push({
          x: Math.floor(Math.random() * (w / GAP)) * GAP + GAP / 2,
          y: Math.floor(Math.random() * (h / GAP)) * GAP + GAP / 2,
          t0: now,
          label: Math.random() < 0.55 ? LABELS[Math.floor(Math.random() * LABELS.length)] : null,
        });
        nextPing = now + 1100 + Math.random() * 1900;
      }
      ctx!.font = "10px ui-monospace, 'IBM Plex Mono', monospace";
      for (let i = pings.length - 1; i >= 0; i--) {
        const p = pings[i];
        const t = (now - p.t0) / 2000;
        if (t >= 1) {
          pings.splice(i, 1);
          continue;
        }
        const y = p.y + offY;
        const fade = 1 - t;
        ctx!.fillStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${0.8 * fade})`;
        ctx!.beginPath();
        ctx!.arc(p.x, y, 2, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${0.4 * fade})`;
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.arc(p.x, y, 2 + Math.min(t * 2, 1) * 20, 0, Math.PI * 2);
        ctx!.stroke();
        if (p.label) {
          ctx!.fillStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${0.55 * fade})`;
          ctx!.fillText(p.label, p.x + 9, y + 3);
        }
      }

      // HUD text, a few times a second.
      if (hudRef.current && now - hudTick > 120) {
        hudTick = now;
        const max = document.documentElement.scrollHeight - h;
        const pct = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
        const mx = mouse.x > -1000 ? String(Math.round(mouse.x)).padStart(4, "0") : "----";
        const my = mouse.y > -1000 ? String(Math.round(mouse.y)).padStart(4, "0") : "----";
        hudRef.current.textContent = `x ${mx} · y ${my} · depth ${String(pct).padStart(3, " ")}%`;
      }
    }

    function loop(now: number) {
      draw(now);
      raf = requestAnimationFrame(loop);
    }

    function onMove(e: PointerEvent) {
      if (e.pointerType !== "mouse") return;
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
      if (mouse.x < -1000) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }
    }
    function onLeave() {
      mouse.tx = mouse.ty = mouse.x = mouse.y = -9999;
    }
    function onVisibility() {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) raf = requestAnimationFrame(loop);
    }

    const themeObserver = new MutationObserver(() => {
      colors = readColors();
      buildPattern();
      if (reduce) draw(performance.now());
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    const onScrollStatic = () => draw(performance.now());
    if (reduce) window.addEventListener("scroll", onScrollStatic, { passive: true });
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScrollStatic);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
      <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10" />
      <div
        aria-hidden
        className="pointer-events-none fixed right-4 bottom-4 z-30 hidden items-center gap-2 font-mono text-[0.62rem] tracking-[0.06em] text-ink-3 uppercase opacity-70 lg:flex"
      >
        <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-accent" />
        <span>monitoring</span>
        <span className="text-ink-3/60">·</span>
        <span ref={hudRef} className="tabular-nums whitespace-pre" />
      </div>
      <div aria-hidden className="grain pointer-events-none fixed inset-0 z-[70]" />
    </>
  );
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
