/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-19
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// `--aplicar` de scripts/hoja-verificacion.mjs (docs/piezas-plan-2.md §5.6): pasa las decisiones de docs/verificacion/*.json al CÓDIGO de las piezas.
//  · Hecho aprobar/ajustar → en su llamada `hecho*("id", "texto", [fuentes], nota)`: con ajustar cambia el texto por `decision.textoFinal`; deja como fuentes
//    las consultadas de la hoja (https y con fecha, primarias primero); pone la nota «Decisión de NB (…)» y envuelve la llamada con
//    `verificadoPorDueno(hecho, en, por)` (constructores.ts). Los agentes no escriben verificadoEn/verificadoPor a mano: solo este script, desde el JSON.
//  · Caso/criterio aprobar → aprobadoEn/aprobadoPor en el literal (o `aprobadoPorDueno(criterio(…), en, por)`); un «vivido» además queda con confirmadoPorDueno.
//  · NO implementa `quitar` ni las fusiones: son cambios de prosa y de datos que hacen agentes a mano (se listan como pendientes).
// Es idempotente, usa el AST de `typescript` (scripts/hoja-codigo.mjs), solo escribe en una lista cerrada de archivos, valida la sintaxis antes de escribir
// y escribe de forma atómica. Sin red: los textos de las hojas y del código son DATOS, nunca se ejecutan.
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { FECHA_VERIFICACION, HOY, VERIFICADOR } from "../src/lib/piezas/constructores.ts";
import * as FUENTES from "../src/lib/piezas/fuentes.ts";
import { esFechaHoja, esFuentePrimariaAbierta, SLUGS_HOJA, validarHoja } from "../src/lib/piezas/hoja.ts";
import { PIEZA_SLUGS } from "../src/lib/piezas/types.ts";
import {
  ENV_APROBACION,
  ENV_DUENO,
  aplicarEdiciones,
  constantesFuente,
  editoresPorUrl,
  envolverLlamada,
  erroresDeSintaxis,
  esPrimeroEnLinea,
  esTextoLiteral,
  formatearFuentes,
  importesDe,
  indexarAprobables,
  indexarHechos,
  leerFuente,
  propiedadDe,
  referenciasA,
  sangriaDeLinea,
  tienePlantillaMultilinea,
} from "./hoja-codigo.mjs";
import { linea } from "./hoja-md.mjs";
import { construirEsqueletos, leerHojas, DIR_VERIFICACION } from "./hoja-verificacion.mjs";

export const RAIZ_REPO = new URL("..", import.meta.url).pathname;
const MODULO_CONSTRUCTORES = "./constructores.ts";
const MODULO_FUENTES = "./fuentes.ts";

/** Archivos que `--aplicar` puede escribir (lista cerrada, relativos a la raíz del repo). */
export const ARCHIVOS_ESCRIBIBLES = [...PIEZA_SLUGS.map((slug) => `src/lib/piezas/${slug}.contenido.ts`), "src/lib/piezas/comun.hechos.ts"];
/** Archivos que se leen para ubicar los hechos (los escribibles). `fuentes.ts` y `procesador.datos.ts` solo se leen. */
const ARCHIVO_FUENTES = "src/lib/piezas/fuentes.ts";

/**
 * Editor (`Fuente.editor`) por servidor, para las fuentes nuevas cuyo editor no se puede sacar del código ni de la hoja. Es el último recurso: si una URL
 * no se resuelve, `--aplicar` falla y la lista; entonces se agrega aquí el servidor.
 */
export const EDITOR_POR_HOST = {
  "en.wikipedia.org": "Wikipedia",
  "learn.microsoft.com": "Microsoft",
  "support.microsoft.com": "Microsoft",
  "lenovopress.lenovo.com": "Lenovo",
  "rog.asus.com": "ASUS",
  "www.asus.com": "ASUS",
  "asus.com": "ASUS",
  "sata-io.org": "SATA-IO",
  "us.design-reuse.com": "Design & Reuse",
  "www.design-reuse.com": "Design & Reuse",
  "www.amd.com": "AMD",
  "www.intel.com": "Intel",
  "www.intel.com.au": "Intel",
  "www.dell.com": "Dell",
  "www.micron.com": "Micron",
  "assets.micron.com": "Micron",
  "www.kingston.com": "Kingston",
  "www.nvidia.com": "NVIDIA",
  "www.corsair.com": "Corsair",
  "www.samsung.com": "Samsung",
  "www.seagate.com": "Seagate",
  "www.westerndigital.com": "Western Digital",
  "nvmexpress.org": "NVM Express",
  "www.ti.com": "Texas Instruments",
  "download.gigabyte.com": "Gigabyte",
  "download.asrock.com": "ASRock",
  "www.asrock.com": "ASRock",
  "dlcdnets.asus.com": "ASUS",
  "download-2.msi.com": "MSI",
  "www.arctic.de": "ARCTIC",
  "www.coolermaster.com": "Cooler Master",
  "www.deepcool.com": "DeepCool",
  "www.fractal-design.com": "Fractal Design",
  "nzxt.com": "NZXT",
};

