"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

/**
 * Background figure for the Record section: the mirror photo, cut out,
 * slides in from the right as the section scrolls into view and drifts
 * with a little parallax. Desktop only, so it never sits behind text on phones.
 */
export function MirrorFigure() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: 0.5 });
  const x = useTransform(p, [0, 0.3, 0.8, 1], ["70%", "0%", "0%", "25%"]);
  const opacity = useTransform(p, [0, 0.25, 0.85, 1], [0, 1, 1, 0]);
  const y = useTransform(p, [0, 1], ["4%", "-4%"]);
  const skew = useTransform(p, [0, 0.3], [-6, 0]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-[30%] lg:block">
      <motion.div style={{ x, y, opacity, skewX: skew }} className="sticky top-[16vh] ml-auto h-[76vh] w-full">
        <div className="mirror-figure relative h-full w-full">
          <Image
            src="/profile/dhio-mirror.webp"
            alt=""
            fill
            sizes="30vw"
            className="object-contain object-bottom grayscale contrast-[1.15]"
          />
        </div>
        <span className="absolute top-0 right-0 font-mono text-[0.62rem] tracking-[0.08em] text-ink-3 uppercase [writing-mode:vertical-rl]">
          Fig. 02 · off duty
        </span>
      </motion.div>
    </div>
  );
}
