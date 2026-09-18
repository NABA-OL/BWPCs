/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { formatCOP } from "@/lib/format";
import { siteConfig, whatsappLink } from "@/lib/site-config";
import { sendEmail } from "@/lib/email/resend";
import { siteUrl } from "@/lib/user-auth/site-url";

// Paleta de docs/DESIGN.md. Los correos no cargan CSS externo: todo va en línea.
const VANILLA = "#FAF8F3";
const PANDA = "#0A0A0A";
const GRAY = "#6B6B6B";
const HAIRLINE = "#E5E5E5";
const ACCENT = "#C83C2A";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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
  const url = `${siteUrl}/cuenta/cotizaciones/${quoteId}`;
  const opciones =
    optionCount === 1 ? "1 opción" : `${optionCount} opciones`;
  const first = name.trim().split(/\s+/)[0] || "";
  const greeting = first ? `Hola ${first},` : "Hola,";

  const text = [
    greeting,
    `Tu cotización ${codigo} ya está lista (${opciones}, desde ${formatCOP(desdeCop)}).`,
    `Ábrela y descarga el PDF en: ${url}`,
    `¿Dudas o quieres afinarla? Escríbenos por WhatsApp: ${whatsappLink()}`,
    "B & W · Ensamble de PC y venta de componentes",
  ].join("\n\n");

  const html = `<!doctype html>
<html lang="es"><body style="margin:0;padding:0;background:${VANILLA};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${VANILLA};padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid ${HAIRLINE};font-family:Helvetica,Arial,sans-serif;color:${PANDA};">
<tr><td style="background:${PANDA};padding:20px 28px;">
<span style="font-size:20px;font-weight:800;letter-spacing:-0.5px;color:${VANILLA};">B &amp; W</span>
</td></tr>
<tr><td style="padding:32px 28px 8px;">
<p style="margin:0 0 8px;font-size:15px;color:${GRAY};">${esc(greeting)}</p>
<h1 style="margin:0 0 16px;font-size:26px;line-height:1.2;font-weight:800;letter-spacing:-0.5px;">Tu cotización ya está lista</h1>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;">Preparamos la cotización <strong>${esc(codigo)}</strong> con ${opciones}.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid ${HAIRLINE};width:100%;"><tr>
<td style="padding:14px 16px;font-size:13px;color:${GRAY};">Desde</td>
<td align="right" style="padding:14px 16px;font-family:Menlo,Consolas,monospace;font-size:18px;font-weight:700;">${esc(formatCOP(desdeCop))}</td>
</tr></table>
<p style="margin:0 0 28px;"><a href="${esc(url)}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;padding:14px 28px;border-radius:2px;">Ver mi cotización</a></p>
<p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:${GRAY};">Ahí mismo puedes descargar el PDF. Los precios son de referencia y pueden variar según disponibilidad.</p>
</td></tr>
<tr><td style="padding:16px 28px 28px;">
<p style="margin:0;font-size:13px;line-height:1.6;color:${GRAY};">¿Dudas o quieres afinarla? Escríbenos por <a href="${esc(whatsappLink())}" style="color:${ACCENT};">WhatsApp</a> o a <a href="mailto:${esc(siteConfig.contact.email)}" style="color:${ACCENT};">${esc(siteConfig.contact.email)}</a>.</p>
</td></tr>
<tr><td style="border-top:1px solid ${HAIRLINE};padding:16px 28px;font-size:11px;color:${GRAY};">B &amp; W · Ensamble de PC y venta de componentes en Colombia</td></tr>
</table>
</td></tr></table>
</body></html>`;

  await sendEmail({
    to,
    subject: `Tu cotización ${codigo} está lista`,
    text,
    html,
  });
}
