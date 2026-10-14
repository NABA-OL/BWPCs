/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-11
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Comprobaciones de "Piezas a fondo" (docs/piezas-plan.md §8.1) sin base de datos ni navegador. Las ejecuta `pnpm check:logic`.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { anchorPct, focusTransform, minAnchorSpacing, nearestPart, partFromHash, stepPart } from "../src/lib/piezas/hotspots.ts";
import { entornoActual } from "../src/lib/piezas/entorno.ts";
import { advertenciasDePublicacion, problemasDePublicacion } from "../src/lib/piezas/publicacion.ts";
import { PIEZAS, hrefPiezaServicios, piezaPorSlug, piezasVisibles } from "../src/lib/piezas/registro.ts";
import { TARJETA_MADRE_CONTENIDO as CONTENIDO } from "../src/lib/piezas/tarjeta-madre.contenido.ts";
import { TARJETA_MADRE_GEO as GEO } from "../src/lib/piezas/tarjeta-madre.geo.ts";
import { IDS_RESERVADOS, TARJETA_MADRE_PARTES } from "../src/lib/piezas/types.ts";

const RAIZ = new URL("..", import.meta.url).pathname;
const HOY = "2026-10-11";
const VISTA = GEO.vistas.unica;
const ORDEN = TARJETA_MADRE_PARTES;
const clonar = (valor) => structuredClone(valor);

/** Todos los hechos del contenido (partes, opciones, secciones y factores de forma), con referencia mutable. */
function hechosDe(contenido) {
  const lista = [];
  for (const parte of Object.values(contenido.partes)) {
    lista.push(...parte.hechos);
    for (const opcion of parte.opciones?.items ?? []) lista.push(...opcion.hechos);
  }
  for (const seccion of contenido.secciones) lista.push(...(seccion.hechos ?? []));
  for (const factor of contenido.factoresForma ?? []) lista.push(factor.hecho);
  return lista;
}

/** Toda la prosa visible (sin cifras de los `Hecho`, que sí pueden llevarlas), con una etiqueta de dónde sale. */
function prosaDe(contenido) {
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
  (contenido.faq ?? []).forEach((f, i) => {
    add(`faq.${i}.q`, f.q);
    add(`faq.${i}.a`, f.a);
  });
  add("cta.texto", contenido.cta.texto);
  return prosa;
}

// ---------------------------------------------------------------- hotspots: nearestPart
{
  for (const id of ORDEN) {
    const [x, y] = VISTA.partes[id].ancla;
    // En el ancla exacta gana su parte salvo que otra ancla coincida exactamente (entonces gana la de menor orden).
    const esperado = ORDEN.find((otro) => {
      const [ox, oy] = VISTA.partes[otro].ancla;
      return ox === x && oy === y;
    });
    assert.equal(nearestPart(VISTA, ORDEN, x, y, 1), esperado, `ancla exacta de ${id}`);
  }
  // Empate exacto → menor índice de `orden`, sin importar el orden de las claves de `partes`.
  const par = {
    w: 100,
    h: 100,
    imagen: VISTA.imagen,
    partes: {
      b: { ancla: [60, 50], contornos: [], foco: { x: 0, y: 0, w: 1, h: 1 }, visible: 1 },
      a: { ancla: [40, 50], contornos: [], foco: { x: 0, y: 0, w: 1, h: 1 }, visible: 1 },
    },
  };
  assert.equal(nearestPart(par, ["a", "b"], 50, 50, 20), "a", "empate → menor índice");
  assert.equal(nearestPart(par, ["b", "a"], 50, 50, 20), "b", "empate sigue el orden dado, no las claves");
  const [sx, sy] = VISTA.partes.socket.ancla;
  assert.equal(nearestPart(VISTA, ORDEN, sx + 2000, sy + 2000, 10), null, "más allá de maxDist");
  assert.equal(nearestPart(VISTA, ORDEN, sx, sy, 0), "socket", "maxDist 0 acepta el ancla exacta");
  for (const malo of [NaN, Infinity, -Infinity]) {
    assert.equal(nearestPart(VISTA, ORDEN, malo, 10, 50), null, `x=${malo}`);
    assert.equal(nearestPart(VISTA, ORDEN, 10, malo, 50), null, `y=${malo}`);
  }
  assert.equal(nearestPart(VISTA, ORDEN, 10, 10, NaN), null, "maxDist NaN");
  assert.equal(nearestPart(VISTA, [], sx, sy, 50), null, "orden vacío");
  assert.equal(nearestPart(VISTA, ["constructor", "__proto__"], sx, sy, 5000), null, "ids heredados del prototipo no cuentan");
}

