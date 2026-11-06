import { redirect } from "next/navigation";
import { AdminApp } from "@/components/admin/AdminApp";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return <AdminApp blobEnabled={Boolean(process.env.BLOB_READ_WRITE_TOKEN)} />;
}
