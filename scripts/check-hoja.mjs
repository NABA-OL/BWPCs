/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Comprobaciones de la herramienta de hojas de verificación (scripts/hoja-verificacion.mjs, docs/piezas-plan-2.md §4 y §5.2 T0.4).
// Sin red ni escrituras: lee las hojas A y B y los JSON que existan en docs/verificacion. Las ejecuta `pnpm check:logic`.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { esFuentePrimariaAbierta, validarHoja } from "../src/lib/piezas/hoja.ts";
import { PIEZAS } from "../src/lib/piezas/registro.ts";
import { PIEZA_SLUGS } from "../src/lib/piezas/types.ts";
import { SLUGS_HOJA } from "../src/lib/piezas/hoja.ts";
import { DIR_VERIFICACION, aplicarBloquesMd, construirEsqueletos, fusionarTodas, leerHojas, nuevaEntrada, textosCambiados } from "./hoja-verificacion.mjs";
import { contarHoja, lineaDecision, parsearDecision, parsearFuente, parsearMd, parsearPropuesta, renderBloque, renderConsolidada, renderHojaMd } from "./hoja-md.mjs";

const clonar = (valor) => structuredClone(valor);
const decisionNB = (valor = "aprobar", extra = {}) => ({ valor, textoFinal: null, por: "NB", en: "2026-10-13", nota: "aprobado por NB (2026-10-13)", ...extra });
const fuenteAbierta = (extra = {}) => ({ titulo: "Especificación", editor: null, url: "https://example.org/spec", consultadoEn: "2026-10-13", tipo: "primaria", detalle: null, ...extra });
const entradaHecho = (extra = {}) => nuevaEntrada({ id: "dato-uno", tipo: "hecho", titulo: "Parte", donde: "procesador › ihs", textoPublicado: "Texto.", usadoPor: ["procesador"], ...extra });
const hojaDe = (entradas, slug = "procesador") => ({ version: 1, slug, entradas });

// --- Esquema: válida e inválida ---
assert.deepEqual(validarHoja(hojaDe([])), [], "una hoja vacía es válida");
assert.deepEqual(validarHoja(hojaDe([entradaHecho()])), [], "un hecho pendiente es válido");
assert.deepEqual(validarHoja(hojaDe([entradaHecho({ estado: "verificado", fuentesConsultadas: [fuenteAbierta()], decision: decisionNB() })])), [], "✅ con fuente primaria abierta y aprobado es válido");
const aviso = (json) => validarHoja(json).join(" | ");
assert.match(aviso(null), /no es un objeto/);
assert.match(aviso({ version: 2, slug: "procesador", entradas: [] }), /version/);
assert.match(aviso({ version: 1, slug: "otra", entradas: [] }), /slug inválido/);
assert.match(aviso({ version: 1, slug: "comun" }), /entradas/);
assert.match(aviso(hojaDe([entradaHecho({ id: "Mal_Id" })])), /kebab-case/);
assert.match(aviso(hojaDe([entradaHecho(), entradaHecho()])), /repetido/);
assert.match(aviso(hojaDe([entradaHecho({ estado: "no-aplica" })])), /no puede ser no-aplica/);
assert.match(aviso(hojaDe([nuevaEntrada({ id: "caso-x", tipo: "caso", casoTipo: "vivido", titulo: "t", donde: "d", textoPublicado: "x", estado: "verificado" })])), /no se verifica con fuente/);
assert.match(aviso(hojaDe([entradaHecho({ fuentesConsultadas: [fuenteAbierta({ url: "http://example.org" })] })])), /https/);
assert.match(aviso(hojaDe([entradaHecho({ fuentesConsultadas: [fuenteAbierta({ consultadoEn: "2026-02-31" })] })])), /consultadoEn/);
// Regla de fondo: ningún ✅ sin fuente primaria abierta.
for (const fuentes of [[], [fuenteAbierta({ tipo: "secundaria" })], [fuenteAbierta({ url: null })], [fuenteAbierta({ consultadoEn: null })], [fuenteAbierta({ tipo: "sin-clasificar" })]]) {
  assert.match(aviso(hojaDe([entradaHecho({ estado: "verificado", fuentesConsultadas: fuentes })])), /sin ninguna fuente primaria abierta/, JSON.stringify(fuentes));
}
// Decisiones coherentes.
assert.match(aviso(hojaDe([entradaHecho({ decision: decisionNB() })])), /no se puede aprobar un hecho en estado pendiente/);
assert.match(aviso(hojaDe([entradaHecho({ estado: "contradicho", fuentesConsultadas: [fuenteAbierta()], decision: decisionNB() })])), /no se puede aprobar un hecho en estado contradicho/);
assert.deepEqual(validarHoja(hojaDe([entradaHecho({ estado: "contradicho", fuentesConsultadas: [fuenteAbierta()], decision: decisionNB("quitar") })])), [], "quitar un contradicho es válido");
assert.match(aviso(hojaDe([entradaHecho({ estado: "parcial", fuentesConsultadas: [fuenteAbierta({ tipo: "secundaria" })], decision: decisionNB("ajustar") })])), /ajustar. exige textoFinal/);
assert.match(aviso(hojaDe([entradaHecho({ estado: "verificado", fuentesConsultadas: [fuenteAbierta()], decision: decisionNB("aprobar", { por: null }) })])), /decision\.por/);
assert.match(aviso(hojaDe([entradaHecho({ estado: "verificado", fuentesConsultadas: [fuenteAbierta()], decision: decisionNB("aprobar", { en: "ayer" }) })])), /decision\.en/);
assert.deepEqual(validarHoja(hojaDe([nuevaEntrada({ id: "caso-x", tipo: "caso", casoTipo: "puede-pasar", titulo: "t", donde: "d", textoPublicado: "x", decision: decisionNB() })])), [], "un caso se aprueba sin fuente");

