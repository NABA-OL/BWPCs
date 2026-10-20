/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-11
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Matemática pura del explorador de piezas (docs/piezas-plan.md §5). Sin imports de valores: la carga `check:logic` con
// `node --experimental-strip-types` y también el componente de cliente.
import type { ParteGeo, Rect, VistaGeo } from "./types.ts";

/** Igual a IDS_RESERVADOS de types.ts (aquí no se pueden importar valores); check-piezas compara ambas listas. */
const IDS_RESERVADOS: readonly string[] = [
  "inicio",
  "partes",
  "lista",
  "nombres",
  "vistas",
  "comparar",
  "tamanos",
  "elegir",
  "errores",
  "fuentes",
  "cotizar",
  "preguntas",
  "casos",
];

/** Igual a PREFIJO_ID_VISTA de types.ts: las anclas `#vista-<id>` no son partes (check-piezas compara ambos valores). */
const PREFIJO_ID_VISTA = "vista-";

const ESCALA_MIN = 1;
const ESCALA_MAX = 3;

const esFinito = (n: number): boolean => Number.isFinite(n);

/** Evita devolver -0 (rompe comparaciones estrictas en pruebas y no aporta nada). */
const sinCeroNegativo = (n: number): number => (n === 0 ? 0 : n);

function parteDe(vista: VistaGeo<string>, id: string): ParteGeo | null {
  // hasOwnProperty: un id como "constructor" no debe resolver a algo heredado del prototipo.
  if (!Object.prototype.hasOwnProperty.call(vista.partes, id)) return null;
  return vista.partes[id] ?? null;
}

function anclaValida(parte: ParteGeo | null): readonly [number, number] | null {
  if (!parte) return null;
  const [ax, ay] = parte.ancla;
  return esFinito(ax) && esFinito(ay) ? [ax, ay] : null;
}

/**
 * Parte cuya ancla está más cerca del punto (x, y), en px del viewBox. Empate → la de menor índice en `orden`.
 * Devuelve null si la más cercana supera `maxDist` o si algún número no es finito.
 */
export function nearestPart(vista: VistaGeo<string>, orden: readonly string[], x: number, y: number, maxDist: number): string | null {
  if (!esFinito(x) || !esFinito(y) || !esFinito(maxDist) || maxDist < 0) return null;
  let mejor: string | null = null;
  let mejorD2 = Infinity;
  for (const id of orden) {
    const ancla = anclaValida(parteDe(vista, id));
    if (!ancla) continue;
    const dx = ancla[0] - x;
    const dy = ancla[1] - y;
    const d2 = dx * dx + dy * dy;
    if (d2 < mejorD2) {
      mejor = id;
      mejorD2 = d2;
    }
  }
  return mejor !== null && mejorD2 <= maxDist * maxDist ? mejor : null;
}

/** Ancla de la parte en % del viewBox (0..100), o null si la parte no existe o el viewBox no es válido. */
export function anchorPct(vista: VistaGeo<string>, id: string): { left: number; top: number } | null {
  const ancla = anclaValida(parteDe(vista, id));
  if (!ancla || !(vista.w > 0) || !(vista.h > 0) || !esFinito(vista.w) || !esFinito(vista.h)) return null;
  return { left: (ancla[0] / vista.w) * 100, top: (ancla[1] / vista.h) * 100 };
}

/** Vecino en `orden` dando la vuelta. Actual desconocido o null → el primero (delta 1) o el último (delta -1). */
export function stepPart(orden: readonly string[], actual: string | null, delta: 1 | -1): string {
  const n = orden.length;
  if (n === 0) return "";
  const i = actual === null ? -1 : orden.indexOf(actual);
  if (i < 0) return delta === 1 ? orden[0] : orden[n - 1];
  return orden[(i + delta + n) % n];
}

/** Id de parte a partir de `location.hash` (con o sin "#"). Rechaza malformados, desconocidos y ids reservados. */
export function partFromHash(hash: string, orden: readonly string[]): string | null {
  const crudo = hash.startsWith("#") ? hash.slice(1) : hash;
  let id: string;
  try {
    id = decodeURIComponent(crudo);
  } catch {
    return null; // secuencia %xx malformada: no es un id nuestro
  }
  if (id === "" || IDS_RESERVADOS.includes(id) || id.startsWith(PREFIJO_ID_VISTA)) return null;
  return orden.includes(id) ? id : null;
}

/* ---------- Multivista (docs/piezas-plan-2.md §2.3): qué partes existen en cada vista y qué queda elegido al cambiar de vista ---------- */

export interface ParteDeclarada {
  id: string;
  orden: number;
  vistas?: readonly string[]; // sin definir = todas
}
export interface VistaIndexada {
  id: string;
  geo: VistaGeo<string>;
}
/** Ids de las partes que existen en cada vista, en orden de lectura (`orden`). El orden de las claves del mapa es el de las vistas. */
export type IndicePartes = ReadonlyMap<string, readonly string[]>;

/** Una parte existe en una vista si la declara (o no restringe vistas) y la geometría de esa vista le da un ancla válida. */
export function existeEnVista(parte: ParteDeclarada, vistaId: string, geo: VistaGeo<string>): boolean {
  if (parte.vistas !== undefined && !parte.vistas.includes(vistaId)) return false;
  return anclaValida(parteDe(geo, parte.id)) !== null;
}

