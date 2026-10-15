/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Decodificador de nombres de procesador (lib/piezas/procesador/decodificador.ts, docs/piezas-plan-2.md §2.2 y §6.1).
// Los casos usan tablas SINTÉTICAS definidas aquí (la lógica no debe depender de los datos reales); al final, una prueba de humo con los
// datos reales de procesador.datos.ts.
import assert from "node:assert/strict";
import { HECHOS_COMUNES } from "../../src/lib/piezas/comun.hechos.ts";
import { PROCESADOR_DECODIFICADOR as REALES } from "../../src/lib/piezas/procesador.datos.ts";
import { PROCESADOR_CONTENIDO } from "../../src/lib/piezas/procesador.contenido.ts";
import { AVISO_PATRON, LARGO_MAXIMO_NOMBRE, decodificarNombre, describirResultado, normalizarNombre } from "../../src/lib/piezas/procesador/decodificador.ts";
import { FECHA, HOY, hechosDe } from "./comun.mjs";

// ---------------------------------------------------------------- tablas sintéticas
const fam = (id, marca, nombre, gamas) => ({ id, marca, nombre, gamas, vigente: true, resumen: `Resumen de ${nombre}.`, hechoIds: [`h-${id}`] });
const serie = (familia, prefijo, digitos, etiqueta, segmento) => ({ familia, prefijo, digitos, etiqueta, ...(segmento ? { segmento } : {}), hechoId: `s-${familia}-${prefijo}` });
const suf = (token, familias, segmento, compone) => ({ token, familias, segmento, significado: `Significado de ${token}.`, ...(compone ? { compone } : {}), hechoId: `x-${token}` });
const INTEL = ["core-i", "core", "core-ultra"];
const SINTETICAS = {
  familias: [
    fam("ryzen", "AMD", "Ryzen", ["3", "5", "7", "9"]),
    fam("ryzen-ai", "AMD", "Ryzen AI", ["5", "7", "9"]),
    fam("core-i", "Intel", "Core i", ["3", "5", "7", "9"]),
    fam("core", "Intel", "Core", ["3", "5", "7"]),
    fam("core-ultra", "Intel", "Core Ultra", ["5", "7", "9"]),
  ],
  series: [
    serie("ryzen", "5", 4, "serie 5000"),
    serie("ryzen", "7", 4, "serie 7000"),
    serie("ryzen", "8", 4, "serie 8000"),
    serie("ryzen-ai", "3", 3, "serie AI 300", "portatil"),
    serie("core-i", "12", 5, "12.ª generación"),
    serie("core-i", "14", 5, "14.ª generación"),
    serie("core", "1", 3, "serie 1 de Core"),
    serie("core-ultra", "2", 3, "serie 2"),
  ],
  sufijos: [
    suf("X", ["ryzen"], "escritorio"),
    suf("X3D", ["ryzen"], "escritorio"),
    suf("XT", ["ryzen"], "escritorio"),
    suf("G", ["ryzen"], "escritorio"),
    suf("F", ["ryzen"], "escritorio"),
    suf("K", INTEL, "escritorio"),
    suf("KF", INTEL, "escritorio", ["K", "F"]),
    suf("KS", INTEL, "escritorio"),
    suf("F", INTEL, "escritorio"),
    suf("T", INTEL, "escritorio"),
    suf("H", [...INTEL, "ryzen-ai"], "portatil"),
    suf("HX", [...INTEL, "ryzen-ai"], "portatil"),
    suf("U", INTEL, "portatil"),
  ],
  ejemplos: [
    { nombre: "Ryzen 5 5600X", hechoId: "e-1" },
    { nombre: "Core i5-12400F", hechoId: "e-2" },
    { nombre: "Core Ultra 7 265K", hechoId: "e-3" },
  ],
  equivalencias: [],
  revisadoEn: HOY,
};

const D = (nombre, datos = SINTETICAS) => decodificarNombre(nombre, datos);
const textos = (r) => r.trozos.map((t) => t.texto);
const tipos = (r) => r.trozos.map((t) => t.tipo);
const sufijoDe = (r) => r.trozos.filter((t) => t.tipo === "sufijo").map((t) => t.texto);

