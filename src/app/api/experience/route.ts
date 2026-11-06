import { listExperience } from "@/lib/repo";

export async function GET() {
  return Response.json({ data: await listExperience() });
}
