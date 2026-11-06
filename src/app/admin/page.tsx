import { redirect } from "next/navigation";
import { AdminApp } from "@/components/admin/AdminApp";
import { blobConfigured } from "@/lib/admin-api";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return <AdminApp blobEnabled={blobConfigured()} />;
}
