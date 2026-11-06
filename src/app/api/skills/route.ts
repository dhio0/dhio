import { listSkills } from "@/lib/repo";

export async function GET() {
  return Response.json({ data: await listSkills() });
}
