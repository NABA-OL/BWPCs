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
  CreatePasswordForm,
  GoogleLinkCard,
} from "@/components/account/security-forms";
import { hasApprovedReview } from "@/lib/reviews/reviews";
import { getUserSession } from "@/lib/user-auth/session";
import { googleEnabled } from "@/lib/user-auth/google";
import { getGoogleLink, hasPasswordAccount } from "@/lib/user-auth/users";

export const metadata: Metadata = { title: "Seguridad de la cuenta" };

export default async function SeguridadPage({
  searchParams,
}: {
  searchParams: Promise<{ google?: string }>;
}) {
  const { google } = await searchParams;
  const session = await getUserSession();
  if (!session) redirect("/cuenta/ingresar?next=/cuenta/seguridad");

  const [keepChoice, hasPassword, googleLink] = await Promise.all([
    hasApprovedReview(session.user.id),
    hasPasswordAccount(session.user.id),
    getGoogleLink(session.user.id),
  ]);

  return (
    <section className="max-w-xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Seguridad</h1>

      <div className="mt-8 space-y-6">
        {hasPassword ? (
          <>
            <ChangePasswordForm />
            <ChangeEmailForm currentEmail={session.user.email} />
          </>
        ) : (
          <CreatePasswordForm email={session.user.email} />
        )}
        {(googleEnabled() || googleLink) && (
          <GoogleLinkCard
            linked={googleLink !== null}
            googleEmail={googleLink?.email ?? null}
            hasPassword={hasPassword}
            primaryEmail={session.user.email}
            status={google === "vinculado" || google === "error" ? google : undefined}
          />
        )}
        <DeleteAccountForm hasApprovedReview={keepChoice} hasPassword={hasPassword} />
      </div>
    </section>
  );
}
