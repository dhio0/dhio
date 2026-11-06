"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

/** Fades and lifts its children in the first time they scroll into view. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.8, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Slides each line up from behind a mask. */
export function MaskLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  onLoad = false,
}: {
  lines: React.ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  onLoad?: boolean;
}) {
  const show = { y: "0%" };
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.06em]">
          <motion.span
            className={`block ${lineClassName ?? ""}`}
            initial={{ y: "105%" }}
            {...(onLoad ? { animate: show } : { whileInView: show, viewport: { once: true } })}
            transition={{ duration: 1, ease, delay: delay + i * 0.09 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/**
 * Text whose words brighten one by one as the block scrolls through the viewport.
 * Scroll progress is written to a single CSS variable; each word derives its own
 * opacity from it in CSS, so a scroll frame costs one style write, not one per word.
 */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = text.split(" ");

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    ref.current?.style.setProperty("--p", (v * words.length).toFixed(2));
  });

  return (
    <p ref={ref} className={className} style={{ ["--p" as string]: 0 }}>
      {words.map((w, i) => (
        <span key={i} style={{ opacity: `clamp(0.16, calc(var(--p) - ${i}), 1)` }}>
          {w}{" "}
        </span>
      ))}
    </p>
  );
}

/** A horizontal rule that draws itself from left to right. */
export function DrawLine({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      className={`h-px origin-left bg-line ${className ?? ""}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease, delay }}
    />
  );
}

export { ease };
