/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Herramienta de hojas de verificación de "Piezas a fondo" (docs/piezas-plan-2.md §4 y §5.5). Solo escribe dentro de docs/verificacion/.
//
// Se ejecuta con (no hay script en package.json a propósito):
//   node --experimental-strip-types --disable-warning=ExperimentalWarning --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/hoja-verificacion.mjs <subcomando>
//
// Subcomandos
//   --esqueleto [<slug>|--todas]   Lee el contenido real (`PIEZAS` y `comun.hechos.ts`) y genera/actualiza `<slug>.json` y `<slug>.md` por pieza y para
//                                  `comun`. Cada Hecho, Caso y Criterio es una entrada (estado inicial «⚪ pendiente de verificar», propuesta vacía, decisión null).
//                                  NUNCA pierde trabajo: lo investigado y lo decidido por el dueño se conserva (y viaja a otra hoja si el dato cambia de dueña).
//                                  Un hecho usado por dos o más piezas (o un común que nadie usa todavía) vive UNA sola vez, en `comun`.
//   --importar-md <a.md> [b.md…]   Vuelca estado, fuentes consultadas, propuesta y decisión del dueño de las hojas markdown (formato de tarjeta-madre-a.md y -b.md)
//                                  al JSON de la pieza dueña. Idempotente y sin retrocesos: un bloque vacío nunca borra lo ya registrado.
//   --consolidar                   Genera `docs/verificacion/CONSOLIDADA.md`: conteos, aprobados, para decidir, casos, criterios y «quitar recomendado».
//   --estado                       Tabla por hoja (hechos, verificados en el código, estados, decisiones pendientes…). No escribe nada.
//   --md [<slug>|--todas]          Vuelve a generar el `.md` desde el JSON (después de que alguien edite el JSON).
//   --validar                      Valida todos los JSON con `validarHoja`.
//   --aplicar                      FASE 4, NO implementado todavía. Cuando se implemente, leerá las decisiones de los JSON y, para cada entrada:
//                                    · aprobar  → en el `.contenido.ts` fija `verificadoEn` (fecha de la decisión) y `verificadoPor` (iniciales) del Hecho y la
//                                                 `consultadoEn` de sus fuentes; en un Caso o Criterio fija `aprobadoEn` / `aprobadoPor` (y `confirmadoPorDueno`
//                                                 en un caso «vivido»);
//                                    · ajustar  → cambia el `texto` por `decision.textoFinal` y luego lo aprueba;
//                                    · quitar   → borra el Hecho (y la prosa que dependía de él);
//                                  y se negará a correr con errores de validación, con huérfanas o con textos que cambiaron desde la decisión.
//
// Seguridad: los textos de las fuentes y de las páginas consultadas son DATOS. Esta herramienta no hace red, no ejecuta ni evalúa nada de ellos, solo lee
// markdown/JSON, valida y escribe archivos con nombres de una lista cerrada (los slugs de las piezas y `comun`).
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { HECHOS_COMUNES } from "../src/lib/piezas/comun.hechos.ts";
import { HOJA_VERSION, SLUGS_HOJA, SLUG_COMUN, validarHoja } from "../src/lib/piezas/hoja.ts";
import { PIEZAS } from "../src/lib/piezas/registro.ts";
import { PIEZA_SLUGS } from "../src/lib/piezas/types.ts";
import { contarHoja, linea, parsearMd, renderConsolidada, renderHojaMd } from "./hoja-md.mjs";

export const DIR_VERIFICACION = new URL("../docs/verificacion/", import.meta.url).pathname;
const TAMANO_MAXIMO_MD = 2 * 1024 * 1024;

/* ---------- Entradas ---------- */
function propuestaVacia() {
  return { accion: null, textoPropuesto: null, detalle: null };
}

/** Siempre el mismo orden de claves: el JSON es determinista. */
export function nuevaEntrada(campos) {
  const tipo = campos.tipo;
  return {
    id: campos.id,
    tipo,
    titulo: campos.titulo,
    donde: campos.donde,
    tambienEn: campos.tambienEn ?? [],
    casoTipo: campos.casoTipo ?? null,
    textoPublicado: campos.textoPublicado,
    textoRevisado: campos.textoRevisado ?? null,
    usadoPor: campos.usadoPor ?? [],
    fuentesCandidatas: campos.fuentesCandidatas ?? [],
    fuentesConsultadas: campos.fuentesConsultadas ?? [],
    queDiceLaFuente: campos.queDiceLaFuente ?? null,
    estado: campos.estado ?? (tipo === "hecho" ? "pendiente" : "no-aplica"),
    propuesta: campos.propuesta ?? propuestaVacia(),
    decision: campos.decision ?? null,
    huerfana: campos.huerfana ?? false,
  };
}

