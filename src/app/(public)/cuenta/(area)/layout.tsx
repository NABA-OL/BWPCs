/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { redirect } from "next/navigation";
import Link from "next/link";
import { AccountNav } from "@/components/account/account-nav";
import { getAccountBanners } from "@/lib/account/banners";
import { isProfileComplete } from "@/lib/user-auth/profile";
import { getRawUserSession } from "@/lib/user-auth/session";

// Área privada de la cuenta (cotizaciones, reseña, perfil, seguridad): exige
// sesión y muestra el menú. Las páginas de registro/ingreso/recuperar quedan fuera.
export default async function CuentaAreaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getRawUserSession();
  if (!session) redirect("/cuenta/ingresar");
  // Cuenta de Google sin celular ni aceptación de términos: primero se completa el perfil.
  if (!isProfileComplete(session.user)) redirect("/cuenta/completar");
  const { user } = session;
  const banners = await getAccountBanners(user.id).catch(() => []); // un fallo aquí no debe tumbar la cuenta

  return (
    <>
      {banners.map((b) => (
        <Link
          key={b.href + b.text}
          href={b.href}
          className="block border-b border-accent/30 bg-accent/5 px-4 py-2.5 text-center text-sm font-medium text-accent transition-colors hover:bg-accent/10 sm:px-6"
        >
          {b.text} →
        </Link>
      ))}
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:gap-10 md:py-14">
        <AccountNav
          name={user.name}
          email={user.email}
          avatarStyle={user.avatarStyle ?? "lorelei-neutral"}
          avatarSeed={user.avatarSeed ?? user.id}
        />
        <div className="mt-8 min-w-0 md:mt-0">{children}</div>
      </div>
    </>
  );
}