const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;

/* ---------- Contexto de código ---------- */
const resolverIdentificador = (nombre) => ({ HOY, FECHA_VERIFICACION })[nombre];

/** Valores de las constantes exportadas de fuentes.ts que son una Fuente: nombre → Fuente. */
function fuentesExportadas() {
  const mapa = new Map();
  for (const [nombre, valor] of Object.entries(FUENTES)) {
    if (valor && typeof valor === "object" && typeof valor.url === "string" && "consultadoEn" in valor) mapa.set(nombre, valor);
  }
  return mapa;
}

/** Lee los archivos de la lista cerrada y fuentes.ts. Devuelve { textos: Map ruta→texto, editores: Map url→editor }. */
export function leerCodigo(raiz = RAIZ_REPO) {
  const textos = new Map();
  for (const ruta of [...ARCHIVOS_ESCRIBIBLES, ARCHIVO_FUENTES]) {
    const completa = join(raiz, ruta);
    if (!existsSync(completa)) throw new Error(`no existe ${ruta}`);
    textos.set(ruta, readFileSync(completa, "utf8"));
  }
  return { textos, raiz };
}

function editoresDelCodigo(textos) {
  const todos = new Map();
  for (const [ruta, texto] of textos) for (const [url, editor] of editoresPorUrl(leerFuente(texto, ruta))) if (!todos.has(url)) todos.set(url, editor);
  return todos;
}

/** Contexto que usan las funciones puras: editores conocidos, fuentes exportadas y resolución de identificadores. */
export function crearContexto(textos) {
  return { editoresCodigo: editoresDelCodigo(textos), fuentesExportadas: fuentesExportadas(), resolverIdentificador };
}

function resolverEditor(fuente, tarea, ctx) {
  const delCodigo = ctx.editoresCodigo.get(fuente.url);
  if (delCodigo) return delCodigo;
  const candidata = (tarea.candidatas ?? []).find((c) => c.url === fuente.url && c.editor);
  if (candidata) return candidata.editor;
  if (fuente.editor && fuente.editor.trim() !== "") return linea(fuente.editor);
  try {
    return EDITOR_POR_HOST[new URL(fuente.url).host] ?? null;
  } catch {
    return null;
  }
}

/** Fuentes que dejará un hecho: las consultadas de la hoja con https y fecha, primarias primero y sin repetir (url + fecha). */
export function fuentesDeHoja(entrada) {
  const validas = entrada.fuentesConsultadas.filter((f) => typeof f.url === "string" && f.url.startsWith("https://") && esFechaHoja(f.consultadoEn));
  const ordenadas = [...validas.filter(esFuentePrimariaAbierta), ...validas.filter((f) => !esFuentePrimariaAbierta(f))];
  const vistas = new Set();
  return ordenadas.filter((f) => {
    const clave = `${f.url}|${f.consultadoEn}`;
    if (vistas.has(clave)) return false;
    vistas.add(clave);
    return true;
  });
}

export function notaDeDecision(tarea) {
  const base = `Decisión de ${tarea.por} (${tarea.en}, hoja ${tarea.hoja}): ${tarea.valor}.`;
  const extra = tarea.notaDecision ? linea(tarea.notaDecision) : "";
  return extra === "" ? base : `${base} ${extra}`;
}

/* ---------- Edición de un archivo ---------- */

function asegurarImportes(texto, nombres) {
  if (nombres.length === 0) return texto;
  const sf = leerFuente(texto);
  const existentes = importesDe(sf, MODULO_CONSTRUCTORES);
  if (existentes.length === 0) {
    const ultimo = [...sf.statements].reverse().find((s) => ts.isImportDeclaration(s));
    const linea = `import { ${[...nombres].sort().join(", ")} } from "${MODULO_CONSTRUCTORES}";\n`;
    return ultimo ? texto.slice(0, ultimo.end + 1) + linea + texto.slice(ultimo.end + 1) : linea + texto;
  }
  const declaracion = existentes[0].declaracion;
  const enlaces = declaracion.importClause.namedBindings;
  const actuales = enlaces.elements.map((e) => e.getText(sf));
  const faltan = nombres.filter((n) => !actuales.includes(n));
  if (faltan.length === 0) return texto;
  const todos = [...actuales, ...faltan].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  return aplicarEdiciones(texto, [{ start: enlaces.getStart(sf), end: enlaces.end, text: `{ ${todos.join(", ")} }` }]);
}

