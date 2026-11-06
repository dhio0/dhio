import "server-only";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { checkAdminRequest } from "./auth";
import { DbMissingError } from "./repo";

/*
 * Shared wrapper for admin route handlers: checks the session, turns known
 * errors into clean JSON responses, and refreshes the public page after any
 * successful write so changes show up without a redeploy.
 */
export async function adminRoute(req: Request, fn: () => Promise<Response>, { write = true } = {}) {
  const denied = checkAdminRequest(req);
  if (denied) return denied;
  try {
    const res = await fn();
    if (write && res.ok) revalidatePath("/");
    return res;
  } catch (e) {
    if (e instanceof ZodError) {
      return Response.json(
        { error: "Invalid input", issues: e.issues.map((i) => ({ path: i.path.join("."), message: i.message })) },
        { status: 400 },
      );
    }
    if (e instanceof DbMissingError) return Response.json({ error: "Database is not configured" }, { status: 503 });
    const code = (e as { code?: string; cause?: { code?: string } }).cause?.code ?? (e as { code?: string }).code;
    if (code === "23505") return Response.json({ error: "That slug is already used" }, { status: 409 });
    console.error(e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * Vercel Blob is usable with either a read-write token or, on newer stores,
 * a store ID plus Vercel's OIDC token (which @vercel/blob picks up itself).
 */
export function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const notFound = () => Response.json({ error: "Not found" }, { status: 404 });
