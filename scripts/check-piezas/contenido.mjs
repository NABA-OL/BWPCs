/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Contenido: integridad de la tarjeta madre (piloto), contrato de las 7 piezas, hechos comunes y verificaciones del dueño.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { HECHOS_COMUNES } from "../../src/lib/piezas/comun.hechos.ts";
import { minAnchorSpacing } from "../../src/lib/piezas/hotspots.ts";
import { PIEZAS } from "../../src/lib/piezas/registro.ts";
import { TARJETA_MADRE_CONTENIDO as CONTENIDO } from "../../src/lib/piezas/tarjeta-madre.contenido.ts";
import { TARJETA_MADRE_GEO as GEO } from "../../src/lib/piezas/tarjeta-madre.geo.ts";
import { IDS_RESERVADOS, PARTES_POR_PIEZA, PIEZA_SLUGS, PREFIJO_ID_VISTA, TARJETA_MADRE_PARTES, VISTAS_POR_PIEZA } from "../../src/lib/piezas/types.ts";
import { FECHA, KEBAB, RAIZ, criteriosDe, hechosDe, prosaDe } from "./comun.mjs";

const VISTA = GEO.vistas.unica;

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
  assert.deepEqual(CONTENIDO.vistas.map((v) => v.id), ["unica"], "el piloto trae una sola vista");
  assert.equal(CONTENIDO.variantes, undefined, "las variantes del contrato viejo ya no existen (las absorben las vistas)");
  assert.equal(CONTENIDO.comparaciones, undefined, "el piloto no trae comparaciones");
  for (const id of ["elegir", "errores", "tamanos"]) assert.ok(CONTENIDO.secciones.some((s) => s.id === id), `sección ${id}`);
  assert.equal(CONTENIDO.secciones.find((s) => s.id === "errores").vinetas, undefined, "los casos del taller salieron de las viñetas de errores");
  for (const [id, parte] of Object.entries(CONTENIDO.partes)) {
    for (const rel of parte.relacionadas ?? []) assert.ok(idsContenido.includes(rel), `relacionada inválida ${id} → ${rel}`);
  }
}

