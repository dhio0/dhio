import type { NextRequest } from "next/server";
import { listProjects } from "@/lib/repo";

// GET /api/projects?stack=python  (filter is optional, case-insensitive)
export async function GET(req: NextRequest) {
  const stack = req.nextUrl.searchParams.get("stack")?.toLowerCase();
  let projects = await listProjects();
  if (stack) projects = projects.filter((p) => p.stack.some((s) => s.toLowerCase() === stack));
  return Response.json({ count: projects.length, data: projects });
}