// ---------------------------------------------------------------- hotspots: anchorPct
{
  for (const id of ORDEN) {
    const pct = anchorPct(VISTA, id);
    assert.ok(pct, id);
    assert.ok(pct.left >= 0 && pct.left <= 100 && pct.top >= 0 && pct.top <= 100, `${id} en 0..100`);
    const [ax, ay] = VISTA.partes[id].ancla;
    assert.ok(Math.abs(pct.left - (ax / VISTA.w) * 100) < 1e-9 && Math.abs(pct.top - (ay / VISTA.h) * 100) < 1e-9, `${id} coherente con w y h`);
  }
  assert.equal(anchorPct(VISTA, "no-existe"), null);
  assert.equal(anchorPct(VISTA, "constructor"), null);
  assert.equal(anchorPct({ ...VISTA, w: 0 }, "socket"), null, "viewBox inválido");
}

// ---------------------------------------------------------------- hotspots: stepPart
{
  assert.equal(stepPart(ORDEN, "bateria-cmos", 1), "socket", "14 → 1");
  assert.equal(stepPart(ORDEN, "socket", -1), "bateria-cmos", "1 → 14");
  assert.equal(stepPart(ORDEN, "socket", 1), "chipset");
  assert.equal(stepPart(ORDEN, "chipset", -1), "socket");
  assert.equal(stepPart(ORDEN, "desconocido", 1), "socket", "desconocido + delta 1 → primero");
  assert.equal(stepPart(ORDEN, "desconocido", -1), "bateria-cmos", "desconocido + delta -1 → último");
  assert.equal(stepPart(ORDEN, null, 1), "socket", "null + delta 1 → primero");
  assert.equal(stepPart(ORDEN, null, -1), "bateria-cmos", "null + delta -1 → último");
  // Recorrer n pasos da la vuelta completa.
  let actual = ORDEN[0];
  for (let i = 0; i < ORDEN.length; i++) actual = stepPart(ORDEN, actual, 1);
  assert.equal(actual, ORDEN[0], "n pasos = vuelta completa");
}

// ---------------------------------------------------------------- hotspots: partFromHash
{
  assert.equal(partFromHash("#vrm", ORDEN), "vrm");
  assert.equal(partFromHash("vrm", ORDEN), "vrm", "sin #");
  assert.equal(partFromHash("#conector%2Dcpu", ORDEN), "conector-cpu", "URI codificado");
  assert.equal(partFromHash("#%76rm", ORDEN), "vrm", "URI codificado (letra)");
  assert.doesNotThrow(() => partFromHash("#%E0%A4%A", ORDEN), "malformado no lanza");
  assert.equal(partFromHash("#%E0%A4%A", ORDEN), null);
  assert.equal(partFromHash("#%", ORDEN), null);
  assert.equal(partFromHash("", ORDEN), null);
  assert.equal(partFromHash("#", ORDEN), null);
  assert.equal(partFromHash("#no-existe", ORDEN), null);
  assert.equal(partFromHash("#constructor", ORDEN), null);
  assert.equal(partFromHash("##vrm", ORDEN), null, "doble # no es un id");
  for (const reservado of IDS_RESERVADOS) {
    assert.equal(partFromHash(`#${reservado}`, ORDEN), null, `reservado ${reservado}`);
    // Aunque el orden (mal formado) lo contuviera, el reservado se rechaza igualmente.
    assert.equal(partFromHash(`#${reservado}`, [...ORDEN, reservado]), null, `reservado ${reservado} aun estando en orden`);
  }
}

