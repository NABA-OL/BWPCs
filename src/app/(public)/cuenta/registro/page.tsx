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
import { AuthForm } from "@/components/account/auth-form";
import { getUserSession, safeNextPath } from "@/lib/user-auth/session";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const next = safeNextPath((await searchParams).next);
  if (await getUserSession()) redirect(next);

  return (
    <section className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Crear cuenta</h1>
      <p className="mt-2 text-sm text-component">
        Guarda tus cotizaciones y sigue su estado desde un solo lugar.
      </p>
      <div className="mt-8 border border-hairline bg-vanilla p-6">
        <AuthForm mode="registro" next={next} />
      </div>
      <p className="mt-6 text-center text-sm text-component">
        ¿Ya tienes cuenta?{" "}
        <Link
          href={`/cuenta/ingresar?next=${encodeURIComponent(next)}`}
          className="text-accent hover:underline"
        >
          Ingresa
        </Link>
      </p>
    </section>
  );
}
