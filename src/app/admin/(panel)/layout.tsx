/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
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