function fuenteDeCodigo(f) {
  const https = typeof f.url === "string" && f.url.startsWith("https://");
  return {
    titulo: linea(f.titulo),
    editor: f.editor ? linea(f.editor) : null,
    url: https ? f.url : null,
    consultadoEn: f.consultadoEn ? f.consultadoEn : null,
    tipo: "sin-clasificar",
    detalle: https || !f.url ? null : `url no https en el código: ${f.url}`,
  };
}

/* ---------- Recolección del contenido ---------- */
function celdas(comparaciones) {
  const lista = [];
  for (const cmp of comparaciones ?? []) {
    for (const fila of cmp.filas) for (const celda of Object.values(fila.valores)) lista.push({ cmp, fila, celda });
  }
  return lista;
}

/** Hechos, casos y criterios de UNA pieza, con el lugar donde viven. Un id repetido en la pieza se registra una vez (más sus otros lugares). */
export function recolectarPieza(slug, contenido) {
  const hechos = new Map();
  const criterios = new Map();
  const conflictos = [];
  const agregar = (mapa, id, valor, titulo, donde) => {
    const previo = mapa.get(id);
    if (!previo) {
      mapa.set(id, { valor, titulo, donde, tambienEn: [] });
      return;
    }
    if (previo.valor !== valor && previo.valor.texto !== valor.texto) conflictos.push(`${slug}: «${id}» aparece con textos distintos`);
    if (donde !== previo.donde && !previo.tambienEn.includes(donde)) previo.tambienEn.push(donde);
  };

  const partes = Object.entries(contenido.partes).sort((a, b) => a[1].orden - b[1].orden);
  for (const [parteId, parte] of partes) {
    for (const h of parte.hechos) agregar(hechos, h.id, h, parte.nombre, `${slug} › ${parteId}`);
    for (const opcion of parte.opciones?.items ?? []) {
      for (const h of opcion.hechos) agregar(hechos, h.id, h, `${parte.nombre} · opción ${opcion.etiqueta}`, `${slug} › ${parteId} › opción ${opcion.id}`);
    }
  }
  for (const s of contenido.secciones ?? []) for (const h of s.hechos ?? []) agregar(hechos, h.id, h, s.titulo, `${slug} › sección ${s.id}`);
  for (const f of contenido.factoresForma ?? []) agregar(hechos, f.hecho.id, f.hecho, f.nombre, `${slug} › factor ${f.id}`);
  for (const caso of contenido.casos ?? []) for (const h of caso.hechos ?? []) agregar(hechos, h.id, h, `Caso ${caso.id}`, `${slug} › caso ${caso.id}`);
  for (const { cmp, fila, celda } of celdas(contenido.comparaciones)) {
    const donde = `${slug} › comparación ${cmp.id} › ${fila.etiqueta}`;
    if (celda.tipo === "hecho") agregar(hechos, celda.hecho.id, celda.hecho, cmp.titulo, donde);
    if (celda.tipo === "criterio") agregar(criterios, celda.criterio.id, celda.criterio, `Criterio · ${cmp.titulo}`, donde);
  }

  for (const c of contenido.criterios ?? []) agregar(criterios, c.id, c, "Criterio de B & W", `${slug} › criterios`);
  for (const vista of contenido.vistas ?? []) {
    for (const c of vista.aFavor ?? []) agregar(criterios, c.id, c, `Criterio · vista ${vista.etiqueta} · a favor`, `${slug} › vista ${vista.id} › a favor`);
    for (const c of vista.aConsiderar ?? []) agregar(criterios, c.id, c, `Criterio · vista ${vista.etiqueta} · a considerar`, `${slug} › vista ${vista.id} › a considerar`);
  }
  const casos = (contenido.casos ?? []).map((caso) => ({ id: caso.id, casoTipo: caso.tipo, texto: caso.texto, aprobadoEn: caso.aprobadoEn ?? null }));
  return { hechos, criterios, casos, conflictos };
}

