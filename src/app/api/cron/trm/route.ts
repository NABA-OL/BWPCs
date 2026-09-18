/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { NextResponse } from "next/server";
import { fetchTrmOficial } from "@/lib/trm";
import { collections } from "@/lib/db/collections";

/**
 * Cron de la TRM. Vercel lo invoca por GET según `vercel.json` y, si existe la
 * env `CRON_SECRET`, añade `Authorization: Bearer <CRON_SECRET>`. Actualiza
 * `settings.trmScrapeado` con el valor oficial de la Superfinanciera.
 *
 * El TRM manual (override) tiene prioridad en el cálculo de precios; este cron
 * solo refresca el valor automático, así que es seguro correrlo siempre.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  // Sin CRON_SECRET nadie puede invocarlo (antes quedaba abierto): defínelo en
  // Vercel y la plataforma enviará "Authorization: Bearer <CRON_SECRET>".
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const trm = await fetchTrmOficial();
    const col = await collections.settings();
    await col.updateOne(
      {},
      {
        $set: {
          trmScrapeado: trm.value,
          trmActualizado: new Date(),
          actualizado: new Date(),
        },
      },
      { upsert: true },
    );

    return NextResponse.json({
      ok: true,
      trm: trm.value,
      validityFrom: trm.validityFrom,
      validityTo: trm.validityTo,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error TRM." },
      { status: 502 },
    );
  }
}
