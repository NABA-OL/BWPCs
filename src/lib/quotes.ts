/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-21
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { MongoServerError } from "mongodb";
import { collections } from "@/lib/db/collections";
import { quoteCodigo } from "@/lib/quote";

let indexReady: Promise<unknown> | null = null;

/** Índice único de `codigo`, creado una sola vez por proceso. Si ya hubiera duplicados, no se crea y solo se registra. */
async function ensureQuoteIndexes() {
  indexReady ??= (async () => {
    const col = await collections.quotes();
    await col.createIndex({ codigo: 1 }, { name: "codigo_unique", unique: true });
  })().catch((error: unknown) => console.error("[quotes] índices", error));
  await indexReady;
}

/** Año actual en Bogotá (en Vercel el reloj es UTC: cerca del 31 de diciembre el año cambiaría antes de hora). */
const bogotaYear = (now: Date) => Number(now.toLocaleDateString("en-CA", { timeZone: "America/Bogota" }).slice(0, 4));

/**
 * Siguiente código "AAAA-COT-NNN", atómico: dos cotizaciones creadas a la vez no comparten
 * código. Igual patrón que `nextCuentaNumero` (`lib/cuentas-cobro.ts`).
 */
export async function nextQuoteCodigo(now = new Date()): Promise<string> {
  await ensureQuoteIndexes();
  const year = bogotaYear(now);
  const counters = await collections.counters();
  const key = `cotizacion-${year}`;
  for (let attempt = 0; ; attempt++) {
    try {
      const updated = await counters.findOneAndUpdate(
        { _id: key },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" },
      );
      return quoteCodigo(year, (updated?.seq ?? 1) - 1);
    } catch (error) {
      if (attempt < 2 && error instanceof MongoServerError && error.code === 11000) continue;
      throw error;
    }
  }
}

/** Código que se asignaría ahora (solo para mostrarlo en el formulario; no reserva nada). */
export async function peekNextQuoteCodigo(now = new Date()): Promise<string> {
  const year = bogotaYear(now);
  const current = await (await collections.counters()).findOne({ _id: `cotizacion-${year}` });
  return quoteCodigo(year, current?.seq ?? 0);
}
