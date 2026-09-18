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
  ChangeEmailForm,
  ChangePasswordForm,
  DeleteAccountForm,
} from "@/components/account/security-forms";
import { hasApprovedReview } from "@/lib/reviews/reviews";
import { getUserSession } from "@/lib/user-auth/session";

export const metadata: Metadata = { title: "Seguridad de la cuenta" };

export default async function SeguridadPage() {
  const session = await getUserSession();
  if (!session) redirect("/cuenta/ingresar?next=/cuenta/seguridad");

  const keepChoice = await hasApprovedReview(session.user.id);

  return (
    <section className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 sm:py-16">
      <Link href="/cuenta" className="text-sm text-component hover:text-panda">
        ← Mi cuenta
      </Link>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Seguridad</h1>

      <div className="mt-8 space-y-6">
        <ChangePasswordForm />
        <ChangeEmailForm currentEmail={session.user.email} />
        <DeleteAccountForm hasApprovedReview={keepChoice} />
      </div>
    </section>
  );
}
