/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-19
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Comprobaciones de la Fase 4 de las hojas (--congelar, --aplicar, --verificar). Todo con funciones puras sobre texto y objetos de ejemplo:
// no lee ni escribe en docs/verificacion ni en src. Las importa scripts/check-hoja.mjs (que corre `pnpm check:logic`).
import assert from "node:assert/strict";
import { esFechaHoja } from "../src/lib/piezas/hoja.ts";
import { PIEZA_SLUGS } from "../src/lib/piezas/types.ts";
import { ARCHIVOS_ESCRIBIBLES, aplicarEnTexto, fuentesDeHoja, notaDeDecision, resumenDeDiff } from "./hoja-aplicar.mjs";
import { erroresDeSintaxis, indexarAprobables, indexarHechos, leerFuente } from "./hoja-codigo.mjs";
import { construirCongelacion, leerFusiones, referenciasDecodificador } from "./hoja-congelar.mjs";
import { buscarId, indexarReales, palabrasClave, prosaConClaves, verificar } from "./hoja-verificar.mjs";
import { construirEsqueletos, nuevaEntrada, textosCambiados } from "./hoja-verificacion.mjs";

const decision = (valor, extra = {}) => ({ valor, textoFinal: null, por: "NB", en: "2026-10-19", nota: `${valor} por NB`, ...extra });
const fuenteHoja = (url, extra = {}) => ({ titulo: `Título de ${url}`, editor: null, url, consultadoEn: "2026-10-15", tipo: "primaria", detalle: null, ...extra });

/* ---------- Texto de ejemplo ---------- */
const EJEMPLO = `import { conRevision, hecho, hechoVerificado } from "./constructores.ts";
import { FUENTE_A, FUENTE_B } from "./fuentes.ts";
import type { Caso, Criterio, Fuente, Hecho } from "./types.ts";

/* ---------- Fuentes de esta pieza ---------- */
const LOCAL_SOBRA: Fuente = { titulo: "Local", editor: "Editor Local", url: "https://ejemplo.org/sobra", consultadoEn: "" };
const LOCAL_USADA: Fuente = {
  titulo: "Usada",
  editor: "Editor Usada",
  url: "https://ejemplo.org/usada",
  consultadoEn: "2026-10-15",
};

function criterio(id: string, texto: string): Criterio {
  return { id, texto, aprobadoEn: null, aprobadoPor: null };
}

const uno: Hecho = hecho(
  "hecho-uno",
  "Texto uno.",
  [LOCAL_SOBRA, FUENTE_A],
  "nota vieja",
);
const dos: Hecho = conRevision(
  hecho(
    "hecho-dos",
    "Texto dos original.",
    [FUENTE_B, LOCAL_USADA],
  ),
  6,
);
const ya: Hecho = hechoVerificado("hecho-ya", "Texto ya.", [FUENTE_A], "n");
const otraUsada = [LOCAL_USADA];

const casos: readonly Caso[] = [
  {
    id: "caso-vivido",
    tipo: "vivido",
    texto: "Algo que pasó.",
    aprobadoEn: null,
    aprobadoPor: null,
  },
  {
    id: "caso-posible",
    tipo: "puede-pasar",
    texto: "Algo que puede pasar.",
    hechos: [uno],
    aprobadoEn: null,
    aprobadoPor: null,
  },
];
const criterios = [criterio("crit-ayudante", "Criterio por ayudante."), { id: "crit-literal", texto: "Criterio literal.", aprobadoEn: null, aprobadoPor: null }];
export { dos, ya, casos, criterios, otraUsada, uno };
`;
const CTX = {
  editoresCodigo: new Map([["https://ejemplo.org/conocida", "Editor del código"]]),
  fuentesExportadas: new Map([
    ["FUENTE_A", { titulo: "A", editor: "Editor A", url: "https://ejemplo.org/a", consultadoEn: "2026-10-14" }],
    ["FUENTE_B", { titulo: "B", editor: "Editor B", url: "https://ejemplo.org/b", consultadoEn: "2026-10-14" }],
  ]),
  resolverIdentificador: () => undefined,
};
const tareaHecho = (id, extra = {}) => ({
  tipo: "hecho",
  id,
  hoja: "procesador",
  valor: "aprobar",
  en: "2026-10-19",
  por: "NB",
  textoRevisado: null,
  textoFinal: null,
  notaDecision: "ok",
  candidatas: [],
  casoTipo: null,
  fuentes: [fuenteHoja("https://ejemplo.org/a", { consultadoEn: "2026-10-14" }), fuenteHoja("https://ejemplo.org/conocida"), fuenteHoja("https://ejemplo.org/nueva", { editor: "Editor de la hoja", tipo: "secundaria" })],
  ...extra,
});
const tareaAprob = (tipo, id, extra = {}) => ({ ...tareaHecho(id), tipo, fuentes: [], casoTipo: tipo === "caso" ? "vivido" : null, ...extra });

