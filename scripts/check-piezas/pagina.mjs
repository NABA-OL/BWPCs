/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Página genérica de una pieza (lib/piezas/pagina.ts): bloques que se pintan, menú lateral, fecha de revisión y fuentes generales.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NAV_POR_BLOQUE, bloqueTieneContenido, bloquesVisibles, fechaRevision, fuentesGenerales, navDePieza, todosLosHechos } from "../../src/lib/piezas/pagina.ts";
import { PIEZAS } from "../../src/lib/piezas/registro.ts";
import { TARJETA_MADRE_CONTENIDO } from "../../src/lib/piezas/tarjeta-madre.contenido.ts";
import { IDS_RESERVADOS, PIEZA_SLUGS } from "../../src/lib/piezas/types.ts";
import { RAIZ, clonar, hechosDe } from "./comun.mjs";

const TODOS_LOS_BLOQUES = Object.keys(NAV_POR_BLOQUE);
const hecho = (id, urls) => ({ id, texto: "x", fuentes: urls.map((url) => ({ titulo: url, editor: "E", url, consultadoEn: "2026-10-01" })), verificadoEn: null, verificadoPor: null });

// ---------------------------------------------------------------- tabla de bloques → anclas
{
  assert.deepEqual(TODOS_LOS_BLOQUES.sort(), ["comparar", "elegir", "errores", "lista", "nombres", "partes", "preguntas", "tamanos", "vistas"], "los 9 bloques tienen su ancla");
  for (const [bloque, item] of Object.entries(NAV_POR_BLOQUE)) {
    assert.equal(item.id, bloque, `el ancla del bloque «${bloque}» es su propio id`);
    assert.ok(IDS_RESERVADOS.includes(item.id), `«${item.id}» es un id reservado (ninguna parte puede usarlo)`);
    assert.ok(item.label.length > 0 && item.label.length <= 16, `rótulo corto de «${bloque}»`);
  }
  assert.equal(new Set(Object.values(NAV_POR_BLOQUE).map((i) => i.label)).size, 9, "rótulos del menú distintos");
}

// ---------------------------------------------------------------- navDePieza en las 7 piezas, con y sin dibujo
for (const slug of PIEZA_SLUGS) {
  const { contenido: C, geo } = PIEZAS[slug];
  for (const conDibujo of [true, false]) {
    const nav = navDePieza(C, conDibujo);
    const ids = nav.map((i) => i.id);
    const dondeEstoy = `${slug} (${conDibujo ? "con" : "sin"} dibujo)`;
    assert.equal(new Set(ids).size, ids.length, `${dondeEstoy}: ids del menú únicos`);
    assert.equal(ids[0], "inicio", `${dondeEstoy}: abre con «inicio»`);
    assert.equal(ids[ids.length - 1], "cotizar", `${dondeEstoy}: cierra con «cotizar»`);
    for (const item of nav) {
      assert.ok(IDS_RESERVADOS.includes(item.id), `${dondeEstoy}: «${item.id}» es un ancla reservada`);
      assert.ok(item.label.length > 0, `${dondeEstoy}: «${item.id}» tiene rótulo`);
      assert.ok(!Object.keys(C.partes).includes(item.id), `${dondeEstoy}: «${item.id}» choca con una parte`);
    }
    // Cada entrada intermedia es un bloque que la pieza declara, en el mismo orden, y con contenido.
    const intermedios = ids.slice(1, -1);
    for (const id of intermedios) {
      assert.ok(C.bloques.includes(id), `${dondeEstoy}: «${id}» no es un bloque de la pieza`);
      assert.ok(bloqueTieneContenido(C, id), `${dondeEstoy}: el bloque «${id}» no tiene contenido`);
    }
    assert.deepEqual(intermedios, C.bloques.filter((b) => intermedios.includes(b)), `${dondeEstoy}: el menú sigue el orden de los bloques`);
    assert.deepEqual(intermedios, [...bloquesVisibles(C, conDibujo)], `${dondeEstoy}: el menú = los bloques que se pintan`);
    // «partes» (el explorador) solo existe con dibujo; «lista» siempre.
    assert.equal(ids.includes("partes"), conDibujo && C.bloques.includes("partes"), `${dondeEstoy}: el explorador solo con dibujo`);
    assert.ok(ids.includes("lista"), `${dondeEstoy}: la lista de partes siempre está`);
  }
  // El geo real decide `conDibujo`: sin geo, la página no monta el explorador.
  assert.equal(bloquesVisibles(C, geo !== null).includes("partes"), geo !== null, `${slug}: sin geo no hay explorador`);
}

