/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { after } from "next/server";
import { sendEmail } from "@/lib/email/resend";
import { siteConfig } from "@/lib/site-config";
import { siteUrl } from "@/lib/user-auth/site-url";

/**
 * Avisos de seguridad por correo ("tu contraseña o tu correo cambió"). Se
 * envían en segundo plano y nunca hacen fallar la operación de la cuenta.
 */

function maskEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  return `${local.slice(0, 1)}***@${domain}`;
}

function send(to: string, subject: string, lines: string[]) {
  const text = lines.join("\n\n");
  const html = lines.map((l) => `<p>${l}</p>`).join("");
  after(() =>
    sendEmail({ to, subject, text, html }).catch((error: unknown) => {
      console.error("[user-auth] fallo al enviar aviso de seguridad", error);
    }),
  );
}

const IF_NOT_YOU = (path: string) =>
  `Si no fuiste tú, restablece tu contraseña ahora en ${siteUrl}${path} y escríbenos a ${siteConfig.contact.email}.`;

export function notifyPasswordChanged(email: string) {
  send(email, "Cambió la contraseña de tu cuenta de B & W", [
    "La contraseña de tu cuenta de B & W acaba de cambiar y cerramos tus otras sesiones.",
    "Si fuiste tú, no tienes que hacer nada.",
    IF_NOT_YOU("/cuenta/recuperar"),
  ]);
}

/** Se envía al correo ANTERIOR: es el que un dueño legítimo sigue leyendo. */
export function notifyEmailChanged(oldEmail: string, newEmail: string) {
  send(oldEmail, "Cambió el correo de tu cuenta de B & W", [
    `El correo de tu cuenta de B & W cambió a ${maskEmail(newEmail)}.`,
    "Si fuiste tú, no tienes que hacer nada.",
    `Si no fuiste tú, escríbenos de inmediato a ${siteConfig.contact.email}.`,
  ]);
}
