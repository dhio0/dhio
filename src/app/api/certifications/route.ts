import { listCertifications } from "@/lib/repo";

export async function GET() {
  return Response.json({ data: await listCertifications() });
}