// ---------------------------------------------------------------- casos concretos de menú
{
  const orden = (C, conDibujo) => navDePieza(C, conDibujo).map((i) => i.id);
  assert.deepEqual(orden(TARJETA_MADRE_CONTENIDO, true), ["inicio", "partes", "lista", "tamanos", "elegir", "errores", "preguntas", "cotizar"], "menú de la tarjeta madre (igual que antes)");
  // Para las piezas con contenido en evolución se comprueba la ESTRUCTURA del menú (no la lista exacta, que cambia al redactar).
  const sinDibujo = orden(PIEZAS.procesador.contenido, false);
  assert.equal(sinDibujo[0], "inicio", "procesador sin dibujo: el menú empieza en «inicio»");
  assert.equal(sinDibujo[1], "nombres", "procesador sin dibujo: el decodificador va primero");
  assert.equal(sinDibujo.at(-1), "cotizar", "procesador sin dibujo: «cotizar» al final");
  assert.ok(sinDibujo.includes("lista") && !sinDibujo.includes("partes"), "procesador sin dibujo: lista sí, explorador no");
  const conDibujo = orden(PIEZAS.procesador.contenido, true);
  assert.ok(conDibujo.indexOf("nombres") < conDibujo.indexOf("partes") && conDibujo.indexOf("partes") < conDibujo.indexOf("lista"), "procesador con dibujo: nombres, partes, lista");
  const ram = orden(PIEZAS["memoria-ram"].contenido, false);
  assert.ok(ram[0] === "inicio" && ram.at(-1) === "cotizar" && ram.includes("lista"), "RAM: inicio, lista y cotizar presentes y en su sitio");
}

// ---------------------------------------------------------------- el menú incluye solo bloques presentes
{
  const base = () => clonar(PIEZAS["memoria-ram"].contenido);
  const ids = (C) => navDePieza(C, true).map((i) => i.id);
  assert.ok(ids(base()).includes("comparar") && ids(base()).includes("vistas"), "punto de partida: la RAM compara y tiene vistas");

  const sinComparaciones = base();
  delete sinComparaciones.comparaciones;
  assert.ok(!ids(sinComparaciones).includes("comparar"), "bloque «comparar» declarado sin comparaciones → fuera del menú");
  const comparacionVacia = base();
  comparacionVacia.comparaciones = [{ ...comparacionVacia.comparaciones[0], filas: [] }];
  assert.ok(!ids(comparacionVacia).includes("comparar"), "comparación sin filas → fuera del menú");

  const unaVista = base();
  unaVista.vistas = [unaVista.vistas[0]];
  assert.ok(!ids(unaVista).includes("vistas"), "una sola vista → sin bloque «vistas»");

  const sinElegir = base();
  sinElegir.secciones = sinElegir.secciones.filter((s) => s.id !== "elegir");
  assert.ok(!ids(sinElegir).includes("elegir"), "sin sección «elegir» → fuera del menú");

  const sinNombres = clonar(PIEZAS.procesador.contenido);
  delete sinNombres.decodificador;
  assert.ok(!navDePieza(sinNombres, true).some((i) => i.id === "nombres"), "sin decodificador → sin «nombres»");

  const conPreguntas = base();
  // El contenido real de la RAM ya trae FAQ: el punto de partida de esta prueba es una pieza SIN faq y sin su bloque.
  delete conPreguntas.faq;
  conPreguntas.bloques = conPreguntas.bloques.filter((b) => b !== "preguntas");
  assert.ok(!ids(conPreguntas).includes("preguntas"), "sin faq → sin «preguntas»");
  conPreguntas.faq = [{ q: "¿Pregunta?", a: "Respuesta." }];
  assert.ok(!ids(conPreguntas).includes("preguntas"), "faq sin el bloque declarado → la página no lo pinta");
  conPreguntas.bloques = [...conPreguntas.bloques, "preguntas"];
  assert.ok(ids(conPreguntas).includes("preguntas"), "faq con el bloque declarado → en el menú");

  const sinTamanos = clonar(TARJETA_MADRE_CONTENIDO);
  delete sinTamanos.factoresForma;
  assert.ok(!navDePieza(sinTamanos, true).some((i) => i.id === "tamanos"), "tamaños sin factores de forma → fuera del menú");
}