// ---------------------------------------------------------------- casos de la tabla del plan (§6.1)
{
  for (const entrada of ["AMD Ryzen 7 7800X3D", "ryzen7 7800x3d", "Ryzen™ 7 7800X3D", "  RYZEN   7   7800x3D "]) {
    const r = D(entrada);
    assert.equal(r.estado, "reconocido", entrada);
    assert.equal(r.marca, "AMD");
    assert.equal(r.familia, "ryzen");
    assert.equal(r.segmento, "escritorio");
    assert.deepEqual(sufijoDe(r), ["X3D"], `${entrada}: X3D, no X`);
    assert.deepEqual(tipos(r).slice(-4), ["gama", "serie", "modelo", "sufijo"]);
  }
  assert.deepEqual(textos(D("AMD Ryzen 7 7800X3D")), ["AMD", "Ryzen", "7", "7", "800", "X3D"]);

  for (const entrada of ["i5-12400F", "Core i5 12400f", "intel core i5-12400F", "core i5-12400f"]) {
    const r = D(entrada);
    assert.equal(r.estado, "reconocido", entrada);
    assert.equal(r.familia, "core-i");
    assert.equal(r.marca, "Intel");
    const s = r.trozos.find((t) => t.tipo === "serie");
    assert.equal(s?.significado, "12.ª generación", entrada);
    assert.equal(s?.hechoId, "s-core-i-12");
    assert.deepEqual(sufijoDe(r), ["F"]);
  }

  const kf = D("Core i7-14700KF");
  assert.equal(kf.estado, "reconocido");
  assert.deepEqual(sufijoDe(kf), ["KF"], "KF antes que K + F");
  assert.deepEqual(SINTETICAS.sufijos.find((s) => s.token === "KF").compone, ["K", "F"]);
  assert.deepEqual(sufijoDe(D("i9-14900KS")), ["KS"]);

  const ultra = D("Core Ultra 7 265K");
  assert.equal(ultra.estado, "reconocido");
  assert.equal(ultra.familia, "core-ultra");
  assert.equal(ultra.trozos.find((t) => t.tipo === "serie").significado, "serie 2");

  const core = D("Core 5 120U");
  assert.equal(core.estado, "reconocido");
  assert.equal(core.familia, "core");
  assert.equal(core.segmento, "portatil");

  const ai = D("Ryzen AI 9 HX 370");
  assert.equal(ai.estado, "reconocido");
  assert.equal(ai.familia, "ryzen-ai");
  assert.equal(ai.segmento, "portatil");
  assert.deepEqual(sufijoDe(ai), ["HX"]);
  assert.deepEqual(textos(ai), ["Ryzen AI", "9", "HX", "3", "70"], "las letras antes del número se explican en su sitio");
  assert.equal(D("ryzen ai 9 hx370").estado, "reconocido");

  const alias = D("r5 5600g");
  assert.equal(alias.estado, "reconocido");
  assert.equal(alias.familia, "ryzen");
  assert.equal(alias.trozos[0].texto, "R5");
  assert.match(alias.trozos[0].significado, /forma abreviada/, "el alias lleva su nota");
  assert.deepEqual(sufijoDe(alias), ["G"]);

  const gamaMala = D("Ryzen 6 1234");
  assert.equal(gamaMala.estado, "incompleto");
  assert.equal(gamaMala.falta, "gama");
  assert.deepEqual(textos(gamaMala), ["Ryzen"]);

  const sufijoRaro = D("Ryzen 7 7800Z");
  assert.equal(sufijoRaro.estado, "incompleto");
  assert.equal(sufijoRaro.falta, "sufijo-desconocido");
  assert.equal(sufijoRaro.resto, "z");
  assert.deepEqual(textos(sufijoRaro), ["Ryzen", "7", "7", "800"], "lo reconocido hasta ahí se conserva");

  assert.deepEqual(D(""), { estado: "invalido", motivo: "vacio" });
  assert.deepEqual(D("   "), { estado: "invalido", motivo: "vacio" });
  assert.deepEqual(D("x".repeat(LARGO_MAXIMO_NOMBRE + 1)), { estado: "invalido", motivo: "muy-largo" });
  assert.equal(D("x".repeat(LARGO_MAXIMO_NOMBRE)).estado, "incompleto", "exactamente el máximo no es «muy largo»");
  assert.deepEqual(D("a".repeat(100000)), { estado: "invalido", motivo: "muy-largo" });
  for (const raro of ["<script>", "ryzen 7 😀", "ryzen\u0000 7", "ryzen 7 \"x\"", "ryzen 7 5800x."]) assert.deepEqual(D(raro), { estado: "invalido", motivo: "caracteres" }, JSON.stringify(raro));
}

