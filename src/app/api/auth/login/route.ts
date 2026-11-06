import { z } from "zod";
import {
  authConfigured,
  clearFailures,
  clientIp,
  COOKIE,
  createSessionToken,
  recordFailure,
  sessionCookie,
  tooManyFailures,
} from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

const body = z.object({ password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  if (!authConfigured()) return Response.json({ error: "Admin is not configured" }, { status: 503 });

  const ip = clientIp(req);
  if (await tooManyFailures(ip)) {
    return Response.json({ error: "Too many failed attempts. Try again in 15 minutes." }, { status: 429 });
  }

  const parsed = body.safeParse(await req.json().catch(() => null));
  const ok = parsed.success && verifyPassword(parsed.data.password, process.env.ADMIN_PASSWORD_HASH!);
  if (!ok) {
    await recordFailure(ip);
    // Same message and a small delay whatever went wrong.
    await new Promise((r) => setTimeout(r, 400));
    return Response.json({ error: "Wrong password" }, { status: 401 });
  }

  await clearFailures(ip);
  const res = Response.json({ ok: true });
  const c = sessionCookie;
  res.headers.append(
    "Set-Cookie",
    `${COOKIE}=${createSessionToken()}; Path=${c.path}; Max-Age=${c.maxAge}; HttpOnly; SameSite=Strict${c.secure ? "; Secure" : ""}`,
  );
  return res;
}
