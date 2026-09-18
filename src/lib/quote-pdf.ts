/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { getSettings } from "@/lib/admin/settings";
import { QuotePDF } from "@/components/pdf/quote-pdf";
import type { Quote } from "@/lib/db/types";

/** PDF de una cotización (mismo documento para el admin y para el cliente). */
export async function renderQuotePdf(quote: Quote): Promise<Response> {
  const settings = await getSettings();

  // Logo opcional para el footer (si no se puede leer, se omite).
  let logo: string | undefined;
  try {
    const buf = await readFile(
      join(process.cwd(), "public", "brand", "logo-solo.png"),
    );
    logo = `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    logo = undefined;
  }

  const buffer = await renderToBuffer(
    QuotePDF({
      quote,
      contactWhatsapp: settings.contacto.whatsapp,
      contactEmail: settings.contacto.email,
      logo,
    }),
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="cotizacion-${quote.codigo}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
