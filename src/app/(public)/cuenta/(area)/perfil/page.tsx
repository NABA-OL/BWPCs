/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AvatarPicker,
  ProfileForm,
} from "@/components/account/profile-forms";
import { SignOutButton } from "@/components/account/sign-out-button";
import { getUserSession } from "@/lib/user-auth/session";

export const metadata: Metadata = { title: "Mi cuenta" };

export default async function CuentaPage() {
  const session = await getUserSession();
  if (!session) redirect("/cuenta/ingresar");
  const { user } = session;

  return (
    <section className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Mi cuenta</h1>
      <p className="mt-2 text-sm text-component">{user.email}</p>

      <div className="mt-8 space-y-6">
        <div className="border border-hairline bg-vanilla p-6">
          <h2 className="text-lg font-semibold">Avatar</h2>
          <div className="mt-4">
            <AvatarPicker
              currentStyle={user.avatarStyle ?? "lorelei-neutral"}
              currentSeed={user.avatarSeed ?? user.id}
            />
          </div>
        </div>

        <div className="border border-hairline bg-vanilla p-6">
          <h2 className="text-lg font-semibold">Tus datos</h2>
          <div className="mt-4">
            <ProfileForm name={user.name} phone={user.phone} />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <SignOutButton />
        <Link
          href="/cuenta/cotizaciones"
          className="text-sm text-accent hover:underline"
        >
          Mis cotizaciones
        </Link>
        <Link
          href="/cuenta/resena"
          className="text-sm text-accent hover:underline"
        >
          Mi reseña
        </Link>
        <Link
          href="/cuenta/seguridad"
          className="text-sm text-accent hover:underline"
        >
          Seguridad: contraseña, correo y eliminar cuenta
        </Link>
      </div>
    </section>
  );
}