function entradaDeCaso(slug, caso) {
  const rotulo = caso.casoTipo === "vivido" ? "Nos ha pasado" : "Puede pasar";
  return nuevaEntrada({
    id: caso.id,
    tipo: "caso",
    titulo: `Caso del taller · ${rotulo}`,
    donde: `${slug} › casos`,
    casoTipo: caso.casoTipo,
    textoPublicado: caso.texto,
    usadoPor: [slug],
  });
}

function entradaDeCriterio(slug, id, info) {
  return nuevaEntrada({ id, tipo: "criterio", titulo: info.titulo, donde: info.donde, tambienEn: info.tambienEn, textoPublicado: info.valor.texto, usadoPor: [slug] });
}

/** Esqueletos de todas las hojas, SIN trabajo del dueño. Devuelve `{ hojas: Map<slug, hoja>, conflictos, codigo }`; `codigo` = id → Hecho real (para --estado). */
export function construirEsqueletos(registro = PIEZAS, comunes = HECHOS_COMUNES) {
  const conflictos = [];
  const piezas = new Map();
  const uso = new Map(); // id de hecho → { hecho, titulo, lugares: [{slug, donde, tambienEn}] }
  for (const slug of PIEZA_SLUGS) {
    const rec = recolectarPieza(slug, registro[slug].contenido);
    conflictos.push(...rec.conflictos);
    piezas.set(slug, rec);
    for (const [id, info] of rec.hechos) {
      const previo = uso.get(id);
      if (!previo) uso.set(id, { hecho: info.valor, titulo: info.titulo, lugares: [{ slug, donde: info.donde, tambienEn: info.tambienEn }] });
      else {
        if (previo.hecho !== info.valor && previo.hecho.texto !== info.valor.texto) conflictos.push(`«${id}» tiene textos distintos en ${previo.lugares[0].slug} y ${slug}: debe ser el mismo objeto de comun.hechos.ts`);
        previo.lugares.push({ slug, donde: info.donde, tambienEn: info.tambienEn });
      }
    }
  }
  const idsComunes = new Set(comunes.map((h) => h.id));
  for (const [id, info] of uso) {
    if (info.lugares.length > 1 && !idsComunes.has(id)) conflictos.push(`«${id}» lo usan ${info.lugares.map((l) => l.slug).join(" y ")} pero no está en comun.hechos.ts`);
  }

  const entradasHecho = (id, info, sinUso) => {
    const lugar = info.lugares[0];
    const otros = info.lugares.slice(1).flatMap((l) => [l.donde, ...l.tambienEn]);
    return nuevaEntrada({
      id,
      tipo: "hecho",
      titulo: info.titulo,
      donde: sinUso ? "comun › sin usar todavía" : lugar.donde,
      tambienEn: sinUso ? [] : [...lugar.tambienEn, ...otros],
      textoPublicado: info.hecho.texto,
      usadoPor: info.lugares.map((l) => l.slug),
      fuentesCandidatas: info.hecho.fuentes.map(fuenteDeCodigo),
    });
  };

  const hojas = new Map(SLUGS_HOJA.map((slug) => [slug, { version: HOJA_VERSION, slug, entradas: [] }]));
  const duenaDe = (id, info) => (info.lugares.length >= 2 ? SLUG_COMUN : info.lugares[0].slug);
  // Comunes primero (en el orden de comun.hechos.ts), después los hechos de cada pieza en su orden de lectura.
  for (const h of comunes) {
    const info = uso.get(h.id);
    if (!info) hojas.get(SLUG_COMUN).entradas.push(entradasHecho(h.id, { hecho: h, titulo: h.etiqueta ?? h.id, lugares: [] }, true));
    else if (duenaDe(h.id, info) === SLUG_COMUN) hojas.get(SLUG_COMUN).entradas.push(entradasHecho(h.id, info, false));
  }
  const enComun = new Set(hojas.get(SLUG_COMUN).entradas.map((e) => e.id));
  for (const slug of PIEZA_SLUGS) {
    const rec = piezas.get(slug);
    const hoja = hojas.get(slug);
    for (const id of rec.hechos.keys()) {
      const info = uso.get(id);
      if (duenaDe(id, info) === slug) hoja.entradas.push(entradasHecho(id, info, false));
      else if (!enComun.has(id)) {
        enComun.add(id);
        hojas.get(SLUG_COMUN).entradas.push(entradasHecho(id, info, false));
      }
    }
    for (const caso of rec.casos) hoja.entradas.push(entradaDeCaso(slug, caso));
    for (const [id, info] of rec.criterios) hoja.entradas.push(entradaDeCriterio(slug, id, info));
  }
  const codigo = new Map([...uso].map(([id, info]) => [id, info.hecho]));
  for (const h of comunes) if (!codigo.has(h.id)) codigo.set(h.id, h);
  return { hojas, conflictos, codigo, casos: new Map(PIEZA_SLUGS.map((s) => [s, piezas.get(s).casos])) };
}

