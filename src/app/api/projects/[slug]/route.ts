import { getProject } from "@/lib/repo";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) {
    return Response.json({ error: { status: 404, message: `No project with slug "${slug}"` } }, { status: 404 });
  }
  return Response.json({ data: project });
}
