/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { formatCOP } from "@/lib/format";
import { CARD_AND_PSE_TEXT } from "@/lib/site-config";
import { sendEmail } from "@/lib/email/resend";
import { renderEmail } from "@/lib/email/template";
import { siteUrl } from "@/lib/user-auth/site-url";

interface QuoteReadyInput {
  to: string;
  name: string;
  codigo: string;
  quoteId: string;
  /** Cada opción de la cotización con su total (efectivo/transferencia, sin recargos de pago). */
  options: { titulo: string; totalCop: number }[];
  /** Presente cuando es una versión nueva de una cotización ya enviada. */
  update?: { version: number; nota: string | null };
}

/** Correo "tu cotización está lista" (o "actualizada"), con la marca de B & W. */
export async function sendQuoteReadyEmail(input: QuoteReadyInput) {
  const { to, name, codigo, quoteId, options, update } = input;
  const optionCount = options.length;
  const opciones = optionCount === 1 ? "1 opción" : `${optionCount} opciones`;
  const first = name.trim().split(/\s+/)[0] || "";

  const { html, text } = renderEmail({
    preheader: update
      ? `Actualizamos tu cotización ${codigo} (versión ${update.version}).`
      : `Tu cotización ${codigo} ya está lista (${opciones}).`,
    greeting: first ? `Hola ${first},` : "Hola,",
    title: update ? "Actualizamos tu cotización" : "Tu cotización ya está lista",
    paragraphs: [
      update
        ? `Ajustamos la cotización ${codigo} según lo que nos pediste. Esta es la versión ${update.version}, con ${opciones}:`
        : optionCount === 1
          ? `Preparamos la cotización ${codigo} con 1 opción:`
          : `Preparamos la cotización ${codigo} con ${optionCount} opciones para que compares:`,
      ...(update?.nota ? [`Qué cambió: ${update.nota}`] : []),
    ],
    facts: options.map((o) => ({ label: o.titulo, value: formatCOP(o.totalCop) })),
    button: { label: "Ver mi cotización", url: `${siteUrl}/cuenta/cotizaciones/${quoteId}` },
    footnote:
      `Los valores son en efectivo o transferencia; con ${CARD_AND_PSE_TEXT} hay un recargo que ves en el detalle. Ahí mismo puedes descargar el PDF. Los precios son de referencia y pueden variar según disponibilidad.`,
  });

  await sendEmail({
    to,
    subject: update
      ? `Actualizamos tu cotización ${codigo}`
      : `Tu cotización ${codigo} está lista`,
    text,
    html,
  });
}
