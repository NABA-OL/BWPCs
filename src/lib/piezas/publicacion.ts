/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-11
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Puerta de publicación de "Piezas a fondo" (docs/piezas-plan.md §8.1). Pura: la usa `check:logic`, no la página.
// Un borrador nunca se bloquea aquí; solo `estado: "publicado"` exige hechos verificados y fuentes https consultadas.
import type { Fuente, Hecho, PiezaContenido } from "./types.ts";

const MESES_CADUCIDAD = 12;
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

/** Todos los hechos de la pieza con una etiqueta de dónde viven (partes, opciones, secciones y factores de forma). */
function hechosDe(contenido: PiezaContenido<string>): readonly { donde: string; hecho: Hecho }[] {
  const lista: { donde: string; hecho: Hecho }[] = [];
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

/** Problemas que bloquean la publicación. Vacío = publicable (o no está en estado "publicado"). `hoy` = AAAA-MM-DD. */
export function problemasDePublicacion(contenido: PiezaContenido<string>, hoy: string): readonly string[] {
  if (contenido.estado !== "publicado") return [];
  const fechaHoy = fechaValida(hoy);
  if (!fechaHoy) return [`fecha de referencia inválida: "${hoy}"`];
  const problemas: string[] = [];
  for (const { donde, hecho } of hechosDe(contenido)) {
    for (const p of problemasDeHecho(hecho, fechaHoy)) problemas.push(`${donde} · ${hecho.id}: ${p}`);
  }
  return problemas;
}

/** Avisos (no fallos): hechos publicados cuya verificación tiene más de 12 meses. */
export function advertenciasDePublicacion(contenido: PiezaContenido<string>, hoy: string): readonly string[] {
  if (contenido.estado !== "publicado") return [];
  const fechaHoy = fechaValida(hoy);
  if (!fechaHoy) return [];
  const limite = new Date(fechaHoy.getTime());
  limite.setUTCMonth(limite.getUTCMonth() - MESES_CADUCIDAD);
  const avisos: string[] = [];
  for (const { donde, hecho } of hechosDe(contenido)) {
    const verificado = fechaValida(hecho.verificadoEn);
    if (verificado && verificado.getTime() < limite.getTime()) {
      avisos.push(`${donde} · ${hecho.id}: verificado el ${hecho.verificadoEn}, revisión anual pendiente`);
    }
  }
  return avisos;
}
