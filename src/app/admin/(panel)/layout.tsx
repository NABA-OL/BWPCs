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
import { collections } from "@/lib/db/collections";
import { countPendingReviews } from "@/lib/reviews/reviews";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  let solicitudesPendientes = 0;
  try {
    const col = await collections.leads();
    solicitudesPendientes = await col.countDocuments({
      revisado: false,
      tipo: { $ne: "guardada" },
    });
  } catch {
    // si falla el conteo, simplemente no se muestra el banner
  }

  let resenasPendientes = 0;
  try {
    resenasPendientes = await countPendingReviews();
  } catch {
    // si falla el conteo, simplemente no se muestra el banner
  }

  let borradoresPendientes = 0;
  try {
    const col = await collections.newsPosts();
    borradoresPendientes = await col.countDocuments({ estado: "borrador" });
  } catch {
    // si falla el conteo, simplemente no se muestra el banner
  }

  let blogBorradoresPendientes = 0;
  try {
    const col = await collections.guides();
    blogBorradoresPendientes = await col.countDocuments({ estado: "borrador" });
  } catch {
    // si falla el conteo, simplemente no se muestra el banner
  }

  return (
    <AdminShell
      usuario={session.usuario}
      solicitudesPendientes={solicitudesPendientes}
      resenasPendientes={resenasPendientes}
      borradoresPendientes={borradoresPendientes}
      blogBorradoresPendientes={blogBorradoresPendientes}
    >
      {children}
    </AdminShell>
  );
}
