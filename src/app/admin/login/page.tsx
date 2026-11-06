import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { authConfigured, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="shell grid min-h-svh place-items-center py-20">
      <div className="w-full max-w-sm">
        <p className="label text-accent">Restricted</p>
        <h1 className="font-display mt-2 text-5xl font-extrabold tracking-[-0.04em]">Admin.</h1>
        {authConfigured() ? (
          <LoginForm />
        ) : (
          <p className="mt-6 leading-relaxed text-ink-2">
            Admin is not configured. Set DATABASE_URL and ADMIN_PASSWORD_HASH (make it at /admin/setup on your own
            machine).
          </p>
        )}
      </div>
    </main>
  );
}
