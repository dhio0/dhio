"use client";

import { motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ease } from "./motion";

const SRC = "/profile/dhio-formal.webp";

/**
 * The profile photo, filed like an exhibit. It starts "locked": greyscale,
 * scanlined, with a periodic RGB-split glitch. Hovering (or, on touch screens,
 * scrolling it into view) plays a decrypt burst and reveals it in colour.
 */
export function SubjectPhoto({ name, delay = 0.5 }: { name: string; delay?: number }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const [revealed, setRevealed] = useState(false);
  const [burst, setBurst] = useState(false);
  const burstTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [5, -5]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 180, damping: 18 });

  function reveal(on: boolean) {
    setRevealed(on);
    if (on) {
      setBurst(true);
      clearTimeout(burstTimer.current);
      burstTimer.current = setTimeout(() => setBurst(false), 650);
    }
  }

  // Touch screens cannot hover: decrypt once, shortly after the photo is on screen.
  useEffect(() => {
    if (!inView || matchMedia("(hover: hover)").matches) return;
    const id = setTimeout(() => reveal(true), 1800);
    return () => clearTimeout(id);
  }, [inView]);

  useEffect(() => () => clearTimeout(burstTimer.current), []);

  return (
    <motion.figure
      ref={ref}
      className={`photo-glitch group relative w-36 shrink-0 sm:w-44 lg:w-full ${revealed ? "is-revealed" : ""} ${burst ? "is-burst" : ""}`}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 800, ["--src" as string]: `url(${SRC})` }}
      onPointerEnter={(e) => e.pointerType === "mouse" && reveal(true)}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={(e) => {
        mx.set(0.5);
        my.set(0.5);
        if (e.pointerType === "mouse") reveal(false);
      }}
      onClick={() => reveal(!revealed)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease, delay }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="label text-accent">Fig. 01</span>
        <span className="label">Subject</span>
      </div>

      <div className="relative border border-ink p-1.5">
        {["-top-2 -left-2 border-t border-l", "-top-2 -right-2 border-t border-r", "-bottom-2 -left-2 border-b border-l", "-bottom-2 -right-2 border-b border-r"].map(
          (c) => (
            <span key={c} aria-hidden className={`absolute h-3 w-3 border-accent ${c}`} />
          ),
        )}

        <div className="relative aspect-[4/5] overflow-hidden bg-paper-2">
          <motion.div
            className="absolute inset-0"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1], delay: delay + 0.2 }}
          >
            <Image
              src={SRC}
              alt={`Portrait of ${name}`}
              fill
              priority
              sizes="(min-width: 1024px) 22vw, 176px"
              className="photo-base object-cover object-[50%_30%]"
            />
            {/* RGB-split layers, only visible while glitching */}
            <span aria-hidden className="gl gl-r" />
            <span aria-hidden className="gl gl-c" />
            {/* Scanlines and a slow scan band while locked */}
            <span aria-hidden className="photo-scan absolute inset-0" />
          </motion.div>

          {/* One-off scanner bar during the load reveal */}
          <motion.span
            aria-hidden
            className="absolute inset-x-0 h-[2px] bg-accent shadow-[0_0_14px_2px_var(--accent)]"
            initial={{ top: "0%", opacity: 1 }}
            animate={{ top: "100%", opacity: [1, 1, 0] }}
            transition={{
              duration: 1.4,
              ease: [0.65, 0, 0.35, 1],
              delay: delay + 0.2,
              opacity: { times: [0, 0.85, 1], duration: 1.6, delay: delay + 0.2 },
            }}
          />
        </div>
      </div>

      <figcaption className="mt-2 flex items-center justify-between gap-2 font-mono text-[0.65rem] text-ink-3">
        <span className="flex items-center gap-1.5">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${revealed ? "bg-emerald-500" : "pulse-dot bg-accent"}`} />
          {revealed ? "ID · VERIFIED" : "ID · LOCKED"}
        </span>
        <span className="hidden sm:inline">{revealed ? "D. U. P. PADDA" : "hover to decrypt"}</span>
      </figcaption>
    </motion.figure>
  );
}
