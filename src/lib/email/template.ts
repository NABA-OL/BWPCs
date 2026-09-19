/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { siteConfig, whatsappLink } from "@/lib/site-config";
import { siteUrl } from "@/lib/user-auth/site-url";

// Paleta de docs/DESIGN.md. Los correos no cargan CSS externo: todo va en línea.
const VANILLA = "#FAF8F3";
const PANDA = "#0A0A0A";
const GRAY = "#6B6B6B";
const HAIRLINE = "#E5E5E5";
const ACCENT = "#C83C2A";

const SANS = "Helvetica,Arial,sans-serif";
const MONO = "Menlo,Consolas,'Courier New',monospace";

export interface EmailContent {
  /** Texto de vista previa en la bandeja (no se ve dentro del correo). */
  preheader?: string;
  title: string;
  greeting?: string;
  /** Párrafos de texto plano (se escapan). */
  paragraphs: string[];
  /** Código destacado (verificación, recuperación…). */
  code?: string;
  /** Recuadro con datos clave, una fila por dato (p. ej. el precio de cada opción de una cotización). */
  facts?: { label: string; value: string }[];
  button?: { label: string; url: string };
  /** Nota final en gris, más pequeña. */
  footnote?: string;
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Plantilla común de los correos de B & W: mismo fondo de red de nodos y colores
 * del sitio, título, texto, código o dato destacado y botón. Sin logo (solo el
 * texto "B & W"). Devuelve HTML y la versión en texto plano.
 */
export function renderEmail(c: EmailContent): { html: string; text: string } {
  const background = `${siteUrl}/brand/email-fondo.png`;
  const { contact } = siteConfig;

  const paragraphs = c.paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:1.6;color:${PANDA};">${esc(p)}</p>`,
    )
    .join("");

  const code = c.code
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 22px;"><tr><td style="background:#ffffff;border:2px solid ${PANDA};padding:14px 22px;font-family:${MONO};font-size:34px;font-weight:700;letter-spacing:10px;color:${PANDA};">${esc(c.code)}</td></tr></table>`
    : "";

  const facts =
    c.facts && c.facts.length > 0
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid ${HAIRLINE};background:#ffffff;">${c.facts
          .map(
            (f, i) =>
              `<tr><td style="padding:12px 16px;${i > 0 ? `border-top:1px solid ${HAIRLINE};` : ""}font-family:${SANS};font-size:14px;color:${PANDA};">${esc(f.label)}</td><td align="right" style="padding:12px 16px;${i > 0 ? `border-top:1px solid ${HAIRLINE};` : ""}font-family:${MONO};font-size:16px;font-weight:700;color:${PANDA};white-space:nowrap;">${esc(f.value)}</td></tr>`,
          )
          .join("")}</table>`
      : "";

  const button = c.button
    ? `<p style="margin:0 0 24px;"><a href="${esc(c.button.url)}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;font-family:${SANS};font-size:13px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;padding:14px 28px;border-radius:2px;">${esc(c.button.label)}</a></p>`
    : "";

  const footnote = c.footnote
    ? `<p style="margin:0 0 8px;font-family:${SANS};font-size:13px;line-height:1.6;color:${GRAY};">${esc(c.footnote)}</p>`
    : "";

  const preheader = c.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(c.preheader)}</div>`
    : "";

  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"></head>
<body style="margin:0;padding:0;background:${VANILLA};">
${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" background="${esc(background)}" style="background:${VANILLA} url('${esc(background)}') repeat;background-size:900px 900px;">
<tr><td align="center" style="padding:36px 16px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:${VANILLA};border:1px solid ${HAIRLINE};">
<tr><td style="padding:22px 32px 18px;border-bottom:1px solid ${HAIRLINE};font-family:${SANS};font-size:20px;font-weight:800;letter-spacing:-0.5px;color:${PANDA};">B &amp; W</td></tr>
<tr><td style="padding:32px 32px 8px;">
${c.greeting ? `<p style="margin:0 0 8px;font-family:${SANS};font-size:15px;color:${GRAY};">${esc(c.greeting)}</p>` : ""}
<h1 style="margin:0 0 18px;font-family:${SANS};font-size:26px;line-height:1.2;font-weight:800;letter-spacing:-0.5px;color:${PANDA};">${esc(c.title)}</h1>
${paragraphs}${code}${facts}${button}${footnote}
</td></tr>
<tr><td style="padding:12px 32px 28px;font-family:${SANS};font-size:13px;line-height:1.6;color:${GRAY};">¿Dudas? Escríbenos por <a href="${esc(whatsappLink())}" style="color:${ACCENT};">WhatsApp</a> o a <a href="mailto:${esc(contact.email)}" style="color:${ACCENT};">${esc(contact.email)}</a>.</td></tr>
<tr><td style="border-top:1px solid ${HAIRLINE};padding:16px 32px;font-family:${SANS};font-size:11px;color:${GRAY};">B &amp; W · Ensamble de PC y venta de componentes en Colombia · Mensaje automático de bw-pcs.com</td></tr>
</table>
</td></tr></table>
</body></html>`;

  const text = [
    c.greeting,
    c.title,
    ...c.paragraphs,
    c.code ? `Tu código: ${c.code}` : undefined,
    ...(c.facts ?? []).map((f) => `${f.label}: ${f.value}`),
    c.button ? `${c.button.label}: ${c.button.url}` : undefined,
    c.footnote,
    `¿Dudas? WhatsApp ${whatsappLink()} o ${contact.email}`,
    "B & W · Ensamble de PC y venta de componentes en Colombia",
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n\n");

  return { html, text };
}
