const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2025-12" → "Dec 2025" */
export function formatYm(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) return ym;
  return `${MONTHS[m - 1]} ${y}`;
}

/** "Dec 2025" → "2025-12" (used when seeding from the static data). */
export function parseMonthYear(s: string): string {
  const [mon, y] = s.split(" ");
  const i = MONTHS.indexOf(mon);
  return i >= 0 && y ? `${y}-${String(i + 1).padStart(2, "0")}` : s;
}

export function formatPeriod(start: string, end: string | null): string {
  return `${formatYm(start)} – ${end ? formatYm(end) : "Present"}`;
}
