/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-19
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CompleteProfileForm } from "@/components/account/complete-profile-form";
import { isProfileComplete } from "@/lib/user-auth/profile";
import { getRawUserSession, safeNextPath } from "@/lib/user-auth/session";

export const metadata: Metadata = { title: "Completa tu cuenta" };

/**
 * Destino de todo retorno de Google: si la cuenta ya está completa sigue a su destino; si es nueva
 * pide el celular y la aceptación de términos (Ley 1581) antes de dejarla usar.
 */
export default async function CompletarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const next = safeNextPath((await searchParams).next);
  const session = await getRawUserSession();
  if (!session) redirect("/cuenta/ingresar");
  if (isProfileComplete(session.user)) redirect(next);

  return (
    <section className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Completa tu cuenta</h1>
      <p className="mt-2 text-sm text-component">
        Entraste con Google como{" "}
        <strong className="font-medium text-panda">{session.user.email}</strong>. Solo falta tu celular
        (para coordinar tu compra) y aceptar los términos.
      </p>
      <div className="mt-8 border border-hairline bg-vanilla p-6">
        <CompleteProfileForm next={next} />
      </div>
    </section>
  );
}
