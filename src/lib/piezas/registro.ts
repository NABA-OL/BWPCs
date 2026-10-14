/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-11
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Registro de piezas y regla de visibilidad por entorno. En producción solo se ve lo `publicado`; en preview y desarrollo, todo
// (los borradores llevan `noindex`). Imports relativos con extensión .ts: los carga `check:logic`.
import { TARJETA_MADRE_CONTENIDO } from "./tarjeta-madre.contenido.ts";
import { TARJETA_MADRE_GEO } from "./tarjeta-madre.geo.ts";
import { PIEZA_SLUGS } from "./types.ts";
import type { Entorno, PiezaContenido, PiezaGeo, PiezaSlug } from "./types.ts";

export interface PiezaRegistrada {
  contenido: PiezaContenido<string>;
  geo: PiezaGeo<string>;
}

export const PIEZAS: Readonly<Record<PiezaSlug, PiezaRegistrada>> = {
  "tarjeta-madre": { contenido: TARJETA_MADRE_CONTENIDO, geo: TARJETA_MADRE_GEO },
};

export function esPiezaSlug(valor: string): valor is PiezaSlug {
  return (PIEZA_SLUGS as readonly string[]).includes(valor);
}

export function piezaVisible(pieza: PiezaRegistrada, entorno: Entorno): boolean {
  return entorno !== "produccion" || pieza.contenido.estado === "publicado";
}

export function piezasVisibles(entorno: Entorno): readonly PiezaRegistrada[] {
  return PIEZA_SLUGS.map((slug) => PIEZAS[slug]).filter((p) => piezaVisible(p, entorno));
}

export function piezaPorSlug(slug: string, entorno: Entorno): PiezaRegistrada | null {
  if (!esPiezaSlug(slug)) return null;
  const pieza = PIEZAS[slug];
  return piezaVisible(pieza, entorno) ? pieza : null;
}

/** Ruta de "Ver a fondo" para un paso del recorrido de /servicios (`PieceId`), o null si la pieza no está visible. */
export function hrefPiezaServicios(pieceId: string, entorno: Entorno): string | null {
  const pieza = piezasVisibles(entorno).find((p) => p.contenido.piezaServicios === pieceId);
  return pieza ? `/piezas/${pieza.contenido.slug}` : null;
}
