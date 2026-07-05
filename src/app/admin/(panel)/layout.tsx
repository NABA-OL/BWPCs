// Desarrollado por NABA-OL
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return <AdminShell usuario={session.usuario}>{children}</AdminShell>;
}
