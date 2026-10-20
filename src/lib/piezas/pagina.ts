/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Lógica pura de la página de una pieza (docs/piezas-plan-2.md §2.3): qué bloques se pintan, el menú lateral, la fecha de revisión y las
// fuentes generales. Vive aparte de `page.tsx` para poder probarla en `check:logic`. Imports relativos con extensión .ts.
import type { BloqueId, Fuente, Hecho, PiezaContenido } from "./types.ts";

type Contenido = PiezaContenido<string, string>;

export interface ItemNavPieza {
  id: string;
  label: string;
}

/** Ancla y rótulo corto de cada bloque en el menú lateral. */
export const NAV_POR_BLOQUE: Readonly<Record<BloqueId, ItemNavPieza>> = {
  nombres: { id: "nombres", label: "Lee el nombre" },
  partes: { id: "partes", label: "Explorar" },
  lista: { id: "lista", label: "Las partes" },
  vistas: { id: "vistas", label: "Versiones" },
  comparar: { id: "comparar", label: "Comparar" },
  tamanos: { id: "tamanos", label: "Tamaños" },
  elegir: { id: "elegir", label: "Al elegir" },
  errores: { id: "errores", label: "Errores" },
  preguntas: { id: "preguntas", label: "Preguntas" },
};

const ITEM_INICIO: ItemNavPieza = { id: "inicio", label: "Inicio" };
const ITEM_COTIZAR: ItemNavPieza = { id: "cotizar", label: "Cotizar" };

/** ¿El contenido trae lo que ese bloque necesita para pintarse? (el mismo criterio que usa `check:logic` para vigilar `bloques`) */
export function bloqueTieneContenido(contenido: Contenido, bloque: BloqueId): boolean {
  switch (bloque) {
    case "partes":
    case "lista":
      return true;
    case "nombres":
      return contenido.decodificador !== undefined;
    case "vistas":
      return contenido.vistas.length >= 2;
    case "comparar":
      return (contenido.comparaciones?.length ?? 0) > 0 && (contenido.comparaciones ?? []).every((c) => c.filas.length > 0);
    case "tamanos":
      return (contenido.factoresForma?.length ?? 0) > 0 && contenido.secciones.some((s) => s.id === "tamanos");
    case "elegir":
    case "errores":
      return contenido.secciones.some((s) => s.id === bloque);
    case "preguntas":
      return (contenido.faq?.length ?? 0) > 0;
  }
}

/**
 * Bloques que la página pinta, en el orden declarado por la pieza. Sin dibujo (`conDibujo` false) el bloque «partes» no monta el
 * explorador: solo queda la lista de partes sin figura, así que no aparece en el menú.
 */
export function bloquesVisibles(contenido: Contenido, conDibujo: boolean): readonly BloqueId[] {
  return contenido.bloques.filter((b) => bloqueTieneContenido(contenido, b) && (b !== "partes" || conDibujo));
}

/** Menú lateral: «Inicio», una entrada por bloque presente (en el orden de la página) y «Cotizar». */
export function navDePieza(contenido: Contenido, conDibujo: boolean): readonly ItemNavPieza[] {
  return [ITEM_INICIO, ...bloquesVisibles(contenido, conDibujo).map((b) => NAV_POR_BLOQUE[b]), ITEM_COTIZAR];
}

/** Todos los hechos de la pieza (partes, opciones, secciones, tamaños, casos y comparaciones), sin repetir el mismo objeto compartido. */
export function todosLosHechos(contenido: Contenido): readonly Hecho[] {
  const lista: Hecho[] = [];
  for (const parte of Object.values(contenido.partes)) {
    lista.push(...parte.hechos);
    for (const opcion of parte.opciones?.items ?? []) lista.push(...opcion.hechos);
  }
  for (const seccion of contenido.secciones) lista.push(...(seccion.hechos ?? []));
  for (const factor of contenido.factoresForma ?? []) lista.push(factor.hecho);
  for (const caso of contenido.casos ?? []) lista.push(...(caso.hechos ?? []));
  for (const comparacion of contenido.comparaciones ?? []) {
    for (const fila of comparacion.filas) {
      for (const celda of Object.values(fila.valores)) if (celda.tipo === "hecho") lista.push(celda.hecho);
    }
  }
  return [...new Set(lista)];
}

/** Fecha (AAAA-MM-DD) de la verificación más reciente; si ningún hecho está verificado, la de la última actualización. */
export function fechaRevision(contenido: Contenido): string {
  const fechas = todosLosHechos(contenido)
    .map((h) => h.verificadoEn)
    .filter((f): f is string => f !== null);
  return fechas.length > 0 ? fechas.reduce((a, b) => (a > b ? a : b)) : contenido.actualizadoEn;
}

/**
 * Fuentes únicas (por URL) de los hechos que NO viven en una parte: secciones, tamaños, casos y comparaciones.
 * Las de cada parte ya van en su propia sección.
 */
export function fuentesGenerales(contenido: Contenido): readonly Fuente[] {
  const hechos: Hecho[] = [...contenido.secciones.flatMap((s) => s.hechos ?? []), ...(contenido.factoresForma ?? []).map((f) => f.hecho)];
  for (const caso of contenido.casos ?? []) hechos.push(...(caso.hechos ?? []));
  for (const comparacion of contenido.comparaciones ?? []) {
    for (const fila of comparacion.filas) {
      for (const celda of Object.values(fila.valores)) if (celda.tipo === "hecho") hechos.push(celda.hecho);
    }
  }
  const vistas = new Set<string>();
  const unicas: Fuente[] = [];
  for (const hecho of hechos) {
    for (const fuente of hecho.fuentes) {
      if (vistas.has(fuente.url)) continue;
      vistas.add(fuente.url);
      unicas.push(fuente);
    }
  }
  return unicas;
}
