/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { renderEmail } from "@/lib/email/template";

interface OtpEmailInput {
  otp: string;
  /** Tipo del plugin de Better Auth: "email-verification", "forget-password", "change-email". */
  type: string;
  /** Vence en minutos (coincide con `expiresIn` del plugin). */
  minutes: number;
}

const CONTENT: Record<string, { subject: string; title: string; intro: string; ignore: string }> = {
  "forget-password": {
    subject: "Tu código para restablecer la contraseña",
    title: "Restablece tu contraseña",
    intro: "Usa este código para elegir una contraseña nueva en B & W.",
    ignore: "Si no lo pediste, ignora este correo: tu contraseña no cambia.",
  },
  "change-email": {
    subject: "Confirma tu nuevo correo en B & W",
    title: "Confirma tu nuevo correo",
    intro: "Usa este código para confirmar que este es tu nuevo correo en B & W.",
    ignore: "Si no lo pediste, ignora este correo: tu correo actual no cambia.",
  },
  "email-verification": {
    subject: "Tu código de verificación de B & W",
    title: "Verifica tu correo",
    intro: "Usa este código para verificar tu correo y activar tu cuenta de B & W.",
    ignore: "Si no fuiste tú, ignora este correo: nadie entra a una cuenta sin este código.",
  },
};

/** Correo con el código de un solo uso (verificación, recuperación, cambio de correo). */
export function otpEmail({ otp, type, minutes }: OtpEmailInput) {
  const c = CONTENT[type] ?? CONTENT["email-verification"];
  const { html, text } = renderEmail({
    preheader: `Tu código es ${otp}. Vence en ${minutes} minutos.`,
    title: c.title,
    paragraphs: [c.intro],
    code: otp,
    footnote: `Vence en ${minutes} minutos y solo sirve una vez. No lo compartas con nadie. ${c.ignore}`,
  });
  return { subject: c.subject, html, text };
}