/** Texto de una declaración de import con solo los especificadores `quedan` (una línea por nombre si el original ocupaba varias). */
function importSinNombres(texto, sf, declaracion, quitar) {
  const enlaces = declaracion.importClause.namedBindings;
  const quedan = enlaces.elements.filter((e) => !quitar.includes(e.name.text));
  if (quedan.length === 0) {
    const fin = texto[declaracion.end] === "\n" ? declaracion.end + 1 : declaracion.end;
    return { start: declaracion.getStart(sf), end: fin, text: "" };
  }
  const multilinea = enlaces.getText(sf).includes("\n");
  const nombres = quedan.map((e) => e.getText(sf));
  const nuevo = multilinea ? `{\n${nombres.map((n) => `  ${n},`).join("\n")}\n}` : `{ ${nombres.join(", ")} }`;
  return { start: enlaces.getStart(sf), end: enlaces.end, text: nuevo };
}

/**
 * Segunda pasada: borra las constantes `Fuente` locales (no exportadas) y los import de fuentes.ts / del tipo `Fuente` que tenían referencias y ya no.
 * `antes` es el texto previo a las ediciones de hechos. Devuelve { texto, eliminadas, importesQuitados }.
 */
function limpiarFuentes(antes, despues, ctx) {
  const sfAntes = leerFuente(antes);
  const eliminadas = [];
  const importesQuitados = [];

  // Pasada 1: constantes locales que tenían referencias y ya no.
  const sf1 = leerFuente(despues);
  const borrar = [];
  for (const c of constantesFuente(sf1, ctx.resolverIdentificador).filter((x) => !x.exportada)) {
    if (referenciasA(sfAntes, c.nombre) > 0 && referenciasA(sf1, c.nombre) === 0) {
      const fin = despues[c.sentencia.end] === "\n" ? c.sentencia.end + 1 : c.sentencia.end;
      borrar.push({ start: c.sentencia.getStart(sf1), end: fin, text: "" });
      eliminadas.push(c.nombre);
    }
  }
  let texto = borrar.length > 0 ? aplicarEdiciones(despues, borrar) : despues;
  // Si ya no queda ninguna constante local de fuentes, también sobra el encabezado de esa sección.
  if (eliminadas.length > 0 && constantesFuente(leerFuente(texto), ctx.resolverIdentificador).filter((c) => !c.exportada).length === 0) {
    texto = texto.replace(/^\/\* -{3,} Fuentes[^\n]*[\s\S]*?\*\/\r?\n(?:\r?\n)?/m, "");
  }

  // Pasada 2 (sobre el texto ya sin esas constantes): import de fuentes.ts y del tipo `Fuente` que se quedaron sin usos.
  const sf2 = leerFuente(texto);
  const ediciones = [];
  const quitarDeImport = (modulo, filtro) => {
    const porDeclaracion = new Map();
    for (const imp of importesDe(sf2, modulo)) {
      if (!filtro(imp)) continue;
      if (referenciasA(sfAntes, imp.nombre) > 0 && referenciasA(sf2, imp.nombre) === 0) {
        porDeclaracion.set(imp.declaracion, [...(porDeclaracion.get(imp.declaracion) ?? []), imp.nombre]);
        importesQuitados.push(imp.nombre);
      }
    }
    for (const [declaracion, nombres] of porDeclaracion) ediciones.push(importSinNombres(texto, sf2, declaracion, nombres));
  };
  quitarDeImport(MODULO_FUENTES, () => true);
  quitarDeImport("./types.ts", (imp) => imp.nombre === "Fuente");
  if (ediciones.length > 0) texto = aplicarEdiciones(texto, ediciones);
  if (eliminadas.length > 0 || importesQuitados.length > 0) texto = /\n{3,}/.test(antes) ? texto : texto.replace(/\n{3,}/g, "\n\n");
  return { texto, eliminadas, importesQuitados };
}

/** Constantes de fuentes disponibles en este archivo: las locales y las importadas de fuentes.ts. */
function constantesDisponibles(sf, ctx) {
  const lista = constantesFuente(sf, ctx.resolverIdentificador).map((c) => ({ nombre: c.nombre, url: c.url, consultadoEn: c.consultadoEn }));
  for (const imp of importesDe(sf, MODULO_FUENTES)) {
    const f = ctx.fuentesExportadas.get(imp.nombre);
    if (f) lista.push({ nombre: imp.nombre, url: f.url, consultadoEn: f.consultadoEn });
  }
  return lista;
}

