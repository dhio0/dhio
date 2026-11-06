"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import type { Experience } from "@/lib/types";
import { Reveal, ease } from "./motion";

export function RecordTimeline({ experience }: { experience: Experience[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  return (
    <div ref={ref} className="relative z-10">
      {/* Rail: grey track plus an accent line that grows with scroll. */}
      <span aria-hidden className="absolute top-0 bottom-0 left-[5px] w-px bg-line md:left-[calc(25%+5px)]" />
      <motion.span
        aria-hidden
        style={{ scaleY: fill }}
        className="absolute top-0 bottom-0 left-[5px] w-px origin-top bg-accent md:left-[calc(25%+5px)]"
      />

      {experience.map((org) => (
        <div key={org.org} className="relative pb-16 last:pb-0 md:grid md:grid-cols-4 md:gap-0">
          <Reveal className="mb-6 pl-8 md:mb-0 md:pr-10 md:pl-0">
            <div className="md:sticky md:top-24 md:text-right">
              <p className="label mb-2">{org.type === "education" ? "Education" : "Organisation"}</p>
              <h3 className="font-display text-2xl leading-tight font-extrabold tracking-[-0.03em]">{org.org}</h3>
              <p className="mt-1 text-[0.9rem] text-ink-2">{org.orgNote}</p>
              <p className="mt-1 text-[0.85rem] text-ink-3">{org.location}</p>
            </div>
          </Reveal>

          <ol className="md:col-span-3">
            {org.roles.map((r, i) => (
              <motion.li
                key={r.title}
                className="relative pb-12 pl-8 last:pb-0 md:pl-12"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                transition={{ duration: 0.8, ease, delay: i * 0.05 }}
              >
                <span
                  aria-hidden
                  className={`absolute top-1.5 left-0 h-[11px] w-[11px] rounded-full border-2 border-paper ${
                    r.end === null ? "pulse-dot bg-accent" : "bg-ink"
                  }`}
                />
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="font-mono text-[0.78rem] text-ink-3">{r.period}</span>
                  {r.end === null && (
                    <span className="border border-accent px-1.5 py-px font-mono text-[0.65rem] tracking-[0.08em] text-accent uppercase">
                      Current
                    </span>
                  )}
                </div>
                <h4 className="mt-2 text-[1.35rem] leading-tight font-semibold tracking-[-0.015em]">{r.title}</h4>
                <p className="mt-3 max-w-2xl leading-relaxed text-ink-2">{r.summary}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {r.skills.map((s) => (
                    <li key={s} className="border border-line px-2 py-0.5 font-mono text-[0.7rem] text-ink-3">
                      {s}
                    </li>
                  ))}
                </ul>
              </motion.li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
