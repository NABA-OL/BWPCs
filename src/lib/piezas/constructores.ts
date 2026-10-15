/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Constructores de `Hecho` compartidos por el contenido de todas las piezas y por `comun.hechos.ts`.
// Reglas: prosa sin cifras (salvo nombres de estándar en `terminos`); toda cifra vive en un `Hecho` con fuente.
// `consultadoEn: ""` = URL candidata que NO se pudo consultar desde esa sesión (la verifica una persona). Con fecha = se abrió ese día.
import type { Fuente, Hecho } from "./types.ts";

export const HOY = "2026-10-11";

/** Hecho pendiente de verificación humana (verificadoEn y verificadoPor quedan en null). */
export function hecho(id: string, texto: string, fuentes: readonly Fuente[], nota?: string): Hecho {
  return { id, texto, fuentes, verificadoEn: null, verificadoPor: null, ...(nota === undefined ? {} : { nota }) };
}

/** Datos aprobados por el dueño tras las hojas de verificación A y B (docs/verificacion/tarjeta-madre-a.md y -b.md). */
export const FECHA_VERIFICACION = "2026-10-13";
export const VERIFICADOR = "NB";
type HojaVerificacion = "A" | "B";

/** Hecho verificado y aprobado por el dueño: fija verificadoEn/verificadoPor y agrega la nota de aprobación de su hoja. */
export function hechoVerificado(id: string, texto: string, fuentes: readonly Fuente[], nota?: string, hoja: HojaVerificacion = "A"): Hecho {
  const notaAprobado = `Verificado por hoja ${hoja} (${FECHA_VERIFICACION}) y aprobado por ${VERIFICADOR}.`;
  return {
    id,
    texto,
    fuentes,
    verificadoEn: FECHA_VERIFICACION,
    verificadoPor: VERIFICADOR,
    nota: nota === undefined ? notaAprobado : `${nota} ${notaAprobado}`,
  };
}

/** Atajo para los hechos aprobados tras la hoja B. */
export function hechoVerificadoB(id: string, texto: string, fuentes: readonly Fuente[], nota?: string): Hecho {
  return hechoVerificado(id, texto, fuentes, nota, "B");
}

/** Misma fuente, abierta de nuevo en la verificación (fecha de consulta actualizada). */
export function consultadaEnVerificacion(fuente: Fuente): Fuente {
  return { ...fuente, consultadoEn: FECHA_VERIFICACION };
}

/** Marca cada cuántos meses se debe revisar un hecho (6 = volátil, 12 = por defecto, 24 = medida de especificación). No toca su verificación. */
export function conRevision(h: Hecho, meses: 6 | 12 | 24): Hecho {
  return { ...h, revisarCadaMeses: meses };
}
