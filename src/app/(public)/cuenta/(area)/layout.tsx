/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { redirect } from "next/navigation";
import { AccountNav } from "@/components/account/account-nav";
import { getUserSession } from "@/lib/user-auth/session";

// Área privada de la cuenta (cotizaciones, reseña, perfil, seguridad): exige
// sesión y muestra el menú. Las páginas de registro/ingreso/recuperar quedan fuera.
export default async function CuentaAreaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getUserSession();
  if (!session) redirect("/cuenta/ingresar");
  const { user } = session;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:gap-10 md:py-14">
      <AccountNav
        name={user.name}
        email={user.email}
        avatarStyle={user.avatarStyle ?? "lorelei-neutral"}
        avatarSeed={user.avatarSeed ?? user.id}
      />
      <div className="mt-8 min-w-0 md:mt-0">{children}</div>
    </div>
  );
}