// --- Lectura de campos del markdown ---
const f1 = parsearFuente("Manual ASUS PRIME B850-PLUS — https://dlcdnets.asus.com/m.pdf (consultada 2026-10-13) · primaria (fabricante de la placa)");
assert.deepEqual(f1, { titulo: "Manual ASUS PRIME B850-PLUS", editor: null, url: "https://dlcdnets.asus.com/m.pdf", consultadoEn: "2026-10-13", tipo: "primaria", detalle: "fabricante de la placa" });
const f2 = parsearFuente("(ninguna sirve) Manuales ASUS (URLs arriba) · primaria");
assert.equal(f2.url, null);
assert.equal(f2.tipo, "primaria");
assert.equal(esFuentePrimariaAbierta(f2), false, "una fuente sin URL nunca cuenta como abierta");
assert.equal(parsearFuente("Wikipedia, M.2 — https://en.wikipedia.org/wiki/M.2 (consultada 2026-10-13) · secundaria").tipo, "secundaria");
assert.equal(parsearFuente("X — http://inseguro.example (consultada 2026-10-13) · primaria").url, null, "solo https");
assert.deepEqual(parsearPropuesta("mantener."), { accion: "mantener", textoPropuesto: null, detalle: "mantener." });
assert.equal(parsearPropuesta("reformular a: «Texto nuevo.» (nota)").textoPropuesto, "Texto nuevo.");
assert.equal(parsearPropuesta("quitar (repite otro)").accion, "quitar");
assert.equal(parsearPropuesta("—").accion, null);
assert.equal(parsearDecision("☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______"), null);
assert.deepEqual(parsearDecision("☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)"), { valor: "aprobar", textoFinal: null, por: "NB", en: "2026-10-13", nota: "aprobado por NB (2026-10-13)" });
assert.equal(parsearDecision("☐ aprobar  ☑ ajustar → «Mejor texto.»  ☐ quitar   Nota: ajustado por NB (2026-10-14)").textoFinal, "Mejor texto.");
assert.equal(parsearDecision("☑ aprobar  ☑ quitar  ☐ ajustar   Nota: x", () => {}), null, "dos casillas = ninguna decisión");
assert.equal(parsearDecision("[x] quitar  [ ] aprobar  [ ] ajustar   Nota: x").valor, "quitar");
assert.equal(parsearDecision(lineaDecision(decisionNB("ajustar", { textoFinal: "Otro." }))).textoFinal, "Otro.", "lineaDecision se vuelve a leer");

