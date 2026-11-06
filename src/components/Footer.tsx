export function Footer() {
  return (
    <footer className="bg-ink text-paper/55">
      <div className="shell flex flex-col gap-4 border-t border-paper/15 py-8 font-mono text-[0.72rem] tracking-[0.04em] sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} Dhio Padda</span>
        <span>
          Next.js · TypeScript · Tailwind CSS · content served from{" "}
          <a href="/api" className="hx inline-block text-paper underline decoration-paper/30 underline-offset-4 hover:decoration-accent">
            /api
          </a>
        </span>
      </div>
    </footer>
  );
}
