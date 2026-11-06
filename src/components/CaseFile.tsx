"use client";

import { motion, useScroll, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { useRef } from "react";
import type { Project } from "@/lib/types";
import { DrawLine, Reveal, ease } from "./motion";
import { RegistryShowcase, WebforensicsShowcase } from "./Showcases";

export function CaseFile({ project }: { project: Project }) {
  return (
    <article id={`case-${project.slug}`} className="scroll-mt-20 pt-16 first:pt-0 md:pt-28">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div className="flex items-baseline gap-4 md:gap-6">
          <Reveal y={12}>
            <span className="font-mono text-[0.8rem] text-accent">CASE {project.code}</span>
          </Reveal>
          <h3 className="font-display overflow-hidden text-[clamp(2.2rem,6.5vw,5.5rem)] leading-[0.95] font-extrabold tracking-[-0.045em]">
            <motion.span
              className="block"
              initial={{ y: "100%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease }}
            >
              {project.title}
            </motion.span>
          </h3>
        </div>
        <Reveal y={12} delay={0.15} className="flex gap-6 pb-2">
          <span className="label">{project.kind}</span>
          <span className="label">{project.year}</span>
        </Reveal>
      </div>
      <DrawLine className="mt-5" />

      {project.showcase === "webforensics" && <WebforensicsShowcase />}
      {project.showcase === "registry" && <RegistryShowcase />}

      <div className={`grid gap-12 md:grid-cols-12 md:gap-10 ${project.showcase ? "mt-16 md:mt-24" : "mt-10"}`}>
        <aside className="md:col-span-4">
          <div className="md:sticky md:top-24">
            <Reveal>
              <p className="text-[1.15rem] leading-snug font-medium tracking-[-0.01em]">{project.tagline}</p>
            </Reveal>
            <Reveal delay={0.1} className="mt-6 flex flex-wrap gap-2">
              {project.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="hx group inline-flex h-9 items-center gap-2 border border-ink px-3.5 font-mono text-[0.75rem] tracking-[0.05em] uppercase hover:bg-ink hover:text-paper"
                >
                  {l.label}
                  <span aria-hidden className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    ↗
                  </span>
                </a>
              ))}
            </Reveal>
            <Reveal delay={0.18} className="mt-8">
              <p className="label mb-3">Stack</p>
              <ul className="flex flex-wrap gap-1.5">
                {project.stack.map((s) => (
                  <li key={s} className="border border-line px-2 py-1 font-mono text-[0.72rem] text-ink-2">
                    {s}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </aside>

        <div className="md:col-span-8">
          {project.pipeline && <Pipeline steps={project.pipeline} />}

          <div className={`grid gap-10 sm:grid-cols-2 ${project.pipeline ? "mt-12" : ""}`}>
            <Reveal>
              <p className="label mb-3">Problem</p>
              <p className="leading-relaxed text-ink-2">{project.problem}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="label mb-3">Approach</p>
              <p className="leading-relaxed text-ink-2">{project.approach}</p>
            </Reveal>
          </div>

          <Reveal className="mt-12">
            <p className="label mb-4">Evidence</p>
            <ol className="border-t border-line">
              {project.evidence.map((e, i) => (
                <motion.li
                  key={e}
                  className="group grid grid-cols-[3rem_1fr] border-b border-line py-3.5"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                  transition={{ duration: 0.55, ease, delay: i * 0.06 }}
                >
                  <span className="font-mono text-[0.75rem] text-ink-3 transition-colors group-hover:text-accent">
                    E{String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[0.98rem] leading-snug">{e}</span>
                </motion.li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </article>
  );
}

function Pipeline({ steps }: { steps: NonNullable<Project["pipeline"]> }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 50%"] });

  return (
    <div className="border border-line bg-paper-2/60 p-5 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <span className="label">Pipeline · main.py</span>
        <span className="label">1 scan → 1 API call</span>
      </div>
      <ol ref={ref} className="relative">
        <span aria-hidden className="absolute top-2 bottom-2 left-[0.6rem] w-px bg-line" />
        <motion.span
          aria-hidden
          style={{ scaleY: scrollYProgress }}
          className="absolute top-2 bottom-2 left-[0.6rem] w-px origin-top bg-accent"
        />
        {steps.map((s, i) => (
          <PipelineStep key={s.name} step={s} i={i} n={steps.length} progress={scrollYProgress} />
        ))}
      </ol>
    </div>
  );
}

function PipelineStep({
  step,
  i,
  n,
  progress,
}: {
  step: { name: string; note: string };
  i: number;
  n: number;
  progress: MotionValue<number>;
}) {
  const at = i / (n - 1);
  const on = useTransform(progress, [Math.max(0, at - 0.08), at], [0, 1]);
  const textOpacity = useTransform(on, [0, 1], [0.35, 1]);

  return (
    <li className="relative grid grid-cols-[1.25rem_1fr] gap-4 py-3">
      <span className="relative mt-1 grid h-5 w-5 place-items-center">
        <span className="absolute h-2.5 w-2.5 rounded-full border border-line bg-paper" />
        <motion.span style={{ scale: on }} className="absolute h-2.5 w-2.5 rounded-full bg-accent" />
      </span>
      <motion.div style={{ opacity: textOpacity }} className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className={`font-mono text-[0.95rem] ${i === n - 1 ? "text-accent" : ""}`}>{step.name}.py</span>
        <span className="text-[0.9rem] text-ink-2">{step.note}</span>
      </motion.div>
    </li>
  );
}
