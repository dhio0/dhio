import { adminRoute } from "@/lib/admin-api";
import { admin } from "@/lib/repo";
import { certificationInput } from "@/lib/validation";

export function GET(req: Request) {
  return adminRoute(req, async () => Response.json({ data: await admin.listCertifications() }), { write: false });
}

export function POST(req: Request) {
  return adminRoute(req, async () => {
    const input = certificationInput.parse(await req.json());
    return Response.json({ data: await admin.createCertification(input) }, { status: 201 });
  });
}