// ---------------------------------------------------------------- integridad de la geometría de TODAS las piezas (la genera BWReel)
{
  const archivo = (href) => join(RAIZ, "public", href);
  let vistasComprobadas = 0;
  for (const slug of PIEZA_SLUGS) {
    const { contenido, geo } = PIEZAS[slug];
    if (geo === null) continue; // solo se admite con `sinDibujo` (lo exige registro.mjs)
    assert.deepEqual(Object.keys(geo.vistas).sort(), [...VISTAS_POR_PIEZA[slug]].sort(), `${slug}: vistas de la geometría = contrato`);
    const partesContrato = PARTES_POR_PIEZA[slug];
    assert.deepEqual(Object.keys(contenido.partes).sort(), [...partesContrato].sort(), `${slug}: partes del contenido = contrato`);
    const usadas = new Set();
    for (const [vistaId, V] of Object.entries(geo.vistas)) {
      const donde = `${slug}/${vistaId}`;
      const dentro = ([x, y]) => x >= 0 && x <= V.w && y >= 0 && y <= V.h;
      assert.ok(Object.keys(V.partes).length >= 2, `${donde}: al menos dos partes con marcador`);
      for (const [id, parte] of Object.entries(V.partes)) {
        assert.ok(partesContrato.includes(id), `${donde}: «${id}» no está en el contrato de ${slug}`);
        usadas.add(id);
        assert.ok(dentro(parte.ancla), `${donde}/${id}: ancla dentro del viewBox`);
        assert.ok(parte.contornos.length >= 1, `${donde}/${id}: al menos un contorno`);
        for (const contorno of parte.contornos) {
          assert.ok(contorno.length >= 3, `${donde}/${id}: polígono con 3+ puntos`);
          for (const pt of contorno) assert.ok(dentro(pt), `${donde}/${id}: punto ${pt} dentro del viewBox`);
        }
        assert.ok(parte.visible >= 0.15 && parte.visible <= 1, `${donde}/${id}: visible ${parte.visible}`);
        const f = parte.foco;
        assert.ok(f.w > 0 && f.h > 0, `${donde}/${id}: foco con tamaño`);
        assert.ok(f.x >= -1e-9 && f.y >= -1e-9 && f.x + f.w <= V.w + 1e-9 && f.y + f.h <= V.h + 1e-9, `${donde}/${id}: foco dentro del viewBox`);
      }
      const rel = V.w / V.h;
      assert.ok(Math.abs(rel / (V.imagen.ancho / V.imagen.alto) - 1) <= 0.005, `${donde}: w/h = ancho/alto (±0,5 %)`);
      assert.ok(Math.abs(rel / (V.imagen.anchoSm / V.imagen.altoSm) - 1) <= 0.005, `${donde}: w/h = anchoSm/altoSm (±0,5 %)`);
      assert.ok(existsSync(archivo(V.imagen.href)), `${donde}: existe public${V.imagen.href}`);
      assert.ok(existsSync(archivo(V.imagen.hrefSm)), `${donde}: existe public${V.imagen.hrefSm}`);
      const pesoLg = statSync(archivo(V.imagen.href)).size;
      const pesoSm = statSync(archivo(V.imagen.hrefSm)).size;
      assert.ok(pesoSm < pesoLg, `${donde}: sm pesa menos que la grande`);
      assert.ok(pesoLg <= 80 * 1024 && pesoSm <= 40 * 1024, `${donde}: dentro de los topes duros (80 / 40 KB): ${pesoLg} / ${pesoSm}`);
      assert.ok(minAnchorSpacing(V, 343) >= 24, `${donde}: separación mínima a 343 px = ${minAnchorSpacing(V, 343)}`);
      vistasComprobadas += 1;
    }
    assert.deepEqual([...usadas].sort(), [...partesContrato].sort(), `${slug}: la unión de las vistas cubre todas las partes del contrato`);
    assert.ok(existsSync(archivo(`/piezas/${slug}-og.jpg`)), `${slug}: existe la imagen OG`);
  }
  assert.ok(vistasComprobadas >= 7, `se comprobaron las vistas de todas las piezas (${vistasComprobadas})`);
  // El total de imágenes de piezas debe caber en el presupuesto del plan (≈ 2,5 MB).
  const total = readdirSync(join(RAIZ, "public/piezas")).reduce((suma, f) => suma + statSync(join(RAIZ, "public/piezas", f)).size, 0);
  assert.ok(total <= 2.5 * 1024 * 1024, `public/piezas ocupa ${(total / 1024).toFixed(0)} KB (tope 2560 KB)`);
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
    for (const enlace of parte.enlaces ?? []) {
      if ("href" in enlace) assert.ok(enlace.href.startsWith("/"), `enlace interno: ${enlace.href}`);
      else assert.ok(PIEZA_SLUGS.includes(enlace.pieza), `enlace a una pieza que no existe: ${enlace.pieza}`);
    }
  }
  assert.ok(CONTENIDO.cta.href.startsWith("/"), "cta interno");

  for (const factor of CONTENIDO.factoresForma ?? []) {
    const texto = `${factor.resumen} ${factor.paraQuien}`.toLowerCase();
    for (const palabra of ["mejor", "peor", "superior", "inferior", "gama baja", "gama alta"]) {
      assert.ok(!texto.includes(palabra), `factor ${factor.id}: «${palabra}» compara tamaños`);
    }
  }

  const todo = prosa.map(([, t]) => t).join("\n");
  assert.deepEqual([...CONTENIDO.sinonimos], ["placa base", "motherboard", "board"]);
  for (const sinonimo of CONTENIDO.sinonimos) {
    const veces = (todo.match(new RegExp(`\\b${sinonimo}\\b`, "gi")) ?? []).length;
    assert.equal(veces, 1, `el sinónimo «${sinonimo}» debe aparecer una sola vez en la prosa (aparece ${veces})`);
  }
  // S9 (plan §10): nada de vigencia anunciada de un socket, es una promesa de un tercero.
  assert.ok(!/vigencia/i.test(JSON.stringify(CONTENIDO)), "sin promesas de vigencia de plataformas");
}

