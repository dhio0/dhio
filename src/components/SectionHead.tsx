import { DrawLine, MaskLines, Reveal } from "./motion";

export function SectionHead({
  index,
  label,
  title,
  intro,
}: {
  index: string;
  label: string;
  title: React.ReactNode[];
  intro?: string;
}) {
  return (
    <header className="mb-14 md:mb-20">
      <div className="mb-6 flex items-center gap-4">
        <span className="label text-accent">{index}</span>
        <span className="label">{label}</span>
        <DrawLine className="flex-1" />
      </div>
      <div className="grid gap-6 md:grid-cols-12 md:items-end">
        <h2 className="font-display text-[clamp(2.4rem,6vw,5.25rem)] leading-[0.95] font-extrabold tracking-[-0.035em] md:col-span-8">
          <MaskLines lines={title} />
        </h2>
        {intro && (
          <Reveal delay={0.2} className="text-ink-2 md:col-span-4 md:pb-2">
            <p className="max-w-sm text-[0.98rem] leading-relaxed">{intro}</p>
          </Reveal>
        )}
      </div>
    </header>
  );
}
