/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-11
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Puerta de publicación de "Piezas a fondo" (docs/piezas-plan.md §8.1 y docs/piezas-plan-2.md §4). Pura: la usa `check:logic`, no la página.
// Un borrador nunca se bloquea aquí; solo `estado: "publicado"` exige hechos verificados con fuentes https consultadas, casos y criterios
// aprobados por el dueño, y un dibujo (o la declaración explícita `sinDibujo: true`).
import type { Aprobacion, Caso, Celda, Criterio, Fuente, Hecho, PiezaContenido } from "./types.ts";

const MESES_CADUCIDAD_POR_DEFECTO = 12;
const FORMATO_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Valida AAAA-MM-DD como fecha real del calendario (rechaza 2026-02-31). Devuelve la fecha en UTC o null. */
function fechaValida(texto: string | null | undefined): Date | null {
  if (typeof texto !== "string") return null;
  const m = FORMATO_FECHA.exec(texto);
  if (!m) return null;
  const [anio, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  const coincide = fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia;
  return coincide ? fecha : null;
}

interface HechoUbicado {
  donde: string;
  hecho: Hecho;
}
interface CriterioUbicado {
  donde: string;
  criterio: Criterio;
}

function hechoDeCelda(celda: Celda): Hecho | null {
  return celda.tipo === "hecho" ? celda.hecho : null;
}
function criterioDeCelda(celda: Celda): Criterio | null {
  return celda.tipo === "criterio" ? celda.criterio : null;
}

/**
 * Todos los hechos de la pieza con una etiqueta de dónde viven (partes, opciones, secciones, tamaños, casos y comparaciones).
 * Un hecho compartido (mismo id) aparece una sola vez: se valida donde se encuentra primero.
 */
function hechosDe(contenido: PiezaContenido<string, string>): readonly HechoUbicado[] {
  const lista: HechoUbicado[] = [];
  for (const [parteId, parte] of Object.entries(contenido.partes)) {
    for (const hecho of parte.hechos) lista.push({ donde: parteId, hecho });
    for (const opcion of parte.opciones?.items ?? []) {
      for (const hecho of opcion.hechos) lista.push({ donde: `${parteId}/${opcion.id}`, hecho });
    }
  }
  for (const seccion of contenido.secciones) {
    for (const hecho of seccion.hechos ?? []) lista.push({ donde: `seccion ${seccion.id}`, hecho });
  }
  for (const factor of contenido.factoresForma ?? []) lista.push({ donde: `factor ${factor.id}`, hecho: factor.hecho });
  for (const caso of contenido.casos ?? []) {
    for (const hecho of caso.hechos ?? []) lista.push({ donde: `caso ${caso.id}`, hecho });
  }
  for (const comparacion of contenido.comparaciones ?? []) {
    for (const fila of comparacion.filas) {
      for (const celda of Object.values(fila.valores)) {
        const hecho = hechoDeCelda(celda);
        if (hecho) lista.push({ donde: `comparacion ${comparacion.id} / ${fila.etiqueta}`, hecho });
      }
    }
  }
  const vistos = new Set<string>();
  return lista.filter(({ hecho }) => (vistos.has(hecho.id) ? false : (vistos.add(hecho.id), true)));
}

/** Todos los criterios de B & W de la pieza (sueltos, por vista y en celdas de comparación). */
function criteriosDe(contenido: PiezaContenido<string, string>): readonly CriterioUbicado[] {
  const lista: CriterioUbicado[] = [];
  for (const criterio of contenido.criterios ?? []) lista.push({ donde: "criterios", criterio });
  for (const vista of contenido.vistas) {
    for (const criterio of vista.aFavor ?? []) lista.push({ donde: `vista ${vista.id} / a favor`, criterio });
    for (const criterio of vista.aConsiderar ?? []) lista.push({ donde: `vista ${vista.id} / a considerar`, criterio });
  }
  for (const comparacion of contenido.comparaciones ?? []) {
    for (const fila of comparacion.filas) {
      for (const celda of Object.values(fila.valores)) {
        const criterio = criterioDeCelda(celda);
        if (criterio) lista.push({ donde: `comparacion ${comparacion.id} / ${fila.etiqueta}`, criterio });
      }
    }
  }
  return lista;
}

function problemasDeFuente(fuente: Fuente, hoy: Date): string[] {
  const problemas: string[] = [];
  if (!fuente.url.startsWith("https://")) problemas.push(`fuente sin https: "${fuente.url}"`);
  if (!fuente.consultadoEn) problemas.push(`fuente sin consultadoEn: "${fuente.url}"`);
  else {
    const consultado = fechaValida(fuente.consultadoEn);
    if (!consultado) problemas.push(`consultadoEn inválido (AAAA-MM-DD): "${fuente.consultadoEn}"`);
    else if (consultado.getTime() > hoy.getTime()) problemas.push(`consultadoEn en el futuro: "${fuente.consultadoEn}"`);
  }
  return problemas;
}

function problemasDeHecho(hecho: Hecho, hoy: Date): string[] {
  const problemas: string[] = [];
  const verificado = fechaValida(hecho.verificadoEn);
  if (hecho.verificadoEn === null || hecho.verificadoEn === "") problemas.push("sin verificar (verificadoEn vacío)");
  else if (!verificado) problemas.push(`verificadoEn inválido (AAAA-MM-DD): "${hecho.verificadoEn}"`);
  else if (verificado.getTime() > hoy.getTime()) problemas.push(`verificadoEn en el futuro: "${hecho.verificadoEn}"`);
  if (!hecho.verificadoPor || hecho.verificadoPor.trim() === "") problemas.push("sin verificadoPor");
  const primarias = hecho.fuentes.filter((f) => f.url.startsWith("https://") && f.consultadoEn);
  if (hecho.fuentes.length === 0) problemas.push("sin fuentes");
  else if (primarias.length === 0) problemas.push("ninguna fuente https con consultadoEn");
  for (const fuente of hecho.fuentes) problemas.push(...problemasDeFuente(fuente, hoy));
  return problemas;
}

/** Aprobación del dueño de un caso o un criterio: fecha real, no futura, y quién aprobó. */
function problemasDeAprobacion(aprobacion: Aprobacion, hoy: Date): string[] {
  const problemas: string[] = [];
  const aprobado = fechaValida(aprobacion.aprobadoEn);
  if (aprobacion.aprobadoEn === null || aprobacion.aprobadoEn === "") problemas.push("sin aprobar (aprobadoEn vacío)");
  else if (!aprobado) problemas.push(`aprobadoEn inválido (AAAA-MM-DD): "${aprobacion.aprobadoEn}"`);
  else if (aprobado.getTime() > hoy.getTime()) problemas.push(`aprobadoEn en el futuro: "${aprobacion.aprobadoEn}"`);
  if (!aprobacion.aprobadoPor || aprobacion.aprobadoPor.trim() === "") problemas.push("sin aprobadoPor");
  return problemas;
}

/** Un caso «Nos ha pasado» no lleva fuente: por eso debe estar marcado como confirmado por el dueño, además de aprobado. */
function problemasDeCaso(caso: Caso, hoy: Date): string[] {
  const problemas = problemasDeAprobacion(caso, hoy);
  if (caso.tipo === "vivido" && caso.confirmadoPorDueno !== true) problemas.push("caso vivido sin confirmadoPorDueno");
  return problemas;
}

/**
 * Problemas que bloquean la publicación. Vacío = publicable (o no está en estado "publicado"). `hoy` = AAAA-MM-DD.
 * `tieneGeo`: la pieza tiene geometría generada (el registro no es `geo: null`); sin dibujo solo se publica con `sinDibujo: true`.
 */
export function problemasDePublicacion(contenido: PiezaContenido<string, string>, hoy: string, tieneGeo: boolean): readonly string[] {
  if (contenido.estado !== "publicado") return [];
  const fechaHoy = fechaValida(hoy);
  if (!fechaHoy) return [`fecha de referencia inválida: "${hoy}"`];
  const problemas: string[] = [];
  for (const { donde, hecho } of hechosDe(contenido)) {
    for (const p of problemasDeHecho(hecho, fechaHoy)) problemas.push(`${donde} · ${hecho.id}: ${p}`);
  }
  for (const caso of contenido.casos ?? []) {
    for (const p of problemasDeCaso(caso, fechaHoy)) problemas.push(`caso ${caso.id}: ${p}`);
  }
  for (const { donde, criterio } of criteriosDe(contenido)) {
    for (const p of problemasDeAprobacion(criterio, fechaHoy)) problemas.push(`${donde} · ${criterio.id}: ${p}`);
  }
  if (!tieneGeo && contenido.sinDibujo !== true) problemas.push("sin dibujo (geo null) y la pieza no declara sinDibujo: true");
  return problemas;
}

/** Avisos (no fallos): hechos publicados cuya verificación superó su plazo (`revisarCadaMeses`, 12 por defecto). */
export function advertenciasDePublicacion(contenido: PiezaContenido<string, string>, hoy: string): readonly string[] {
  if (contenido.estado !== "publicado") return [];
  const fechaHoy = fechaValida(hoy);
  if (!fechaHoy) return [];
  const avisos: string[] = [];
  for (const { donde, hecho } of hechosDe(contenido)) {
    const meses = hecho.revisarCadaMeses ?? MESES_CADUCIDAD_POR_DEFECTO;
    const limite = new Date(fechaHoy.getTime());
    limite.setUTCMonth(limite.getUTCMonth() - meses);
    const verificado = fechaValida(hecho.verificadoEn);
    if (verificado && verificado.getTime() < limite.getTime()) {
      avisos.push(`${donde} · ${hecho.id}: verificado el ${hecho.verificadoEn}, revisión pendiente (cada ${meses} meses)`);
    }
  }
  return avisos;
}
