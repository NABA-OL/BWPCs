/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-19
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// `--congelar` de scripts/hoja-verificacion.mjs (docs/piezas-plan-2.md §5.6). Se corre UNA sola vez, antes de aplicar las decisiones:
//  1. Llena `textoRevisado` con `textoPublicado` en las entradas decididas (el texto que tenía el código cuando el dueño decidió).
//  2. Escribe docs/verificacion/linea-base.json: la foto del código previa a aplicar (dónde vive cada hecho, caso y criterio, y qué referencias del
//     decodificador apuntan a qué hecho) más el mapa de fusiones origen → destino que sale de las notas «FUSIONADO en <id>».
// Solo escribe dentro de docs/verificacion y se niega a sobrescribir una línea base existente o a correr con hojas desactualizadas.
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SLUGS_HOJA, validarHoja } from "../src/lib/piezas/hoja.ts";
import { PIEZAS } from "../src/lib/piezas/registro.ts";
import { indexarAprobables, indexarHechos, leerFuente } from "./hoja-codigo.mjs";
import { ARCHIVOS_ESCRIBIBLES, RAIZ_REPO } from "./hoja-aplicar.mjs";
import { linea } from "./hoja-md.mjs";
import { DIR_VERIFICACION, construirEsqueletos, fusionarTodas, leerHojas, serializar } from "./hoja-verificacion.mjs";

export const ARCHIVO_LINEA_BASE = "linea-base.json";
export const LINEA_BASE_VERSION = 1;
const PATRON_FUSION = /^FUSIONADO en ([a-z0-9-]+)/;

/** Fecha local AAAA-MM-DD. */
export function fechaDeHoy(ahora = new Date()) {
  const dos = (n) => String(n).padStart(2, "0");
  return `${ahora.getFullYear()}-${dos(ahora.getMonth() + 1)}-${dos(ahora.getDate())}`;
}

/** Referencias del decodificador a un hecho: [{ campo, clave, hechoId? , hechoIds? }]. La clave identifica la fila (familia, familia:prefijo, familias:token, nombre). */
export function referenciasDecodificador(decodificador) {
  if (!decodificador) return [];
  const lista = [];
  const unica = (campo, base) => {
    const repetidas = lista.filter((r) => r.campo === campo && (r.clave === base || r.clave.startsWith(`${base}#`))).length;
    return repetidas === 0 ? base : `${base}#${repetidas + 1}`;
  };
  for (const f of decodificador.familias) lista.push({ campo: "familias", clave: unica("familias", f.id), hechoIds: [...f.hechoIds] });
  for (const s of decodificador.series) lista.push({ campo: "series", clave: unica("series", `${s.familia}:${s.prefijo}`), hechoId: s.hechoId });
  for (const s of decodificador.sufijos) lista.push({ campo: "sufijos", clave: unica("sufijos", `${s.familias.join("+")}:${s.token}`), hechoId: s.hechoId });
  for (const e of decodificador.ejemplos) lista.push({ campo: "ejemplos", clave: unica("ejemplos", e.nombre), hechoId: e.hechoId });
  return lista;
}

/** Mapa de fusiones leído de las notas de las entradas «quitar». Devuelve { fusiones, errores }. */
export function leerFusiones(hojas) {
  const fusiones = [];
  const errores = [];
  const decididas = new Map(); // id → { hoja, valor }
  for (const [slug, hoja] of hojas) for (const e of hoja.entradas) if (e.tipo === "hecho" && e.decision) decididas.set(e.id, { hoja: slug, valor: e.decision.valor });
  for (const slug of SLUGS_HOJA) {
    for (const e of hojas.get(slug)?.entradas ?? []) {
      if (e.tipo !== "hecho" || e.decision?.valor !== "quitar") continue;
      const m = PATRON_FUSION.exec((e.decision.nota ?? "").trim());
      if (!m) continue;
      const destino = decididas.get(m[1]);
      if (!destino) errores.push(`${slug}/${e.id}: se fusiona en «${m[1]}», que no existe en ninguna hoja`);
      else if (destino.valor === "quitar") errores.push(`${slug}/${e.id}: se fusiona en «${m[1]}», pero ese hecho también se quita`);
      else fusiones.push({ origen: e.id, destino: m[1], hojaOrigen: slug, hojaDestino: destino.hoja });
    }
  }
  return { fusiones, errores };
}

/** Dónde vive cada hecho, caso y criterio en el código actual (por archivo y nodo). */
export function fotoDelCodigo(textos) {
  const hechos = new Map();
  const aprobables = new Map();
  for (const ruta of ARCHIVOS_ESCRIBIBLES) {
    const sf = leerFuente(textos.get(ruta), ruta);
    for (const h of indexarHechos(sf)) {
      const previo = hechos.get(h.id) ?? [];
      previo.push({ archivo: ruta, linea: h.linea, nodo: { constante: h.contexto || null, llamada: h.ctor, envolturas: h.envolturas.map((e) => e.expression.text) } });
      hechos.set(h.id, previo);
    }
    for (const a of indexarAprobables(sf)) {
      const clave = `${a.tipo}:${ruta}:${a.id}`;
      aprobables.set(clave, { archivo: ruta, linea: a.linea, nodo: { constante: a.contexto || null, forma: a.forma } });
    }
  }
  return { hechos, aprobables };
}

