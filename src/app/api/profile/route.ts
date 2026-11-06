import { getPillars, getProfile } from "@/lib/repo";

export async function GET() {
  const [profile, pillars] = await Promise.all([getProfile(), getPillars()]);
  return Response.json({ data: { ...profile, pillars } });
}