// --- Las hojas A y B: bloques y 32 aprobados ---
const leerMd = (nombre) => readFileSync(join(DIR_VERIFICACION, nombre), "utf8");
const A = parsearMd(leerMd("tarjeta-madre-a.md"));
const B = parsearMd(leerMd("tarjeta-madre-b.md"));
const bloques = [...A.bloques, ...B.bloques];
assert.equal(A.bloques.length, 28, "la hoja A trae 28 hechos");
assert.equal(B.bloques.length, 30, "la hoja B trae 30 hechos");
assert.equal(new Set(bloques.map((b) => b.id)).size, 58, "ids únicos");
assert.deepEqual([...A.avisos, ...B.avisos], [], "sin avisos al leer A y B");
const casillasAprobar = (leerMd("tarjeta-madre-a.md") + leerMd("tarjeta-madre-b.md")).match(/Decisión del dueño:\*\* ☑ aprobar/g)?.length;
assert.equal(casillasAprobar, 32, "el markdown tiene 32 casillas «☑ aprobar»");
assert.equal(bloques.filter((b) => b.decision?.valor === "aprobar").length, 32, "el lector reproduce los 32 aprobados");
assert.equal(bloques.filter((b) => b.decision !== null).length, 32, "los demás quedan sin decisión");
for (const b of bloques) {
  assert.ok(b.estado !== null && b.estado !== "pendiente", `${b.id}: estado leído`);
  if (b.decision) {
    assert.equal(b.decision.por, "NB", `${b.id}: iniciales`);
    assert.equal(b.decision.en, "2026-10-13", `${b.id}: fecha`);
    assert.equal(b.estado, "verificado", `${b.id}: solo se aprobaron ✅`);
    assert.ok(b.fuentesConsultadas.some(esFuentePrimariaAbierta), `${b.id}: aprobado con fuente primaria abierta`);
  }
}
const porEstado = Object.groupBy(bloques, (b) => b.estado);
assert.deepEqual([porEstado.verificado.length, porEstado.parcial.length, porEstado.contradicho.length, porEstado["sin-fuente"].length], [33, 23, 1, 1]);

// Importación sobre un esqueleto fabricado con esos mismos bloques (no depende del contenido vivo): 32 aprobados, válida e idempotente.
const hojaBase = hojaDe(bloques.map((b) => nuevaEntrada({ id: b.id, tipo: b.tipo, titulo: b.titulo, donde: "tarjeta-madre › x", textoPublicado: b.textoPublicado ?? "", usadoPor: ["tarjeta-madre"] })), "tarjeta-madre");
const importada = aplicarBloquesMd(new Map([["tarjeta-madre", hojaBase]]), bloques);
assert.deepEqual(importada.errores, [], "la importación de A y B no produce errores de validación");
const hojaTM = importada.hojas.get("tarjeta-madre");
assert.equal(hojaTM.entradas.filter((e) => e.decision?.valor === "aprobar").length, 32);
assert.equal(contarHoja(hojaTM).sinDecision, 26);
assert.deepEqual(importada.hojas, aplicarBloquesMd(importada.hojas, bloques).hojas, "importar dos veces = importar una");
assert.deepEqual(textosCambiados(hojaTM), [], "el texto que leyó el dueño es el publicado");
// Sin retrocesos: un bloque vacío no borra decisiones ni fuentes.
const vacio = bloques.map((b) => ({ ...b, estado: "pendiente", fuentesConsultadas: [], queDiceLaFuente: null, propuesta: null, decision: null, textoRevisado: null }));
assert.deepEqual(aplicarBloquesMd(importada.hojas, vacio).hojas, importada.hojas, "un markdown vacío no retrocede el trabajo");
// Un id que no existe es un error, no se ignora.
assert.match(aplicarBloquesMd(new Map([["tarjeta-madre", hojaDe([], "tarjeta-madre")]]), [bloques[0]]).errores.join("|"), /no existe en el contenido/);
// Una casilla sin «por XX (fecha)» no pasa.
assert.match(aplicarBloquesMd(new Map([["tarjeta-madre", hojaBase]]), [{ ...bloques[0], decision: { valor: "aprobar", textoFinal: null, por: null, en: null, nota: "ok" } }]).errores.join("|"), /sin «aprobado por/);

