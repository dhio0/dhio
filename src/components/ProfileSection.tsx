import type { Pillar, Profile } from "@/lib/types";
import { Reveal, ScrollWords } from "./motion";
import { SectionHead } from "./SectionHead";

export function ProfileSection({ profile, pillars }: { profile: Profile; pillars: Pillar[] }) {
  return (
    <section id="profile" className="shell scroll-mt-20 py-24 md:py-36">
      <SectionHead index="01" label="Profile" title={["Who is", "on file."]} />

      <ScrollWords
        text={profile.statement}
        className="max-w-5xl text-[clamp(1.5rem,3.3vw,2.75rem)] leading-[1.2] font-medium tracking-[-0.02em]"
      />

      <div className="mt-20 grid border-t border-line md:grid-cols-3">
        {pillars.map((p, i) => (
          <Reveal
            key={p.key}
            delay={i * 0.1}
            className="group border-b border-line py-8 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
          >
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[0.75rem] text-accent">0{i + 1}</span>
              <span className="label">{p.title}</span>
            </div>
            <h3 className="font-display mt-6 text-[clamp(2.6rem,4.5vw,3.75rem)] leading-none font-extrabold tracking-[-0.045em] transition-colors group-hover:text-accent">
              {p.key}
              <span className="text-accent">.</span>
            </h3>
            <p className="mt-5 max-w-sm leading-relaxed text-ink-2">{p.text}</p>
            <ul className="mt-6 flex flex-wrap gap-1.5">
              {p.tools.map((t) => (
                <li key={t} className="border border-line px-2 py-0.5 font-mono text-[0.7rem] text-ink-3">
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
