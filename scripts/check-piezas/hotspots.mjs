/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Hotspots: nearestPart, anchorPct, stepPart, partFromHash, focusTransform y separación mínima (lib/piezas/hotspots.ts).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  anchorPct,
  cambiarVista,
  elegirParte,
  existeEnVista,
  focusTransform,
  hrefDeVista,
  indicePartesPorVista,
  minAnchorSpacing,
  nearestPart,
  partFromHash,
  seleccionDesdeHash,
  seleccionInicial,
  stepPart,
  vistaFromHash,
} from "../../src/lib/piezas/hotspots.ts";
import { TARJETA_MADRE_GEO as GEO } from "../../src/lib/piezas/tarjeta-madre.geo.ts";
import { IDS_RESERVADOS, PREFIJO_ID_VISTA, TARJETA_MADRE_PARTES } from "../../src/lib/piezas/types.ts";
import { RAIZ } from "./comun.mjs";

const VISTA = GEO.vistas.unica;
const ORDEN = TARJETA_MADRE_PARTES;

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

// ---------------------------------------------------------------- multivista: fixture sintético (no es una pieza real)
{
  const caja = { x: 0, y: 0, w: 10, h: 10 };
  const parte = (x, y) => ({ ancla: [x, y], contornos: [], foco: caja, visible: 1 });
  const imagen = VISTA.imagen;
  // Tres vistas de 1000×400: "pmic" solo en la vista b; "trabas" solo en a y b; "ranura" sin restricción en el contenido pero sin geometría en c.
  const geo = {
    a: { w: 1000, h: 400, imagen, partes: { contactos: parte(100, 200), ranura: parte(300, 200), trabas: parte(900, 200) } },
    b: { w: 1000, h: 400, imagen, partes: { contactos: parte(100, 200), pmic: parte(500, 200), ranura: parte(300, 200), trabas: parte(900, 200) } },
    c: { w: 800, h: 400, imagen, partes: { contactos: parte(80, 200), pmic: parte(400, 100) } },
  };
  const partes = [
    { id: "trabas", orden: 4 },
    { id: "contactos", orden: 1 },
    { id: "pmic", orden: 3, vistas: ["b", "c"] },
    { id: "ranura", orden: 2, vistas: ["a", "b", "c"] },
  ];
  const vistas = Object.entries(geo).map(([id, g]) => ({ id, geo: g }));
  const indice = indicePartesPorVista(vistas, partes);

  // Qué partes existen en cada vista: declaradas Y con ancla en la geometría, en orden de lectura.
  assert.deepEqual([...indice.keys()], ["a", "b", "c"], "el índice sigue el orden de las vistas");
  assert.deepEqual(indice.get("a"), ["contactos", "ranura", "trabas"], "vista a: sin pmic (no declarado)");
  assert.deepEqual(indice.get("b"), ["contactos", "ranura", "pmic", "trabas"], "vista b: todas, en orden");
  assert.deepEqual(indice.get("c"), ["contactos", "pmic"], "vista c: «ranura» y «trabas» están declaradas pero no tienen ancla en su geometría");
  assert.equal(existeEnVista(partes[2], "a", geo.a), false, "pmic declarada solo en b y c");
  assert.equal(existeEnVista(partes[2], "b", geo.b), true);
  assert.equal(existeEnVista({ id: "trabas", orden: 4, vistas: ["c"] }, "c", geo.c), false, "declarada pero sin ancla en la geometría");
  assert.equal(existeEnVista({ id: "constructor", orden: 9 }, "a", geo.a), false, "ids heredados no existen");

  // Funciones por vista: anclas y vecinos solo de esa vista; la parte ausente da null.
  assert.equal(anchorPct(geo.a, "pmic"), null, "parte ausente → sin marcador");
  assert.deepEqual(anchorPct(geo.c, "pmic"), { left: 50, top: 25 }, "porcentaje con el viewBox de CADA vista");
  assert.deepEqual(anchorPct(geo.b, "pmic"), { left: 50, top: 50 });
  assert.equal(stepPart(indice.get("a"), "ranura", 1), "trabas", "en la vista a, tras ranura va trabas (no pmic)");
  assert.equal(stepPart(indice.get("b"), "ranura", 1), "pmic");
  assert.equal(stepPart(indice.get("c"), "pmic", 1), "contactos", "da la vuelta dentro de la vista c");
  assert.equal(nearestPart(geo.a, indice.get("a"), 500, 200, 1000), "ranura", "a: la más cercana a (500,200) entre las suyas");
  assert.equal(nearestPart(geo.b, indice.get("b"), 500, 200, 1000), "pmic", "b: el pmic está justo ahí");
  assert.equal(nearestPart(geo.a, indice.get("a"), 500, 200, 20), null, "a: no hay parte a 20 px de (500,200)");

  // Conservar la parte entre vistas.
  const sobreA = elegirParte(seleccionInicial("a"), "ranura", indice);
  assert.deepEqual(sobreA, { vista: "a", parte: "ranura", ausente: null });
  assert.deepEqual(cambiarVista(sobreA, "b", indice), { vista: "b", parte: "ranura", ausente: null }, "la parte se conserva al cambiar de vista");
  assert.deepEqual(cambiarVista(sobreA, "a", indice), sobreA, "cambiar a la misma vista no cambia nada");
  assert.deepEqual(cambiarVista(seleccionInicial("a"), "b", indice), { vista: "b", parte: null, ausente: null }, "sin parte elegida solo cambia la vista");

  // Parte ausente en la vista nueva: se limpia y queda anunciada como ausente; no rompe nada.
  const sobreB = elegirParte(seleccionInicial("b"), "pmic", indice);
  const aVistaA = cambiarVista(sobreB, "a", indice);
  assert.deepEqual(aVistaA, { vista: "a", parte: null, ausente: "pmic" }, "pmic no existe en a → se limpia y se anuncia");
  assert.deepEqual(cambiarVista(aVistaA, "b", indice), { vista: "b", parte: null, ausente: null }, "el aviso no se arrastra a la vista siguiente");
  assert.equal(cambiarVista(sobreB, "no-existe", indice), sobreB, "vista desconocida → sin cambios");
  assert.deepEqual(elegirParte(seleccionInicial("a"), "inexistente", indice), seleccionInicial("a"), "parte que no existe en ninguna vista → sin cambios");
  assert.deepEqual(elegirParte(seleccionInicial("c"), "trabas", indice), { vista: "a", parte: "trabas", ausente: null }, "«trabas» no tiene ancla en c → salta a la primera vista que sí la tiene");
  assert.deepEqual(elegirParte(seleccionInicial("a"), "pmic", indice), { vista: "b", parte: "pmic", ausente: null }, "elegir una parte de otra vista salta a la primera vista que la tiene");

  // Hash: #parte, #vista-<id> y rechazo de ids reservados o con prefijo de vista.
  const todas = ["contactos", "ranura", "pmic", "trabas"];
  assert.equal(PREFIJO_ID_VISTA, "vista-");
  assert.equal(hrefDeVista("ddr5"), "#vista-ddr5");
  assert.equal(vistaFromHash("#vista-b", ["a", "b", "c"]), "b");
  assert.equal(vistaFromHash("vista-c", ["a", "b", "c"]), "c", "sin #");
  assert.equal(vistaFromHash("#vista-%62", ["a", "b", "c"]), "b", "URI codificado");
  assert.equal(vistaFromHash("#vista-z", ["a", "b", "c"]), null, "vista desconocida");
  assert.equal(vistaFromHash("#vista-", ["a", "b", "c"]), null, "prefijo solo");
  assert.equal(vistaFromHash("#b", ["a", "b", "c"]), null, "sin prefijo no es una vista");
  assert.equal(vistaFromHash("#vista-%E0%A4%A", ["a"]), null, "malformado");
  assert.equal(vistaFromHash("#vista-vista-a", ["a", "vista-a"]), "vista-a", "solo se quita UN prefijo");
  assert.equal(partFromHash("#vista-a", [...todas, "vista-a"]), null, "una parte nunca puede llamarse vista-*");
  assert.equal(partFromHash("#vista-pmic", [...todas, "vista-pmic"]), null);
  assert.equal(partFromHash("#pmic", todas), "pmic", "las partes siguen resolviéndose");
  assert.deepEqual(seleccionDesdeHash("#vista-b", sobreA, indice, todas), { vista: "b", parte: "ranura", ausente: null }, "#vista-b conserva la parte");
  assert.deepEqual(seleccionDesdeHash("#vista-a", sobreB, indice, todas), { vista: "a", parte: null, ausente: "pmic" }, "#vista-a con pmic elegida → ausente");
  assert.deepEqual(seleccionDesdeHash("#pmic", seleccionInicial("a"), indice, todas), { vista: "b", parte: "pmic", ausente: null }, "#pmic desde la vista a lleva a la vista b");
  assert.deepEqual(seleccionDesdeHash("#contactos", seleccionInicial("c"), indice, todas), { vista: "c", parte: "contactos", ausente: null }, "#contactos se queda en la vista actual");
  for (const ruido of ["#lista", "#fuentes", "#vistas", "#nada", "", "#", "#vista-z", "#%"]) {
    assert.equal(seleccionDesdeHash(ruido, sobreA, indice, todas), null, `hash ajeno «${ruido}» no toca la selección`);
  }

  // Separación mínima por vista: cada vista se mide con su propio viewBox (la vista c es más estrecha).
  assert.equal(minAnchorSpacing(geo.a, 1000), 200, "a: 100 → 300 son 200 px a escala 1");
  assert.equal(minAnchorSpacing(geo.b, 1000), 200, "b: 300 → 500 son 200 px");
  assert.ok(Math.abs(minAnchorSpacing(geo.c, 400) - Math.hypot(320, 100) * 0.5) < 1e-9, "c: escala 400/800 = 0,5");
  const junto = { ...geo.b, partes: { ...geo.b.partes, pmic: parte(310, 200) } };
  assert.equal(minAnchorSpacing(junto, 343), (10 * 343) / 1000, "dos anclas a 10 px del viewBox quedan a 3,43 px CSS");
  assert.ok(minAnchorSpacing(junto, 343) < 24, "el control de 24 px detecta una vista con marcadores amontonados");
  assert.ok(minAnchorSpacing(geo.a, 343) >= 24 && minAnchorSpacing(geo.b, 343) >= 24 && minAnchorSpacing(geo.c, 343) >= 24, "las tres vistas del fixture cumplen ≥ 24 px a 343 px");
}

// ---------------------------------------------------------------- multivista: la copia local del prefijo coincide con types.ts
{
  const fuenteHotspots = readFileSync(join(RAIZ, "src/lib/piezas/hotspots.ts"), "utf8");
  const prefijo = /const PREFIJO_ID_VISTA = "([^"]+)"/.exec(fuenteHotspots);
  assert.ok(prefijo, "hotspots.ts define PREFIJO_ID_VISTA");
  assert.equal(prefijo[1], PREFIJO_ID_VISTA, "PREFIJO_ID_VISTA de hotspots.ts = types.ts");
}
