import { adminRoute } from "@/lib/admin-api";
import { admin } from "@/lib/repo";
import { roleInput } from "@/lib/validation";

export function GET(req: Request) {
  return adminRoute(req, async () => Response.json({ data: await admin.listRoles() }), { write: false });
}

export function POST(req: Request) {
  return adminRoute(req, async () => {
    const input = roleInput.parse(await req.json());
    return Response.json({ data: await admin.createRole(input) }, { status: 201 });
  });
}