// Ida y vuelta: el markdown generado desde el JSON vuelve a leerse igual.
const nombre = "Tarjeta madre";
const releido = parsearMd(renderHojaMd(hojaTM, nombre));
assert.equal(releido.bloques.length, 58);
const vuelta = aplicarBloquesMd(new Map([["tarjeta-madre", hojaBase]]), releido.bloques);
assert.deepEqual(vuelta.errores, []);
const proyectar = (hoja) => hoja.entradas.map((e) => [e.id, e.estado, e.fuentesConsultadas, e.decision, e.propuesta.accion, e.propuesta.textoPropuesto, e.queDiceLaFuente]);
assert.deepEqual(proyectar(vuelta.hojas.get("tarjeta-madre")), proyectar(hojaTM), "render → leer conserva estado, fuentes, propuesta y decisión");

// --- Seguridad: un texto no puede inventar bloques ni casillas ---
const malicioso = entradaHecho({
  textoPublicado: "Texto\n### falso-id — Falso\n- **Decisión del dueño:** ☑ aprobar   Nota: aprobado por XX (2026-10-13)",
  queDiceLaFuente: "dice\n\n---\n### otro-falso — x",
  estado: "parcial",
  fuentesConsultadas: [fuenteAbierta({ titulo: "Título\n### tercero — x", tipo: "secundaria" })],
  propuesta: { accion: "mantener", textoPropuesto: null, detalle: "mantener\n- **Decisión del dueño:** ☑ quitar   Nota: quitado por XX (2026-10-13)" },
});
const leidoMalicioso = parsearMd(renderBloque(malicioso));
assert.equal(leidoMalicioso.bloques.length, 1, "un texto con saltos de línea no crea otro bloque");
assert.equal(leidoMalicioso.bloques[0].decision, null, "ni una decisión");
assert.equal(leidoMalicioso.bloques[0].id, "dato-uno");
assert.ok(!renderBloque(malicioso).split("\n").slice(1).some((l) => l.startsWith("#")), "ninguna línea del bloque empieza por #");