// ---------------------------------------------------------------- contrato por pieza (las 7 registradas)
{
  const MAX_MARCADORES_POR_VISTA = 8; // las 6 piezas nuevas; la tarjeta madre (piloto) trae 14 en su única vista
  const COMPARATIVOS = /\b(mejor|mejores|peor|peores|superior|superiores|inferior|inferiores)\b/i;
  const todosLosHechos = new Map(); // id → objeto (un id repetido debe ser el mismo objeto)
  const registrar = (hecho, donde) => {
    assert.match(hecho.id, KEBAB, `id de hecho kebab-case: ${hecho.id} (${donde})`);
    if (todosLosHechos.has(hecho.id)) assert.equal(todosLosHechos.get(hecho.id), hecho, `el id de hecho «${hecho.id}» se repite con objetos distintos (${donde})`);
    else todosLosHechos.set(hecho.id, hecho);
  };
  for (const hecho of HECHOS_COMUNES) registrar(hecho, "comun.hechos");
  assert.equal(new Set(HECHOS_COMUNES.map((h) => h.id)).size, HECHOS_COMUNES.length, "ids únicos entre los hechos comunes");
  assert.ok(HECHOS_COMUNES.length >= 27, "los hechos comunes incluyen los que ya estaban en la tarjeta madre");

  for (const slug of PIEZA_SLUGS) {
    const { contenido: C, geo } = PIEZAS[slug];
    const partesEsperadas = [...PARTES_POR_PIEZA[slug]];
    const vistasEsperadas = [...VISTAS_POR_PIEZA[slug]];
    const ids = Object.keys(C.partes);
    const prosa = prosaDe(C);

    // --- partes exhaustivas y en orden; vistas = *_VISTAS en el mismo orden
    assert.deepEqual(ids, partesEsperadas, `${slug}: partes = lista de types.ts (exhaustivo y en orden)`);
    assert.deepEqual(C.vistas.map((v) => v.id), vistasEsperadas, `${slug}: vistas = lista de types.ts (mismo orden)`);
    assert.deepEqual(ids.map((id) => C.partes[id].orden), ids.map((_, i) => i + 1), `${slug}: orden contiguo 1..n`);
    for (const id of ids) {
      assert.ok(!IDS_RESERVADOS.includes(id), `${slug}: «${id}» choca con un id reservado`);
      assert.ok(!id.startsWith(PREFIJO_ID_VISTA), `${slug}: «${id}» empieza por el prefijo reservado de las vistas`);
      assert.match(id, KEBAB, `${slug}: id de parte kebab-case`);
      assert.ok(C.partes[id].resumen.length <= 160, `${slug}.${id}: resumen ${C.partes[id].resumen.length}`);
      for (const rel of C.partes[id].relacionadas ?? []) assert.ok(ids.includes(rel), `${slug}: relacionada inválida ${id} → ${rel}`);
      for (const v of C.partes[id].vistas ?? []) assert.ok(vistasEsperadas.includes(v), `${slug}.${id}: vista «${v}» desconocida`);
    }
    for (const seccion of C.secciones) assert.ok(!ids.includes(seccion.id), `${slug}: la sección ${seccion.id} choca con una parte`);

    // --- cada vista tiene partes (no demasiadas); las notas, si existen, son de partes reales (la nota de una parte ausente es opcional)
    for (const vista of C.vistas) {
      const presentes = ids.filter((id) => (C.partes[id].vistas ?? vistasEsperadas).includes(vista.id));
      assert.ok(presentes.length >= 1, `${slug}/${vista.id}: la vista no tiene partes`);
      if (slug !== "tarjeta-madre") assert.ok(presentes.length <= MAX_MARCADORES_POR_VISTA, `${slug}/${vista.id}: ${presentes.length} marcadores (máximo ${MAX_MARCADORES_POR_VISTA})`);
      for (const id of Object.keys(vista.notasPorParte ?? {})) assert.ok(ids.includes(id), `${slug}/${vista.id}: nota de una parte que no existe: ${id}`);
    }

    // --- metadatos
    assert.match(C.slug, /^[a-z0-9-]+$/);
    assert.ok(C.titulo.length <= 60, `${slug}: titulo ${C.titulo.length}`);
    assert.ok(C.descripcion.length >= 120 && C.descripcion.length <= 160, `${slug}: descripcion ${C.descripcion.length}`);
    assert.ok(C.nombreCorto.length > 0 && C.nombreCorto.length <= 24, `${slug}: nombreCorto`);
    assert.ok(C.publicadoEn === null || FECHA.test(C.publicadoEn), `${slug}: publicadoEn`);
    assert.match(C.actualizadoEn, FECHA);
    assert.ok(C.cta.href.startsWith("/"), `${slug}: cta interno`);

    // --- bloques: sin duplicados, con contenido, y sin contenido olvidado fuera de la lista
    assert.equal(new Set(C.bloques).size, C.bloques.length, `${slug}: bloques sin duplicados`);
    const tiene = {
      partes: true,
      lista: true,
      nombres: C.decodificador !== undefined,
      vistas: C.vistas.length >= 2,
      comparar: (C.comparaciones?.length ?? 0) > 0 && C.comparaciones.every((c) => c.filas.length > 0),
      tamanos: (C.factoresForma?.length ?? 0) > 0 && C.secciones.some((s) => s.id === "tamanos"),
      elegir: C.secciones.some((s) => s.id === "elegir"),
      errores: C.secciones.some((s) => s.id === "errores"),
      preguntas: (C.faq?.length ?? 0) > 0,
    };
    for (const bloque of C.bloques) assert.ok(tiene[bloque] === true, `${slug}: el bloque «${bloque}» no tiene contenido`);
    // El contenido no puede quedar huérfano: si existe y no se lista en bloques, la página no lo pintaría («vistas» es opcional: hay piezas que solo comparan).
    for (const [bloque, hay] of Object.entries(tiene)) {
      if (hay && !["partes", "lista", "vistas"].includes(bloque)) assert.ok(C.bloques.includes(bloque), `${slug}: hay contenido de «${bloque}» pero el bloque no está en la lista`);
    }
    assert.ok(C.bloques.includes("partes") && C.bloques.includes("lista"), `${slug}: partes y lista siempre`);

    // --- reglas de prosa (sin cifras fuera de `terminos`, sin precio/garantía, sin voseo)
    const terminos = [...C.terminos].sort((a, b) => b.length - a.length);
    assert.ok(prosa.length > 0);
    for (const [donde, texto] of prosa) {
      let sinTerminos = texto;
      for (const termino of terminos) sinTerminos = sinTerminos.split(termino).join(" ");
      assert.ok(!/\d/.test(sinTerminos), `${slug}: dígito en ${donde}: ${texto}`);
      const minus = texto.toLowerCase();
      for (const prohibida of ["garantía", "precio", "$"]) assert.ok(!minus.includes(prohibida), `${slug}: «${prohibida}» en ${donde}`);
      assert.ok(!/\b(vos|tenés|querés|elegí)\b/i.test(texto), `${slug}: voseo en ${donde}`);
    }
    // sinónimos: cada uno exactamente una vez en la prosa
    const todaLaProsa = prosa.map(([, t]) => t).join("\n");
    for (const sinonimo of C.sinonimos) {
      const veces = (todaLaProsa.match(new RegExp(`\\b${sinonimo}\\b`, "gi")) ?? []).length;
      assert.equal(veces, 1, `${slug}: el sinónimo «${sinonimo}» debe aparecer una sola vez en la prosa (aparece ${veces})`);
    }
    assert.ok(!/vigencia/i.test(JSON.stringify(C)), `${slug}: sin promesas de vigencia de plataformas`);

    // --- casos y criterios
    const idsCasos = (C.casos ?? []).map((c) => c.id);
    assert.equal(new Set(idsCasos).size, idsCasos.length, `${slug}: ids de casos únicos`);
    for (const caso of C.casos ?? []) {
      assert.match(caso.id, KEBAB, `${slug}: id de caso`);
      assert.ok(["vivido", "puede-pasar"].includes(caso.tipo), `${slug}/${caso.id}: tipo`);
      assert.ok(!/^\s*(nos ha pasado|puede pasar)\b/i.test(caso.texto), `${slug}/${caso.id}: el rótulo lo pone la interfaz, no el texto`);
      if (caso.tipo === "puede-pasar") assert.notEqual(caso.confirmadoPorDueno, true, `${slug}/${caso.id}: un «puede pasar» nunca es experiencia confirmada`);
      assert.equal(caso.aprobadoEn === null, caso.aprobadoPor === null, `${slug}/${caso.id}: aprobadoEn y aprobadoPor van juntos`);
      for (const hecho of caso.hechos ?? []) registrar(hecho, `${slug}/caso ${caso.id}`);
    }
    const criterios = criteriosDe(C);
    const idsCriterios = criterios.map((c) => c.id);
    assert.equal(new Set(idsCriterios).size, idsCriterios.length, `${slug}: ids de criterios únicos`);
    for (const criterio of criterios) {
      assert.match(criterio.id, KEBAB, `${slug}: id de criterio`);
      assert.ok(!COMPARATIVOS.test(criterio.texto), `${slug}/${criterio.id}: «mejor/peor» en un criterio`);
      assert.equal(criterio.aprobadoEn === null, criterio.aprobadoPor === null, `${slug}/${criterio.id}: aprobadoEn y aprobadoPor van juntos`);
    }
    for (const comparacion of C.comparaciones ?? []) {
      assert.match(comparacion.id, KEBAB);
      for (const columna of comparacion.columnas) assert.ok(vistasEsperadas.includes(columna), `${slug}/${comparacion.id}: columna «${columna}» no es una vista`);
      for (const fila of comparacion.filas) {
        assert.deepEqual(Object.keys(fila.valores).sort(), [...comparacion.columnas].sort(), `${slug}/${comparacion.id}/${fila.etiqueta}: una celda por columna`);
        assert.ok(!COMPARATIVOS.test(fila.etiqueta), `${slug}: «mejor/peor» en la etiqueta de una fila`);
        for (const celda of Object.values(fila.valores)) if (celda.tipo === "texto") assert.ok(!COMPARATIVOS.test(celda.texto), `${slug}: «mejor/peor» en una celda de comparación`);
      }
    }

    // --- hechos
    for (const hecho of hechosDe(C)) registrar(hecho, slug);

    // --- enlaces de las partes
    for (const [id, parte] of Object.entries(C.partes)) {
      for (const enlace of parte.enlaces ?? []) {
        if ("href" in enlace) {
          assert.ok(enlace.href.startsWith("/"), `${slug}.${id}: enlace interno ${enlace.href}`);
          continue;
        }
        assert.ok(PIEZA_SLUGS.includes(enlace.pieza), `${slug}.${id}: enlace a una pieza que no existe (${enlace.pieza})`);
        assert.notEqual(enlace.pieza, slug, `${slug}.${id}: una pieza no se enlaza a sí misma por registro`);
        if (enlace.parte !== undefined) assert.ok(PARTES_POR_PIEZA[enlace.pieza].includes(enlace.parte), `${slug}.${id}: ${enlace.pieza} no tiene la parte «${enlace.parte}»`);
      }
    }

    // --- decodificador (solo el procesador): tablas, fecha y hechoIds existentes
    if (C.decodificador) {
      assert.match(C.decodificador.revisadoEn, FECHA, `${slug}: revisadoEn del decodificador`);
      const referencias = [...C.decodificador.series.map((x) => x.hechoId), ...C.decodificador.sufijos.map((x) => x.hechoId), ...C.decodificador.ejemplos.map((x) => x.hechoId), ...C.decodificador.familias.flatMap((x) => x.hechoIds)];
      for (const hechoId of referencias) assert.ok(todosLosHechos.has(hechoId), `${slug}: el hechoId «${hechoId}» del decodificador no existe`);
    }

    // --- geometría: nula (esqueleto) o coherente con partes y vistas
    assert.ok(C.sinDibujo === undefined || typeof C.sinDibujo === "boolean");
    if (geo !== null) {
      assert.deepEqual(Object.keys(geo.vistas), vistasEsperadas, `${slug}: vistas del geo = vistas del contenido`);
      for (const vista of C.vistas) {
        const esperadas = ids.filter((id) => (C.partes[id].vistas ?? vistasEsperadas).includes(vista.id));
        assert.deepEqual(Object.keys(geo.vistas[vista.id].partes).sort(), [...esperadas].sort(), `${slug}/${vista.id}: partes del geo = partes de esa vista`);
      }
    }
  }
}