function editarHecho(texto, sf, item, tarea, ctx, constantes, salida) {
  const { llamada, ctor, envolturas } = item;
  const a = llamada.arguments;
  const dueno = envolturas.find((e) => e.expression.text === ENV_DUENO);
  if (a.length < 3 || !esTextoLiteral(a[1])) return salida.errores.push(`${tarea.hoja}/${tarea.id}: el texto no es un literal (${item.contexto || "sin contexto"}, línea ${item.linea})`);
  if (!ts.isArrayLiteralExpression(a[2])) return salida.errores.push(`${tarea.hoja}/${tarea.id}: las fuentes no son un arreglo literal (línea ${item.linea})`);
  const textoActual = a[1].text;
  const esperados = [tarea.textoRevisado, ...(tarea.valor === "ajustar" ? [tarea.textoFinal] : [])].filter((t) => t !== null);
  if (!esperados.some((t) => linea(t) === linea(textoActual))) {
    return salida.errores.push(`${tarea.hoja}/${tarea.id}: el texto del código no es ni el que leyó el dueño ni el ajustado (línea ${item.linea}); revisa el texto o vuelve a congelar`);
  }
  if ((ctor === "hechoVerificado" || ctor === "hechoVerificadoB") && !dueno) {
    if (tarea.valor === "aprobar" && tarea.en === FECHA_VERIFICACION && tarea.por === VERIFICADOR) return salida.resultados.push({ id: tarea.id, accion: "sin cambios (verificado antes en el código)" });
    return salida.errores.push(`${tarea.hoja}/${tarea.id}: usa ${ctor} (verificación anterior) y la decisión no es la misma; resuélvelo a mano (línea ${item.linea})`);
  }

  const inicio = llamada.getStart(sf);
  const fin = llamada.end;
  const multilinea = texto.slice(inicio, fin).includes("\n");
  const sangriaBase = sangriaDeLinea(texto, inicio);
  const posFuentes = a[2].getStart(sf);
  const sangriaArg = esPrimeroEnLinea(texto, posFuentes) ? sangriaDeLinea(texto, posFuentes) : `${sangriaBase}  `;

  const elementos = [];
  for (const f of tarea.fuentes) {
    const existente = constantes.find((c) => c.url === f.url && c.consultadoEn === f.consultadoEn);
    if (existente) {
      elementos.push({ ref: existente.nombre });
      continue;
    }
    const editor = resolverEditor(f, tarea, ctx);
    if (!editor) {
      salida.sinEditor.add(f.url);
      continue;
    }
    elementos.push({ fuente: { titulo: linea(f.titulo), editor, url: f.url, consultadoEn: f.consultadoEn } });
  }
  if (elementos.length === 0) return salida.errores.push(`${tarea.hoja}/${tarea.id}: sin fuentes consultadas con https y fecha`);

  const interiores = [];
  if (tarea.valor === "ajustar" && textoActual !== tarea.textoFinal) interiores.push({ start: a[1].getStart(sf), end: a[1].end, text: JSON.stringify(tarea.textoFinal) });
  interiores.push({ start: posFuentes, end: a[2].end, text: formatearFuentes(elementos, sangriaArg) });
  const nota = JSON.stringify(notaDeDecision(tarea));
  if (a.length >= 4) interiores.push({ start: a[3].getStart(sf), end: a[3].end, text: nota });
  else interiores.push({ start: a[2].end, end: a[2].end, text: multilinea ? `,\n${sangriaArg}${nota}` : `, ${nota}` });

  const relativas = interiores.map((e) => ({ start: e.start - inicio, end: e.end - inicio, text: e.text }));
  let nuevoLlamada = aplicarEdiciones(texto.slice(inicio, fin), relativas);
  const ediciones = [];
  if (dueno) {
    for (const [i, valor] of [[1, tarea.en], [2, tarea.por]]) {
      const arg = dueno.arguments[i];
      if (!arg || !esTextoLiteral(arg)) return salida.errores.push(`${tarea.hoja}/${tarea.id}: ${ENV_DUENO} sin argumentos literales (línea ${item.linea})`);
      if (arg.text !== valor) ediciones.push({ start: arg.getStart(sf), end: arg.end, text: JSON.stringify(valor) });
    }
  } else {
    nuevoLlamada = envolverLlamada(nuevoLlamada, sangriaBase, ENV_DUENO, tarea.en, tarea.por, !tienePlantillaMultilinea(llamada, sf));
    salida.necesita.add(ENV_DUENO);
  }
  const textoOriginal = texto.slice(inicio, fin);
  if (nuevoLlamada !== textoOriginal) ediciones.push({ start: inicio, end: fin, text: nuevoLlamada });
  salida.ediciones.push(...ediciones);
  salida.resultados.push({ id: tarea.id, accion: ediciones.length > 0 ? `aplicado (${tarea.valor})` : "sin cambios" });
}

