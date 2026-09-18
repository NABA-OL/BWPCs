/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { formatCOP } from "@/lib/format";
import { sendEmail } from "@/lib/email/resend";
import { renderEmail } from "@/lib/email/template";
import { siteUrl } from "@/lib/user-auth/site-url";

interface QuoteReadyInput {
  to: string;
  name: string;
  codigo: string;
  quoteId: string;
  optionCount: number;
  /** Total más bajo entre las opciones (sin recargos de pago), en COP. */
  desdeCop: number;
}

/** Correo "tu cotización está lista", con la marca de B & W. */
export async function sendQuoteReadyEmail(input: QuoteReadyInput) {
  const { to, name, codigo, quoteId, optionCount, desdeCop } = input;
  const opciones = optionCount === 1 ? "1 opción" : `${optionCount} opciones`;
  const first = name.trim().split(/\s+/)[0] || "";

  const { html, text } = renderEmail({
    preheader: `Tu cotización ${codigo} ya está lista (${opciones}).`,
    greeting: first ? `Hola ${first},` : "Hola,",
    title: "Tu cotización ya está lista",
    paragraphs: [`Preparamos la cotización ${codigo} con ${opciones}.`],
    fact: { label: "Desde", value: formatCOP(desdeCop) },
    button: { label: "Ver mi cotización", url: `${siteUrl}/cuenta/cotizaciones/${quoteId}` },
    footnote:
      "Ahí mismo puedes descargar el PDF. Los precios son de referencia y pueden variar según disponibilidad.",
  });

  await sendEmail({ to, subject: `Tu cotización ${codigo} está lista`, text, html });
}