// ---------------------------------------------------------------- casos extra de tolerancia y límites
{
  assert.equal(D("Core i5–12400F").estado, "reconocido", "guion largo pegado de un sitio web");
  assert.equal(D("Core\ti5\n12400F").estado, "reconocido", "tabulaciones y saltos cuentan como espacios");
  assert.equal(D("Core i5 12400 F").estado, "reconocido", "sufijo separado por espacio");
  assert.equal(D("ryzen 7 5800x3d").estado, "reconocido");

  const sinGama = D("ryzen 5600x");
  assert.equal(sinGama.estado, "incompleto");
  assert.equal(sinGama.falta, "gama", "«ryzen 5600x» no se inventa una gama");
  assert.equal(D("i512400f").falta, "gama", "«i512400» es ambiguo y no se acepta");
  assert.equal(D("ryzen 7").falta, "numero");
  assert.equal(D("ryzen 7 x").falta, "numero");
  assert.equal(D("pentium 4").falta, "familia");
  assert.equal(D("amd core i5 12400").falta, "familia", "marca y familia que no coinciden");
  assert.equal(D("Core Ultra 3 200").falta, "gama", "gama fuera de la tabla de esa familia");

  // Serie desconocida: sigue siendo reconocido, con el número como «modelo».
  const sinSerie = D("Ryzen 7 9999X");
  assert.equal(sinSerie.estado, "reconocido");
  assert.deepEqual(tipos(sinSerie).slice(-2), ["modelo", "sufijo"]);
  assert.equal(sinSerie.trozos.at(-2).texto, "9999");

  // Un sufijo de otra familia no se reconoce (X3D solo existe en Ryzen en estas tablas).
  assert.equal(D("Core i5 12400X3D").falta, "sufijo-desconocido");
  // Dos sufijos seguidos se explican uno a uno cuando no existe uno combinado.
  const doble = D("Core i7 12700 K F");
  assert.deepEqual(sufijoDe(doble), ["K", "F"]);
  // Sin el combinado KF en las tablas, «kf» se lee como K + F.
  const sinKF = { ...SINTETICAS, sufijos: SINTETICAS.sufijos.filter((s) => s.token !== "KF") };
  assert.deepEqual(sufijoDe(D("Core i7-14700KF", sinKF)), ["K", "F"]);

  // El segmento sale del sufijo; un mismo token puede existir en dos segmentos de una familia.
  const dosSegmentos = { ...SINTETICAS, sufijos: [...SINTETICAS.sufijos, suf("S", INTEL, "portatil"), suf("S", INTEL, "escritorio")] };
  assert.equal(D("Core i5 12400S", dosSegmentos).segmento, "portatil", "gana la primera entrada de la tabla");

  // Tablas vacías: todo es «no reconocido», nada lanza.
  const vacias = { familias: [], series: [], sufijos: [], ejemplos: [], equivalencias: [], revisadoEn: HOY };
  assert.equal(D("Ryzen 7 7800X3D", vacias).falta, "familia");
  assert.deepEqual(D("", vacias), { estado: "invalido", motivo: "vacio" });

  // El orden de las tablas no cambia el resultado (el sufijo más largo gana siempre).
  const invertidas = { ...SINTETICAS, sufijos: [...SINTETICAS.sufijos].reverse(), series: [...SINTETICAS.series].reverse(), familias: [...SINTETICAS.familias].reverse() };
  for (const n of ["Ryzen 7 7800X3D", "Core i7-14700KF", "Ryzen AI 9 HX 370", "Core 5 120U", "Ryzen 7 7800XT"]) assert.deepEqual(D(n, invertidas), D(n), `${n}: el orden de las tablas no importa`);
  assert.deepEqual(sufijoDe(D("Ryzen 7 7800XT")), ["XT"], "XT antes que X + T");

  // Prototipo y cadenas raras como nombre: nada especial.
  for (const n of ["__proto__", "constructor", "toString", "ryzen 7 constructor"]) assert.doesNotThrow(() => D(n), n);
}