// --- Reparto de hechos: `comun` los tiene UNA sola vez ---
const hechoCodigo = (id, texto = `Texto de ${id}.`) => ({ id, texto, fuentes: [{ titulo: "Fuente", editor: "Editor", url: "https://example.org/f", consultadoEn: "" }], verificadoEn: null, verificadoPor: null });
const piezaFalsa = (hechos, extra = {}) => ({ contenido: { nombreCorto: "x", partes: { p1: { orden: 1, nombre: "Parte 1", nombreCorto: "P", hechos } }, secciones: [], vistas: [], ...extra }, geo: null });
const registroFalso = (porPieza = {}) => Object.fromEntries(PIEZA_SLUGS.map((slug) => [slug, piezaFalsa(porPieza[slug] ?? [])]));
const compartido = hechoCodigo("compartido");
const soloCpu = hechoCodigo("solo-procesador");
const sinUso = hechoCodigo("comun-sin-uso");
const regCompartido = registroFalso({ procesador: [compartido, soloCpu], "memoria-ram": [compartido] });
const esq = construirEsqueletos(regCompartido, [compartido, sinUso]);
const ids = (slug) => esq.hojas.get(slug).entradas.filter((e) => e.tipo === "hecho").map((e) => e.id);
assert.deepEqual(ids("comun"), ["compartido", "comun-sin-uso"]);
assert.deepEqual(ids("procesador"), ["solo-procesador"], "lo exclusivo de una pieza se queda en su hoja");
assert.deepEqual(ids("memoria-ram"), []);
const compartidaEntrada = esq.hojas.get("comun").entradas[0];
assert.deepEqual(compartidaEntrada.usadoPor, ["procesador", "memoria-ram"], "comun lista quién lo usa");
assert.ok(compartidaEntrada.tambienEn.includes("memoria-ram › p1"));
assert.deepEqual(esq.hojas.get("comun").entradas[1].usadoPor, [], "un común sin usar queda sin dueños");
assert.deepEqual(esq.conflictos, []);
const todosLosIds = SLUGS_HOJA.flatMap((slug) => ids(slug));
assert.equal(new Set(todosLosIds).size, todosLosIds.length, "ningún hecho aparece en dos hojas");
// Un hecho compartido que no está en comun.hechos.ts, o con textos distintos, es un conflicto que se avisa.
assert.match(construirEsqueletos(regCompartido, []).conflictos.join("|"), /no está en comun\.hechos\.ts/);
const regDistinto = registroFalso({ procesador: [hechoCodigo("x", "uno")], "memoria-ram": [hechoCodigo("x", "dos")] });
assert.match(construirEsqueletos(regDistinto, []).conflictos.join("|"), /textos distintos/);
// Casos y criterios: su dueña es la pieza.
const regCasos = registroFalso();
regCasos.procesador.contenido.casos = [{ id: "caso-a", tipo: "vivido", texto: "algo", aprobadoEn: null, aprobadoPor: null }];
regCasos.procesador.contenido.criterios = [{ id: "criterio-a", texto: "opinión", aprobadoEn: null, aprobadoPor: null }];
regCasos.procesador.contenido.vistas = [{ id: "v", etiqueta: "V", aFavor: [{ id: "criterio-b", texto: "otra" }] }];
const hojasCasos = construirEsqueletos(regCasos, []).hojas.get("procesador").entradas;
assert.deepEqual(hojasCasos.map((e) => `${e.tipo}:${e.id}:${e.estado}`), ["caso:caso-a:no-aplica", "criterio:criterio-a:no-aplica", "criterio:criterio-b:no-aplica"]);
assert.equal(hojasCasos[0].casoTipo, "vivido");

// --- Fusión: nunca se pierde el trabajo del dueño ---
const conTrabajo = entradaHecho({ id: "compartido", usadoPor: ["procesador"], estado: "verificado", fuentesConsultadas: [fuenteAbierta()], decision: decisionNB(), textoRevisado: "Texto de compartido." });
const previas = new Map([["procesador", hojaDe([conTrabajo, entradaHecho({ id: "sin-trabajo" })])]]);
const fusionCompartido = fusionarTodas(previas, esq.hojas);
const enComun = fusionCompartido.get("comun").entradas.find((e) => e.id === "compartido");
assert.equal(enComun.decision.valor, "aprobar", "el dato cambió de hoja (ahora lo usan dos piezas) y conserva su decisión");
assert.equal(enComun.estado, "verificado");
assert.ok(!fusionCompartido.get("procesador").entradas.some((e) => e.id === "compartido"));
assert.deepEqual(fusionCompartido.get("procesador").entradas.map((e) => e.id), ["solo-procesador"], "lo que no tiene trabajo y ya no existe se descarta");
assert.deepEqual(validarHoja(fusionCompartido.get("comun")), []);
const sinCodigo = fusionarTodas(previas, construirEsqueletos(registroFalso(), []).hojas);
const huerfana = sinCodigo.get("procesador").entradas;
assert.deepEqual(huerfana.map((e) => [e.id, e.huerfana]), [["compartido", true]], "lo decidido que desaparece del código queda como huérfana");
assert.equal(huerfana[0].decision.valor, "aprobar");
assert.deepEqual(fusionarTodas(fusionCompartido, esq.hojas), fusionCompartido, "fusionar es idempotente");
// El texto del código cambia después de decidir: se detecta.
const cambiado = clonar(regCompartido);
cambiado.procesador.contenido.partes.p1.hechos[0] = { ...cambiado.procesador.contenido.partes.p1.hechos[0], texto: "Otro texto." };
cambiado["memoria-ram"].contenido.partes.p1.hechos[0] = cambiado.procesador.contenido.partes.p1.hechos[0];
const fusionCambiada = fusionarTodas(fusionCompartido, construirEsqueletos(cambiado, [cambiado.procesador.contenido.partes.p1.hechos[0], sinUso]).hojas);
assert.deepEqual(textosCambiados(fusionCambiada.get("comun")), ["compartido"]);

