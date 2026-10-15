/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Registro, entorno, sinónimos de slug y enlaces cruzados entre piezas.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { entornoActual } from "../../src/lib/piezas/entorno.ts";
import { PIEZAS, SINONIMOS_SLUG, enlacesResueltos, hayIndice, hrefPiezaServicios, piezaPorSlug, piezasVisibles, resolverEnlace } from "../../src/lib/piezas/registro.ts";
import { PIEZA_SLUGS } from "../../src/lib/piezas/types.ts";
import { ORDEN_INDICE, PALABRAS_INICIO, enlacesInicio, enlacesServicios, indiceEsBorrador, indiceSchema, piezasDelIndice, rutasSitemapPiezas, temasReservados } from "../../src/lib/piezas/indice.ts";
import { RAIZ } from "./comun.mjs";

// ---------------------------------------------------------------- registro y entorno
{
  // El registro es exhaustivo y sigue el orden de PIEZA_SLUGS.
  assert.deepEqual(Object.keys(PIEZAS).sort(), [...PIEZA_SLUGS].sort(), "las 7 piezas están registradas");
  assert.equal(PIEZA_SLUGS.length, 7);
  for (const slug of PIEZA_SLUGS) assert.equal(PIEZAS[slug].contenido.slug, slug, `el contenido de ${slug} declara su propio slug`);
  // Todas las piezas traen su geometría generada por BWReel; solo una que declare `sinDibujo` puede quedarse sin ella.
  for (const slug of PIEZA_SLUGS) {
    const { contenido, geo } = PIEZAS[slug];
    assert.ok(geo !== null || contenido.sinDibujo === true, `${slug}: trae geometría o declara sinDibujo`);
  }

  // Producción solo ve lo publicado: hoy ningún estado es "publicado".
  for (const slug of PIEZA_SLUGS) assert.equal(PIEZAS[slug].contenido.estado, "borrador", `${slug} sigue en borrador`);
  assert.deepEqual(piezasVisibles("produccion"), [], "producción no incluye borradores");
  for (const slug of PIEZA_SLUGS) assert.equal(piezaPorSlug(slug, "produccion"), null, `${slug} es 404 en producción`);
  for (const entorno of ["preview", "desarrollo"]) {
    assert.equal(piezasVisibles(entorno).length, Object.keys(PIEZAS).length, `${entorno} ve todas`);
    assert.deepEqual(piezasVisibles(entorno).map((p) => p.contenido.slug), [...PIEZA_SLUGS], `${entorno}: mismo orden que PIEZA_SLUGS`);
  }
  // Un registro de prueba con piezas publicadas (clon): producción solo ve las publicadas.
  const registroPrueba = (publicadas) => {
    const copia = {};
    for (const slug of PIEZA_SLUGS) copia[slug] = { ...PIEZAS[slug], contenido: { ...PIEZAS[slug].contenido, estado: publicadas.includes(slug) ? "publicado" : "borrador" } };
    return copia;
  };
  assert.deepEqual(piezasVisibles("produccion", registroPrueba(["procesador"])).map((p) => p.contenido.slug), ["procesador"]);
  assert.equal(piezaPorSlug("procesador", "produccion", registroPrueba(["procesador"]))?.contenido.slug, "procesador");
  assert.equal(piezaPorSlug("memoria-ram", "produccion", registroPrueba(["procesador"])), null);

  // Índice /piezas: solo con 2 o más visibles.
  assert.equal(hayIndice("produccion"), false, "0 publicadas: sin índice");
  assert.equal(hayIndice("produccion", registroPrueba(["procesador"])), false, "1 publicada: sin índice");
  assert.equal(hayIndice("produccion", registroPrueba(["procesador", "memoria-ram"])), true, "2 publicadas: hay índice");
  assert.equal(hayIndice("desarrollo"), true);
  assert.equal(hayIndice("preview"), true);

  // "Ver a fondo" desde /servicios: los 7 pasos que tienen pieza; chasis no tiene.
  const PASO_A_PIEZA = { boards: "tarjeta-madre", procesador: "procesador", ram: "memoria-ram", graficas: "tarjeta-grafica", fuentes: "fuente-de-poder", almacenamiento: "almacenamiento", refrigeracion: "refrigeracion" };
  for (const [paso, slug] of Object.entries(PASO_A_PIEZA)) {
    assert.equal(PIEZAS[slug].contenido.piezaServicios, paso, `${slug} declara el paso ${paso}`);
    assert.equal(hrefPiezaServicios(paso, "produccion"), null, `${paso}: sin enlace en producción mientras sea borrador`);
    assert.equal(hrefPiezaServicios(paso, "desarrollo"), `/piezas/${slug}`, `${paso} → ${slug}`);
    assert.equal(hrefPiezaServicios(paso, "preview"), `/piezas/${slug}`);
    assert.equal(hrefPiezaServicios(paso, "produccion", registroPrueba([slug])), `/piezas/${slug}`, `${paso}: enlaza cuando está publicada`);
  }
  assert.equal(new Set(PIEZA_SLUGS.map((s) => PIEZAS[s].contenido.piezaServicios)).size, 7, "un paso por pieza");
  assert.equal(hrefPiezaServicios("chasis", "desarrollo"), null, "el chasis no tiene pieza a fondo");
  assert.equal(hrefPiezaServicios("no-existe", "desarrollo"), null);

  assert.equal(piezaPorSlug("tarjeta-madre", "preview")?.contenido.slug, "tarjeta-madre");
  assert.equal(piezaPorSlug("tarjeta-madre", "desarrollo")?.contenido.slug, "tarjeta-madre");
  for (const raro of ["no-existe", "", "constructor", "__proto__", "Tarjeta-Madre"]) assert.equal(piezaPorSlug(raro, "desarrollo"), null, `slug «${raro}»`);

  assert.equal(entornoActual({ VERCEL_ENV: "production" }), "produccion");
  assert.equal(entornoActual({ VERCEL_ENV: "preview" }), "preview");
  assert.equal(entornoActual({}), "desarrollo");
  assert.equal(entornoActual({ VERCEL_ENV: "development" }), "desarrollo");
  assert.equal(entornoActual({ VERCEL_ENV: "Production" }), "desarrollo", "sensible a mayúsculas: ante la duda, no es producción");
}

