import { adminRoute, notFound, parseId } from "@/lib/admin-api";
import { admin } from "@/lib/repo";
import { projectInput } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export function PUT(req: Request, { params }: Ctx) {
  return adminRoute(req, async () => {
    const id = parseId((await params).id);
    if (!id) return notFound();
    const row = await admin.updateProject(id, projectInput.parse(await req.json()));
    return row ? Response.json({ data: row }) : notFound();
  });
}

export function DELETE(req: Request, { params }: Ctx) {
  return adminRoute(req, async () => {
    const id = parseId((await params).id);
    if (!id) return notFound();
    return (await admin.deleteProject(id)) ? new Response(null, { status: 204 }) : notFound();
  });
}