function editarAprobable(texto, sf, item, tarea, salida) {
  const donde = `${tarea.hoja}/${tarea.id}`;
  const ediciones = [];
  const comparar = (textoActual) => {
    if (tarea.textoRevisado === null || linea(textoActual) !== linea(tarea.textoRevisado)) {
      salida.errores.push(`${donde}: el texto del código no es el que leyó el dueño (línea ${item.linea}); revisa el texto o vuelve a congelar`);
      return false;
    }
    return true;
  };
  if (item.forma === "llamada") {
    const a = item.nodo.arguments;
    if (!esTextoLiteral(a[1])) return salida.errores.push(`${donde}: el texto no es un literal (línea ${item.linea})`);
    if (!comparar(a[1].text)) return undefined;
    const envoltura = item.envolturas.find((e) => e.expression.text === ENV_APROBACION);
    if (envoltura) {
      for (const [i, valor] of [[1, tarea.en], [2, tarea.por]]) {
        const arg = envoltura.arguments[i];
        if (!arg || !esTextoLiteral(arg)) return salida.errores.push(`${donde}: ${ENV_APROBACION} sin argumentos literales (línea ${item.linea})`);
        if (arg.text !== valor) ediciones.push({ start: arg.getStart(sf), end: arg.end, text: JSON.stringify(valor) });
      }
    } else {
      const inicio = item.nodo.getStart(sf);
      const original = texto.slice(inicio, item.nodo.end);
      ediciones.push({ start: inicio, end: item.nodo.end, text: envolverLlamada(original, sangriaDeLinea(texto, inicio), ENV_APROBACION, tarea.en, tarea.por, !tienePlantillaMultilinea(item.nodo, sf)) });
      salida.necesita.add(ENV_APROBACION);
    }
  } else {
    const obj = item.nodo;
    const textoProp = propiedadDe(obj, "texto");
    if (!textoProp || !esTextoLiteral(textoProp.initializer)) return salida.errores.push(`${donde}: el texto no es un literal (línea ${item.linea})`);
    if (!comparar(textoProp.initializer.text)) return undefined;
    const prop = { en: propiedadDe(obj, "aprobadoEn"), por: propiedadDe(obj, "aprobadoPor") };
    if (!prop.en || !prop.por) return salida.errores.push(`${donde}: falta aprobadoEn o aprobadoPor en el literal (línea ${item.linea})`);
    for (const [p, valor] of [[prop.en, tarea.en], [prop.por, tarea.por]]) {
      const actual = esTextoLiteral(p.initializer) ? p.initializer.text : null;
      if (actual !== valor) ediciones.push({ start: p.initializer.getStart(sf), end: p.initializer.end, text: JSON.stringify(valor) });
    }
    if (item.tipo === "caso") {
      const tipoProp = propiedadDe(obj, "tipo");
      const tipoCodigo = tipoProp && esTextoLiteral(tipoProp.initializer) ? tipoProp.initializer.text : null;
      if (tipoCodigo !== tarea.casoTipo) return salida.errores.push(`${donde}: el tipo del caso en el código («${tipoCodigo}») no es el de la hoja («${tarea.casoTipo}»)`);
      const confirma = propiedadDe(obj, "confirmadoPorDueno");
      const esTrue = confirma !== undefined && confirma.initializer.kind === ts.SyntaxKind.TrueKeyword;
      if (tarea.casoTipo === "vivido" && !esTrue) {
        if (confirma) ediciones.push({ start: confirma.initializer.getStart(sf), end: confirma.initializer.end, text: "true" });
        else ediciones.push({ start: prop.por.end, end: prop.por.end, text: `,\n${sangriaDeLinea(texto, prop.por.getStart(sf))}confirmadoPorDueno: true` });
      }
      if (tarea.casoTipo === "puede-pasar" && esTrue) return salida.errores.push(`${donde}: un «puede pasar» no puede estar confirmado por el dueño`);
    }
  }
  salida.ediciones.push(...ediciones);
  salida.resultados.push({ id: tarea.id, accion: ediciones.length > 0 ? `aplicado (${tarea.tipo})` : "sin cambios" });
  return undefined;
}