// ---------------------------------------------------------------- textos para el lector de pantalla
{
  assert.equal(describirResultado(D("Ryzen 7 7800X3D")), "ryzen 7 7800x3d: 5 partes reconocidas.");
  assert.match(describirResultado(D("Ryzen 7 7800Z")), /4 partes reconocidas\. No reconozco/);
  assert.match(describirResultado(D("")), /Escribe el nombre/);
  assert.match(AVISO_PATRON, /confirma en la página del fabricante/, "el aviso dice que el modelo no se comprueba");
  assert.match(AVISO_PATRON, /cómo se lee el nombre/);
  assert.equal(describirResultado({ estado: "reconocido", normalizado: "x", marca: "AMD", familia: "ryzen", segmento: null, trozos: [{ texto: "x", tipo: "modelo", significado: "." }] }), "x: 1 parte reconocida.");
}

// ---------------------------------------------------------------- propiedades
{
  // normalizarNombre es idempotente.
  const muestras = ["AMD Ryzen™ 7  7800X3D", "Core i5–12400F", "  I5-12400F  ", "RYZEN®", "Core\t\tUltra   9"];
  for (const m of muestras) {
    const n = normalizarNombre(m);
    assert.equal(n.ok, true, m);
    assert.deepEqual(normalizarNombre(n.texto), n, `idempotente: ${m}`);
  }
  assert.equal(normalizarNombre("Ryzen™ 7").texto, "ryzen 7", "™ se quita antes de NFKC (si no quedaría «tm»)");

  // Nunca lanza una excepción: 2000 cadenas pseudoaleatorias con semilla fija.
  let semilla = 20261014;
  const azar = () => {
    semilla = (Math.imul(semilla, 1664525) + 1013904223) >>> 0;
    return semilla / 2 ** 32;
  };
  const alfabeto = "abcdefghijklmnopqrstuvwxyz0123456789 -+ryzenicoultaHXKFUGT™®©\u0000<>é😀\n\t";
  const piezas = ["ryzen", "core", "ultra", "ai", "i", "r", "amd", "intel", "x3d", "kf", "hx", " ", "-", "5", "7", "12400", "370", "z"];
  for (let i = 0; i < 2000; i++) {
    let texto = "";
    const modo = azar() < 0.5;
    const largo = Math.floor(azar() * 80);
    for (let j = 0; j < largo; j++) texto += modo ? alfabeto[Math.floor(azar() * alfabeto.length)] : piezas[Math.floor(azar() * piezas.length)];
    for (const datos of [SINTETICAS, REALES]) {
      const r = decodificarNombre(texto, datos);
      assert.ok(["reconocido", "incompleto", "invalido"].includes(r.estado), JSON.stringify(texto));
      assert.equal(typeof describirResultado(r), "string");
      if (r.estado !== "invalido") for (const t of r.trozos) assert.ok(t.texto.length > 0 && t.significado.length > 0, `trozo completo: ${JSON.stringify(texto)}`);
    }
  }
  for (const raro of [null, undefined, 42, {}, []]) assert.deepEqual(decodificarNombre(raro, SINTETICAS), { estado: "invalido", motivo: "vacio" });

  // Cada sufijo sintético se alcanza por al menos un caso (un nombre por familia y token).
  const ejemploPorFamilia = { ryzen: "Ryzen 7 7800", "ryzen-ai": "Ryzen AI 9 HX 370", "core-i": "Core i5 12400", core: "Core 5 120", "core-ultra": "Core Ultra 7 265" };
  for (const s of SINTETICAS.sufijos) {
    let alcanzado = false;
    for (const f of s.familias) {
      const r = D(`${ejemploPorFamilia[f]}${s.token}`);
      if (r.estado === "reconocido" && sufijoDe(r).join("") === s.token) alcanzado = true;
      if (r.estado === "reconocido" && sufijoDe(r).includes(s.token)) alcanzado = true;
    }
    assert.ok(alcanzado, `el sufijo ${s.token} se alcanza`);
  }
  // Cada ejemplo da «reconocido».
  for (const e of SINTETICAS.ejemplos) assert.equal(D(e.nombre).estado, "reconocido", e.nombre);
  // Tokens únicos por (familia, segmento) y el más largo gana (comprobado arriba con las tablas invertidas).
  const vistos = new Set();
  for (const s of SINTETICAS.sufijos) for (const f of s.familias) {
    const clave = `${f}|${s.segmento}|${s.token}`;
    assert.ok(!vistos.has(clave), `token repetido ${clave}`);
    vistos.add(clave);
  }
}

