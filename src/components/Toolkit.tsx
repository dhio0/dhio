"use client";

import { motion } from "motion/react";
import { useState } from "react";
import type { EvidenceKind, SkillGroup } from "@/lib/types";
import { ease } from "./motion";

const KIND: Record<EvidenceKind, string> = {
  project: "Project",
  lab: "Lab",
  cert: "Cert",
  org: "Org",
  course: "Course",
};

/**
 * Skills without percentages or bars. Each one lists where it was actually
 * used, labelled by kind; hovering a skill lights up every skill that shares
 * a piece of that evidence.
 */
export function Toolkit({ groups }: { groups: SkillGroup[] }) {
  const [focus, setFocus] = useState<string[] | null>(null);

  return (
    <>
      <ul className="mb-10 flex flex-wrap gap-x-5 gap-y-2" aria-label="Evidence kinds">
        {(Object.keys(KIND) as EvidenceKind[]).map((k) => (
          <li key={k} className="flex items-center gap-2 font-mono text-[0.7rem] text-ink-3">
            <KindTag kind={k} />
            {k === "project" && "something I built"}
            {k === "lab" && "my own SIEM home lab"}
            {k === "cert" && "covered by a certificate"}
            {k === "org" && "CSC R&D work"}
            {k === "course" && "coursework"}
          </li>
        ))}
      </ul>

      <div className="grid gap-12 lg:grid-cols-3 lg:gap-10" onMouseLeave={() => setFocus(null)}>
        {groups.map((g, gi) => (
          <motion.div
            key={g.group}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.8, ease, delay: gi * 0.1 }}
          >
            <div className="mb-4 flex items-baseline justify-between border-b border-ink pb-3">
              <h3 className="font-display text-2xl font-extrabold tracking-[-0.03em]">{g.group}</h3>
              <span className="font-mono text-[0.75rem] text-ink-3">{String(g.skills.length).padStart(2, "0")}</span>
            </div>
            <p className="mb-3 text-[0.88rem] text-ink-3">{g.note}</p>
            <ul>
              {g.skills.map((s) => {
                const labels = s.evidence.map((e) => e.label);
                const related = focus ? labels.some((l) => focus.includes(l)) : true;
                return (
                  <li
                    key={s.name}
                    tabIndex={0}
                    onMouseEnter={() => setFocus(labels)}
                    onFocus={() => setFocus(labels)}
                    onBlur={() => setFocus(null)}
                    className={`group border-b border-line py-3.5 outline-none transition-opacity duration-300 ${
                      related ? "opacity-100" : "opacity-25"
                    }`}
                  >
                    <span className="block text-[1.02rem] font-medium tracking-[-0.01em] transition-colors group-hover:text-accent group-focus:text-accent">
                      {s.name}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      {s.evidence.map((e) => {
                        const body = (
                          <>
                            <KindTag kind={e.kind} />
                            <span>{e.label}</span>
                          </>
                        );
                        const cls =
                          "inline-flex items-center gap-1.5 border border-line py-0.5 pr-2 pl-0.5 font-mono text-[0.68rem] text-ink-2";
                        return e.href ? (
                          <a
                            key={e.label}
                            href={e.href}
                            {...(e.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                            className={`hx ${cls} hover:border-ink hover:text-ink`}
                          >
                            {body}
                          </a>
                        ) : (
                          <span key={e.label} className={cls}>
                            {body}
                          </span>
                        );
                      })}
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ))}
      </div>
    </>
  );
}

function KindTag({ kind }: { kind: EvidenceKind }) {
  const tone =
    kind === "project"
      ? "bg-ink text-paper"
      : kind === "lab"
        ? "bg-accent text-white"
        : kind === "cert"
          ? "border border-ink text-ink"
          : "bg-paper-2 text-ink-2";
  return <span className={`px-1 py-px text-[0.58rem] tracking-[0.08em] uppercase ${tone}`}>{KIND[kind]}</span>;
}