/* ---------- Fusión: nunca pierde trabajo ---------- */
const claveDe = (slug, e) => (e.tipo === "hecho" ? `hecho:${e.id}` : `${e.tipo}:${slug}:${e.id}`);

export function tieneTrabajo(e) {
  const base = e.tipo === "hecho" ? "pendiente" : "no-aplica";
  return e.decision !== null || e.estado !== base || e.fuentesConsultadas.length > 0 || e.queDiceLaFuente !== null || e.propuesta.accion !== null || e.propuesta.detalle !== null;
}

function fusionarEntrada(fresca, previa) {
  if (!previa) return fresca;
  return nuevaEntrada({
    ...fresca,
    textoRevisado: previa.textoRevisado,
    fuentesConsultadas: previa.fuentesConsultadas,
    queDiceLaFuente: previa.queDiceLaFuente,
    estado: previa.estado,
    propuesta: previa.propuesta,
    decision: previa.decision,
    huerfana: false,
  });
}

/**
 * Mezcla las hojas guardadas (`existentes`: Map slug → hoja) con los esqueletos nuevos. Lo investigado y lo decidido se conserva aunque el dato
 * cambie de hoja; lo que ya no existe en el código y tiene trabajo queda como huérfana; lo que no tiene trabajo se descarta.
 */
export function fusionarTodas(existentes, frescas) {
  const indice = new Map();
  for (const [slug, hoja] of existentes) {
    for (const e of hoja.entradas) {
      const clave = claveDe(slug, e);
      const previo = indice.get(clave);
      if (!previo || (!tieneTrabajo(previo.entrada) && tieneTrabajo(e))) indice.set(clave, { entrada: e, slug });
    }
  }
  const usadas = new Set();
  const resultado = new Map();
  for (const [slug, fresca] of frescas) {
    const entradas = fresca.entradas.map((f) => {
      const clave = claveDe(slug, f);
      const previa = indice.get(clave);
      if (previa) usadas.add(clave);
      return fusionarEntrada(f, previa?.entrada);
    });
    resultado.set(slug, { version: HOJA_VERSION, slug, entradas });
  }
  for (const [clave, { entrada, slug }] of indice) {
    if (usadas.has(clave) || !tieneTrabajo(entrada)) continue;
    resultado.get(slug)?.entradas.push(nuevaEntrada({ ...entrada, huerfana: true }));
  }
  return resultado;
}

/* ---------- Importar markdown ---------- */
function buscarEntrada(hojas, bloque) {
  const candidatas = [];
  for (const [slug, hoja] of hojas) {
    for (const e of hoja.entradas) if (e.tipo === bloque.tipo && e.id === bloque.id) candidatas.push({ slug, e });
  }
  if (candidatas.length <= 1) return candidatas[0] ?? null;
  return null;
}

/**
 * Aplica los bloques leídos de un markdown a las hojas (Map slug → hoja, se modifica copiando). Devuelve `{ hojas, errores, avisos, tocadas }`.
 * Sin retrocesos: un campo vacío del markdown nunca borra lo que la hoja ya tiene.
 */
