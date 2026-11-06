/*
 * Faint, endlessly scrolling access-log lines behind the hero. Generated from
 * a fixed seed so server and client render the same text. Attack-looking
 * lines are tinted with the accent colour.
 */

const PATHS = [
  "/", "/index.php", "/product.php?id=12", "/assets/app.js", "/login", "/admin/", "/api/v1/items",
  "/uploads/logo.png", "/search?q=laptop", "/robots.txt", "/contact", "/blog/2026/10/", "/cart", "/favicon.ico",
];
const BAD = [
  "/admin/login.php?user=admin'%20OR%201=1--",
  "/uploads/x.php?cmd=id",
  "/.env",
  "/wp-login.php",
  "/index.php?page=../../../../etc/passwd",
  "/admin/upload.php",
];
const AGENTS = ["Mozilla/5.0", "curl/8.5", "Googlebot/2.1", "sqlmap/1.8", "python-requests/2.31", "Mozilla/5.0"];

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

function lines(seed: number, n: number) {
  const r = rng(seed);
  const out: { text: string; bad: boolean }[] = [];
  let sec = Math.floor(r() * 3600);
  for (let i = 0; i < n; i++) {
    const bad = r() < 0.09;
    const ip = `${10 + Math.floor(r() * 200)}.${Math.floor(r() * 255)}.${Math.floor(r() * 255)}.${1 + Math.floor(r() * 254)}`;
    sec += 1 + Math.floor(r() * 9);
    const hh = String(2 + Math.floor(sec / 3600)).padStart(2, "0");
    const mm = String(Math.floor(sec / 60) % 60).padStart(2, "0");
    const ss = String(sec % 60).padStart(2, "0");
    const path = bad ? BAD[Math.floor(r() * BAD.length)] : PATHS[Math.floor(r() * PATHS.length)];
    const method = bad && r() < 0.4 ? "POST" : "GET";
    const status = bad ? [200, 302, 403, 404][Math.floor(r() * 4)] : r() < 0.88 ? 200 : 304;
    const agent = bad ? AGENTS[3 + Math.floor(r() * 2)] : AGENTS[Math.floor(r() * 3)];
    out.push({ text: `${ip} [${hh}:${mm}:${ss}] "${method} ${path}" ${status} "${agent}"`, bad });
  }
  return out;
}

const COLUMNS = [
  { seed: 7, dur: "70s", cls: "" },
  { seed: 21, dur: "95s", cls: "hidden md:block" },
  { seed: 42, dur: "80s", cls: "hidden xl:block" },
];

export function LogStream() {
  return (
    <div aria-hidden className="log-stream pointer-events-none absolute inset-0 overflow-hidden select-none">
      <div className="shell flex h-full justify-end gap-10 opacity-30 dark:opacity-30 lg:opacity-35 dark:lg:opacity-45">
        {COLUMNS.map((c) => {
          const ls = lines(c.seed, 40);
          return (
            <div key={c.seed} className={`h-full overflow-hidden ${c.cls}`}>
              <div className="log-stream-col" style={{ ["--dur" as string]: c.dur }}>
                {[...ls, ...ls].map((l, i) => (
                  <p
                    key={i}
                    className={`font-mono text-[0.66rem] leading-[1.9] whitespace-nowrap ${
                      l.bad ? "text-accent/70" : "text-ink-3/40"
                    }`}
                  >
                    {l.text}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
