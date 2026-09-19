/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { formatCOP } from "@/lib/format";
import { sendEmail } from "@/lib/email/resend";
import { renderEmail } from "@/lib/email/template";
import { siteUrl } from "@/lib/user-auth/site-url";

interface CuentaCobroReadyInput {
  to: string;
  name: string;
  numero: string;
  totalCop: number;
  cuentaId: string;
  /** Es una versión corregida tras pedirla el cliente. */
  corrected?: boolean;
  /** Aviso de que ya está el enlace de pago con tarjeta de una cuenta ya enviada. */
  cardLinkReady?: boolean;
}

/** Correo "tienes una cuenta de cobro" (o "la corregimos"), con la marca de B & W. */
export async function sendCuentaCobroEmail(input: CuentaCobroReadyInput) {
  const { to, name, numero, totalCop, cuentaId, corrected, cardLinkReady } = input;
  const first = name.trim().split(/\s+/)[0] || "";

  const { html, text } = renderEmail({
    preheader: cardLinkReady
      ? `Ya puedes pagar la cuenta de cobro ${numero} con tarjeta.`
      : corrected
        ? `Corregimos tu cuenta de cobro ${numero}.`
        : `Tu cuenta de cobro ${numero} está lista.`,
    greeting: first ? `Hola ${first},` : "Hola,",
    title: cardLinkReady
      ? "Tu enlace de pago con tarjeta está listo"
      : corrected
        ? "Corregimos tu cuenta de cobro"
        : "Tu cuenta de cobro está lista",
    paragraphs: [
      cardLinkReady
        ? `Ya puedes pagar la cuenta de cobro ${numero} con tarjeta desde tu cuenta. Cuando pagues, guarda el comprobante (una captura o la descarga) y súbelo ahí mismo para que lo confirmemos.`
        : corrected
          ? `Ajustamos la cuenta de cobro ${numero} según lo que nos pediste. Revísala y, cuando hagas el pago, avísanos desde tu cuenta.`
          : `Ya puedes ver la cuenta de cobro ${numero} en tu cuenta, con los datos para hacer el pago. Cuando lo hagas, avísanos desde ahí.`,
    ],
    facts: [{ label: "Total a pagar", value: formatCOP(totalCop) }],
    button: { label: "Ver mi cuenta de cobro", url: `${siteUrl}/cuenta/cuentas-cobro/${cuentaId}` },
    footnote:
      "Nunca te pediremos claves ni datos de tarjetas por correo. Si algo no te cuadra, escríbenos por WhatsApp antes de pagar.",
  });

  await sendEmail({
    to,
    subject: cardLinkReady
      ? `Tu enlace de pago con tarjeta (${numero})`
      : corrected
        ? `Corregimos tu cuenta de cobro ${numero}`
        : `Tu cuenta de cobro ${numero}`,
    text,
    html,
  });
}
