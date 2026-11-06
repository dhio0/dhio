import { z } from "zod";
import { hashPassword } from "@/lib/password";

/*
 * Development-only helper behind /admin/setup: turns a password into the
 * ADMIN_PASSWORD_HASH value. Returns 404 on the deployed site.
 */

const body = z.object({ password: z.string().min(12).max(200) });

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
  const host = new URL(req.url).hostname;
  if (host !== "localhost" && host !== "127.0.0.1") return new Response("Not found", { status: 404 });

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Use at least 12 characters" }, { status: 400 });
  return Response.json({ hash: hashPassword(parsed.data.password) });
}