// ---------------------------------------------------------------- hotspots: focusTransform
{
  const completo = focusTransform({ x: 0, y: 0, w: VISTA.w, h: VISTA.h }, VISTA.w, VISTA.h);
  assert.deepEqual(completo, { scale: 1, tx: 0, ty: 0 }, "foco completo = identidad");
  for (const id of ORDEN) {
    const { scale, tx, ty } = focusTransform(VISTA.partes[id].foco, VISTA.w, VISTA.h);
    assert.ok(scale >= 1 && scale <= 3, `${id}: escala ${scale}`);
    // La figura ampliada cubre todo el cuadro: sin bordes vacíos.
    assert.ok(tx <= 0 && tx >= VISTA.w - scale * VISTA.w - 1e-9, `${id}: tx ${tx}`);
    assert.ok(ty <= 0 && ty >= VISTA.h - scale * VISTA.h - 1e-9, `${id}: ty ${ty}`);
  }
  // Un foco pequeño llega al tope de 3; uno diminuto no lo pasa.
  assert.equal(focusTransform({ x: 100, y: 100, w: 10, h: 10 }, 730, 440).scale, 3);
  for (const degenerado of [
    { x: 10, y: 10, w: 0, h: 0 },
    { x: 10, y: 10, w: -5, h: 20 },
    { x: NaN, y: 10, w: 20, h: 20 },
    { x: 10, y: 10, w: Infinity, h: 20 },
  ]) {
    const r = focusTransform(degenerado, 730, 440);
    assert.deepEqual(r, { scale: 1, tx: 0, ty: 0 }, `foco degenerado ${JSON.stringify(degenerado)}`);
  }
  assert.deepEqual(focusTransform({ x: 0, y: 0, w: 10, h: 10 }, 0, 0), { scale: 1, tx: 0, ty: 0 }, "figura sin tamaño");
  for (const v of Object.values(focusTransform({ x: 0, y: 0, w: 10, h: 10 }, 730, 440))) assert.ok(Number.isFinite(v));
}

