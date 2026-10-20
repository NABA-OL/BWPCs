/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-11
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Entorno de despliegue para decidir qué piezas se ven. Puro: recibe el entorno como argumento.
import type { Entorno } from "./types.ts";

type Variables = Readonly<Record<string, string | undefined>>;

/**
 * Producción solo con VERCEL_ENV=production. Preview de Vercel = "preview". Todo lo demás (incluido `next build` local y
 * `build:check`, que no definen VERCEL_ENV) = "desarrollo", así el borrador se puede revisar y compilar. Para probar el
 * comportamiento de producción en local: `VERCEL_ENV=production pnpm dev`.
 */
export function entornoActual(vars: Variables = process.env): Entorno {
  if (vars.VERCEL_ENV === "production") return "produccion";
  if (vars.VERCEL_ENV === "preview") return "preview";
  return "desarrollo";
}