export function aplicarBloquesMd(hojas, bloques) {
  const errores = [];
  const avisos = [];
  const tocadas = new Set();
  const siguiente = new Map([...hojas].map(([slug, hoja]) => [slug, { ...hoja, entradas: [...hoja.entradas] }]));
  for (const bloque of bloques) {
    const hallada = buscarEntrada(siguiente, bloque);
    if (!hallada) {
      errores.push(`${bloque.tipo} «${bloque.id}»: no existe en el contenido (o es ambiguo entre piezas)`);
      continue;
    }
    const { slug, e } = hallada;
    const hoja = siguiente.get(slug);
    const i = hoja.entradas.indexOf(e);
    const estado = bloque.estado !== null && !(bloque.estado === "pendiente" && e.estado !== "pendiente") ? bloque.estado : e.estado;
    const decision = bloque.decision ?? e.decision;
    if (bloque.decision && bloque.decision.por === null) errores.push(`${bloque.id}: decisión marcada sin «aprobado por XX (AAAA-MM-DD)» en la Nota`);
    hoja.entradas[i] = nuevaEntrada({
      ...e,
      estado,
      fuentesConsultadas: bloque.fuentesConsultadas.length > 0 ? bloque.fuentesConsultadas : e.fuentesConsultadas,
      queDiceLaFuente: bloque.queDiceLaFuente ?? e.queDiceLaFuente,
      propuesta: bloque.propuesta && (bloque.propuesta.accion !== null || bloque.propuesta.detalle !== null) ? bloque.propuesta : e.propuesta,
      decision,
      textoRevisado: bloque.decision ? bloque.textoRevisado : e.textoRevisado,
    });
    tocadas.add(slug);
  }
  for (const slug of tocadas) errores.push(...validarHoja(siguiente.get(slug)).map((m) => `${slug}.json: ${m}`));
  return { hojas: siguiente, errores, avisos, tocadas };
}

/** Entradas con decisión cuyo texto publicado en el código ya no es el que leyó el dueño. */
export function textosCambiados(hoja) {
  return hoja.entradas.filter((e) => e.decision !== null && !e.huerfana && e.textoRevisado !== null && linea(e.textoRevisado) !== linea(e.textoPublicado)).map((e) => e.id);
}

/* ---------- Disco ---------- */
function serializar(hoja) {
  return `${JSON.stringify(hoja, null, 2)}\n`;
}

function rutaHoja(dir, slug, ext) {
  if (!SLUGS_HOJA.includes(slug)) throw new Error(`slug de hoja no permitido: ${slug}`);
  return join(dir, `${slug}.${ext}`);
}

function escribirSiCambia(ruta, contenido) {
  const previo = existsSync(ruta) ? readFileSync(ruta, "utf8") : null;
  if (previo === contenido) return "sin cambios";
  writeFileSync(ruta, contenido, "utf8");
  return previo === null ? "creado" : "actualizado";
}

/** Lee los JSON que existan. Un JSON ilegible es un error, no un archivo ausente. */
export function leerHojas(dir = DIR_VERIFICACION) {
  const hojas = new Map();
  for (const slug of SLUGS_HOJA) {
    const ruta = rutaHoja(dir, slug, "json");
    if (!existsSync(ruta)) continue;
    let json;
    try {
      json = JSON.parse(readFileSync(ruta, "utf8"));
    } catch (error) {
      throw new Error(`${slug}.json no es JSON válido: ${error instanceof Error ? error.message : String(error)}`);
    }
    hojas.set(slug, json);
  }
  return hojas;
}

export function nombresDeHojas(registro = PIEZAS) {
  const nombres = { [SLUG_COMUN]: "Hechos comunes" };
  for (const slug of PIEZA_SLUGS) nombres[slug] = registro[slug].contenido.nombreCorto;
  return nombres;
}

function escribirHoja(dir, hoja, nombres) {
  const json = escribirSiCambia(rutaHoja(dir, hoja.slug, "json"), serializar(hoja));
  const md = escribirSiCambia(rutaHoja(dir, hoja.slug, "md"), renderHojaMd(hoja, nombres[hoja.slug]));
  return `${hoja.slug}.json ${json} · ${hoja.slug}.md ${md}`;
}

/* ---------- Estado ---------- */
export function filasDeEstado(hojas, esqueletos) {
  const filas = [];
  const vigentes = fusionarTodas(hojas, esqueletos.hojas);
  for (const slug of SLUGS_HOJA) {
    const hoja = hojas.get(slug) ?? null;
    const base = hoja ?? esqueletos.hojas.get(slug);
    const c = contarHoja(base);
    const hechos = base.entradas.filter((e) => e.tipo === "hecho" && !e.huerfana);
    const verificadosCodigo = hechos.filter((e) => esqueletos.codigo.get(e.id)?.verificadoEn).length;
    const porAplicar = hechos.filter((e) => e.decision && e.decision.valor !== "quitar" && !esqueletos.codigo.get(e.id)?.verificadoEn).length;
    const sinDecisionVerificado = hechos.filter((e) => !e.decision && esqueletos.codigo.get(e.id)?.verificadoEn).length;
    const casosAprobados = (esqueletos.casos.get(slug) ?? []).filter((caso) => caso.aprobadoEn).length;
    const desactualizado = hoja ? serializar(hoja) !== serializar(vigentes.get(slug)) : null;
    filas.push({ slug, hoja: hoja !== null, desactualizado, c, verificadosCodigo, porAplicar, sinDecisionVerificado, casosAprobados, cambiados: hoja ? textosCambiados(hoja).length : 0 });
  }
  return filas;
}