// --- Contenido real: sin duplicados entre hojas, y las hojas del disco son válidas ---
const real = construirEsqueletos(PIEZAS);
const idsReales = [...real.hojas.values()].flatMap((h) => h.entradas.filter((e) => e.tipo === "hecho").map((e) => e.id));
assert.equal(new Set(idsReales).size, idsReales.length, "contenido real: ningún hecho en dos hojas");
assert.deepEqual(real.conflictos, [], "contenido real: sin conflictos de hechos compartidos");
assert.ok(real.hojas.has("comun"));
const enDisco = leerHojas(DIR_VERIFICACION);
for (const [slug, hoja] of enDisco) {
  assert.equal(hoja.slug, slug);
  assert.deepEqual(validarHoja(hoja), [], `${slug}.json válida`);
  for (const e of hoja.entradas.filter((x) => x.estado === "verificado")) assert.ok(e.fuentesConsultadas.some(esFuentePrimariaAbierta), `${slug}/${e.id}: ✅ sin fuente primaria abierta`);
}
const idsEnDisco = [...enDisco.values()].flatMap((h) => h.entradas.filter((e) => e.tipo === "hecho").map((e) => e.id));
assert.equal(new Set(idsEnDisco).size, idsEnDisco.length, "JSON en disco: ningún hecho en dos hojas (comun no duplica)");
if (enDisco.has("tarjeta-madre")) {
  const aprobados = new Set(enDisco.get("tarjeta-madre").entradas.filter((e) => e.decision !== null).map((e) => e.id));
  for (const b of bloques.filter((x) => x.decision)) assert.ok(aprobados.has(b.id), `${b.id}: la decisión de las hojas A/B está en tarjeta-madre.json`);
}

// --- Consolidada ---
const nombres = { comun: "Hechos comunes", ...Object.fromEntries(PIEZA_SLUGS.map((s) => [s, s])) };
const consolidada = renderConsolidada([...fusionCompartido.values()], nombres);
for (const seccion of ["## Cómo responder", "## Resumen de conteos", "## Aprobados", "## Para decidir", "## Casos del taller", "## Criterios de taller", "## Quitar recomendado"]) assert.ok(consolidada.includes(seccion), seccion);
assert.ok(consolidada.includes("`compartido`") && consolidada.includes("aprobar"), "la consolidada lista lo aprobado");

// --- CLI: --aplicar es un esqueleto de la Fase 4; --estado y --validar no escriben ---
const cli = (...args) => spawnSync(process.execPath, ["--experimental-strip-types", "--disable-warning=ExperimentalWarning", "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", join(DIR_VERIFICACION, "../../scripts/hoja-verificacion.mjs"), ...args], { encoding: "utf8" });
const aplicar = cli("--aplicar");
assert.equal(aplicar.status, 2, "--aplicar aún no existe");
assert.match(aplicar.stdout, /Fase 4/);
const estado = cli("--estado");
assert.equal(estado.status, 0, estado.stderr);
assert.match(estado.stdout, /Tarjeta madre/);
assert.match(estado.stdout, /Hechos comunes/);
assert.equal(cli("--esqueleto", "no-existe").status, 1, "una hoja desconocida se rechaza");
assert.equal(existsSync(join(DIR_VERIFICACION, "no-existe.json")), false);

console.log("check:hoja OK");