// ---------------------------------------------------------------- hotspots: minAnchorSpacing + reservados
{
  assert.ok(minAnchorSpacing(VISTA, 343) >= 24, `separación mínima a 343 px: ${minAnchorSpacing(VISTA, 343)}`);
  assert.equal(minAnchorSpacing(VISTA, 0), 0);
  assert.equal(minAnchorSpacing(VISTA, NaN), 0);
  assert.equal(minAnchorSpacing({ ...VISTA, partes: {} }, 343), Infinity, "menos de 2 anclas");
  // Escala lineal con el ancho.
  const a = minAnchorSpacing(VISTA, 343);
  assert.ok(Math.abs(minAnchorSpacing(VISTA, 686) - a * 2) < 1e-9);
  // La copia local de IDS_RESERVADOS en hotspots.ts debe ser idéntica a la de types.ts.
  const fuenteHotspots = readFileSync(join(RAIZ, "src/lib/piezas/hotspots.ts"), "utf8");
  const literal = /const IDS_RESERVADOS: readonly string\[\] = \[([^\]]*)\]/.exec(fuenteHotspots);
  assert.ok(literal, "hotspots.ts define IDS_RESERVADOS");
  const local = [...literal[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(local, [...IDS_RESERVADOS], "IDS_RESERVADOS de hotspots.ts = types.ts");
}

// ---------------------------------------------------------------- integridad de datos
{
  const idsContenido = Object.keys(CONTENIDO.partes);
  const idsGeo = Object.keys(VISTA.partes);
  assert.deepEqual(idsContenido, [...TARJETA_MADRE_PARTES], "ids del contenido = TARJETA_MADRE_PARTES (y en orden)");
  assert.deepEqual([...idsGeo].sort(), [...TARJETA_MADRE_PARTES].sort(), "ids de la geometría = TARJETA_MADRE_PARTES");
  assert.deepEqual(Object.keys(GEO.vistas), ["unica"]);

  const ordenes = idsContenido.map((id) => CONTENIDO.partes[id].orden);
  assert.deepEqual(ordenes, idsContenido.map((_, i) => i + 1), "orden único y contiguo 1..n");
  assert.equal(new Set(ordenes).size, ordenes.length);

  const dentro = ([x, y]) => x >= 0 && x <= VISTA.w && y >= 0 && y <= VISTA.h;
  for (const id of idsGeo) {
    const parte = VISTA.partes[id];
    assert.ok(dentro(parte.ancla), `${id}: ancla dentro del viewBox`);
    assert.ok(parte.contornos.length >= 1, `${id}: al menos un contorno`);
    for (const contorno of parte.contornos) {
      assert.ok(contorno.length >= 3, `${id}: polígono con 3+ puntos`);
      for (const pt of contorno) assert.ok(dentro(pt), `${id}: punto ${pt} dentro del viewBox`);
    }
    assert.ok(parte.visible >= 0.15 && parte.visible <= 1, `${id}: visible ${parte.visible}`);
    const f = parte.foco;
    assert.ok(f.w > 0 && f.h > 0, `${id}: foco con tamaño`);
    assert.ok(f.x >= -1e-9 && f.y >= -1e-9 && f.x + f.w <= VISTA.w + 1e-9 && f.y + f.h <= VISTA.h + 1e-9, `${id}: foco dentro del viewBox`);
  }

  const { imagen } = VISTA;
  const relViewBox = VISTA.w / VISTA.h;
  assert.ok(Math.abs(relViewBox / (imagen.ancho / imagen.alto) - 1) <= 0.005, "w/h = ancho/alto (±0,5 %)");
  assert.ok(Math.abs(relViewBox / (imagen.anchoSm / imagen.altoSm) - 1) <= 0.005, "w/h = anchoSm/altoSm (±0,5 %)");
  const archivo = (href) => join(RAIZ, "public", href);
  assert.ok(existsSync(archivo(imagen.href)), `existe public${imagen.href}`);
  assert.ok(existsSync(archivo(imagen.hrefSm)), `existe public${imagen.hrefSm}`);
  assert.ok(statSync(archivo(imagen.hrefSm)).size < statSync(archivo(imagen.href)).size, "sm pesa menos que la grande");
  assert.ok(existsSync(join(RAIZ, "public/piezas/tarjeta-madre-og.jpg")), "existe la imagen OG");

  for (const id of idsContenido) assert.ok(!IDS_RESERVADOS.includes(id), `${id} choca con un id reservado`);
  for (const seccion of CONTENIDO.secciones) assert.ok(!idsContenido.includes(seccion.id), `sección ${seccion.id} choca con una parte`);

  assert.match(CONTENIDO.slug, /^[a-z0-9-]+$/);
  assert.ok(CONTENIDO.titulo.length <= 60, `titulo ${CONTENIDO.titulo.length}`);
  assert.ok(CONTENIDO.descripcion.length >= 120 && CONTENIDO.descripcion.length <= 160, `descripcion ${CONTENIDO.descripcion.length}`);
  for (const [id, parte] of Object.entries(CONTENIDO.partes)) assert.ok(parte.resumen.length <= 160, `resumen de ${id}: ${parte.resumen.length}`);
  assert.equal(CONTENIDO.variantes, undefined, "el piloto no trae variantes");
  assert.equal(CONTENIDO.comparaciones, undefined, "el piloto no trae comparaciones");
  for (const id of ["elegir", "errores", "tamanos"]) assert.ok(CONTENIDO.secciones.some((s) => s.id === id), `sección ${id}`);
  for (const [id, parte] of Object.entries(CONTENIDO.partes)) {
    for (const rel of parte.relacionadas ?? []) assert.ok(idsContenido.includes(rel), `relacionada inválida ${id} → ${rel}`);
  }
}

// ---------------------------------------------------------------- reglas de contenido
{
  const hechos = hechosDe(CONTENIDO);
  const ids = hechos.map((h) => h.id);
  assert.equal(new Set(ids).size, ids.length, "ids de hechos únicos");
  for (const id of ids) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `id de hecho kebab-case: ${id}`);

  const terminos = [...CONTENIDO.terminos].sort((a, b) => b.length - a.length);
  const prosa = prosaDe(CONTENIDO);
  assert.ok(prosa.length > 50, "hay prosa que revisar");
  for (const [donde, texto] of prosa) {
    let sinTerminos = texto;
    for (const termino of terminos) sinTerminos = sinTerminos.split(termino).join(" ");
    assert.ok(!/\d/.test(sinTerminos), `dígito en ${donde}: ${texto}`);
    const minus = texto.toLowerCase();
    for (const prohibida of ["garantía", "precio", "$"]) assert.ok(!minus.includes(prohibida), `«${prohibida}» en ${donde}`);
    assert.ok(!/\b(vos|tenés|querés|elegí)\b/i.test(texto), `voseo en ${donde}`);
  }

  for (const parte of Object.values(CONTENIDO.partes)) {
    for (const enlace of parte.enlaces ?? []) assert.ok(enlace.href.startsWith("/"), `enlace interno: ${enlace.href}`);
  }
  assert.ok(CONTENIDO.cta.href.startsWith("/"), "cta interno");

  for (const factor of CONTENIDO.factoresForma ?? []) {
    const texto = `${factor.resumen} ${factor.paraQuien}`.toLowerCase();
    for (const palabra of ["mejor", "peor", "superior", "inferior", "gama baja", "gama alta"]) {
      assert.ok(!texto.includes(palabra), `factor ${factor.id}: «${palabra}» compara tamaños`);
    }
  }

  const todo = prosa.map(([, t]) => t).join("\n");
  for (const sinonimo of ["placa base", "motherboard", "board"]) {
    const veces = (todo.match(new RegExp(`\\b${sinonimo}\\b`, "gi")) ?? []).length;
    assert.equal(veces, 1, `el sinónimo «${sinonimo}» debe aparecer una sola vez en la prosa (aparece ${veces})`);
  }
  // S9 (plan §10): nada de vigencia anunciada de un socket, es una promesa de un tercero.
  assert.ok(!/vigencia/i.test(JSON.stringify(CONTENIDO)), "sin promesas de vigencia de plataformas");
}