// ---------------------------------------------------------------- hechos comunes y verificaciones de la tarjeta madre intactas
{
  // Las 32 verificaciones del dueño (hojas A y B, 2026-10-13). Lista fija: si un id cambia de fecha, de persona o desaparece, falla.
  const VERIFICADOS_NB = [
    "socket-disipadores-lga1700-lga1851", "socket-mismo-no-garantiza", "socket-marca-pin-uno", "am4-pga-ryzen", "am5-memoria-ddr5",
    "lga1700-generaciones-memoria", "chipsets-am5", "chipset-vs-procesador-lineas", "eps-ocho-pines", "eps-vs-pcie-grafica",
    "ram-ddr4-ddr5-muesca", "ram-una-generacion-por-placa", "ram-doble-canal", "pcie-x16-desde-procesador", "pcie-x16-cableada-menos-lineas",
    "m2-protocolos", "m2-comparte-lineas-sata", "nvme-lineas-pcie", "sata-datos-y-energia", "video-requiere-graficos-integrados",
    "escudo-es-integrado-o-suelto", "botones-bios-flashback-clear-cmos", "ventilador-nombres-cabezales", "panel-frontal-conexiones",
    "bateria-cr2032", "bateria-que-conserva", "uefi-reemplazo-bios", "bios-procesador-nuevo-flashback", "errores-bios-flash-usb",
    "forma-atx-medidas", "forma-micro-atx-medidas", "forma-mini-itx-medidas",
  ];
  assert.equal(VERIFICADOS_NB.length, 32);
  assert.equal(new Set(VERIFICADOS_NB).size, 32);
  const hechos = hechosDe(CONTENIDO);
  assert.equal(hechos.length, 58, "la tarjeta madre sigue con sus 58 hechos");
  for (const id of VERIFICADOS_NB) {
    const hecho = hechos.find((h) => h.id === id);
    assert.ok(hecho, `la verificación «${id}» sigue en la tarjeta madre`);
    assert.equal(hecho.verificadoEn, "2026-10-13", `${id}: verificadoEn`);
    assert.equal(hecho.verificadoPor, "NB", `${id}: verificadoPor`);
    assert.ok(hecho.fuentes.length > 0 && hecho.fuentes.every((f) => f.url.startsWith("https://")), `${id}: conserva sus fuentes https`);
    assert.ok(hecho.fuentes.some((f) => f.consultadoEn === "2026-10-13"), `${id}: conserva una fuente consultada el 2026-10-13`);
  }
  const verificados = hechos.filter((h) => h.verificadoEn !== null).map((h) => h.id).sort();
  assert.deepEqual(verificados, [...VERIFICADOS_NB].sort(), "no hay verificados de más ni de menos");
  const pendientes = hechos.filter((h) => h.verificadoEn === null);
  assert.equal(pendientes.length, 26, "los 26 restantes siguen sin verificar");
  for (const h of pendientes) assert.equal(h.verificadoPor, null, `${h.id}: pendiente sin verificadoPor`);

  // Los hechos comunes que vienen de la tarjeta madre son los MISMOS objetos que usa su contenido.
  const idsTarjeta = new Set(hechos.map((h) => h.id));
  const comunesEnTarjeta = HECHOS_COMUNES.filter((h) => idsTarjeta.has(h.id));
  assert.equal(comunesEnTarjeta.length, 27, "27 hechos de la tarjeta madre viven en comun.hechos.ts");
  for (const comun of comunesEnTarjeta) assert.equal(hechos.find((h) => h.id === comun.id), comun, `${comun.id}: la tarjeta madre usa el objeto común`);
  // Los comunes nuevos (aún no están en la tarjeta madre) nacen sin verificar.
  for (const comun of HECHOS_COMUNES.filter((h) => !idsTarjeta.has(h.id))) assert.equal(comun.verificadoEn, null, `${comun.id}: común nuevo sin verificar`);
  // Todo hecho común verificado está en la lista del dueño.
  for (const comun of HECHOS_COMUNES.filter((h) => h.verificadoEn !== null)) assert.ok(VERIFICADOS_NB.includes(comun.id), `${comun.id}: verificado fuera de la lista`);
  // Los casos «Nos ha pasado» de la tarjeta madre vienen del relato del dueño; ninguno está aprobado todavía.
  const vividos = (CONTENIDO.casos ?? []).filter((c) => c.tipo === "vivido");
  assert.equal(vividos.length, 4);
  assert.ok(vividos.every((c) => c.confirmadoPorDueno === true), "los 4 vividos están marcados como confirmados por el dueño");
  assert.equal((CONTENIDO.casos ?? []).filter((c) => c.tipo === "puede-pasar").length, 6);
  assert.ok((CONTENIDO.casos ?? []).every((c) => c.aprobadoEn === null && c.aprobadoPor === null), "ningún caso está aprobado todavía");
}