// ---------------------------------------------------------------- nada queda sin pintar ni se pinta sin contenido
for (const slug of PIEZA_SLUGS) {
  const { contenido: C } = PIEZAS[slug];
  // La página pinta los casos dentro de «errores», los criterios sueltos dentro de «elegir» y los de cada vista dentro de «vistas».
  if ((C.casos ?? []).length > 0) assert.ok(C.bloques.includes("errores"), `${slug}: hay casos pero el bloque «errores» no está`);
  if ((C.criterios ?? []).length > 0) assert.ok(C.bloques.includes("elegir"), `${slug}: hay criterios sueltos pero el bloque «elegir» no está`);
  if (C.vistas.some((v) => (v.aFavor ?? []).length + (v.aConsiderar ?? []).length > 0)) assert.ok(C.bloques.includes("vistas") && C.vistas.length >= 2, `${slug}: hay criterios por vista pero no se pinta el bloque «vistas»`);
  // Una sección «nombres» (texto del decodificador) solo tiene sentido si hay decodificador.
  if (C.secciones.some((s) => s.id === "nombres")) assert.ok(C.decodificador !== undefined, `${slug}: sección «nombres» sin decodificador`);
}

// ---------------------------------------------------------------- fecha de revisión y fuentes generales
{
  const C = clonar(TARJETA_MADRE_CONTENIDO);
  const hechos = todosLosHechos(C);
  assert.equal(hechos.length, hechosDe(C).length, "todosLosHechos recorre los mismos lugares que el chequeo");
  // La más reciente de sus hechos verificados: 2026-10-13 con las hojas A y B, o la de las decisiones que aplique `--aplicar` después.
  const masReciente = hechos.map((h) => h.verificadoEn).filter((f) => f !== null).reduce((a, b) => (a > b ? a : b));
  assert.ok(masReciente >= "2026-10-13", "la tarjeta madre trae hechos verificados desde las hojas A y B");
  assert.equal(fechaRevision(C), masReciente, "la revisión más reciente de la tarjeta madre");
  const sinVerificar = clonar(C);
  for (const h of todosLosHechos(sinVerificar)) {
    h.verificadoEn = null;
    h.verificadoPor = null;
  }
  assert.equal(fechaRevision(sinVerificar), sinVerificar.actualizadoEn, "sin hechos verificados: la fecha de actualización");

  // Fuentes generales: deduplicadas por URL, incluyen secciones, tamaños, casos y celdas de comparación; no las de las partes.
  const D = clonar(PIEZAS["memoria-ram"].contenido);
  D.secciones = D.secciones.map((s, i) => (i === 0 ? { ...s, hechos: [hecho("h-sec-a", ["https://a.example/1", "https://b.example/2"]), hecho("h-sec-b", ["https://a.example/1"])] } : s));
  D.casos = [{ id: "c1", tipo: "puede-pasar", texto: "t", aprobadoEn: null, aprobadoPor: null, hechos: [hecho("h-caso", ["https://c.example/3", "https://b.example/2"])] }];
  D.comparaciones = [
    { id: "cmp", titulo: "t", columnas: ["ddr4", "ddr5"], filas: [{ etiqueta: "f", valores: { ddr4: { tipo: "hecho", hecho: hecho("h-celda", ["https://d.example/4"]) }, ddr5: { tipo: "texto", texto: "x" } } }] },
  ];
  const parteConFuente = Object.keys(D.partes)[0];
  D.partes[parteConFuente].hechos = [hecho("h-parte", ["https://solo-parte.example/9"])];
  const urls = fuentesGenerales(D).map((f) => f.url);
  assert.deepEqual(urls, ["https://a.example/1", "https://b.example/2", "https://c.example/3", "https://d.example/4"], "fuentes únicas por URL, en orden de aparición");
  assert.ok(!urls.includes("https://solo-parte.example/9"), "las fuentes de una parte ya van en su sección");
  const sinHechosGenerales = clonar(PIEZAS.procesador.contenido);
  sinHechosGenerales.secciones = [];
  sinHechosGenerales.casos = [];
  sinHechosGenerales.comparaciones = [];
  delete sinHechosGenerales.factoresForma;
  assert.deepEqual(fuentesGenerales(sinHechosGenerales), [], "sin secciones, casos, comparaciones ni tamaños no hay fuentes generales");
}