/**
 * Aplica las tareas de UN archivo a su texto. Pura: no lee ni escribe disco.
 * tarea: { tipo: "hecho"|"caso"|"criterio", id, hoja, valor, en, por, textoRevisado, textoFinal, notaDecision, fuentes, candidatas, casoTipo }.
 * Devuelve { texto, errores, resultados, eliminadas, importesQuitados, sinEditor } — si hay errores o URLs sin editor, `texto` es el original.
 */
export function aplicarEnTexto(texto, ruta, tareas, ctx) {
  const sf = leerFuente(texto, ruta);
  const hechos = indexarHechos(sf);
  const aprobables = indexarAprobables(sf);
  const constantes = constantesDisponibles(sf, ctx);
  const salida = { ediciones: [], errores: [], resultados: [], necesita: new Set(), sinEditor: new Set() };
  for (const tarea of tareas) {
    const lista = tarea.tipo === "hecho" ? hechos.filter((h) => h.id === tarea.id) : aprobables.filter((x) => x.tipo === tarea.tipo && x.id === tarea.id);
    if (lista.length !== 1) {
      salida.errores.push(`${tarea.hoja}/${tarea.id}: se esperaba 1 nodo en ${ruta} y hay ${lista.length}`);
      continue;
    }
    if (tarea.tipo === "hecho") editarHecho(texto, sf, lista[0], tarea, ctx, constantes, salida);
    else editarAprobable(texto, sf, lista[0], tarea, salida);
  }
  const base = { errores: salida.errores, resultados: salida.resultados, eliminadas: [], importesQuitados: [], sinEditor: salida.sinEditor };
  if (salida.errores.length > 0 || salida.sinEditor.size > 0) return { ...base, texto };
  if (salida.ediciones.length === 0) return { ...base, texto };
  let nuevo = aplicarEdiciones(texto, salida.ediciones);
  const erroresIntermedios = erroresDeSintaxis(nuevo);
  if (erroresIntermedios.length > 0) return { ...base, errores: [`${ruta}: sintaxis inválida tras editar: ${erroresIntermedios[0]}`], texto };
  nuevo = asegurarImportes(nuevo, [...salida.necesita]);
  const limpio = limpiarFuentes(texto, nuevo, ctx);
  const erroresFinales = erroresDeSintaxis(limpio.texto);
  if (erroresFinales.length > 0) return { ...base, errores: [`${ruta}: sintaxis inválida tras limpiar: ${erroresFinales[0]}`], texto };
  return { ...base, texto: limpio.texto, eliminadas: limpio.eliminadas, importesQuitados: limpio.importesQuitados };
}

/* ---------- Plan sobre todas las hojas ---------- */
const claveDe = (slug, e) => (e.tipo === "hecho" ? `hecho:${e.id}` : `${e.tipo}:${slug}:${e.id}`);

/** Resumen de líneas distintas (multiconjunto): suficiente para el plan, no es un diff exacto. */
export function resumenDeDiff(antes, despues) {
  const cuenta = new Map();
  for (const l of antes.split("\n")) cuenta.set(l, (cuenta.get(l) ?? 0) + 1);
  let agregadas = 0;
  for (const l of despues.split("\n")) {
    const n = cuenta.get(l) ?? 0;
    if (n > 0) cuenta.set(l, n - 1);
    else agregadas += 1;
  }
  let quitadas = 0;
  for (const n of cuenta.values()) quitadas += n;
  return { agregadas, quitadas };
}

/**
 * Valida y construye el plan. No escribe. `hojas`: Map slug → hoja (todas las del disco). `objetivo`: slugs a aplicar.
 * Devuelve { errores, avisos, archivos: [{ ruta, antes, despues, resultados, eliminadas, importesQuitados }], pendientes: [{ hoja, id, tipo, nota }], sinUso }.
 */
