"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { Profile } from "@/lib/types";
import { LogStream } from "./LogStream";
import { SubjectPhoto } from "./SubjectPhoto";
import { MaskLines, ease } from "./motion";

export function Hero({ profile }: { profile: Profile }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const nameY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const [first, last] = profile.name.split(" ");
  const meta: [string, React.ReactNode][] = [
    ["Subject", profile.fullName],
    ["Program", `${profile.program}, ${profile.university}`],
    ["Since", `${profile.since} · semester 5`],
    ["Focus", profile.focus.join(" · ")],
    ["Based in", profile.location],
    [
      "Status",
      <span key="s" className="inline-flex items-center gap-2">
        <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-accent" />
        {profile.status}
      </span>,
    ],
  ];

  return (
    <section id="top" ref={ref} className="relative overflow-hidden pt-24 pb-20 md:pt-28 md:pb-28">
      <motion.div style={{ opacity: fade }} className="absolute inset-0">
        <LogStream />
      </motion.div>

      <div className="shell relative">
        <motion.div
          className="flex items-center gap-4 border-b border-line pb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <span className="label">Case file · DP-2026</span>
        </motion.div>

        <div className="mt-6 lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">
          <motion.h1
            style={{ y: nameY }}
            className="font-display text-[clamp(4.5rem,19vw,17rem)] leading-[0.82] font-extrabold tracking-[-0.055em] [font-stretch:88%] lg:col-span-9 lg:text-[clamp(8rem,15vw,15rem)]"
          >
            <MaskLines
              onLoad
              delay={0.15}
              lines={[
                first,
                <>
                  {last}
                  <span className="text-accent">.</span>
                </>,
              ]}
            />
          </motion.h1>
          <div className="mt-8 flex items-end gap-5 lg:col-span-3 lg:mt-3 lg:block">
            <SubjectPhoto name={profile.fullName} />
            <p className="max-w-[12rem] pb-6 text-[0.85rem] leading-snug text-ink-2 lg:hidden">
              Cybersecurity · {profile.program}, {profile.university}.
            </p>
          </div>
        </div>

        <motion.div style={{ opacity: fade }} className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12">
          <motion.div
            className="md:col-span-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.55 }}
          >
            <p className="text-[1.2rem] leading-snug font-medium tracking-[-0.01em] text-balance md:text-[1.45rem]">
              {profile.headline}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-1.5">
              <span className="label mr-2">Toolbox</span>
              {profile.tools.map((t, i) => (
                <motion.span
                  key={t}
                  className="border border-line bg-paper/60 px-2 py-0.5 font-mono text-[0.72rem] text-ink-2"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease, delay: 0.85 + i * 0.05 }}
                >
                  {t}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <motion.dl
            className="grid grid-cols-[6.5rem_1fr] border-t border-line text-[0.92rem] md:col-span-5 md:col-start-8"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.7 } } }}
          >
            {meta.map(([k, v]) => (
              <motion.div
                key={k}
                className="col-span-2 grid grid-cols-subgrid border-b border-line py-2.5"
                variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0, transition: { duration: 0.5, ease } } }}
              >
                <dt className="label pt-0.5">{k}</dt>
                <dd className="text-ink">{v}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </motion.div>


        <a href="#profile" className="hx mt-16 flex w-fit items-center gap-3 text-ink-3 hover:text-ink">
          <span className="relative block h-10 w-px overflow-hidden bg-line">
            <motion.span
              className="absolute inset-x-0 top-0 h-4 bg-accent"
              animate={{ y: ["-100%", "250%"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
          <span className="label">Scroll to open the file</span>
        </a>
      </div>
    </section>
  );
}
