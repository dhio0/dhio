/*
 * Prints an ADMIN_PASSWORD_HASH value for the admin login.
 *   npm run admin:hash
 * Type the password when asked; copy the printed line into Vercel's
 * environment variables (and into .env.local for local use).
 */
import { createInterface } from "node:readline/promises";
import { hashPassword } from "../src/lib/password";

const rl = createInterface({ input: process.stdin, output: process.stdout });
const pw = await rl.question("Admin password (min 12 characters): ");
rl.close();
if (pw.length < 12) {
  console.error("Too short. Use at least 12 characters.");
  process.exit(1);
}
console.log(`\nADMIN_PASSWORD_HASH=${hashPassword(pw)}`);
