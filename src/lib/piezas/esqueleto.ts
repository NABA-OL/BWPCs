/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Piezas de los esqueletos de contenido (docs/piezas-plan-2.md §5.2, T0.1): textos «Pendiente de redactar.» sin cifras ni afirmaciones.
// Quien redacte una pieza reemplaza estos marcadores por contenido real; mientras tanto la página se ve completa en desarrollo y preview.
import type { Celda, Comparacion, ParteContenido, SeccionTexto, VistaContenido } from "./types.ts";

export const PENDIENTE = "Pendiente de redactar.";

/** Parte sin redactar: nombre real, textos pendientes y las vistas donde existe (sin definir = todas). */
export function parteEsqueleto(orden: number, nombre: string, nombreCorto: string, vistas?: readonly string[]): ParteContenido {
  return {
    orden,
    nombre,
    nombreCorto,
    resumen: PENDIENTE,
    queHace: PENDIENTE,
    alElegir: [],
    hechos: [],
    ...(vistas === undefined ? {} : { vistas }),
  };
}

/** Vista sin redactar. */
export function vistaEsqueleto<P extends string, V extends string>(id: V, etiqueta: string): VistaContenido<P, V> {
  return { id, etiqueta, resumen: PENDIENTE, etiquetaFigura: PENDIENTE };
}

/** Sección de texto sin redactar. */
export function seccionEsqueleto(id: string, titulo: string): SeccionTexto {
  return { id, titulo, parrafos: [PENDIENTE] };
}

/** Comparación con una sola fila pendiente, para que el bloque «comparar» exista. */
export function comparacionEsqueleto<V extends string>(columnas: readonly V[]): Comparacion<V> {
  const celda: Celda = { tipo: "texto", texto: PENDIENTE };
  const valores = Object.fromEntries(columnas.map((columna) => [columna, celda])) as Record<V, Celda>;
  return { id: "general", titulo: "Comparación", columnas, filas: [{ etiqueta: PENDIENTE, valores }] };
}

/** Pie común de los esqueletos. */
export const CTA_ESQUELETO = { titulo: "Cotiza tu PC", texto: PENDIENTE, etiqueta: "Cotiza tu PC", href: "/cotizador" } as const;