export function indicePartesPorVista(vistas: readonly VistaIndexada[], partes: readonly ParteDeclarada[]): IndicePartes {
  const ordenadas = [...partes].sort((a, b) => a.orden - b.orden);
  const indice = new Map<string, readonly string[]>();
  for (const vista of vistas) indice.set(vista.id, ordenadas.filter((p) => existeEnVista(p, vista.id, vista.geo)).map((p) => p.id));
  return indice;
}

export interface SeleccionExplorador {
  vista: string;
  parte: string | null; // parte elegida que existe en la vista activa
  ausente: string | null; // parte que estaba elegida y no existe en la vista a la que se cambió (se anuncia y se limpia)
}

export const seleccionInicial = (vista: string): SeleccionExplorador => ({ vista, parte: null, ausente: null });

/** Cambia de vista conservando la parte elegida; si esa parte no existe en la vista nueva, se limpia y queda como `ausente`. */
export function cambiarVista(sel: SeleccionExplorador, destino: string, indice: IndicePartes): SeleccionExplorador {
  const ids = indice.get(destino);
  if (!ids) return sel;
  if (sel.parte === null) return { vista: destino, parte: null, ausente: null };
  return ids.includes(sel.parte) ? { vista: destino, parte: sel.parte, ausente: null } : { vista: destino, parte: null, ausente: sel.parte };
}

/** Elige una parte. Si no está en la vista activa se pasa a la primera vista que la tiene; si no está en ninguna, no cambia nada. */
export function elegirParte(sel: SeleccionExplorador, id: string, indice: IndicePartes): SeleccionExplorador {
  if (indice.get(sel.vista)?.includes(id)) return { vista: sel.vista, parte: id, ausente: null };
  for (const [vista, ids] of indice) if (ids.includes(id)) return { vista, parte: id, ausente: null };
  return sel;
}

export const hrefDeVista = (id: string): string => `#${PREFIJO_ID_VISTA}${id}`;

/** Id de vista a partir de `location.hash` (`#vista-ddr5`). Null si está malformado o no es una vista conocida. */
export function vistaFromHash(hash: string, vistaIds: readonly string[]): string | null {
  const crudo = hash.startsWith("#") ? hash.slice(1) : hash;
  let id: string;
  try {
    id = decodeURIComponent(crudo);
  } catch {
    return null;
  }
  if (!id.startsWith(PREFIJO_ID_VISTA)) return null;
  const vista = id.slice(PREFIJO_ID_VISTA.length);
  return vista !== "" && vistaIds.includes(vista) ? vista : null;
}

/** Nueva selección a partir del hash (vista o parte), o null si el hash no es ninguna de las dos. `todas` = ids de todas las partes de la pieza. */
export function seleccionDesdeHash(hash: string, sel: SeleccionExplorador, indice: IndicePartes, todas: readonly string[]): SeleccionExplorador | null {
  const vista = vistaFromHash(hash, [...indice.keys()]);
  if (vista !== null) return cambiarVista(sel, vista, indice);
  const parte = partFromHash(hash, todas);
  if (parte === null) return null;
  const nueva = elegirParte(sel, parte, indice);
  return nueva === sel ? null : nueva;
}

/**
 * Transformación `translate(tx, ty) scale(scale)` (origen 0,0, en px del viewBox) que lleva el recuadro `foco` al centro de la
 * figura w×h con la mayor escala que lo deja completo, entre 1 y 3. Nunca deja bordes vacíos. Foco completo o degenerado → identidad.
 */
export function focusTransform(foco: Rect, w: number, h: number): { scale: number; tx: number; ty: number } {
  const identidad = { scale: 1, tx: 0, ty: 0 };
  const valido = [foco.x, foco.y, foco.w, foco.h, w, h].every(esFinito) && foco.w > 0 && foco.h > 0 && w > 0 && h > 0;
  if (!valido) return identidad;
  const scale = Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, Math.min(w / foco.w, h / foco.h)));
  const cx = foco.x + foco.w / 2;
  const cy = foco.y + foco.h / 2;
  // Centrar el foco y luego recortar el desplazamiento para que la figura ampliada siga cubriendo todo el cuadro.
  const tx = Math.min(0, Math.max(w - scale * w, w / 2 - scale * cx));
  const ty = Math.min(0, Math.max(h - scale * h, h / 2 - scale * cy));
  return { scale, tx: sinCeroNegativo(tx), ty: sinCeroNegativo(ty) };
}

/**
 * Separación mínima, en px CSS, entre dos anclas cuando la figura mide `anchoPx` de ancho (escala anchoPx / vista.w).
 * Infinity con menos de 2 anclas; 0 si el ancho o el viewBox no son válidos (así el control de separación falla en vez de pasar).
 */
export function minAnchorSpacing(vista: VistaGeo<string>, anchoPx: number): number {
  if (!esFinito(anchoPx) || anchoPx <= 0 || !esFinito(vista.w) || vista.w <= 0) return 0;
  const anclas: (readonly [number, number])[] = [];
  for (const id of Object.keys(vista.partes)) {
    const ancla = anclaValida(parteDe(vista, id));
    if (ancla) anclas.push(ancla);
  }
  if (anclas.length < 2) return Infinity;
  let minD2 = Infinity;
  for (let i = 0; i < anclas.length; i++) {
    for (let j = i + 1; j < anclas.length; j++) {
      const dx = anclas[i][0] - anclas[j][0];
      const dy = anclas[i][1] - anclas[j][1];
      minD2 = Math.min(minD2, dx * dx + dy * dy);
    }
  }
  return (Math.sqrt(minD2) * anchoPx) / vista.w;
}
