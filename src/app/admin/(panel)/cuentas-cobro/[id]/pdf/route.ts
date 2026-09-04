/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ObjectId } from "mongodb";
import { renderToBuffer } from "@react-pdf/renderer";
import { collections } from "@/lib/db/collections";
import { getSettings } from "@/lib/admin/settings";
import { getSession } from "@/lib/auth/session";
import { CuentaCobroPDF } from "@/components/pdf/cuenta-cobro-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Doble verificación (además del proxy que protege /admin/*).
  if (!(await getSession())) {
    return new Response("No autorizado", { status: 401 });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return new Response("No encontrado", { status: 404 });
  }

  const col = await collections.cuentasCobro();
  const cuenta = await col.findOne({ _id: new ObjectId(id) });
  if (!cuenta) {
    return new Response("No encontrado", { status: 404 });
  }

  const settings = await getSettings();

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