// ---------------------------------------------------------------- guardas de la página y de los componentes nuevos
{
  const quitarComentarios = (texto) => texto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const leer = (ruta) => quitarComentarios(readFileSync(join(RAIZ, ruta), "utf8"));
  const pagina = leer("src/app/(public)/piezas/[pieza]/page.tsx");
  // La página no puede estar atada a una pieza: nada de textos ni slugs de la tarjeta madre.
  for (const atado of [/tarjeta[- ]madre/i, /motherboard/i, /placa base/i, /ETIQUETA_FIGURA/, /vistas\.unica/]) assert.ok(!atado.test(pagina), `la página está atada a una pieza: ${atado}`);
  assert.ok(pagina.includes("navDePieza(") && pagina.includes("bloquesVisibles("), "la página usa navDePieza y bloquesVisibles");
  assert.ok(pagina.includes("contenido.nombreCorto"), "el breadcrumb sale de nombreCorto");
  assert.ok(pagina.includes("hayIndice("), "el paso «Piezas del PC» del breadcrumb depende de hayIndice");
  assert.ok(pagina.includes("notFound()"), "una pieza no visible en el entorno es 404");
  assert.ok(/estado !== "publicado"[^\n]*index: false/.test(pagina), "un borrador lleva noindex");
  assert.ok(pagina.includes("Borrador: no publicado"), "aviso de borrador visible");
  assert.ok(pagina.includes("TechArticle") && pagina.includes("BreadcrumbJsonLd"), "TechArticle y BreadcrumbList");
  assert.ok(pagina.includes("geo ? ") || pagina.includes("geo !== null"), "con geo null no se monta el explorador");

  // Componentes nuevos: servidor (sin "use client"), solo tokens del sitio y sin «mejor/peor».
  for (const archivo of ["pieza-casos", "pieza-comparacion", "pieza-criterios", "pieza-nombres", "pieza-partes"]) {
    const bruto = readFileSync(join(RAIZ, `src/components/piezas/${archivo}.tsx`), "utf8");
    assert.ok(!/^\s*["']use client["']/m.test(bruto), `${archivo} es un componente de servidor`);
    const codigo = quitarComentarios(bruto);
    assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(codigo), `${archivo}: sin colores en hex`);
    assert.ok(!/\b(mejor|mejores|peor|peores|superior|superiores|inferior|inferiores)\b/i.test(codigo), `${archivo}: sin «mejor/peor»`);
  }
  const casos = leer("src/components/piezas/pieza-casos.tsx");
  assert.ok(casos.includes('"Nos ha pasado"') && casos.includes('"Puede pasar"'), "los rótulos de los casos los pone la interfaz");
  assert.ok(casos.includes(">Para tener en cuenta</h3>") && !casos.includes("Casos del taller"), "el título visible de los casos es «Para tener en cuenta»");
  assert.ok(casos.includes('id="casos"'), "el ancla #casos se conserva");
  const criterios = leer("src/components/piezas/pieza-criterios.tsx");
  assert.ok(criterios.includes("Criterio de B & W") && criterios.includes("A favor") && criterios.includes("A considerar"), "criterios: rótulo y lados");
  const comparacion = leer("src/components/piezas/pieza-comparacion.tsx");
  for (const etiqueta of ["<table", "<caption", 'scope="col"', 'scope="row"', "<thead", "<tbody"]) assert.ok(comparacion.includes(etiqueta), `comparación accesible: ${etiqueta}`);
}
