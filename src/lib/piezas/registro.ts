/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-11
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Registro de piezas y regla de visibilidad por entorno. En producción solo se ve lo `publicado`; en preview y desarrollo, todo
// (los borradores llevan `noindex`). Imports relativos con extensión .ts: los carga `check:logic`.
// Cada pieza trae su geometría generada por BWReel (`<slug>.geo.ts`); `geo: null` solo se admite con `sinDibujo` declarado en el contenido.
import { ALMACENAMIENTO_CONTENIDO } from "./almacenamiento.contenido.ts";
import { FUENTE_DE_PODER_CONTENIDO } from "./fuente-de-poder.contenido.ts";
import { MEMORIA_RAM_CONTENIDO } from "./memoria-ram.contenido.ts";
import { PROCESADOR_CONTENIDO } from "./procesador.contenido.ts";
import { REFRIGERACION_CONTENIDO } from "./refrigeracion.contenido.ts";
import { TARJETA_GRAFICA_CONTENIDO } from "./tarjeta-grafica.contenido.ts";
import { TARJETA_MADRE_CONTENIDO } from "./tarjeta-madre.contenido.ts";
import { ALMACENAMIENTO_GEO } from "./almacenamiento.geo.ts";
import { FUENTE_DE_PODER_GEO } from "./fuente-de-poder.geo.ts";
import { MEMORIA_RAM_GEO } from "./memoria-ram.geo.ts";
import { PROCESADOR_GEO } from "./procesador.geo.ts";
import { REFRIGERACION_GEO } from "./refrigeracion.geo.ts";
import { TARJETA_GRAFICA_GEO } from "./tarjeta-grafica.geo.ts";
import { TARJETA_MADRE_GEO } from "./tarjeta-madre.geo.ts";
import { PIEZA_SLUGS } from "./types.ts";
import type { EnlaceParte, Entorno, PiezaContenido, PiezaGeo, PiezaSlug } from "./types.ts";

export { SINONIMOS_SLUG } from "./types.ts";

export interface PiezaRegistrada {
  contenido: PiezaContenido<string, string>;
  geo: PiezaGeo<string, string> | null;
}

/** El registro completo; las funciones aceptan uno alternativo solo para poder probarlas con piezas publicadas. */
export type Registro = Readonly<Record<PiezaSlug, PiezaRegistrada>>;

export const PIEZAS: Registro = {
  "tarjeta-madre": { contenido: TARJETA_MADRE_CONTENIDO, geo: TARJETA_MADRE_GEO },
  procesador: { contenido: PROCESADOR_CONTENIDO, geo: PROCESADOR_GEO },
  "memoria-ram": { contenido: MEMORIA_RAM_CONTENIDO, geo: MEMORIA_RAM_GEO },
  almacenamiento: { contenido: ALMACENAMIENTO_CONTENIDO, geo: ALMACENAMIENTO_GEO },
  refrigeracion: { contenido: REFRIGERACION_CONTENIDO, geo: REFRIGERACION_GEO },
  "fuente-de-poder": { contenido: FUENTE_DE_PODER_CONTENIDO, geo: FUENTE_DE_PODER_GEO },
  "tarjeta-grafica": { contenido: TARJETA_GRAFICA_CONTENIDO, geo: TARJETA_GRAFICA_GEO },
};

export function esPiezaSlug(valor: string): valor is PiezaSlug {
  return (PIEZA_SLUGS as readonly string[]).includes(valor);
}

export function piezaVisible(pieza: PiezaRegistrada, entorno: Entorno): boolean {
  return entorno !== "produccion" || pieza.contenido.estado === "publicado";
}

export function piezasVisibles(entorno: Entorno, registro: Registro = PIEZAS): readonly PiezaRegistrada[] {
  return PIEZA_SLUGS.map((slug) => registro[slug]).filter((p) => piezaVisible(p, entorno));
}

export function piezaPorSlug(slug: string, entorno: Entorno, registro: Registro = PIEZAS): PiezaRegistrada | null {
  if (!esPiezaSlug(slug)) return null;
  const pieza = registro[slug];
  return piezaVisible(pieza, entorno) ? pieza : null;
}

/** El índice `/piezas` existe solo con dos o más piezas visibles en ese entorno. */
export function hayIndice(entorno: Entorno, registro: Registro = PIEZAS): boolean {
  return piezasVisibles(entorno, registro).length >= 2;
}

/** Ruta de "Ver a fondo" para un paso del recorrido de /servicios (`PieceId`), o null si la pieza no está visible. */
export function hrefPiezaServicios(pieceId: string, entorno: Entorno, registro: Registro = PIEZAS): string | null {
  const pieza = piezasVisibles(entorno, registro).find((p) => p.contenido.piezaServicios === pieceId);
  return pieza ? `/piezas/${pieza.contenido.slug}` : null;
}

export interface EnlaceResuelto {
  etiqueta: string;
  href: string;
}

/**
 * Resuelve un enlace de parte. Los internos fijos pasan tal cual; los que apuntan a otra pieza solo se pintan si esa pieza es visible
 * en el entorno (en producción un borrador es 404) y, si piden una parte, esa parte existe. Devuelve null cuando no se debe pintar.
 */
export function resolverEnlace(enlace: EnlaceParte, entorno: Entorno, registro: Registro = PIEZAS): EnlaceResuelto | null {
  if ("href" in enlace) return { etiqueta: enlace.etiqueta, href: enlace.href };
  const destino = piezaPorSlug(enlace.pieza, entorno, registro);
  if (!destino) return null;
  if (enlace.parte === undefined) return { etiqueta: enlace.etiqueta, href: `/piezas/${destino.contenido.slug}` };
  if (!Object.prototype.hasOwnProperty.call(destino.contenido.partes, enlace.parte)) return null;
  return { etiqueta: enlace.etiqueta, href: `/piezas/${destino.contenido.slug}#${enlace.parte}` };
}

/** Los enlaces de una parte que sí se pintan en ese entorno, en su orden. */
export function enlacesResueltos(enlaces: readonly EnlaceParte[] | undefined, entorno: Entorno, registro: Registro = PIEZAS): readonly EnlaceResuelto[] {
  const resueltos: EnlaceResuelto[] = [];
  for (const enlace of enlaces ?? []) {
    const resuelto = resolverEnlace(enlace, entorno, registro);
    if (resuelto) resueltos.push(resuelto);
  }
  return resueltos;
}
