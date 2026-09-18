/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-05
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { NextResponse } from "next/server";
import { generateBlogDraft } from "@/lib/blog/generate";

/**
 * Cron semanal (miércoles) de redacción de guía. Mismo patrón que
 * /api/cron/trm y /api/cron/noticias: Vercel invoca por GET y, si existe
 * `CRON_SECRET`, valida `Authorization: Bearer <CRON_SECRET>`. Solo crea
 * borrador, nunca publica.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  // Sin CRON_SECRET nadie puede invocarlo (antes quedaba abierto): defínelo en
  // Vercel y la plataforma enviará "Authorization: Bearer <CRON_SECRET>".
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const result = await generateBlogDraft();
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