/**
 * Construye la línea base y las hojas congeladas a partir de las hojas, el esqueleto actual y el texto del código. Pura (no escribe).
 * Devuelve { errores, hojas: Map slug → hoja con textoRevisado, lineaBase, avisos }.
 */
export function construirCongelacion({ hojas, esqueletos, textos, decodificador, hoy }) {
  const errores = [];
  const avisos = [];
  for (const slug of SLUGS_HOJA) if (!hojas.has(slug)) errores.push(`falta docs/verificacion/${slug}.json`);
  for (const [slug, hoja] of hojas) for (const m of validarHoja(hoja)) errores.push(`${slug}.json: ${m}`);
  if (errores.length > 0) return { errores, avisos, hojas, lineaBase: null };

  const vigentes = fusionarTodas(hojas, esqueletos.hojas);
  for (const [slug, hoja] of hojas) if (serializar(hoja) !== serializar(vigentes.get(slug))) errores.push(`${slug}.json está desactualizada respecto al código (corre --esqueleto --todas y revisa)`);
  const { fusiones, errores: erroresFusion } = leerFusiones(hojas);
  errores.push(...erroresFusion);
  if (errores.length > 0) return { errores, avisos, hojas, lineaBase: null };

  const foto = fotoDelCodigo(textos);
  const congeladas = new Map();
  const lineaBase = { version: LINEA_BASE_VERSION, congeladoEn: hoy, fusiones, hechos: {}, casos: {}, criterios: {}, referencias: referenciasDecodificador(decodificador) };
  for (const slug of SLUGS_HOJA) {
    const entradas = hojas.get(slug).entradas.map((e) => {
      const decidida = e.decision !== null;
      if (decidida && e.textoRevisado !== null && linea(e.textoRevisado) !== linea(e.textoPublicado)) avisos.push(`${slug}/${e.id}: ya tenía textoRevisado y no coincide con el texto actual del código; se conserva`);
      return decidida && e.textoRevisado === null ? { ...e, textoRevisado: e.textoPublicado } : e;
    });
    congeladas.set(slug, { ...hojas.get(slug), entradas });
    for (const e of hojas.get(slug).entradas) {
      const datos = { hoja: slug, donde: e.donde, tambienEn: e.tambienEn, usadoPor: e.usadoPor, huerfana: e.huerfana, decision: e.decision?.valor ?? null };
      if (e.tipo === "hecho") {
        const sitios = foto.hechos.get(e.id) ?? [];
        lineaBase.hechos[e.id] = { ...datos, ubicaciones: sitios };
      } else {
        const sitio = foto.aprobables.get(`${e.tipo}:src/lib/piezas/${slug}.contenido.ts:${e.id}`) ?? null;
        (e.tipo === "caso" ? lineaBase.casos : lineaBase.criterios)[`${slug}/${e.id}`] = { ...datos, ubicacion: sitio };
      }
    }
  }
  return { errores, avisos, hojas: congeladas, lineaBase };
}

function escribirAtomico(ruta, contenido) {
  const temporal = `${ruta}.tmp`;
  writeFileSync(temporal, contenido, "utf8");
  renameSync(temporal, ruta);
}

export function cmdCongelar(dir = DIR_VERIFICACION) {
  const rutaBase = join(dir, ARCHIVO_LINEA_BASE);
  if (existsSync(rutaBase)) throw new Error(`${ARCHIVO_LINEA_BASE} ya existe: --congelar se corre una sola vez y no sobrescribe`);
  const hojas = leerHojas(dir);
  const textos = new Map(ARCHIVOS_ESCRIBIBLES.map((ruta) => [ruta, readFileSync(join(RAIZ_REPO, ruta), "utf8")]));
  const resultado = construirCongelacion({ hojas, esqueletos: construirEsqueletos(), textos, decodificador: PIEZAS.procesador.contenido.decodificador, hoy: fechaDeHoy() });
  if (resultado.errores.length > 0) throw new Error(`--congelar se niega a correr:\n  - ${resultado.errores.join("\n  - ")}`);
  let llenadas = 0;
  for (const [slug, hoja] of resultado.hojas) {
    const antes = hojas.get(slug);
    llenadas += hoja.entradas.filter((e, i) => e.textoRevisado !== antes.entradas[i].textoRevisado).length;
    escribirAtomico(join(dir, `${slug}.json`), serializar(hoja));
  }
  escribirAtomico(rutaBase, `${JSON.stringify(resultado.lineaBase, null, 2)}\n`);
  for (const a of resultado.avisos) console.log(`AVISO ${a}`);
  const lb = resultado.lineaBase;
  console.log(`Congelado: textoRevisado llenado en ${llenadas} entradas.`);
  console.log(`${ARCHIVO_LINEA_BASE}: ${Object.keys(lb.hechos).length} hechos, ${Object.keys(lb.casos).length} casos, ${Object.keys(lb.criterios).length} criterios, ${lb.referencias.length} referencias del decodificador, ${lb.fusiones.length} fusiones.`);
  for (const f of lb.fusiones) console.log(`  fusión: ${f.origen} → ${f.destino} (${f.hojaOrigen})`);
}
