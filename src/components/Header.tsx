"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { ease } from "./motion";

const NAV = [
  { id: "profile", n: "01", label: "Profile" },
  { id: "cases", n: "02", label: "Cases" },
  { id: "record", n: "03", label: "Record" },
  { id: "credentials", n: "04", label: "Credentials" },
  { id: "toolkit", n: "05", label: "Toolkit" },
];

export function Header() {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  useEffect(() => {
    const ids = [...NAV.map((n) => n.id), "contact"];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <header
        className={`glass fixed inset-x-3 top-3 z-50 mx-auto max-w-[86rem] overflow-hidden rounded-2xl sm:inset-x-6 ${
          scrolled || open ? "is-solid" : ""
        }`}
      >
        <div className="flex h-12 items-center justify-between gap-6 pr-2 pl-3 sm:pl-4">
          <a href="#top" className="hx group flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <span className="grid h-7 w-7 place-items-center rounded-md bg-ink font-mono text-[0.62rem] font-medium text-paper transition-colors group-hover:bg-accent">
              DP
            </span>
            <span className="font-display text-[0.9rem] font-bold tracking-tight">Dhio Padda</span>
          </a>

          <nav aria-label="Sections" className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`hx group flex items-baseline gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.06em] ${
                  active === item.id ? "text-ink" : "text-ink-3 hover:text-ink"
                }`}
              >
                <span className={active === item.id ? "text-accent" : ""}>{item.n}</span>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href="#contact"
              className="hx hidden h-8 items-center rounded-lg bg-ink px-3.5 font-mono text-[0.7rem] uppercase tracking-[0.06em] text-paper hover:bg-accent sm:flex"
            >
              Contact
            </a>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className="hx grid h-8 w-8 place-items-center rounded-lg border border-line lg:hidden"
            >
              <span className="relative block h-2.5 w-4">
                <span
                  className={`absolute left-0 h-px w-4 bg-ink transition-transform duration-300 ${open ? "top-1/2 rotate-45" : "top-0"}`}
                />
                <span
                  className={`absolute left-0 h-px w-4 bg-ink transition-transform duration-300 ${open ? "top-1/2 -rotate-45" : "bottom-0"}`}
                />
              </span>
            </button>
          </div>
        </div>
        <motion.div style={{ scaleX: progress }} className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-accent" />
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 bg-paper pt-16 lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease }}
          >
            <nav aria-label="Sections" className="shell flex flex-col pt-8">
              {[...NAV, { id: "contact", n: "06", label: "Contact" }].map((item, i) => (
                <motion.a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-4 border-b border-line py-4"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.5, ease }}
                >
                  <span className="label text-accent">{item.n}</span>
                  <span className="font-display text-4xl font-extrabold tracking-tight">{item.label}</span>
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="hx grid h-8 w-8 place-items-center rounded-lg border border-line text-ink hover:border-ink"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5z" fill="currentColor" />
      </svg>
    </button>
  );
}