// ---------------------------------------------------------------- puerta de publicación
{
  assert.equal(CONTENIDO.estado, "borrador", "el piloto sigue en borrador");
  assert.deepEqual(problemasDePublicacion(CONTENIDO, HOY), [], "un borrador no se bloquea");
  assert.deepEqual(advertenciasDePublicacion(CONTENIDO, HOY), [], "un borrador no avisa");
  const revision = { ...clonar(CONTENIDO), estado: "revision" };
  assert.deepEqual(problemasDePublicacion(revision, HOY), [], "revisión tampoco se bloquea");

  const publicado = () => ({ ...clonar(CONTENIDO), estado: "publicado" });
  const sinVerificar = problemasDePublicacion(publicado(), HOY);
  assert.ok(sinVerificar.length > 0, "publicado con hechos sin verificar → problemas");
  const numeroHechos = hechosDe(CONTENIDO).length;
  assert.ok(sinVerificar.length >= numeroHechos, "al menos un problema por hecho sin verificar");

  const verificarTodo = (pieza, verificadoEn = "2026-10-01") => {
    for (const hecho of hechosDe(pieza)) {
      hecho.verificadoEn = verificadoEn;
      hecho.verificadoPor = "NAB";
      hecho.fuentes = hecho.fuentes.map((f) => ({ ...f, consultadoEn: "2026-10-01", url: f.url.startsWith("https://") ? f.url : "https://example.com/doc" }));
    }
    return pieza;
  };
  assert.deepEqual(problemasDePublicacion(verificarTodo(publicado()), HOY), [], "todo verificado → publicable");
  assert.deepEqual(advertenciasDePublicacion(verificarTodo(publicado()), HOY), [], "verificado hace días: sin advertencias");

  // Cada regla por separado, sobre un clon verificado.
  const conCambio = (cambio) => {
    const pieza = verificarTodo(publicado());
    cambio(hechosDe(pieza)[0]);
    return problemasDePublicacion(pieza, HOY);
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
    return problemasDePublicacion(pieza, HOY);
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
  assert.deepEqual(problemasDePublicacion(vieja, HOY), [], "verificación vieja no es un fallo");
  assert.equal(advertenciasDePublicacion(vieja, HOY).length, numeroHechos, "una advertencia por hecho de más de 12 meses");
  assert.deepEqual(advertenciasDePublicacion(verificarTodo(publicado(), "2025-10-11"), HOY), [], "exactamente 12 meses: aún no avisa");
  assert.deepEqual(advertenciasDePublicacion(verificarTodo(publicado(), "2026-01-01"), HOY), [], "verificado hace 9 meses");
  assert.ok(advertenciasDePublicacion(vieja, "2026-10-11").every((a) => a.includes("2025-10-10")));
}

// ---------------------------------------------------------------- registro y entorno
{
  assert.deepEqual(piezasVisibles("produccion"), PIEZAS["tarjeta-madre"].contenido.estado === "publicado" ? [PIEZAS["tarjeta-madre"]] : [], "producción solo ve lo publicado");
  const publicadaHoy = PIEZAS["tarjeta-madre"].contenido.estado === "publicado"; // las pruebas siguen valiendo el día que se publique
  for (const entorno of ["preview", "desarrollo"]) {
    assert.equal(piezasVisibles(entorno).length, Object.keys(PIEZAS).length, `${entorno} ve todas`);
  }
  assert.equal(hrefPiezaServicios("boards", "produccion"), publicadaHoy ? "/piezas/tarjeta-madre" : null, "producción enlaza solo si está publicada");
  assert.equal(hrefPiezaServicios("boards", "desarrollo"), "/piezas/tarjeta-madre");
  assert.equal(hrefPiezaServicios("boards", "preview"), "/piezas/tarjeta-madre");
  assert.equal(hrefPiezaServicios("procesador", "desarrollo"), null, "paso sin pieza a fondo");
  assert.equal(piezaPorSlug("tarjeta-madre", "produccion")?.contenido.slug ?? null, publicadaHoy ? "tarjeta-madre" : null);
  assert.equal(piezaPorSlug("tarjeta-madre", "preview")?.contenido.slug, "tarjeta-madre");
  assert.equal(piezaPorSlug("tarjeta-madre", "desarrollo")?.contenido.slug, "tarjeta-madre");
  for (const raro of ["no-existe", "", "constructor", "__proto__", "Tarjeta-Madre"]) assert.equal(piezaPorSlug(raro, "desarrollo"), null, `slug «${raro}»`);

  assert.equal(entornoActual({ VERCEL_ENV: "production" }), "produccion");
  assert.equal(entornoActual({ VERCEL_ENV: "preview" }), "preview");
  assert.equal(entornoActual({}), "desarrollo");
  assert.equal(entornoActual({ VERCEL_ENV: "development" }), "desarrollo");
  assert.equal(entornoActual({ VERCEL_ENV: "Production" }), "desarrollo", "sensible a mayúsculas: ante la duda, no es producción");
}

// ---------------------------------------------------------------- guardas estáticas
{
  const DIRECTORIOS = ["src/components/piezas", "src/app/(public)/piezas", "src/lib/piezas"];
  const archivos = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const ruta = join(dir, e.name);
      if (e.isDirectory()) return archivos(ruta);
      return /\.(ts|tsx|mjs|js)$/.test(e.name) ? [ruta] : [];
    });
  const sinComentarios = (texto) => texto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const PROHIBIDOS = [/(^|\/)sharp$/, /images\/process/, /user-auth\/auth/, /(^|\/)db(\/|$)/, /lib\/db/];
  let revisados = 0;
  for (const dir of DIRECTORIOS) {
    const absoluto = join(RAIZ, dir);
    assert.ok(existsSync(absoluto), `existe ${dir}`);
    for (const archivo of archivos(absoluto)) {
      revisados++;
      const texto = sinComentarios(readFileSync(archivo, "utf8"));
      assert.ok(!texto.includes("dangerouslySetInnerHTML"), `dangerouslySetInnerHTML en ${archivo}`);
      const especificadores = [
        ...[...texto.matchAll(/\bfrom\s*["']([^"']+)["']/g)].map((m) => m[1]),
        ...[...texto.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]),
        ...[...texto.matchAll(/\brequire\s*\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]),
        ...[...texto.matchAll(/^\s*import\s+["']([^"']+)["']/gm)].map((m) => m[1]),
      ];
      for (const especificador of especificadores) {
        for (const prohibido of PROHIBIDOS) assert.ok(!prohibido.test(especificador), `import prohibido «${especificador}» en ${archivo}`);
      }
    }
  }
  assert.ok(revisados >= 8, `se revisaron ${revisados} archivos de piezas`);
}

console.log("check:piezas OK");