function imprimirEstado(filas, conflictos, nombres) {
  const cols = ["Hoja", "Hechos", "Verif.cód", "✅", "🟡", "❌", "⚪sf", "⚪pend", "Aprob", "Ajust", "Quitar", "SinDec", "Casos", "Crit", "Avisos"];
  const filasTexto = filas.map(({ slug, hoja, desactualizado, c, verificadosCodigo, porAplicar, sinDecisionVerificado, casosAprobados, cambiados }) => {
    const avisos = [];
    if (!hoja) avisos.push("sin JSON (corre --esqueleto)");
    else if (desactualizado) avisos.push("esqueleto desactualizado");
    if (porAplicar > 0) avisos.push(`${porAplicar} por aplicar (Fase 4)`);
    if (sinDecisionVerificado > 0) avisos.push(`${sinDecisionVerificado} verificados en código sin decisión en la hoja`);
    if (cambiados > 0) avisos.push(`${cambiados} con texto cambiado tras decidir`);
    if (c.huerfanas > 0) avisos.push(`${c.huerfanas} huérfanas`);
    const casos = `${c.casosDecididos}/${c.casos}${casosAprobados ? ` (cód ${casosAprobados})` : ""}`;
    return [
      nombres[slug],
      c.hechos,
      verificadosCodigo,
      c.estados.verificado,
      c.estados.parcial,
      c.estados.contradicho,
      c.estados["sin-fuente"],
      c.estados.pendiente,
      c.aprobar,
      c.ajustar,
      c.quitar,
      c.sinDecision,
      casos,
      `${c.criteriosDecididos}/${c.criterios}`,
      avisos.join("; ") || "—",
    ].map(String);
  });
  const anchos = cols.map((col, i) => Math.max(col.length, ...filasTexto.map((f) => f[i].length)));
  const fila = (celdasFila) => celdasFila.map((t, i) => t.padEnd(anchos[i])).join("  ");
  console.log(fila(cols));
  console.log(anchos.map((a) => "-".repeat(a)).join("  "));
  for (const f of filasTexto) console.log(fila(f));
  for (const conflicto of conflictos) console.log(`AVISO: ${conflicto}`);
}

/* ---------- CLI ---------- */
function sheetsDestino(argumentos) {
  const restantes = argumentos.filter((a) => a !== "--todas");
  if (restantes.length === 0) return [...SLUGS_HOJA];
  for (const slug of restantes) if (!SLUGS_HOJA.includes(slug)) throw new Error(`hoja desconocida: «${slug}». Opciones: ${SLUGS_HOJA.join(", ")} o --todas`);
  return restantes;
}

function cmdEsqueleto(argumentos, dir) {
  const destino = sheetsDestino(argumentos);
  const esq = construirEsqueletos();
  const existentes = leerHojas(dir);
  const fusion = fusionarTodas(existentes, esq.hojas);
  // Si el dueño de un dato con trabajo cambió de hoja, escribir solo una de las dos perdería ese trabajo.
  for (const [slug, previa] of existentes) {
    if (destino.includes(slug)) continue;
    const nueva = fusion.get(slug);
    if (nueva && serializar(previa) !== serializar(nueva)) throw new Error(`escribir solo ${destino.join(", ")} dejaría desfasada la hoja «${slug}» (un dato cambió de hoja). Usa --todas.`);
  }
  mkdirSync(dir, { recursive: true });
  const nombres = nombresDeHojas();
  for (const slug of destino) console.log(escribirHoja(dir, fusion.get(slug), nombres));
  for (const conflicto of esq.conflictos) console.log(`AVISO: ${conflicto}`);
  const errores = [...fusion.values()].flatMap((h) => validarHoja(h).map((m) => `${h.slug}.json: ${m}`));
  if (errores.length > 0) throw new Error(`hojas con errores:\n${errores.join("\n")}`);
}