// ---------------------------------------------------------------- prueba de humo con los datos reales (procesador.datos.ts)
{
  const hayDatos = REALES.familias.length > 0 && REALES.sufijos.length > 0;
  if (!hayDatos) {
    console.warn("check:piezas · decodificador: procesador.datos.ts aún está vacío; se omite la prueba de humo con datos reales.");
  } else {
    assert.match(REALES.revisadoEn, FECHA, "revisadoEn tiene formato AAAA-MM-DD");
    const meses = (Date.parse(HOY) - Date.parse(REALES.revisadoEn)) / (1000 * 60 * 60 * 24 * 30.4);
    if (meses > 6) console.warn(`check:piezas · decodificador: las tablas se revisaron hace ${Math.floor(meses)} meses (revisar cada 6).`);

    // Todos los hechoId de las tablas existen en el contenido de la pieza o en los hechos comunes.
    const ids = new Set([...hechosDe(PROCESADOR_CONTENIDO), ...HECHOS_COMUNES].map((h) => h.id));
    const usados = [
      ...REALES.familias.flatMap((f) => f.hechoIds),
      ...REALES.series.map((s) => s.hechoId),
      ...REALES.sufijos.map((s) => s.hechoId),
      ...REALES.ejemplos.map((e) => e.hechoId),
    ];
    for (const id of usados) assert.ok(ids.has(id), `hechoId inexistente en las tablas del decodificador: ${id}`);

    // Cada ejemplo se reconoce por completo y todo trozo con hecho apunta a uno de las tablas.
    for (const e of REALES.ejemplos) {
      const r = decodificarNombre(e.nombre, REALES);
      assert.equal(r.estado, "reconocido", `ejemplo real: ${e.nombre}`);
      for (const t of r.trozos) if (t.hechoId !== undefined) assert.ok(usados.includes(t.hechoId), `${e.nombre}: ${t.texto} trae un hechoId ajeno a las tablas`);
    }
    // Las trampas conocidas salen de los datos: el sufijo X3D no es X, y una G de AMD no se afirma en el código.
    const x3d = REALES.sufijos.find((s) => s.token === "X3D");
    if (x3d !== undefined) assert.deepEqual(sufijoDe(decodificarNombre("Ryzen 7 7800X3D", REALES)), ["X3D"]);
    // Cada sufijo real se alcanza: se prueba con una base de cada familia que lo usa y, si hay serie, un número de esa serie.
    for (const s of REALES.sufijos) {
      let alcanzado = false;
      for (const idFamilia of s.familias) {
        const f = REALES.familias.find((x) => x.id === idFamilia);
        const serieBase = REALES.series.find((x) => x.familia === idFamilia && (x.segmento === undefined || x.segmento === s.segmento));
        if (f === undefined || serieBase === undefined) continue;
        const numero = `${serieBase.prefijo}${"0".repeat(serieBase.digitos - serieBase.prefijo.length)}`;
        const nombre = `${f.nombre} ${f.gamas[0]} ${numero}${s.token}`;
        if (sufijoDe(decodificarNombre(nombre, REALES)).includes(s.token)) alcanzado = true;
        const antes = decodificarNombre(`${f.nombre} ${f.gamas[0]} ${s.token} ${numero}`, REALES);
        if (antes.estado !== "invalido" && sufijoDe(antes).includes(s.token)) alcanzado = true;
      }
      assert.ok(alcanzado, `sufijo real inalcanzable: ${s.token} (${s.familias.join(", ")})`);
    }
  }
}