export function planearAplicacion({ hojas, objetivo, esqueletos, codigo }) {
  const errores = [];
  const avisos = [];
  const pendientes = [];
  for (const slug of SLUGS_HOJA) if (!hojas.has(slug)) errores.push(`falta docs/verificacion/${slug}.json (corre --esqueleto --todas)`);
  for (const [slug, hoja] of hojas) for (const m of validarHoja(hoja)) errores.push(`${slug}.json: ${m}`);
  if (errores.length > 0) return { errores, avisos, archivos: [], pendientes, sinUso: [] };

  // Cobertura: todo dato del código tiene entrada, y toda entrada viva tiene código.
  const clavesHojas = new Map();
  for (const [slug, hoja] of hojas) for (const e of hoja.entradas) clavesHojas.set(claveDe(slug, e), { slug, e });
  const clavesCodigo = new Set();
  for (const [slug, hoja] of esqueletos.hojas) {
    for (const e of hoja.entradas) {
      const clave = e.tipo === "hecho" ? `hecho:${e.id}` : claveDe(slug, e);
      clavesCodigo.add(clave);
      if (!clavesHojas.has(clave)) errores.push(`${slug}/${e.id}: ${e.tipo} del código sin entrada en ninguna hoja (corre --esqueleto --todas y decídelo)`);
    }
  }
  for (const [clave, { slug, e }] of clavesHojas) {
    if (!e.huerfana && !clavesCodigo.has(clave)) errores.push(`${slug}/${e.id}: la entrada ya no existe en el código y no está marcada huérfana (corre --esqueleto --todas)`);
  }

  const ctx = crearContexto(codigo.textos);
  const tareasPorArchivo = new Map();
  const hechosEnArchivos = new Map(); // id → rutas
  for (const ruta of ARCHIVOS_ESCRIBIBLES) {
    for (const h of indexarHechos(leerFuente(codigo.textos.get(ruta), ruta))) hechosEnArchivos.set(h.id, [...(hechosEnArchivos.get(h.id) ?? []), ruta]);
  }
  for (const slug of objetivo) {
    const hoja = hojas.get(slug);
    for (const e of hoja.entradas) {
      const donde = `${slug}/${e.id}`;
      if (e.huerfana) {
        if (e.decision?.valor !== "quitar") errores.push(`${donde}: huérfana con decisión distinta de «quitar» (${e.decision?.valor ?? "sin decisión"}): su dato ya no existe en el código`);
        continue;
      }
      if (e.decision === null) {
        errores.push(`${donde}: sin decisión del dueño`);
        continue;
      }
      const d = e.decision;
      if (d.valor === "quitar") {
        pendientes.push({ hoja: slug, id: e.id, tipo: e.tipo, nota: d.nota ?? "" });
        continue;
      }
      if (e.tipo !== "hecho" && d.valor !== "aprobar") {
        errores.push(`${donde}: «${d.valor}» no se aplica a un ${e.tipo}; hazlo a mano`);
        continue;
      }
      if (e.textoRevisado === null) {
        errores.push(`${donde}: sin textoRevisado (corre --congelar una vez)`);
        continue;
      }
      let ruta;
      if (e.tipo === "hecho") {
        const rutas = hechosEnArchivos.get(e.id) ?? [];
        if (rutas.length !== 1) {
          errores.push(`${donde}: el hecho aparece en ${rutas.length} llamadas ${rutas.length > 0 ? `(${rutas.join(", ")})` : "(¿se construye de otra forma?)"}`);
          continue;
        }
        ruta = rutas[0];
      } else ruta = `src/lib/piezas/${slug}.contenido.ts`;
      const tarea = {
        tipo: e.tipo,
        id: e.id,
        hoja: slug,
        valor: d.valor,
        en: d.en,
        por: d.por,
        textoRevisado: e.textoRevisado,
        textoFinal: d.textoFinal,
        notaDecision: d.nota,
        candidatas: e.fuentesCandidatas,
        casoTipo: e.casoTipo,
        fuentes: e.tipo === "hecho" ? fuentesDeHoja(e) : [],
      };
      tareasPorArchivo.set(ruta, [...(tareasPorArchivo.get(ruta) ?? []), tarea]);
    }
  }
  if (errores.length > 0) return { errores, avisos, archivos: [], pendientes, sinUso: [] };

  const archivos = [];
  const sinEditor = new Set();
  for (const [ruta, tareas] of tareasPorArchivo) {
    const antes = codigo.textos.get(ruta);
    const r = aplicarEnTexto(antes, ruta, tareas, ctx);
    errores.push(...r.errores);
    for (const url of r.sinEditor) sinEditor.add(url);
    archivos.push({ ruta, antes, despues: r.texto, resultados: r.resultados, eliminadas: r.eliminadas, importesQuitados: r.importesQuitados });
  }
  if (sinEditor.size > 0) errores.push(`no se pudo resolver el editor de ${sinEditor.size} URL (agrégalas a EDITOR_POR_HOST en scripts/hoja-aplicar.mjs):\n  ${[...sinEditor].join("\n  ")}`);
  if (errores.length > 0) return { errores, avisos, archivos: [], pendientes, sinUso: [] };

  // Constantes exportadas de fuentes.ts que ya nadie usa (solo se informa).
  const finales = new Map(codigo.textos);
  for (const a of archivos) finales.set(a.ruta, a.despues);
  const sinUso = [];
  for (const nombre of ctx.fuentesExportadas.keys()) {
    const re = new RegExp(`\\b${nombre}\\b`, "g");
    let usos = 0;
    for (const [ruta, texto] of finales) usos += (texto.match(re) ?? []).length - (ruta === ARCHIVO_FUENTES ? 1 : 0);
    if (usos === 0) sinUso.push(nombre);
  }
  return { errores, avisos, archivos: archivos.filter((a) => a.antes !== a.despues || a.resultados.length > 0), pendientes, sinUso };
}