function cmdImportarMd(archivos, dir) {
  if (archivos.length === 0) throw new Error("--importar-md necesita al menos un archivo .md");
  const esq = construirEsqueletos();
  let hojas = fusionarTodas(leerHojas(dir), esq.hojas);
  const tocadas = new Set();
  for (const archivo of archivos) {
    if (!archivo.endsWith(".md")) throw new Error(`${archivo}: no es un .md`);
    if (statSync(archivo).size > TAMANO_MAXIMO_MD) throw new Error(`${archivo}: pesa más de ${TAMANO_MAXIMO_MD} bytes`);
    const { bloques, avisos: avisosMd } = parsearMd(readFileSync(archivo, "utf8"));
    const resultado = aplicarBloquesMd(hojas, bloques);
    for (const aviso of [...avisosMd, ...resultado.avisos]) console.log(`AVISO ${archivo}: ${aviso}`);
    if (resultado.errores.length > 0) throw new Error(`${archivo}:\n${resultado.errores.join("\n")}`);
    hojas = resultado.hojas;
    for (const slug of resultado.tocadas) tocadas.add(slug);
    console.log(`${archivo}: ${bloques.length} bloques leídos`);
  }
  mkdirSync(dir, { recursive: true });
  const nombres = nombresDeHojas();
  for (const slug of tocadas) {
    console.log(escribirHoja(dir, hojas.get(slug), nombres));
    const cambiados = textosCambiados(hojas.get(slug));
    if (cambiados.length > 0) console.log(`AVISO ${slug}: el texto del código cambió después de la decisión en: ${cambiados.join(", ")}`);
  }
}

function hojasVigentes(dir) {
  const esq = construirEsqueletos();
  const fusion = fusionarTodas(leerHojas(dir), esq.hojas);
  return { esq, hojas: SLUGS_HOJA.map((slug) => fusion.get(slug)) };
}

function cmdConsolidar(dir) {
  const { hojas } = hojasVigentes(dir);
  mkdirSync(dir, { recursive: true });
  const ruta = join(dir, "CONSOLIDADA.md");
  console.log(`CONSOLIDADA.md ${escribirSiCambia(ruta, renderConsolidada(hojas, nombresDeHojas()))}`);
  const total = hojas.reduce((suma, h) => suma + contarHoja(h).hechos, 0);
  console.log(`${hojas.length} hojas, ${total} hechos.`);
}

function cmdEstado(dir) {
  const esq = construirEsqueletos();
  const hojas = leerHojas(dir);
  imprimirEstado(filasDeEstado(hojas, esq), esq.conflictos, nombresDeHojas());
}

function cmdMd(argumentos, dir) {
  const hojas = leerHojas(dir);
  const nombres = nombresDeHojas();
  for (const slug of sheetsDestino(argumentos)) {
    const hoja = hojas.get(slug);
    if (!hoja) {
      console.log(`${slug}: sin JSON (corre --esqueleto)`);
      continue;
    }
    console.log(`${slug}.md ${escribirSiCambia(rutaHoja(dir, slug, "md"), renderHojaMd(hoja, nombres[slug]))}`);
  }
}

function cmdValidar(dir) {
  const hojas = leerHojas(dir);
  let errores = 0;
  for (const [slug, hoja] of hojas) {
    const lista = validarHoja(hoja);
    errores += lista.length;
    console.log(`${slug}.json: ${lista.length === 0 ? "válida" : `${lista.length} errores`}`);
    for (const m of lista) console.log(`  - ${m}`);
  }
  if (errores > 0) throw new Error(`${errores} errores de validación`);
}

export function main(argv) {
  const [sub, ...resto] = argv;
  const dir = DIR_VERIFICACION;
  switch (sub) {
    case "--esqueleto":
      return cmdEsqueleto(resto, dir);
    case "--importar-md":
      return cmdImportarMd(resto, dir);
    case "--consolidar":
      return cmdConsolidar(dir);
    case "--estado":
      return cmdEstado(dir);
    case "--md":
      return cmdMd(resto, dir);
    case "--validar":
      return cmdValidar(dir);
    case "--aplicar":
      console.log("--aplicar se implementa en la Fase 4 (docs/piezas-plan-2.md §5.6): ver la cabecera de este script.");
      process.exitCode = 2;
      return undefined;
    default:
      console.log("Uso: --esqueleto [<slug>|--todas] | --importar-md <a.md…> | --consolidar | --estado | --md [<slug>|--todas] | --validar | --aplicar (Fase 4)");
      process.exitCode = sub === undefined ? 0 : 1;
      return undefined;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
