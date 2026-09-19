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
import { googleEnabled } from "@/lib/user-auth/google";
import { isProfileComplete } from "@/lib/user-auth/profile";
import { getRawUserSession, safeNextPath } from "@/lib/user-auth/session";

export const metadata: Metadata = { title: "Ingresar" };

export default async function IngresarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; google?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const session = await getRawUserSession();
  if (session) {
    redirect(isProfileComplete(session.user) ? next : `/cuenta/completar?next=${encodeURIComponent(next)}`);
  }

  return (
    <section className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Ingresar</h1>
      <p className="mt-2 text-sm text-component">
        Entra a tu cuenta de B &amp; W.
      </p>
      <div className="mt-8 border border-hairline bg-vanilla p-6">
        <AuthForm mode="ingreso" next={next} google={googleEnabled()} googleFailed={params.google === "error"} />
      </div>
      <p className="mt-6 text-center text-sm text-component">
        ¿No tienes cuenta?{" "}
        <Link
          href={`/cuenta/registro?next=${encodeURIComponent(next)}`}
          className="text-accent hover:underline"
        >
          Créala
        </Link>
      </p>
    </section>
  );
}
