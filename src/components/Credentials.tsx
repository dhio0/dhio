"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import type { Certification } from "@/lib/types";
import { ease } from "./motion";

export function Credentials({ items }: { items: Certification[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {items.map((c, i) => (
        <motion.div
          key={c.title}
          initial={{ opacity: 0, y: 40, rotate: i % 2 ? 1.5 : -1.5 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.9, ease, delay: i * 0.12 }}
        >
          <Tag cert={c} n={i + 1} />
        </motion.div>
      ))}
    </div>
  );
}

/** Completed courses as a segmented track; hovering a segment names the course. */
function CourseTrack({ courses }: { courses: string[] }) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="label">Courses</span>
        <span className="font-mono text-[0.72rem] text-ink-2">
          {courses.length}/{courses.length} complete
        </span>
      </div>
      <div className="flex gap-1" onMouseLeave={() => setHover(null)}>
        {courses.map((c, i) => (
          <motion.button
            type="button"
            key={c}
            aria-label={c}
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onClick={() => setHover(i)}
            className={`h-3 flex-1 origin-left transition-[background-color,transform] hover:scale-y-150 ${hover === i ? "bg-ink" : "bg-accent"}`}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease, delay: 0.3 + i * 0.07 }}
          />
        ))}
      </div>
      <p className="mt-2 h-5 truncate font-mono text-[0.72rem] text-ink-3">
        {hover === null ? "Hover a segment to see the course" : `${String(hover + 1).padStart(2, "0")} · ${courses[hover]}`}
      </p>
    </div>
  );
}

/** A certificate drawn as an evidence tag that tilts toward the cursor. */
function Tag({ cert, n }: { cert: Certification; n: number }) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [4, -4]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-5, 5]), { stiffness: 200, damping: 20 });

  return (
    <motion.article
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className="relative flex h-full flex-col border border-ink bg-paper p-6 sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-[0.75rem] text-accent">EVIDENCE TAG · C-{String(n).padStart(2, "0")}</span>
        <span aria-hidden className="h-4 w-4 shrink-0 rounded-full border border-ink bg-paper-2" />
      </div>

      {cert.image && cert.file && (
        <a
          href={cert.file}
          target="_blank"
          rel="noreferrer"
          className="group/img relative mt-6 block overflow-hidden border border-line"
          aria-label={`Open the ${cert.title} certificate (PDF)`}
        >
          <Image
            src={cert.image.src}
            alt={`${cert.title} certificate from ${cert.issuer}`}
            width={cert.image.width}
            height={cert.image.height}
            sizes="(min-width: 768px) 40vw, 100vw"
            className="w-full transition-transform duration-700 ease-out group-hover/img:scale-[1.04]"
          />
          <span className="absolute right-2 bottom-2 bg-ink px-2 py-1 font-mono text-[0.62rem] tracking-[0.06em] text-paper uppercase opacity-0 transition-opacity group-hover/img:opacity-100">
            Open PDF ↗
          </span>
        </a>
      )}

      <h3 className="font-display mt-8 text-[clamp(1.6rem,2.6vw,2.2rem)] leading-[1.02] font-extrabold tracking-[-0.03em]">
        {cert.title}
      </h3>
      {cert.grade && (
        <span className="mt-3 inline-flex w-fit items-center gap-2 border border-accent px-2 py-0.5 font-mono text-[0.68rem] tracking-[0.06em] text-accent uppercase">
          <span aria-hidden>★</span>
          {cert.grade}
        </span>
      )}
      <p className="mt-4 mb-8 max-w-md leading-relaxed text-ink-2">{cert.summary}</p>

      {cert.courses && <CourseTrack courses={cert.courses} />}

      <dl className="mt-auto grid grid-cols-2 gap-4 border-t border-dashed border-ink/40 pt-5 text-[0.9rem]">
        <div>
          <dt className="label mb-1">Issued by</dt>
          <dd>{cert.issuer}</dd>
        </div>
        <div>
          <dt className="label mb-1">Date</dt>
          <dd>{cert.issued}</dd>
        </div>
        {cert.credentialId && (
          <div className="col-span-2">
            <dt className="label mb-1">{cert.idLabel ?? "Credential ID"}</dt>
            <dd className="font-mono text-[0.85rem] break-all">{cert.credentialId}</dd>
          </div>
        )}
      </dl>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
        {cert.verifyUrl && <TagLink href={cert.verifyUrl} label="Verify on Coursera" />}
        {cert.file && <TagLink href={cert.file} label="View certificate" />}
      </div>
    </motion.article>
  );
}

function TagLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="hx group inline-flex w-fit items-center gap-2 font-mono text-[0.75rem] tracking-[0.05em] uppercase"
    >
      <span className="link-underline">{label}</span>
      <span aria-hidden className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        ↗
      </span>
    </a>
  );
}
