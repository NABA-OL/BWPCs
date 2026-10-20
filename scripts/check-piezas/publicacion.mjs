/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Puerta de publicación (lib/piezas/publicacion.ts): hechos, casos, criterios, dibujo y plazos de revisión.
import assert from "node:assert/strict";
import { advertenciasDePublicacion, problemasDePublicacion } from "../../src/lib/piezas/publicacion.ts";
import { TARJETA_MADRE_CONTENIDO as CONTENIDO } from "../../src/lib/piezas/tarjeta-madre.contenido.ts";
import { HOY, clonar, criteriosDe, hechosDe } from "./comun.mjs";

// ---------------------------------------------------------------- puerta de publicación
{
  // Estas pruebas no dependen del estado real del contenido: parten de clones con el estado forzado.
  const borrador = { ...clonar(CONTENIDO), estado: "borrador" };
  assert.deepEqual(problemasDePublicacion(borrador, HOY, true), [], "un borrador no se bloquea");
  assert.deepEqual(advertenciasDePublicacion(borrador, HOY), [], "un borrador no avisa");
  const revision = { ...clonar(CONTENIDO), estado: "revision" };
  assert.deepEqual(problemasDePublicacion(revision, HOY, true), [], "revisión tampoco se bloquea");

  const publicado = () => ({ ...clonar(CONTENIDO), estado: "publicado" });
  // Después de `--aplicar` el contenido real ya trae hechos verificados y casos aprobados: la prueba de "sin verificar" usa un clon al que se le quita todo.
  const sinNada = (pieza) => {
    for (const hecho of hechosDe(pieza)) Object.assign(hecho, { verificadoEn: null, verificadoPor: null });
    for (const caso of pieza.casos ?? []) Object.assign(caso, { aprobadoEn: null, aprobadoPor: null });
    for (const criterio of criteriosDe(pieza)) Object.assign(criterio, { aprobadoEn: null, aprobadoPor: null });
    return pieza;
  };
  const sinVerificar = problemasDePublicacion(sinNada(publicado()), HOY, true);
  assert.ok(sinVerificar.length > 0, "publicado con hechos sin verificar → problemas");
  const numeroHechos = hechosDe(CONTENIDO).length;
  assert.ok(sinVerificar.length >= numeroHechos, "al menos un problema por hecho sin verificar");

  const verificarTodo = (pieza, verificadoEn = "2026-10-01") => {
    for (const hecho of hechosDe(pieza)) {
      hecho.verificadoEn = verificadoEn;
      hecho.verificadoPor = "NAB";
      delete hecho.revisarCadaMeses; // estas pruebas miden el plazo por defecto (12 meses); el plazo propio se prueba aparte
      hecho.fuentes = hecho.fuentes.map((f) => ({ ...f, consultadoEn: "2026-10-01", url: f.url.startsWith("https://") ? f.url : "https://example.com/doc" }));
    }
    for (const caso of pieza.casos ?? []) Object.assign(caso, { aprobadoEn: "2026-10-01", aprobadoPor: "NAB" });
    for (const criterio of criteriosDe(pieza)) Object.assign(criterio, { aprobadoEn: "2026-10-01", aprobadoPor: "NAB" });
    return pieza;
  };
  assert.deepEqual(problemasDePublicacion(verificarTodo(publicado()), HOY, true), [], "todo verificado → publicable");
  assert.deepEqual(advertenciasDePublicacion(verificarTodo(publicado()), HOY), [], "verificado hace días: sin advertencias");

  // Cada regla por separado, sobre un clon verificado.
  const conCambio = (cambio) => {
    const pieza = verificarTodo(publicado());
    cambio(hechosDe(pieza)[0]);
    return problemasDePublicacion(pieza, HOY, true);
  };
  assert.ok(conCambio((h) => (h.verificadoEn = null)).length > 0, "verificadoEn null");
  assert.ok(conCambio((h) => (h.verificadoEn = "")).length > 0, "verificadoEn vacío");
  assert.ok(conCambio((h) => (h.verificadoEn = "11/10/2026")).length > 0, "verificadoEn con formato inválido");
  assert.ok(conCambio((h) => (h.verificadoEn = "2026-02-31")).length > 0, "verificadoEn con fecha imposible");
  assert.ok(conCambio((h) => (h.verificadoEn = "2026-10-12")).length > 0, "verificadoEn futuro (mañana)");
  assert.ok(conCambio((h) => (h.verificadoEn = "2099-01-01")).length > 0, "verificadoEn futuro (lejano)");
  assert.deepEqual(conCambio((h) => (h.verificadoEn = HOY)), [], "verificado hoy es válido");
  assert.ok(conCambio((h) => (h.verificadoPor = null)).length > 0, "verificadoPor null");
  assert.ok(conCambio((h) => (h.verificadoPor = "  ")).length > 0, "verificadoPor en blanco");
  assert.ok(conCambio((h) => (h.fuentes = [])).length > 0, "sin fuentes");
  assert.ok(conCambio((h) => (h.fuentes = [{ ...h.fuentes[0], consultadoEn: "" }])).length > 0, "consultadoEn vacío");
  assert.ok(conCambio((h) => (h.fuentes = [{ ...h.fuentes[0], url: "http://example.com" }])).length > 0, "fuente sin https");
  assert.ok(conCambio((h) => (h.fuentes = [{ ...h.fuentes[0], consultadoEn: "2099-01-01" }])).length > 0, "consultadoEn futuro");
  assert.ok(conCambio((h) => (h.fuentes = [{ ...h.fuentes[0], consultadoEn: "ayer" }])).length > 0, "consultadoEn con formato inválido");

  // La puerta recorre los cuatro lugares donde viven los hechos.
  const piezaConUno = (lugar) => {
    const pieza = verificarTodo(publicado());
    const objetivo = lugar(pieza);
    objetivo.verificadoEn = null;
    return problemasDePublicacion(pieza, HOY, true);
  };
  assert.equal(piezaConUno((p) => p.partes.socket.hechos[0]).length > 0, true, "hecho de una parte");
  const conOpciones = Object.values(CONTENIDO.partes).find((p) => (p.opciones?.items ?? []).some((o) => o.hechos.length > 0));
  assert.ok(conOpciones, "el contenido real trae opciones con hechos");
  const idParteOpciones = Object.keys(CONTENIDO.partes).find((id) => CONTENIDO.partes[id] === conOpciones);
  assert.equal(piezaConUno((p) => p.partes[idParteOpciones].opciones.items.find((o) => o.hechos.length > 0).hechos[0]).length > 0, true, "hecho de una opción");
  const idSeccion = CONTENIDO.secciones.findIndex((s) => (s.hechos ?? []).length > 0);
  if (idSeccion >= 0) assert.equal(piezaConUno((p) => p.secciones[idSeccion].hechos[0]).length > 0, true, "hecho de una sección");
  assert.ok((CONTENIDO.factoresForma ?? []).length > 0, "el contenido real trae factoresForma");
  assert.equal(piezaConUno((p) => p.factoresForma[0].hecho).length > 0, true, "hecho de un factor de forma");

  // Advertencia a 12 meses: avisa solo si la verificación es anterior, sin fallar la puerta.
  const vieja = verificarTodo(publicado(), "2025-10-10");
  assert.deepEqual(problemasDePublicacion(vieja, HOY, true), [], "verificación vieja no es un fallo");
  assert.equal(advertenciasDePublicacion(vieja, HOY).length, numeroHechos, "una advertencia por hecho de más de 12 meses");
  assert.deepEqual(advertenciasDePublicacion(verificarTodo(publicado(), "2025-10-11"), HOY), [], "exactamente 12 meses: aún no avisa");
  assert.deepEqual(advertenciasDePublicacion(verificarTodo(publicado(), "2026-01-01"), HOY), [], "verificado hace 9 meses");
  assert.ok(advertenciasDePublicacion(vieja, "2026-10-11").every((a) => a.includes("2025-10-10")));

  // Casos «Nos ha pasado» / «Puede pasar» y criterios de B & W: el dueño los aprueba; sin fuente, pero con firma.
  const conPieza = (cambio) => {
    const pieza = verificarTodo(publicado());
    cambio(pieza);
    return problemasDePublicacion(pieza, HOY, true);
  };
  assert.ok((CONTENIDO.casos ?? []).length > 0, "el contenido real trae casos");
  assert.ok(conPieza((p) => (p.casos[0].aprobadoEn = null)).length > 0, "caso sin aprobar");
  assert.ok(conPieza((p) => (p.casos[0].aprobadoPor = null)).length > 0, "caso sin aprobadoPor");
  assert.ok(conPieza((p) => (p.casos[0].aprobadoPor = "  ")).length > 0, "caso con aprobadoPor en blanco");
  assert.ok(conPieza((p) => (p.casos[0].aprobadoEn = "2099-01-01")).length > 0, "caso aprobado en el futuro");
  assert.ok(conPieza((p) => (p.casos[0].aprobadoEn = "10/10/2026")).length > 0, "caso con fecha inválida");
  const idxVivido = CONTENIDO.casos.findIndex((c) => c.tipo === "vivido");
  const idxPuedePasar = CONTENIDO.casos.findIndex((c) => c.tipo === "puede-pasar");
  assert.ok(conPieza((p) => (p.casos[idxVivido].confirmadoPorDueno = false)).length > 0, "un «Nos ha pasado» exige confirmadoPorDueno");
  assert.ok(conPieza((p) => delete p.casos[idxVivido].confirmadoPorDueno).length > 0, "un «Nos ha pasado» sin la marca");
  assert.deepEqual(conPieza((p) => delete p.casos[idxPuedePasar].confirmadoPorDueno), [], "un «Puede pasar» no necesita la marca");
  assert.ok(conPieza((p) => (p.casos[0].hechos = [{ id: "caso-hecho", texto: "x", fuentes: [], verificadoEn: null, verificadoPor: null }])).length > 0, "el hecho de un caso también se verifica");
  const criterioNuevo = (aprobado) => ({ id: "criterio-de-prueba", texto: "Una opinión de taller.", aprobadoEn: aprobado ? "2026-10-01" : null, aprobadoPor: aprobado ? "NAB" : null });
  assert.ok(conPieza((p) => (p.vistas[0].aFavor = [criterioNuevo(false)])).length > 0, "criterio «a favor» sin aprobar");
  assert.ok(conPieza((p) => (p.vistas[0].aConsiderar = [criterioNuevo(false)])).length > 0, "criterio «a considerar» sin aprobar");
  assert.ok(conPieza((p) => (p.criterios = [criterioNuevo(false)])).length > 0, "criterio suelto sin aprobar");
  assert.deepEqual(conPieza((p) => (p.criterios = [criterioNuevo(true)])), [], "criterio aprobado → publicable");
  const celdaCriterio = (aprobado) => ({ id: "c", titulo: "t", columnas: ["unica"], filas: [{ etiqueta: "f", valores: { unica: { tipo: "criterio", criterio: criterioNuevo(aprobado) } } }] });
  assert.ok(conPieza((p) => (p.comparaciones = [celdaCriterio(false)])).length > 0, "criterio en una celda de comparación sin aprobar");
  assert.deepEqual(conPieza((p) => (p.comparaciones = [celdaCriterio(true)])), [], "criterio aprobado en una celda");
  const celdaHecho = { id: "c", titulo: "t", columnas: ["unica"], filas: [{ etiqueta: "f", valores: { unica: { tipo: "hecho", hecho: { id: "hecho-en-celda", texto: "x", fuentes: [], verificadoEn: null, verificadoPor: null } } } }] };
  assert.ok(conPieza((p) => (p.comparaciones = [celdaHecho])).length > 0, "el hecho de una celda de comparación también se verifica");

  // Dibujo: una pieza sin geometría solo se publica si declara `sinDibujo: true`.
  const completa = verificarTodo(publicado());
  assert.deepEqual(problemasDePublicacion(completa, HOY, true), [], "con dibujo → publicable");
  assert.ok(problemasDePublicacion(completa, HOY, false).length > 0, "geo null sin sinDibujo → bloquea");
  assert.ok(problemasDePublicacion({ ...completa, sinDibujo: false }, HOY, false).length > 0, "sinDibujo false tampoco");
  assert.deepEqual(problemasDePublicacion({ ...completa, sinDibujo: true }, HOY, false), [], "sinDibujo: true → publicable sin geometría");
  assert.deepEqual(problemasDePublicacion({ ...clonar(CONTENIDO), estado: "borrador" }, HOY, false), [], "un borrador sin dibujo no se bloquea");

  // Plazo de revisión por hecho (revisarCadaMeses): 6 volátil, 12 por defecto, 24 medidas.
  const conPlazo = (meses, verificadoEn) => {
    const pieza = verificarTodo(publicado(), "2026-10-01");
    const hecho = hechosDe(pieza)[0];
    hecho.verificadoEn = verificadoEn;
    if (meses === undefined) delete hecho.revisarCadaMeses;
    else hecho.revisarCadaMeses = meses;
    return advertenciasDePublicacion(pieza, HOY).filter((a) => a.includes(hecho.id));
  };
  assert.equal(conPlazo(6, "2026-03-01").length, 1, "plazo de 6 meses vencido (7 meses)");
  assert.equal(conPlazo(6, "2026-04-11").length, 0, "plazo de 6 meses: exactamente 6 no avisa");
  assert.equal(conPlazo(undefined, "2025-09-01").length, 1, "por defecto 12 meses: 13 meses avisa");
  assert.equal(conPlazo(24, "2025-03-01").length, 0, "plazo de 24 meses: 19 meses no avisa");
  assert.equal(conPlazo(24, "2024-09-01").length, 1, "plazo de 24 meses vencido (25 meses)");
}