// ---------------------------------------------------------------- sinónimos de slug (next.config.ts los importará)
{
  const todos = [];
  assert.deepEqual(Object.keys(SINONIMOS_SLUG).sort(), [...PIEZA_SLUGS].sort(), "cada pieza declara sus sinónimos");
  for (const [slug, lista] of Object.entries(SINONIMOS_SLUG)) {
    assert.ok(lista.length > 0, `${slug} tiene al menos un sinónimo`);
    for (const sinonimo of lista) {
      assert.match(sinonimo, /^[a-z0-9]+(-[a-z0-9]+)*$/, `sinónimo kebab-case: ${sinonimo}`);
      assert.ok(!PIEZA_SLUGS.includes(sinonimo), `el sinónimo «${sinonimo}» no puede ser un slug real`);
      todos.push(sinonimo);
    }
  }
  assert.equal(new Set(todos).size, todos.length, "ningún sinónimo se repite entre piezas");
  // Acordados con el dueño (docs/piezas-plan-2.md §2.1).
  assert.deepEqual([...SINONIMOS_SLUG["tarjeta-madre"]], ["placa-base", "board", "motherboard"]);
  assert.ok(SINONIMOS_SLUG["tarjeta-grafica"].includes("tarjeta-de-video"));
  // types.ts no debe importar nada (next.config.ts lo carga).
  const tipos = readFileSync(join(RAIZ, "src/lib/piezas/types.ts"), "utf8");
  assert.ok(!/^\s*import\s/m.test(tipos), "types.ts no tiene imports");
  assert.ok(!/\benum\b/.test(tipos.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")), "types.ts no usa enum (strip-types)");
}

// ---------------------------------------------------------------- enlaces cruzados por registro
{
  const publicarTodo = () => {
    const copia = {};
    for (const slug of PIEZA_SLUGS) copia[slug] = { ...PIEZAS[slug], contenido: { ...PIEZAS[slug].contenido, estado: "publicado" } };
    return copia;
  };
  let enlacesAPiezas = 0;
  for (const slug of PIEZA_SLUGS) {
    for (const [id, parte] of Object.entries(PIEZAS[slug].contenido.partes)) {
      const enlaces = parte.enlaces ?? [];
      const apuntadores = enlaces.filter((e) => !("href" in e));
      enlacesAPiezas += apuntadores.length;
      // Donde el destino es visible (desarrollo, preview o todo publicado) el enlace nunca devuelve null.
      assert.equal(enlacesResueltos(enlaces, "desarrollo").length, enlaces.length, `${slug}.${id}: todos los enlaces se resuelven en desarrollo`);
      assert.equal(enlacesResueltos(enlaces, "preview").length, enlaces.length, `${slug}.${id}: ... y en preview`);
      assert.equal(enlacesResueltos(enlaces, "produccion", publicarTodo()).length, enlaces.length, `${slug}.${id}: ... y en producción con todo publicado`);
      // En producción con borradores, los enlaces a otras piezas no se pintan (serían un 404); los internos fijos sí.
      assert.equal(enlacesResueltos(enlaces, "produccion").length, enlaces.length - apuntadores.length, `${slug}.${id}: en producción solo quedan los enlaces fijos`);
    }
  }
  assert.ok(enlacesAPiezas >= 5, "la tarjeta madre enlaza a las piezas a fondo");
  // Resolución concreta y rechazo de destinos inválidos.
  assert.deepEqual(resolverEnlace({ etiqueta: "x", pieza: "procesador" }, "desarrollo"), { etiqueta: "x", href: "/piezas/procesador" });
  assert.deepEqual(resolverEnlace({ etiqueta: "x", pieza: "fuente-de-poder", parte: "atx-24" }, "desarrollo"), { etiqueta: "x", href: "/piezas/fuente-de-poder#atx-24" });
  assert.equal(resolverEnlace({ etiqueta: "x", pieza: "fuente-de-poder", parte: "no-existe" }, "desarrollo"), null, "parte inexistente");
  assert.equal(resolverEnlace({ etiqueta: "x", pieza: "fuente-de-poder", parte: "constructor" }, "desarrollo"), null, "parte heredada del prototipo");
  assert.equal(resolverEnlace({ etiqueta: "x", pieza: "no-existe" }, "desarrollo"), null, "pieza inexistente");
  assert.equal(resolverEnlace({ etiqueta: "x", pieza: "procesador" }, "produccion"), null, "borrador en producción");
  assert.deepEqual(resolverEnlace({ etiqueta: "Cotizador", href: "/cotizador" }, "produccion"), { etiqueta: "Cotizador", href: "/cotizador" });
}

// ---------------------------------------------------------------- redirecciones generadas desde SINONIMOS_SLUG (next.config.ts)
{
  const quitarComentarios = (texto) => texto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const config = quitarComentarios(readFileSync(join(RAIZ, "next.config.ts"), "utf8"));
  // next.config.ts las deriva de la fuente única (types.ts, sin imports) y ya no lleva una lista a mano.
  assert.ok(/import\s*\{\s*SINONIMOS_SLUG\s*\}\s*from\s*["']\.\/src\/lib\/piezas\/types(\.ts)?["']/.test(config), "next.config.ts importa SINONIMOS_SLUG de lib/piezas/types");
  assert.ok(/Object\.entries\(SINONIMOS_SLUG\)/.test(config), "las redirecciones recorren SINONIMOS_SLUG");
  assert.ok(config.includes("source: `/piezas/${sinonimo}`") && config.includes("destination: `/piezas/${slug}`"), "origen /piezas/<sinónimo> y destino /piezas/<slug>");
  assert.ok(config.includes("permanent: true"), "redirecciones permanentes");
  for (const literal of ["placa-base", "motherboard", "tarjeta-madre"]) assert.ok(!config.includes(literal), `next.config.ts no repite «${literal}» a mano`);

  // Lo que producen, calculado con la misma fórmula.
  const redirecciones = Object.entries(SINONIMOS_SLUG).flatMap(([slug, sinonimos]) => sinonimos.map((sinonimo) => ({ source: `/piezas/${sinonimo}`, destination: `/piezas/${slug}` })));
  assert.equal(redirecciones.length, Object.values(SINONIMOS_SLUG).reduce((n, lista) => n + lista.length, 0), "una redirección por sinónimo");
  const origenes = redirecciones.map((r) => r.source);
  assert.equal(new Set(origenes).size, origenes.length, "ningún origen se repite (Next rechazaría dos redirecciones iguales)");
  const slugsReales = new Set(PIEZA_SLUGS.map((s) => `/piezas/${s}`));
  for (const { source, destination } of redirecciones) {
    assert.ok(slugsReales.has(destination), `el destino ${destination} es una pieza real`);
    assert.ok(!slugsReales.has(source), `el origen ${source} no es una pieza real (sería un bucle)`);
    assert.ok(!origenes.includes(destination), `${destination} no es a la vez origen y destino (sin cadenas)`);
  }
  assert.ok(redirecciones.length >= 14, `al menos 2 sinónimos por pieza (${redirecciones.length})`);
  assert.deepEqual(redirecciones.filter((r) => r.destination === "/piezas/tarjeta-madre").map((r) => r.source), ["/piezas/placa-base", "/piezas/board", "/piezas/motherboard"], "la tarjeta madre conserva sus tres redirecciones de siempre");
}

// ---------------------------------------------------------------- índice /piezas, enlaces de /servicios y del inicio, sitemap y blog (B3)
{
  const registroConPublicadas = (publicadas) => {
    const copia = {};
    for (const slug of PIEZA_SLUGS) copia[slug] = { ...PIEZAS[slug], contenido: { ...PIEZAS[slug].contenido, estado: publicadas.includes(slug) ? "publicado" : "borrador" } };
    return copia;
  };
  const ordenServicios = ["procesador", "graficas", "ram", "boards", "fuentes", "chasis", "refrigeracion", "almacenamiento"];
  const slugs = (piezas) => piezas.map((p) => p.contenido.slug);

  // Orden propio del índice: cubre las 7 piezas, sin repetir.
  assert.deepEqual([...ORDEN_INDICE].sort(), [...PIEZA_SLUGS].sort(), "el orden del índice cubre las 7 piezas");
  assert.deepEqual([...ORDEN_INDICE], ["procesador", "tarjeta-grafica", "memoria-ram", "tarjeta-madre", "fuente-de-poder", "almacenamiento", "refrigeracion"]);
  assert.notDeepEqual([...ORDEN_INDICE], [...PIEZA_SLUGS], "no es el orden de PIEZA_SLUGS");

  // 0, 1 y 2 visibles según entorno: tamaño, orden y existencia del índice.
  const pruebas = [
    { entorno: "produccion", reg: PIEZAS, esperadas: [], indice: false },
    { entorno: "produccion", reg: registroConPublicadas(["refrigeracion"]), esperadas: ["refrigeracion"], indice: false },
    { entorno: "produccion", reg: registroConPublicadas(["refrigeracion", "procesador"]), esperadas: ["procesador", "refrigeracion"], indice: true },
    { entorno: "preview", reg: PIEZAS, esperadas: [...ORDEN_INDICE], indice: true },
    { entorno: "desarrollo", reg: PIEZAS, esperadas: [...ORDEN_INDICE], indice: true },
  ];
  for (const { entorno, reg, esperadas, indice } of pruebas) {
    assert.deepEqual(slugs(piezasDelIndice(entorno, reg)), esperadas, `${entorno}: piezas del índice ${esperadas.length}`);
    assert.equal(hayIndice(entorno, reg), indice, `${entorno}: índice ${esperadas.length}`);
    assert.equal(piezasDelIndice(entorno, reg).length >= 2, indice, "el índice existe si y solo si hay 2 o más");
  }
  assert.equal(indiceEsBorrador("desarrollo"), true, "todas borrador: el índice lleva noindex");
  assert.equal(indiceEsBorrador("produccion", registroConPublicadas(["procesador", "memoria-ram"])), false, "publicadas: se indexa");
  assert.equal(indiceEsBorrador("preview", registroConPublicadas(["procesador"])), false, "una publicada entre borradores: no es todo borrador");

  // JSON-LD: una entrada por pieza, en orden, con url absoluta.
  const esquema = indiceSchema(piezasDelIndice("desarrollo"), "https://bw-pcs.com", "T", "D");
  assert.equal(esquema["@type"], "CollectionPage");
  assert.equal(esquema.mainEntity.numberOfItems, 7);
  assert.deepEqual(esquema.mainEntity.itemListElement.map((e) => e.position), [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(esquema.mainEntity.itemListElement.map((e) => e.url), ORDEN_INDICE.map((s) => `https://bw-pcs.com/piezas/${s}`));
  assert.ok(esquema.mainEntity.itemListElement.every((e) => e.name.length > 0));

  // Enlaces de /servicios: ninguno en producción con borradores; en desarrollo uno por paso con pieza; nunca a una pieza no visible.
  assert.deepEqual(enlacesServicios(ordenServicios, "produccion"), [], "producción: /servicios sin enlaces");
  const enDesarrollo = enlacesServicios(ordenServicios, "desarrollo");
  assert.deepEqual(enDesarrollo.map((e) => e.paso), ordenServicios.filter((p) => p !== "chasis"), "desarrollo: todos los pasos menos el chasis, en el orden del recorrido");
  for (const e of enDesarrollo) assert.equal(e.href, hrefPiezaServicios(e.paso, "desarrollo"));
  const soloRam = enlacesServicios(ordenServicios, "produccion", registroConPublicadas(["memoria-ram"]));
  assert.deepEqual(soloRam, [{ paso: "ram", etiqueta: "Memoria RAM", href: "/piezas/memoria-ram" }]);

  // Inicio: la línea conserva sus 7 palabras en orden; solo se enlazan las que tienen pieza visible.
  assert.deepEqual(PALABRAS_INICIO.map((p) => p.palabra), ["GPU", "CPU", "RAM", "Board", "Fuente", "Chasis", "Refrigeración"]);
  assert.ok(enlacesInicio("produccion").every((p) => p.href === null), "producción: ninguna palabra enlazada");
  const inicioDev = enlacesInicio("desarrollo");
  assert.equal(inicioDev.find((p) => p.palabra === "Chasis")?.href, null, "el chasis no tiene pieza");
  assert.equal(inicioDev.filter((p) => p.href !== null).length, 6);
  assert.equal(enlacesInicio("produccion", registroConPublicadas(["tarjeta-madre"])).find((p) => p.palabra === "Board")?.href, "/piezas/tarjeta-madre");

  // Ningún enlace producido apunta a una pieza no visible, en ningún escenario.
  for (const { entorno, reg } of pruebas) {
    const visibles = new Set(slugs(piezasVisibles(entorno, reg)).map((s) => `/piezas/${s}`));
    const hrefs = [...enlacesServicios(ordenServicios, entorno, reg).map((e) => e.href), ...enlacesInicio(entorno, reg).map((p) => p.href).filter(Boolean)];
    for (const href of hrefs) assert.ok(visibles.has(href), `${entorno}: ${href} es visible`);
  }

  // Sitemap: sin piezas ni índice en producción con borradores; con publicadas, solo ellas (y el índice si son 2 o más).
  assert.deepEqual(rutasSitemapPiezas(), [], "sitemap: nada mientras sean borrador");
  assert.deepEqual(rutasSitemapPiezas(registroConPublicadas(["procesador"])).map((r) => r.ruta), ["/piezas/procesador"], "1 publicada: sin índice");
  const dos = rutasSitemapPiezas(registroConPublicadas(["refrigeracion", "procesador"]));
  assert.deepEqual(dos.map((r) => r.ruta), ["/piezas", "/piezas/procesador", "/piezas/refrigeracion"], "2 publicadas: índice y piezas en el orden del índice");
  assert.ok(dos.every((r) => /^\d{4}-\d{2}-\d{2}$/.test(r.modificada)));
  assert.equal(dos[0].modificada, [dos[1].modificada, dos[2].modificada].sort().at(-1), "el índice lleva la fecha más reciente");

  // Blog: las 7 piezas son temas reservados aunque sean borrador.
  const temas = temasReservados();
  assert.equal(temas.length, 7, "temas reservados: todas las piezas, sin importar el estado");
  assert.deepEqual(temas.map((t) => t.titulo), ORDEN_INDICE.map((s) => PIEZAS[s].contenido.titulo));
  assert.ok(temas.every((t) => t.titulo && t.descripcion));
}
