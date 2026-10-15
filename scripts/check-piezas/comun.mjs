/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Utilidades compartidas de las comprobaciones de "Piezas a fondo" (check-piezas.mjs partido por tema, docs/piezas-plan-2.md §2.3).
export const RAIZ = new URL("../..", import.meta.url).pathname;
export const HOY = "2026-10-11";
export const clonar = (valor) => structuredClone(valor);
export const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const FECHA = /^\d{4}-\d{2}-\d{2}$/;

/** Todos los hechos del contenido (partes, opciones, secciones, factores de forma, casos y comparaciones), sin repetir el mismo objeto. */
export function hechosDe(contenido) {
  const lista = [];
  for (const parte of Object.values(contenido.partes)) {
    lista.push(...parte.hechos);
    for (const opcion of parte.opciones?.items ?? []) lista.push(...opcion.hechos);
  }
  for (const seccion of contenido.secciones) lista.push(...(seccion.hechos ?? []));
  for (const factor of contenido.factoresForma ?? []) lista.push(factor.hecho);
  for (const caso of contenido.casos ?? []) lista.push(...(caso.hechos ?? []));
  for (const comparacion of contenido.comparaciones ?? []) {
    for (const fila of comparacion.filas) for (const celda of Object.values(fila.valores)) if (celda.tipo === "hecho") lista.push(celda.hecho);
  }
  return [...new Set(lista)];
}

/** Todos los criterios de B & W de una pieza (sueltos, por vista y en celdas de comparación). */
export function criteriosDe(contenido) {
  const lista = [...(contenido.criterios ?? [])];
  for (const vista of contenido.vistas) lista.push(...(vista.aFavor ?? []), ...(vista.aConsiderar ?? []));
  for (const comparacion of contenido.comparaciones ?? []) {
    for (const fila of comparacion.filas) for (const celda of Object.values(fila.valores)) if (celda.tipo === "criterio") lista.push(celda.criterio);
  }
  return lista;
}

/** Toda la prosa visible (sin cifras de los `Hecho`, que sí pueden llevarlas), con una etiqueta de dónde sale. */
export function prosaDe(contenido) {
  const prosa = [];
  const add = (donde, texto) => prosa.push([donde, texto]);
  contenido.intro.forEach((t, i) => add(`intro.${i}`, t));
  for (const [id, parte] of Object.entries(contenido.partes)) {
    add(`${id}.resumen`, parte.resumen);
    add(`${id}.queHace`, parte.queHace);
    parte.alElegir.forEach((t, i) => add(`${id}.alElegir.${i}`, t));
    for (const opcion of parte.opciones?.items ?? []) add(`${id}.opcion.${opcion.id}`, opcion.resumen);
  }
  for (const seccion of contenido.secciones) {
    seccion.parrafos.forEach((t, i) => add(`seccion.${seccion.id}.p${i}`, t));
    (seccion.vinetas ?? []).forEach((t, i) => add(`seccion.${seccion.id}.v${i}`, t));
  }
  for (const factor of contenido.factoresForma ?? []) {
    add(`factor.${factor.id}.resumen`, factor.resumen);
    add(`factor.${factor.id}.paraQuien`, factor.paraQuien);
  }
  for (const vista of contenido.vistas) {
    add(`vista.${vista.id}.resumen`, vista.resumen);
    add(`vista.${vista.id}.figura`, vista.etiquetaFigura);
    for (const [parteId, nota] of Object.entries(vista.notasPorParte ?? {})) add(`vista.${vista.id}.nota.${parteId}`, nota);
  }
  for (const caso of contenido.casos ?? []) add(`caso.${caso.id}`, caso.texto);
  for (const criterio of criteriosDe(contenido)) add(`criterio.${criterio.id}`, criterio.texto);
  for (const comparacion of contenido.comparaciones ?? []) {
    add(`comparacion.${comparacion.id}.titulo`, comparacion.titulo);
    for (const fila of comparacion.filas) {
      add(`comparacion.${comparacion.id}.fila.${fila.etiqueta}`, fila.etiqueta);
      for (const [col, celda] of Object.entries(fila.valores)) if (celda.tipo === "texto") add(`comparacion.${comparacion.id}.${fila.etiqueta}.${col}`, celda.texto);
    }
  }
  (contenido.faq ?? []).forEach((f, i) => {
    add(`faq.${i}.q`, f.q);
    add(`faq.${i}.a`, f.a);
  });
  add("cta.texto", contenido.cta.texto);
  return prosa;
}
