/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-05
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { NextResponse } from "next/server";
import { runNewsScan } from "@/lib/news/scan";

/**
 * Cron semanal (lunes) del escaneo de noticias. Mismo patrón que
 * /api/cron/trm: Vercel invoca por GET y, si existe `CRON_SECRET`, valida
 * `Authorization: Bearer <CRON_SECRET>`. Solo crea borradores, nunca publica.
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
    const result = await runNewsScan();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error de escaneo." },
      { status: 502 },
    );
  }
}
