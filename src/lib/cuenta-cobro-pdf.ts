/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { getSettings } from "@/lib/admin/settings";
import { CuentaCobroPDF } from "@/components/pdf/cuenta-cobro-pdf";
import type { CuentaCobro } from "@/lib/db/types";

/** PDF de una cuenta de cobro (mismo documento para el admin y para el cliente). */
export async function renderCuentaCobroPdf(cuenta: CuentaCobro): Promise<Response> {
  const settings = await getSettings();

  let logo: string | undefined;
  try {
    const buf = await readFile(join(process.cwd(), "public", "brand", "logo-solo.png"));
    logo = `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    logo = undefined;
  }

  const buffer = await renderToBuffer(
    CuentaCobroPDF({
      cuenta,
      contactWhatsapp: settings.contacto.whatsapp,
      contactEmail: settings.contacto.email,
      logo,
    }),
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="cuenta-cobro-${cuenta.numero}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