/* ---------- Lectura del AST ---------- */
{
  const sf = leerFuente(EJEMPLO);
  const hechos = indexarHechos(sf);
  assert.deepEqual(hechos.map((h) => h.id), ["hecho-uno", "hecho-dos", "hecho-ya"]);
  assert.deepEqual(hechos[1].envolturas.map((e) => e.expression.text), ["conRevision"], "ve la envoltura conRevision");
  assert.equal(hechos[1].contexto, "dos");
  const aprobables = indexarAprobables(sf);
  assert.deepEqual(aprobables.map((a) => `${a.tipo}:${a.id}:${a.forma}`), ["caso:caso-vivido:literal", "caso:caso-posible:literal", "criterio:crit-ayudante:llamada", "criterio:crit-literal:literal"]);
  assert.deepEqual(erroresDeSintaxis(EJEMPLO), []);
  assert.ok(erroresDeSintaxis("const a = ;").length > 0, "la sintaxis rota se detecta");
}

/* ---------- Aplicar: hechos ---------- */
const aplicar = (texto, tareas, ctx = CTX) => aplicarEnTexto(texto, "ejemplo.ts", tareas, ctx);
{
  const hechoUno = tareaHecho("hecho-uno", { textoRevisado: "Texto uno." });
  const r = aplicar(EJEMPLO, [hechoUno]);
  assert.deepEqual(r.errores, []);
  assert.deepEqual(erroresDeSintaxis(r.texto), [], "el resultado compila");
  assert.match(r.texto, /verificadoPorDueno\(\n\s+hecho\(\n\s+"hecho-uno"/, "envuelve la llamada y reindenta");
  assert.match(r.texto, /"2026-10-19",\n\s+"NB",\n\s*\);/, "fecha e iniciales de la decisión");
  assert.match(r.texto, /\[\n\s+FUENTE_A,\n\s+\{ titulo: "Título de https:\/\/ejemplo\.org\/conocida", editor: "Editor del código", url: "https:\/\/ejemplo\.org\/conocida", consultadoEn: "2026-10-15" \},/, "reutiliza la constante con la misma url y fecha y el editor del código");
  assert.match(r.texto, /editor: "Editor de la hoja", url: "https:\/\/ejemplo\.org\/nueva"/, "si el código no la conoce usa el editor de la hoja");
  assert.ok(r.texto.indexOf("conocida") < r.texto.indexOf("nueva"), "primarias primero");
  assert.match(r.texto, /"Decisión de NB \(2026-10-19, hoja procesador\): aprobar\. ok"/, "la nota registra la decisión");
  assert.ok(!r.texto.includes("nota vieja"), "la nota anterior se reemplaza");
  assert.ok(!r.texto.includes("LOCAL_SOBRA"), "la constante local sin referencias se borra");
  assert.ok(r.texto.includes("LOCAL_USADA"), "la que sigue usándose se conserva");
  assert.deepEqual(r.eliminadas, ["LOCAL_SOBRA"]);
  assert.match(r.texto, /import \{ conRevision, hecho, hechoVerificado, verificadoPorDueno \} from/, "agrega el import del ayudante");
  assert.match(r.texto, /import \{ FUENTE_A, FUENTE_B \} from "\.\/fuentes\.ts"/, "los import que se siguen usando se conservan");
  const otra = aplicar(r.texto, [hechoUno]);
  assert.equal(otra.texto, r.texto, "aplicar dos veces = aplicar una");
  assert.deepEqual(otra.resultados.map((x) => x.accion), ["sin cambios"]);
}
{
  // ajustar: cambia el texto y respeta conRevision (la envoltura va por dentro)
  const dos = tareaHecho("hecho-dos", { valor: "ajustar", textoRevisado: "Texto dos original.", textoFinal: "Texto dos ajustado.", fuentes: [fuenteHoja("https://ejemplo.org/b", { consultadoEn: "2026-10-14" })] });
  const r = aplicar(EJEMPLO, [dos]);
  assert.deepEqual(r.errores, []);
  assert.match(r.texto, /conRevision\(\n\s+verificadoPorDueno\(\n\s+hecho\(\n\s+"hecho-dos",\n\s+"Texto dos ajustado\."/, "conRevision queda por fuera");
  assert.match(r.texto, /\[FUENTE_B\],/, "la constante reutilizada va en una línea");
  assert.ok(r.texto.includes("LOCAL_USADA"), "otra referencia la mantiene viva");
  // Con otra fuente nueva, FUENTE_B queda sin usos y su import se quita.
  const sinB = aplicar(EJEMPLO, [tareaHecho("hecho-dos", { textoRevisado: "Texto dos original.", fuentes: [fuenteHoja("https://ejemplo.org/conocida")] })]);
  assert.deepEqual(sinB.errores, []);
  assert.deepEqual(sinB.importesQuitados, ["FUENTE_B"]);
  assert.match(sinB.texto, /import \{ FUENTE_A \} from "\.\/fuentes\.ts"/);
  assert.equal(aplicar(r.texto, [dos]).texto, r.texto, "idempotente también con ajustar");
  // El texto del código puede ser el original o ya el ajustado; cualquier otro se rechaza.
  assert.deepEqual(aplicar(r.texto, [dos]).errores, []);
  assert.match(aplicar(EJEMPLO, [{ ...dos, textoRevisado: "Otro texto." }]).errores.join("|"), /ni el que leyó el dueño ni el ajustado/);
  // Cambiar la decisión reescribe fecha e iniciales sin envolver otra vez.
  const nueva = aplicar(r.texto, [{ ...dos, en: "2026-10-20", por: "XY" }]);
  assert.equal(nueva.texto.match(/verificadoPorDueno\(/g).length, 1, "una sola envoltura");
  assert.ok(nueva.texto.includes('"2026-10-20"') && nueva.texto.includes('"XY"'));
}
{
  // Los verificados antes en el código no se tocan; con otra decisión se rechaza.
  const ya = tareaHecho("hecho-ya", { textoRevisado: "Texto ya.", en: "2026-10-13", fuentes: [fuenteHoja("https://ejemplo.org/a", { consultadoEn: "2026-10-14" })] });
  const r = aplicar(EJEMPLO, [ya]);
  assert.equal(r.texto, EJEMPLO);
  assert.match(r.resultados[0].accion, /verificado antes en el código/);
  assert.match(aplicar(EJEMPLO, [{ ...ya, en: "2026-10-19" }]).errores.join("|"), /resuélvelo a mano/);
  // Errores: id inexistente, texto distinto, editor sin resolver.
  assert.match(aplicar(EJEMPLO, [tareaHecho("no-existe", { textoRevisado: "x" })]).errores.join("|"), /se esperaba 1 nodo .* hay 0/);
  assert.match(aplicar(EJEMPLO, [tareaHecho("hecho-uno", { textoRevisado: "Otro." })]).errores.join("|"), /ni el que leyó el dueño/);
  const sinEditor = aplicar(EJEMPLO, [tareaHecho("hecho-uno", { textoRevisado: "Texto uno.", fuentes: [fuenteHoja("https://desconocido.example/x")] })]);
  assert.deepEqual([...sinEditor.sinEditor], ["https://desconocido.example/x"]);
  assert.equal(sinEditor.texto, EJEMPLO, "con un editor sin resolver no cambia nada");
  assert.match(aplicar(EJEMPLO, [tareaHecho("hecho-uno", { textoRevisado: "Texto uno.", fuentes: [] })]).errores.join("|"), /sin fuentes consultadas/);
  // Texto no literal → se niega.
  const dinamico = EJEMPLO.replace('"Texto uno."', "`Texto ${1}`");
  assert.match(aplicar(dinamico, [tareaHecho("hecho-uno", { textoRevisado: "x" })]).errores.join("|"), /no es un literal/);
}

/* ---------- Aplicar: casos y criterios ---------- */
{
  const tareas = [
    tareaAprob("caso", "caso-vivido", { textoRevisado: "Algo que pasó.", casoTipo: "vivido" }),
    tareaAprob("caso", "caso-posible", { textoRevisado: "Algo que puede pasar.", casoTipo: "puede-pasar" }),
    tareaAprob("criterio", "crit-ayudante", { textoRevisado: "Criterio por ayudante." }),
    tareaAprob("criterio", "crit-literal", { textoRevisado: "Criterio literal." }),
  ];
  const r = aplicar(EJEMPLO, tareas);
  assert.deepEqual(r.errores, []);
  assert.deepEqual(erroresDeSintaxis(r.texto), []);
  assert.equal(r.texto.match(/aprobadoEn: "2026-10-19"/g).length, 3, "los tres literales quedan aprobados");
  assert.equal(r.texto.match(/aprobadoPor: "NB"/g).length, 3);
  assert.match(r.texto, /aprobadoPorDueno\(criterio\("crit-ayudante", "Criterio por ayudante\."\), "2026-10-19", "NB"\)/, "el ayudante se envuelve");
  assert.match(r.texto, /id: "caso-vivido",[\s\S]*?confirmadoPorDueno: true,/, "un «vivido» queda confirmado");
  assert.ok(!/id: "caso-posible"[\s\S]*?confirmadoPorDueno/.test(r.texto.split('id: "caso-posible"')[1].split("}")[0]), "un «puede pasar» no se confirma");
  assert.match(r.texto, /import \{ aprobadoPorDueno, conRevision, hecho, hechoVerificado \} from/);
  assert.equal(aplicar(r.texto, tareas).texto, r.texto, "idempotente");
  // Tipo distinto, texto cambiado y «puede pasar» ya confirmado.
  assert.match(aplicar(EJEMPLO, [tareaAprob("caso", "caso-vivido", { textoRevisado: "Algo que pasó.", casoTipo: "puede-pasar" })]).errores.join("|"), /el tipo del caso/);
  assert.match(aplicar(EJEMPLO, [tareaAprob("criterio", "crit-literal", { textoRevisado: "Otro." })]).errores.join("|"), /no es el que leyó el dueño/);
  const confirmado = EJEMPLO.replace('texto: "Algo que puede pasar.",', 'texto: "Algo que puede pasar.",\n    confirmadoPorDueno: true,');
  assert.match(aplicar(confirmado, [tareaAprob("caso", "caso-posible", { textoRevisado: "Algo que puede pasar.", casoTipo: "puede-pasar" })]).errores.join("|"), /no puede estar confirmado/);
}

/* ---------- Utilidades del plan ---------- */
{
  const entrada = nuevaEntrada({
    id: "x",
    tipo: "hecho",
    titulo: "t",
    donde: "d",
    textoPublicado: "t",
    fuentesConsultadas: [fuenteHoja("https://e.org/sec", { tipo: "secundaria" }), fuenteHoja("https://e.org/prim"), fuenteHoja("http://e.org/insegura"), fuenteHoja("https://e.org/sinfecha", { consultadoEn: null }), fuenteHoja("https://e.org/prim")],
  });
  assert.deepEqual(fuentesDeHoja(entrada).map((f) => f.url), ["https://e.org/prim", "https://e.org/sec"], "https con fecha, primarias primero, sin repetir");
  assert.equal(notaDeDecision({ por: "NB", en: "2026-10-19", hoja: "comun", valor: "ajustar", notaDecision: "  nota\n larga " }), "Decisión de NB (2026-10-19, hoja comun): ajustar. nota larga");
  assert.deepEqual(resumenDeDiff("a\nb\nc", "a\nB\nc\nd"), { agregadas: 2, quitadas: 1 });
  assert.equal(esFechaHoja("2026-10-19"), true);
  assert.ok(ARCHIVOS_ESCRIBIBLES.includes("src/lib/piezas/comun.hechos.ts") && ARCHIVOS_ESCRIBIBLES.length === PIEZA_SLUGS.length + 1, "lista cerrada de archivos escribibles");
  assert.ok(ARCHIVOS_ESCRIBIBLES.every((r) => r.startsWith("src/lib/piezas/")), "solo dentro de src/lib/piezas");
  // textosCambiados reconoce el texto ajustado como esperado.
  const hoja = { entradas: [nuevaEntrada({ id: "a", tipo: "hecho", titulo: "t", donde: "d", textoPublicado: "Nuevo texto.", textoRevisado: "Texto viejo.", decision: decision("ajustar", { textoFinal: "Nuevo  texto." }) }), nuevaEntrada({ id: "b", tipo: "hecho", titulo: "t", donde: "d", textoPublicado: "Cambió.", textoRevisado: "Texto viejo.", decision: decision("aprobar") })] };
  assert.deepEqual(textosCambiados(hoja), ["b"], "con ajustar, lo esperado es textoFinal");
}

/* ---------- Congelar ---------- */
{
  const hojas = new Map();
  const conFusion = nuevaEntrada({ id: "origen", tipo: "hecho", titulo: "t", donde: "procesador › x", textoPublicado: "T", decision: decision("quitar", { nota: "FUSIONADO en destino por pedido de NB (2026-10-19)." }) });
  const destino = nuevaEntrada({ id: "destino", tipo: "hecho", titulo: "t", donde: "procesador › y", textoPublicado: "D", estado: "verificado", fuentesConsultadas: [fuenteHoja("https://e.org/p")], decision: decision("aprobar") });
  hojas.set("procesador", { version: 1, slug: "procesador", entradas: [conFusion, destino] });
  const { fusiones, errores } = leerFusiones(hojas);
  assert.deepEqual(errores, []);
  assert.deepEqual(fusiones, [{ origen: "origen", destino: "destino", hojaOrigen: "procesador", hojaDestino: "procesador" }]);
  const sinDestino = new Map([["procesador", { version: 1, slug: "procesador", entradas: [conFusion] }]]);
  assert.match(leerFusiones(sinDestino).errores.join("|"), /no existe en ninguna hoja/);
  const decodificador = {
    familias: [{ id: "ryzen", hechoIds: ["a", "b"] }],
    series: [{ familia: "ryzen", prefijo: "5", hechoId: "a" }],
    sufijos: [{ familias: ["ryzen", "core"], token: "X", hechoId: "b" }, { familias: ["ryzen", "core"], token: "X", hechoId: "c" }],
    ejemplos: [{ nombre: "Ryzen 5 5600X", hechoId: "a" }],
  };
  assert.deepEqual(referenciasDecodificador(decodificador).map((r) => `${r.campo}|${r.clave}`), ["familias|ryzen", "series|ryzen:5", "sufijos|ryzen+core:X", "sufijos|ryzen+core:X#2", "ejemplos|Ryzen 5 5600X"], "claves únicas por campo");
  assert.deepEqual(referenciasDecodificador(undefined), []);

  // construirCongelacion sobre un registro falso: llena textoRevisado y arma la línea base; se niega con una hoja desactualizada.
  const hechoCodigo = (id, texto) => ({ id, texto, fuentes: [{ titulo: "F", editor: "E", url: "https://e.org/p", consultadoEn: "" }], verificadoEn: null, verificadoPor: null });
  const piezaFalsa = (hechos) => ({ contenido: { nombreCorto: "x", partes: { p1: { orden: 1, nombre: "P", nombreCorto: "P", hechos } }, secciones: [], vistas: [] }, geo: null });
  const registro = Object.fromEntries(PIEZA_SLUGS.map((s) => [s, piezaFalsa(s === "procesador" ? [hechoCodigo("origen", "T"), hechoCodigo("destino", "D")] : [])]));
  const esq = construirEsqueletos(registro, []);
  const hojasReales = new Map([...esq.hojas].map(([slug, hoja]) => [slug, structuredClone(hoja)]));
  const ent = (id) => hojasReales.get("procesador").entradas.find((e) => e.id === id);
  Object.assign(ent("origen"), { decision: decision("quitar", { nota: "FUSIONADO en destino" }), estado: "parcial" });
  Object.assign(ent("destino"), { decision: decision("aprobar"), estado: "verificado", fuentesConsultadas: [fuenteHoja("https://e.org/p")] });
  const textos = new Map(ARCHIVOS_ESCRIBIBLES.map((ruta) => [ruta, ruta.includes("procesador.contenido") ? 'import { hecho } from "./constructores.ts";\nexport const a = hecho("origen", "T", []);\nexport const b = hecho("destino", "D", []);\n' : ""]));
  const dec = { familias: [{ id: "f", hechoIds: ["origen"] }], series: [], sufijos: [], ejemplos: [] };
  const c = construirCongelacion({ hojas: hojasReales, esqueletos: esq, textos, decodificador: dec, hoy: "2026-10-19" });
  assert.deepEqual(c.errores, []);
  assert.equal(c.hojas.get("procesador").entradas.find((e) => e.id === "destino").textoRevisado, "D", "llena textoRevisado de lo decidido");
  assert.equal(c.lineaBase.fusiones.length, 1);
  assert.deepEqual(c.lineaBase.referencias, [{ campo: "familias", clave: "f", hechoIds: ["origen"] }]);
  assert.equal(c.lineaBase.hechos.destino.ubicaciones[0].nodo.llamada, "hecho");
  assert.equal(c.lineaBase.hechos.destino.ubicaciones[0].nodo.constante, "b");
  const desactualizada = structuredClone(hojasReales);
  desactualizada.get("procesador").entradas.find((e) => e.id === "destino").textoPublicado = "Otro texto";
  assert.match(construirCongelacion({ hojas: desactualizada, esqueletos: esq, textos, decodificador: dec, hoy: "2026-10-19" }).errores.join("|"), /desactualizada/);
  assert.match(construirCongelacion({ hojas: new Map(), esqueletos: esq, textos, decodificador: dec, hoy: "2026-10-19" }).errores.join("|"), /falta docs\/verificacion/);
}

/* ---------- Verificar ---------- */
const HOY = "2026-10-20";
const hechoReal = (id, extra = {}) => ({ id, texto: `Texto de ${id}.`, fuentes: [{ titulo: "F", editor: "E", url: "https://e.org/p", consultadoEn: "2026-10-15" }], verificadoEn: "2026-10-19", verificadoPor: "NB", revisarCadaMeses: 12, ...extra });
const contenidoFalso = (hechos = [], extra = {}) => ({ partes: { p1: { orden: 1, nombre: "P", nombreCorto: "P", resumen: "r", queHace: "q", alElegir: [], hechos } }, secciones: [], vistas: [], intro: [], cta: { texto: "" }, casos: [], ...extra });
const registroDe = (porPieza = {}) => Object.fromEntries(PIEZA_SLUGS.map((s) => [s, { contenido: contenidoFalso(porPieza[s]?.hechos ?? [], porPieza[s]?.extra ?? {}), geo: null }]));
const entradaDecidida = (id, valor, extra = {}) => nuevaEntrada({ id, tipo: "hecho", titulo: "t", donde: "procesador › p1", textoPublicado: `Texto de ${id}.`, textoRevisado: `Texto de ${id}.`, usadoPor: ["procesador"], estado: "verificado", fuentesConsultadas: [fuenteHoja("https://e.org/p")], decision: decision(valor, valor === "ajustar" ? { textoFinal: `Texto de ${id}.` } : {}), ...extra });
const hojaProcesador = (...entradas) => new Map([["procesador", { version: 1, slug: "procesador", entradas }]]);
const correr = (extra) => verificar({ hojas: hojaProcesador(), piezas: registroDe(), comunes: [], hoy: HOY, ...extra });
const reglas = (r) => r.errores.map((e) => e.regla);
{
  const piezas = registroDe({ procesador: { hechos: [hechoReal("bueno")] } });
  const ok = correr({ hojas: hojaProcesador(entradaDecidida("bueno", "aprobar")), piezas });
  assert.deepEqual(ok.errores, [], "un hecho aplicado y coherente no da errores");
  assert.deepEqual(ok.avisos, []);

  const caso = (extra) => correr({ hojas: hojaProcesador(entradaDecidida("bueno", "aprobar", extra)), piezas });
  assert.deepEqual(reglas(caso({ textoRevisado: "Otro texto." })), ["H2"], "H2: el texto cambió");
  assert.match(caso({ textoRevisado: "Otro texto." }).errores[0].texto, /^procesador\/bueno: H2 .* → docs\/verificacion\/procesador\.json, /, "formato hoja/id: problema → lugar, qué hacer");
  assert.deepEqual(reglas(caso({ textoRevisado: null })), ["H2"], "sin textoRevisado");
  assert.deepEqual(reglas(caso({ decision: decision("aprobar", { en: "2026-10-18" }) })), ["H3"], "H3: fecha distinta");
  assert.deepEqual(reglas(caso({ decision: decision("aprobar", { por: "XY" }) })), ["H3"], "H3: iniciales distintas");
  const ajustado = correr({ hojas: hojaProcesador(entradaDecidida("bueno", "ajustar", { decision: decision("ajustar", { textoFinal: "Texto final." }), textoRevisado: "Texto de bueno." })), piezas });
  assert.deepEqual(reglas(ajustado), ["H2"]);
  assert.match(ajustado.errores[0].texto, /sigue siendo el original/, "ajustar pendiente de aplicar");
  // H4
  const conFuente = (fuentes) => correr({ hojas: hojaProcesador(entradaDecidida("bueno", "aprobar")), piezas: registroDe({ procesador: { hechos: [hechoReal("bueno", { fuentes })] } }) });
  assert.deepEqual(reglas(conFuente([{ titulo: "F", editor: "E", url: "http://e.org/p", consultadoEn: "2026-10-15" }])), ["H4"], "H4: sin https");
  assert.deepEqual(reglas(conFuente([{ titulo: "F", editor: "E", url: "https://e.org/p", consultadoEn: "" }])), ["H4"], "H4: sin fecha");
  assert.deepEqual(reglas(conFuente([{ titulo: "F", editor: "E", url: "https://e.org/p", consultadoEn: "2026-10-30" }])), ["H4"], "H4: fecha futura");
  assert.deepEqual(reglas(conFuente([{ titulo: "F", editor: "E", url: "https://e.org/p", consultadoEn: "2026-10-14" }])), ["H4"], "H4: la hoja no la tiene con esa fecha");
  assert.deepEqual(reglas(conFuente([{ titulo: "F", editor: "E", url: "https://e.org/otra", consultadoEn: "2026-10-15" }])), ["H4"], "H4: la hoja no la tiene");
  assert.deepEqual(reglas(conFuente([])), ["H4"], "H4: sin fuentes");
  const soloSecundaria = correr({ hojas: hojaProcesador(entradaDecidida("bueno", "aprobar", { estado: "parcial", fuentesConsultadas: [fuenteHoja("https://e.org/p", { tipo: "secundaria" })] })), piezas, paraPublicar: true });
  assert.deepEqual(reglas(soloSecundaria), ["H4"], "--para-publicar exige una primaria");
  assert.deepEqual(reglas(correr({ hojas: hojaProcesador(entradaDecidida("bueno", "aprobar", { estado: "parcial", fuentesConsultadas: [fuenteHoja("https://e.org/p", { tipo: "secundaria" })] })), piezas })), [], "sin --para-publicar basta la fuente");
  // H1
  assert.deepEqual(reglas(correr({ hojas: hojaProcesador(entradaDecidida("falta", "aprobar")), piezas: registroDe() })), ["H1"], "H1: no existe");
  const dosObjetos = registroDe({ procesador: { hechos: [hechoReal("bueno")] }, "memoria-ram": { hechos: [hechoReal("bueno")] } });
  assert.ok(reglas(correr({ hojas: hojaProcesador(entradaDecidida("bueno", "aprobar")), piezas: dosObjetos })).includes("H1"), "H1: dos objetos con el mismo id");
  const compartido = hechoReal("bueno");
  const compartidoSinComun = registroDe({ procesador: { hechos: [compartido] }, "memoria-ram": { hechos: [compartido] } });
  assert.ok(reglas(correr({ hojas: hojaProcesador(entradaDecidida("bueno", "aprobar")), piezas: compartidoSinComun })).includes("H1"), "H1: lo usan dos piezas y no está en comun.hechos.ts");
  assert.deepEqual(reglas(correr({ hojas: hojaProcesador(entradaDecidida("bueno", "aprobar")), piezas: compartidoSinComun, comunes: [compartido] })), [], "compartido y en comun: bien");
  // H5
  const quitar = entradaDecidida("viejo", "quitar", { estado: "sin-fuente", fuentesConsultadas: [] });
  assert.deepEqual(reglas(correr({ hojas: hojaProcesador(quitar), piezas: registroDe({ procesador: { hechos: [hechoReal("viejo", { verificadoEn: null, verificadoPor: null })] } }) })), ["H5"], "H5: sigue en el contenido");
  assert.deepEqual(reglas(correr({ hojas: hojaProcesador(quitar), piezas: registroDe() })), [], "H5: quitado de verdad");
  const archivos = [{ ruta: "src/lib/piezas/x.ts", texto: 'const a = ["viejo"];\n// nota: ver viejo-aparte y "viejo-aparte"\n// menciona viejo en una nota\n' }];
  const conLiteral = correr({ hojas: hojaProcesador(quitar), piezas: registroDe(), archivos });
  assert.deepEqual(reglas(conLiteral), ["H5"], "H5: queda el literal");
  assert.match(conLiteral.errores[0].texto, /x\.ts:1/);
  assert.equal(conLiteral.avisos.length, 1, "una mención en una nota solo avisa");
  assert.deepEqual(buscarId("viejo", archivos), { exactas: ["src/lib/piezas/x.ts:1"], menciones: ["src/lib/piezas/x.ts:3"] }, "un id más largo no cuenta");
  // H6
  const lineaBase = { fusiones: [{ origen: "viejo", destino: "bueno", hojaOrigen: "procesador", hojaDestino: "procesador" }], referencias: [{ campo: "sufijos", clave: "ryzen:X", hechoId: "viejo" }] };
  const conDecodificador = (hechoId) => registroDe({ procesador: { hechos: [hechoReal("bueno")], extra: { decodificador: { familias: [], series: [], ejemplos: [], sufijos: [{ familias: ["ryzen"], token: "X", hechoId }] } } } });
  const hojasFusion = hojaProcesador(entradaDecidida("bueno", "aprobar"), entradaDecidida("viejo", "quitar", { estado: "sin-fuente", fuentesConsultadas: [], decision: decision("quitar", { nota: "FUSIONADO en bueno" }) }));
  assert.deepEqual(reglas(correr({ hojas: hojasFusion, piezas: conDecodificador("viejo"), lineaBase })), ["H6"], "H6: la referencia sigue en el origen");
  assert.deepEqual(reglas(correr({ hojas: hojasFusion, piezas: conDecodificador("bueno"), lineaBase })), [], "H6: ya apunta al destino");
  const sinFila = registroDe({ procesador: { hechos: [hechoReal("bueno")] } });
  assert.deepEqual(reglas(correr({ hojas: hojasFusion, piezas: sinFila, lineaBase })), ["H6"], "H6: la fila desapareció");
  // H8 y H9
  assert.ok(reglas(correr({ hojas: hojaProcesador(), piezas })).includes("H8"), "H8: hecho del contenido sin entrada");
  const sinDecision = nuevaEntrada({ id: "bueno", tipo: "hecho", titulo: "t", donde: "d", textoPublicado: "Texto de bueno.", usadoPor: ["procesador"] });
  assert.ok(reglas(correr({ hojas: hojaProcesador(sinDecision), piezas })).includes("H8"), "H8: entrada sin decisión");
  const verificadoSinDecision = registroDe({ procesador: { hechos: [hechoReal("bueno")] } });
  const soloPendiente = correr({ hojas: hojaProcesador(entradaDecidida("bueno", "quitar", { estado: "sin-fuente", fuentesConsultadas: [] })), piezas: verificadoSinDecision });
  assert.ok(reglas(soloPendiente).includes("H8"), "H8: verificado en el código sin aprobar/ajustar en la hoja");
  const huerfana = entradaDecidida("fantasma", "aprobar", { huerfana: true });
  assert.ok(reglas(correr({ hojas: hojaProcesador(entradaDecidida("bueno", "aprobar"), huerfana), piezas })).includes("H9"), "H9: huérfana no quitar");
  assert.deepEqual(reglas(correr({ hojas: hojaProcesador(entradaDecidida("bueno", "aprobar"), { ...huerfana, decision: decision("quitar"), estado: "sin-fuente", fuentesConsultadas: [] }), piezas })), [], "H9: huérfana quitar es válida");
  // Filtro por hoja
  assert.deepEqual(reglas(correr({ hojas: hojaProcesador(entradaDecidida("falta", "aprobar")), piezas, soloHojas: ["comun"] })), [], "soloHojas filtra");
  // Avisos
  const conAvisos = correr({ hojas: hojaProcesador(entradaDecidida("bueno", "ajustar", { decision: decision("ajustar", { textoFinal: "Texto de bueno.", nota: "Pendiente: mencionar el caso. Es experiencia del taller, sin fuente." }) })), piezas: registroDe({ procesador: { hechos: [hechoReal("bueno", { revisarCadaMeses: undefined })] } }) });
  assert.deepEqual(conAvisos.errores, []);
  assert.deepEqual(conAvisos.avisos.map((a) => a.regla).sort(), ["A1", "A3", "A4"], "pendiente en nota, experiencia sin fuente y sin revisarCadaMeses");
}
{
  // H7: casos y criterios
  const entrada = (tipo, id, extra = {}) => nuevaEntrada({ id, tipo, titulo: "t", donde: "procesador › casos", casoTipo: tipo === "caso" ? "vivido" : null, textoPublicado: "Texto.", textoRevisado: "Texto.", usadoPor: ["procesador"], decision: decision("aprobar"), ...extra });
  const caso = (extra = {}) => ({ id: "c1", tipo: "vivido", texto: "Texto.", aprobadoEn: "2026-10-19", aprobadoPor: "NB", confirmadoPorDueno: true, ...extra });
  const criterio = (extra = {}) => ({ id: "k1", texto: "Texto.", aprobadoEn: "2026-10-19", aprobadoPor: "NB", ...extra });
  const piezas = (c, k) => registroDe({ procesador: { extra: { casos: c ? [c] : [], criterios: k ? [k] : [] } } });
  assert.deepEqual(reglas(correr({ hojas: hojaProcesador(entrada("caso", "c1"), entrada("criterio", "k1")), piezas: piezas(caso(), criterio()) })), [], "caso y criterio aplicados: sin errores");
  assert.deepEqual(reglas(correr({ hojas: hojaProcesador(entrada("caso", "c1")), piezas: piezas(caso({ aprobadoEn: null, aprobadoPor: null })) })), ["H7"], "H7: sin aprobar");
  assert.deepEqual(reglas(correr({ hojas: hojaProcesador(entrada("caso", "c1")), piezas: piezas(caso({ confirmadoPorDueno: false })) })), ["H7"], "H7: «vivido» sin confirmar");
  assert.deepEqual(reglas(correr({ hojas: hojaProcesador(entrada("caso", "c1", { casoTipo: "puede-pasar" })), piezas: piezas(caso({ tipo: "puede-pasar" })) })), ["H7"], "H7: «puede pasar» confirmado como vivido");
  assert.deepEqual(reglas(correr({ hojas: hojaProcesador(entrada("caso", "c1")), piezas: piezas(caso({ texto: "Cambió." })) })), ["H7"], "H7: el texto cambió");
  assert.deepEqual(reglas(correr({ hojas: hojaProcesador(entrada("criterio", "k1", { decision: decision("quitar") })), piezas: piezas(null, criterio({ aprobadoEn: null, aprobadoPor: null })) })), ["H7"], "H7: criterio quitado que sigue");
  assert.deepEqual(reglas(correr({ hojas: hojaProcesador(entrada("caso", "c1", { decision: decision("quitar") })), piezas: piezas() })), [], "H7: caso quitado de verdad");
  assert.ok(reglas(correr({ hojas: hojaProcesador(), piezas: piezas(caso(), null) })).includes("H8"), "H8: caso sin entrada");
  assert.ok(reglas(correr({ hojas: hojaProcesador(entrada("criterio", "k1")), piezas: piezas(null, null) })).includes("H7"), "H7: aprobado en la hoja y ausente del contenido");
  assert.equal(indexarReales(registroDe({ procesador: { extra: { casos: [caso()], criterios: [criterio()] } } }), []).casos.has("procesador:c1"), true);
}

/* ---------- Palabras clave de un hecho quitado ---------- */
{
  assert.deepEqual(palabrasClave("El sufijo X3D añade memoria caché 3D V-Cache; son procesadores."), ["x3d", "memoria", "3d", "v-cache", "procesadores"], "palabras de 7+ letras o con dígitos, sin repetir");
  const prosa = [["a", "Habla de x3d y v-cache en detalle."], ["b", "Otro párrafo sin relación."], ["c", "Dice conectores varias veces: conectores y conectores."], ["d", "conectores otra vez"], ["e", "conectores más"], ["f", "conectores de nuevo"], ["g", "conectores y x3d"]];
  const hallados = prosaConClaves(["x3d", "v-cache", "conectores"], prosa);
  assert.deepEqual(hallados.map((h) => h.lugar), ["a"], "solo palabras distintivas y dos o más en el mismo párrafo");
}

console.log("check:hoja-aplicar OK");
