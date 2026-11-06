import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { and, count, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { db, schema } from "@/db";

/*
 * Single-user admin auth.
 *  - ADMIN_PASSWORD_HASH: scrypt hash (from /admin/setup locally, or `npm run admin:hash`).
 *  - SESSION_SECRET (optional): key that signs the session cookie. When it is
 *    not set, the key is derived from ADMIN_PASSWORD_HASH, which is already a
 *    secret with a random salt; changing the password then also logs out
 *    every existing session.
 * The session is a signed, expiring token in an httpOnly, SameSite=Strict
 * cookie. Failed logins are counted in Postgres and limited per IP.
 */

export const COOKIE = "dp_admin";
const SESSION_HOURS = 12;
const MAX_FAILS = 5;
const WINDOW_MIN = 15;

export function authConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD_HASH?.startsWith("scrypt:") && db);
}

function sessionKey() {
  const explicit = process.env.SESSION_SECRET;
  if (explicit && explicit.length >= 32) return explicit;
  return createHash("sha256").update(`dp-session-v1:${process.env.ADMIN_PASSWORD_HASH}`).digest();
}

function sign(payload: string) {
  return createHmac("sha256", sessionKey()).update(payload).digest("base64url");
}

export function createSessionToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_HOURS * 3600_000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function validToken(token: string | undefined) {
  if (!token || !authConfigured()) return false;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return false;
  const expected = Buffer.from(sign(payload));
  const got = Buffer.from(mac);
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export const sessionCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_HOURS * 3600,
};

/** For server components (admin pages). */
export async function isAdmin() {
  return authConfigured() && validToken((await cookies()).get(COOKIE)?.value);
}

/**
 * For API route handlers that change data. Checks the session and, as a
 * second CSRF guard on top of SameSite=Strict, that the request came from
 * this site.
 */
export function checkAdminRequest(req: Request): Response | null {
  if (!authConfigured()) return Response.json({ error: "Admin is not configured" }, { status: 503 });
  const token = req.headers
    .get("cookie")
    ?.split(/;\s*/)
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!validToken(token)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(req.url).host) {
    return Response.json({ error: "Cross-site request blocked" }, { status: 403 });
  }
  return null;
}

export function clientIp(req: Request) {
  return req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function tooManyFailures(ip: string) {
  if (!db) return false;
  const since = new Date(Date.now() - WINDOW_MIN * 60_000);
  const [{ n }] = await db
    .select({ n: count() })
    .from(schema.loginAttempts)
    .where(and(eq(schema.loginAttempts.ip, ip), gt(schema.loginAttempts.at, since)));
  return n >= MAX_FAILS;
}

export async function recordFailure(ip: string) {
  await db?.insert(schema.loginAttempts).values({ ip });
}

export async function clearFailures(ip: string) {
  await db?.delete(schema.loginAttempts).where(eq(schema.loginAttempts.ip, ip));
}
