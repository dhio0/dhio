import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/*
 * Password hashing for the single admin account. Stored format:
 *   scrypt:<N>:<salt hex>:<hash hex>
 * (":" rather than "$", because Next.js expands "$" inside .env files.)
 * Kept free of Next.js imports so the hash script can use it too.
 */

const N = 16384;
const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEYLEN, { N, r: 8, p: 1 });
  return `scrypt:${N}:${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [alg, n, saltHex, hashHex] = stored.split(":");
  if (alg !== "scrypt" || !n || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length, { N: Number(n), r: 8, p: 1 });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
