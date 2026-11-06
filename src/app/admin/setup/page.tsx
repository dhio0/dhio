import { notFound } from "next/navigation";
import { SetupForm } from "@/components/admin/SetupForm";

export const dynamic = "force-dynamic";

/** Local-only page that makes the ADMIN_PASSWORD_HASH value. Hidden on the deployed site. */
export default function SetupPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="shell grid min-h-svh place-items-center py-20">
      <div className="w-full max-w-xl">
        <p className="label text-accent">Local setup · not on the live site</p>
        <h1 className="font-display mt-2 text-5xl font-extrabold tracking-[-0.04em]">Admin password.</h1>
        <SetupForm />
      </div>
    </main>
  );
}
