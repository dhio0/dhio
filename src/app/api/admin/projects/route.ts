import { adminRoute } from "@/lib/admin-api";
import { admin } from "@/lib/repo";
import { projectInput } from "@/lib/validation";

// GET /api/admin/projects: every project, drafts included.
export function GET(req: Request) {
  return adminRoute(req, async () => Response.json({ data: await admin.listProjects() }), { write: false });
}

// POST /api/admin/projects: create a project.
export function POST(req: Request) {
  return adminRoute(req, async () => {
    const input = projectInput.parse(await req.json());
    return Response.json({ data: await admin.createProject(input) }, { status: 201 });
  });
}
