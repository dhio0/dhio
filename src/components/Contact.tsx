"use client";

import { motion } from "motion/react";
import { useState } from "react";
import type { Profile } from "@/lib/types";
import { MaskLines, Reveal, ease } from "./motion";

export function Contact({ profile }: { profile: Profile }) {
  const rows = [
    profile.phone.e164 && {
      label: "WhatsApp · LINE",
      value: profile.phone.display,
      href: `https://wa.me/${profile.phone.e164}`,
      copy: profile.phone.display.replace(/[\s-]/g, ""),
    },
    profile.email && { label: "Email", value: profile.email, href: `mailto:${profile.email}`, copy: profile.email },
    { label: "LinkedIn", value: "in/dhioo", href: profile.links.linkedin },
    { label: "GitHub", value: "dhio0", href: profile.links.github },
    profile.cvUrl && { label: "Résumé", value: "Download PDF", href: profile.cvUrl },
  ].filter(Boolean) as { label: string; value: string; href: string; copy?: string }[];

  return (
    <section
      id="contact"
      className="relative scroll-mt-20 overflow-hidden bg-ink py-24 text-paper md:py-36"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      {/* Dot pattern plus an accent glow that follows the cursor */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: "radial-gradient(color-mix(in oklab, var(--paper) 22%, transparent) 1px, transparent 1.4px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse at 70% 40%, #000 20%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(520px circle at var(--mx, 75%) var(--my, 35%), color-mix(in oklab, var(--accent) 22%, transparent), transparent 65%)",
        }}
      />
      <div className="shell relative">
        <div className="mb-6 flex items-center gap-4">
          <span className="label text-accent">06</span>
          <span className="label">Contact</span>
          <motion.div
            className="h-px flex-1 origin-left bg-paper/20"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease }}
          />
        </div>

        <h2 className="font-display text-[clamp(3.5rem,13vw,11rem)] leading-[0.86] font-extrabold tracking-[-0.05em]">
          <MaskLines
            lines={[
              "Open the",
              <>
                next case<span className="text-accent">.</span>
              </>,
            ]}
          />
        </h2>

        <div className="mt-14 grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <p className="max-w-md text-[1.15rem] leading-relaxed text-paper/75">
              I&apos;m looking for an internship in software engineering or security, where I can build real things and
              learn from a team that ships. The fastest way to reach me is WhatsApp or LINE, same number.
            </p>
          </Reveal>

          <ul className="border-t border-paper/20 md:col-span-6 md:col-start-7">
            {rows.map((r, i) => (
              <motion.li
                key={r.label}
                className="border-b border-paper/20"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease, delay: 0.1 + i * 0.07 }}
              >
                <ContactRow {...r} />
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ContactRow({ label, value, href, copy }: { label: string; value: string; href: string; copy?: string }) {
  const [copied, setCopied] = useState(false);
  const external = href.startsWith("http");

  return (
    <div className="group flex items-center justify-between gap-4 py-5">
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className="hx flex flex-1 origin-left items-baseline gap-6"
      >
        <span className="w-24 shrink-0 font-mono text-[0.72rem] tracking-[0.08em] text-paper/50 uppercase sm:w-32">{label}</span>
        <span className="text-[1.3rem] font-medium tracking-[-0.01em] transition-colors group-hover:text-accent md:text-[1.6rem]">
          {value}
        </span>
      </a>
      {copy ? (
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(copy);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            } catch {}
          }}
          className="hx font-mono text-[0.72rem] tracking-[0.06em] text-paper/60 uppercase hover:text-paper"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      ) : (
        <span
          aria-hidden
          className="text-xl text-paper/50 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent"
        >
          ↗
        </span>
      )}
    </div>
  );
}
