"use client";

import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ease } from "./motion";

/*
 * A browser-window showcase built from my own screenshots. The window tilts
 * flat as it scrolls in, tabs step through the views (auto-advancing until the
 * visitor picks one), and detail cards float over it at their own speed.
 */

export type ShowcaseView = {
  id: string;
  tab: string;
  title: string;
  note: string;
  /** One image, or one per theme when the app has light and dark modes. */
  src: string | { dark: string; light: string };
  /** Background behind the screenshot, matched to the captured page. */
  bg?: string;
};

export type ShowcaseFloat = {
  node: React.ReactNode;
  className: string;
  /** Pixels travelled over the section's scroll; negative moves up. */
  drift: [number, number];
};

type Theme = "dark" | "light";
const AUTO_MS = 5200;

export function Showcase({
  views,
  windowTitle,
  floats = [],
  footnote,
  chrome = "#131923",
}: {
  views: ShowcaseView[];
  windowTitle: string;
  floats?: ShowcaseFloat[];
  footnote: string;
  chrome?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [theme, setTheme] = useState<Theme>("dark");
  const [touched, setTouched] = useState(false);
  const themed = views.some((v) => typeof v.src !== "string");

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 25%"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const rotateX = useTransform(smooth, [0, 1], [reduce ? 0 : 24, 0]);
  const scale = useTransform(smooth, [0, 1], [reduce ? 1 : 0.88, 1]);
  const y = useTransform(smooth, [0, 1], [reduce ? 0 : 80, 0]);
  const { scrollYProgress: pass } = useScroll({ target: ref, offset: ["start end", "end start"] });

  useEffect(() => {
    if (touched || reduce || !inView) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % views.length), AUTO_MS);
    return () => clearTimeout(id);
  }, [active, touched, reduce, inView, views.length]);

  const view = views[active];
  const src = typeof view.src === "string" ? view.src : view.src[theme];

  return (
    <div ref={ref} className="relative mt-10 md:mt-14" style={{ perspective: "1600px" }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[10%] top-[15%] bottom-[10%] -z-10 rounded-[50%] bg-accent/25 blur-[90px]"
      />

      <motion.div style={{ rotateX, scale, y, transformOrigin: "50% 0%" }} className="relative">
        <div className="overflow-hidden rounded-xl border border-line shadow-[0_40px_120px_-30px_rgba(0,0,0,0.55)]">
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-2.5" style={{ background: chrome }}>
            <span className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            </span>
            <span className="mx-auto truncate font-mono text-[0.7rem] text-white/45">{windowTitle}</span>
            {themed ? (
              <button
                type="button"
                onClick={() => {
                  setTouched(true);
                  setTheme((t) => (t === "dark" ? "light" : "dark"));
                }}
                className="hx flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1 font-mono text-[0.65rem] tracking-[0.06em] text-white/70 uppercase hover:border-white/40 hover:text-white"
                aria-label={`Show the ${theme === "dark" ? "light" : "dark"} theme`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${theme === "dark" ? "bg-white/70" : "bg-amber-300"}`} />
                {theme}
              </button>
            ) : (
              <span className="font-mono text-[0.65rem] text-white/35">
                {String(active + 1).padStart(2, "0")}/{String(views.length).padStart(2, "0")}
              </span>
            )}
          </div>

          <div className="relative aspect-[16/10] transition-colors duration-500" style={{ background: view.bg ?? "#1b2230" }}>
            <AnimatePresence initial={false}>
              <motion.div
                key={src}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease }}
              >
                <Image
                  src={src}
                  alt={`${view.tab}: ${view.title}`}
                  fill
                  sizes="(min-width: 1280px) 1200px, 100vw"
                  className="object-cover object-top"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {floats.map((f, i) => (
          <Float key={i} float={f} progress={pass} />
        ))}
      </motion.div>

      <div className="mt-16 grid gap-8 md:mt-20 md:grid-cols-12">
        <div
          role="tablist"
          aria-label="Showcase views"
          className="grid border-t border-line md:col-span-5"
          style={{ gridTemplateColumns: `repeat(${views.length}, minmax(0, 1fr))` }}
        >
          {views.map((v, i) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={i === active}
              onClick={() => {
                setTouched(true);
                setActive(i);
              }}
              className={`hx relative py-3 pr-2 text-left ${i === active ? "text-ink" : "text-ink-3 hover:text-ink"}`}
            >
              {i === active && (
                <motion.span
                  key={`bar-${active}-${touched}`}
                  className="absolute -top-px left-0 h-[2px] bg-accent"
                  initial={{ width: touched || reduce ? "100%" : "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: touched || reduce ? 0 : AUTO_MS / 1000, ease: "linear" }}
                />
              )}
              <span className="block font-mono text-[0.68rem] text-ink-3">0{i + 1}</span>
              <span className="mt-1 block truncate text-[0.88rem] font-medium">{v.tab}</span>
            </button>
          ))}
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={view.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease }}
            >
              <p className="text-[1.2rem] leading-snug font-medium tracking-[-0.01em]">{view.title}</p>
              <p className="mt-2 leading-relaxed text-ink-2">{view.note}</p>
            </motion.div>
          </AnimatePresence>
          <p className="mt-4 font-mono text-[0.7rem] text-ink-3">{footnote}</p>
        </div>
      </div>
    </div>
  );
}

function Float({ float, progress }: { float: ShowcaseFloat; progress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const y = useTransform(progress, [0, 1], float.drift);
  return (
    <motion.div style={{ y }} className={`absolute hidden lg:block ${float.className}`}>
      {float.node}
    </motion.div>
  );
}
