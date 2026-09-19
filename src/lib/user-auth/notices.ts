/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { after } from "next/server";
import { consumeNoticeMail } from "@/lib/email/budget";
import { sendEmail } from "@/lib/email/resend";
import { renderEmail, type EmailContent } from "@/lib/email/template";
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

function send(to: string, subject: string, content: EmailContent) {
  const { html, text } = renderEmail(content);
  after(() =>
    sendEmail({ to, subject, html, text }).catch((error: unknown) => {
      console.error("[user-auth] fallo al enviar aviso de seguridad", error);
    }),
  );
}

/**
 * Bienvenida: la cuenta quedó lista (correo verificado con código, o Google con el perfil
 * completo). Es un aviso, no algo crítico: usa el cupo diario de avisos y si no hay, no sale.
 */
export function notifyWelcome(email: string, name: string | undefined) {
  const first = (name ?? "").trim().split(/\s+/)[0];
  const { html, text } = renderEmail({
    preheader: "Tu cuenta está lista. Arma tu PC y pide tu primera cotización.",
    greeting: first ? `Hola ${first},` : "Hola,",
    title: "¡Bienvenido a B & W!",
    paragraphs: [
      "Tu cuenta ya está lista. Desde ahora puedes guardar tus cotizaciones, ver su estado y pedir cambios en un solo lugar.",
      "Empieza por el cotizador: eliges la gama de cada componente, ves un valor aproximado al instante y, con un clic, nos pides la cotización a tu medida. La verás aquí, en tu cuenta.",
    ],
    button: { label: "Hacer mi primera cotización", url: `${siteUrl}/cotizador` },
    footnote: "Recibes este correo porque creaste una cuenta en bw-pcs.com.",
  });
  after(async () => {
    if (!(await consumeNoticeMail())) return;
    await sendEmail({ to: email, subject: "¡Bienvenido a B & W!", html, text }).catch((error: unknown) => {
      console.error("[user-auth] fallo al enviar la bienvenida", error);
    });
  });
}

export function notifyPasswordChanged(email: string) {
  send(email, "Cambió la contraseña de tu cuenta de B & W", {
    preheader: "La contraseña de tu cuenta acaba de cambiar.",
    title: "Cambió la contraseña de tu cuenta",
    paragraphs: [
      "La contraseña de tu cuenta de B & W acaba de cambiar y cerramos tus otras sesiones.",
      "Si fuiste tú, no tienes que hacer nada. Si no fuiste tú, restablécela ahora y escríbenos.",
    ],
    button: { label: "Restablecer contraseña", url: `${siteUrl}/cuenta/recuperar` },
  });
}

/** Se envía al correo ANTERIOR: es el que un dueño legítimo sigue leyendo. */
export function notifyEmailChanged(oldEmail: string, newEmail: string) {
  send(oldEmail, "Cambió el correo de tu cuenta de B & W", {
    preheader: "El correo de tu cuenta acaba de cambiar.",
    title: "Cambió el correo de tu cuenta",
    paragraphs: [
      `El correo de tu cuenta de B & W cambió a ${maskEmail(newEmail)}.`,
      "Si fuiste tú, no tienes que hacer nada. Si no fuiste tú, escríbenos de inmediato.",
    ],
    button: { label: "Escribirnos", url: `mailto:${siteConfig.contact.email}` },
  });
}
