import type { Project } from "@/lib/types";
import { CaseFile } from "./CaseFile";
import { SectionHead } from "./SectionHead";

export function Cases({ projects }: { projects: Project[] }) {
  return (
    <section id="cases" className="shell scroll-mt-20 py-24 md:py-36">
      <SectionHead
        index="02"
        label="Cases"
        title={["Selected", "work."]}
        intro="Each case opens with the problem, explains the approach, and ends with evidence you can check in the source."
      />

      <nav aria-label="Case index" className="mb-16 grid border-t border-line sm:grid-cols-3 md:mb-24">
        {projects.map((p) => (
          <a
            key={p.slug}
            href={`#case-${p.slug}`}
            className="hx group flex items-baseline justify-between gap-3 border-b border-line py-4 pr-4 hover:text-accent"
          >
            <span className="flex items-baseline gap-3">
              <span className="font-mono text-[0.75rem] text-ink-3 group-hover:text-accent">{p.code}</span>
              <span className="font-display text-lg font-bold tracking-tight">{p.title}</span>
            </span>
            <span aria-hidden className="text-ink-3 transition-transform group-hover:translate-y-0.5 group-hover:text-accent">
              ↓
            </span>
          </a>
        ))}
      </nav>

      {projects.map((p) => (
        <CaseFile key={p.slug} project={p} />
      ))}
    </section>
  );
}