/* ---------- Disco ---------- */
function rutaPermitida(ruta) {
  if (!ARCHIVOS_ESCRIBIBLES.includes(ruta)) throw new Error(`--aplicar no puede escribir ${ruta}`);
}

/** Escribe cada archivo con un temporal y un rename (atómico por archivo). Valida todo antes de tocar el primero. */
export function escribirArchivos(archivos, raiz = RAIZ_REPO) {
  for (const a of archivos) {
    rutaPermitida(a.ruta);
    const errores = erroresDeSintaxis(a.despues);
    if (errores.length > 0) throw new Error(`${a.ruta}: sintaxis inválida (${errores[0]}); no se escribió nada`);
  }
  const escritos = [];
  for (const a of archivos) {
    if (a.antes === a.despues) continue;
    const destino = join(raiz, a.ruta);
    const temporal = `${destino}.hoja-tmp`;
    writeFileSync(temporal, a.despues, "utf8");
    renameSync(temporal, destino);
    escritos.push(a.ruta);
  }
  return escritos;
}

function imprimirPlan(plan, escribir) {
  const lineaDe = (a) => {
    const { agregadas, quitadas } = resumenDeDiff(a.antes, a.despues);
    const aplicados = a.resultados.filter((r) => r.accion.startsWith("aplicado")).length;
    return `${a.ruta}: ${aplicados} aplicados, ${a.resultados.length - aplicados} sin cambios · +${agregadas} −${quitadas} líneas${a.eliminadas.length > 0 ? ` · constantes borradas: ${a.eliminadas.join(", ")}` : ""}${a.importesQuitados.length > 0 ? ` · import quitados: ${a.importesQuitados.join(", ")}` : ""}`;
  };
  console.log(escribir ? "APLICAR (se escribe):" : "PLAN (no se escribe nada; agrega --escribir para aplicar):");
  const conCambios = plan.archivos.filter((a) => a.antes !== a.despues);
  for (const a of conCambios) console.log(`  ${lineaDe(a)}`);
  if (conCambios.length === 0) console.log(`  nada que cambiar (${plan.archivos.length} archivos al día)`);
  if (plan.pendientes.length > 0) {
    console.log(`PENDIENTES A MANO (quitar y fusiones, ${plan.pendientes.length}): los hacen los agentes, no este script`);
    for (const p of plan.pendientes) {
      const fusion = /^FUSIONADO en ([a-z0-9-]+)/.exec((p.nota ?? "").trim());
      console.log(`  ${p.hoja}/${p.id} (${p.tipo})${fusion ? ` — fusionado en ${fusion[1]}` : ""}`);
    }
  }
  if (plan.sinUso.length > 0) console.log(`Constantes exportadas de fuentes.ts sin uso tras aplicar (${plan.sinUso.length}): ${plan.sinUso.join(", ")}`);
}

/** CLI: `--aplicar [<hoja>…|--todas] [--escribir]`. */
export function cmdAplicar(argumentos, dir = DIR_VERIFICACION) {
  const escribir = argumentos.includes("--escribir");
  const pedidas = argumentos.filter((a) => a !== "--escribir" && a !== "--todas");
  for (const slug of pedidas) if (!SLUGS_HOJA.includes(slug)) throw new Error(`hoja desconocida: «${slug}». Opciones: ${SLUGS_HOJA.join(", ")} o --todas`);
  const objetivo = pedidas.length > 0 ? pedidas : [...SLUGS_HOJA];
  const hojas = leerHojas(dir);
  const esqueletos = construirEsqueletos();
  const codigo = leerCodigo();
  const plan = planearAplicacion({ hojas, objetivo, esqueletos, codigo });
  if (plan.errores.length > 0) {
    console.error(`--aplicar se niega a correr (${plan.errores.length} problemas):`);
    for (const e of plan.errores) console.error(`  - ${e}`);
    process.exitCode = 1;
    return;
  }
  imprimirPlan(plan, escribir);
  if (!escribir) return;
  const escritos = escribirArchivos(plan.archivos);
  console.log(`Escritos ${escritos.length} archivos. Siguiente: --verificar ${objetivo.join(" ")} (y corre pnpm tsc --noEmit y pnpm check:logic).`);
}
