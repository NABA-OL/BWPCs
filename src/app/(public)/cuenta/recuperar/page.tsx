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
import { RecoverForm } from "@/components/account/recover-form";
import { getUserSession } from "@/lib/user-auth/session";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default async function RecuperarPage() {
  if (await getUserSession()) redirect("/cuenta/seguridad");

  return (
    <section className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Recuperar contraseña
      </h1>
      <p className="mt-2 text-sm text-component">
        Te enviaremos un código de 6 dígitos al correo de tu cuenta.
      </p>
      <div className="mt-8 border border-hairline bg-vanilla p-6">
        <RecoverForm />
      </div>
      <p className="mt-6 text-center text-sm text-component">
        <Link href="/cuenta/ingresar" className="text-accent hover:underline">
          Volver a ingresar
        </Link>
      </p>
    </section>
  );
}
