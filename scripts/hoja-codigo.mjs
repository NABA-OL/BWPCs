/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-19
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Lectura y edición del CÓDIGO de las piezas con el AST de `typescript` (docs/piezas-plan-2.md §5.6). Lo usan `--congelar`, `--aplicar` y `--verificar`
// de scripts/hoja-verificacion.mjs. Todo es puro sobre texto: no toca el disco ni la red. El texto de los archivos son DATOS: aquí solo se lee su AST.
import ts from "typescript";

/** Constructores que crean un `Hecho`: `hecho(id, texto, fuentes, nota?)`. */
export const CTORS_HECHO = ["hecho", "hechoVerificado", "hechoVerificadoB"];
/** Ayudantes que envuelven la llamada de un `Hecho` (el primer argumento es el hecho). */
export const ENV_REVISION = "conRevision";
export const ENV_DUENO = "verificadoPorDueno";
/** Envoltura de un criterio creado con el ayudante `criterio(id, texto)` (almacenamiento). */
export const ENV_APROBACION = "aprobadoPorDueno";
export const AYUDANTE_CRITERIO = "criterio";

export function leerFuente(texto, ruta = "contenido.ts") {
  return ts.createSourceFile(ruta, texto, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

/** Errores de sintaxis del texto (vacío = se puede parsear). No comprueba tipos. */
export function erroresDeSintaxis(texto) {
  const resultado = ts.transpileModule(texto, { fileName: "x.ts", reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext } });
  return (resultado.diagnostics ?? []).map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"));
}

const esTextoLiteral = (nodo) => nodo !== undefined && (ts.isStringLiteral(nodo) || ts.isNoSubstitutionTemplateLiteral(nodo));
export { esTextoLiteral };

const llamaA = (nodo, nombres) => ts.isCallExpression(nodo) && ts.isIdentifier(nodo.expression) && nombres.includes(nodo.expression.text);

function numeroDeLinea(sf, nodo) {
  return sf.getLineAndCharacterOfPosition(nodo.getStart(sf)).line + 1;
}

/** Nombre de la declaración o propiedad más cercana que contiene al nodo ("am5Lga", "casos", "factoresForma"…); "" si no hay. */
function contextoDe(nodo) {
  for (let actual = nodo.parent; actual; actual = actual.parent) {
    if (ts.isVariableDeclaration(actual) && ts.isIdentifier(actual.name)) return actual.name.text;
    if (ts.isPropertyAssignment(actual) && (ts.isIdentifier(actual.name) || ts.isStringLiteral(actual.name))) return actual.name.text;
  }
  return "";
}

/** Envolturas (`conRevision`, `verificadoPorDueno`, `aprobadoPorDueno`) de una llamada, de dentro hacia fuera, y el nodo más externo. */
function envolturasDe(llamada, nombres) {
  const lista = [];
  let actual = llamada;
  for (;;) {
    const padre = actual.parent;
    if (padre && llamaA(padre, nombres) && padre.arguments[0] === actual) {
      lista.push(padre);
      actual = padre;
    } else break;
  }
  return { lista, externa: actual };
}

/**
 * Todas las llamadas que crean un Hecho con id literal. Devuelve [{ id, ctor, llamada, envolturas, externa, linea, contexto }]. Un id puede salir más de una vez
 * (el llamador decide si eso es un error). Los hechos que no se construyen así (spread, ayudantes propios) no aparecen.
 */
export function indexarHechos(sf) {
  const lista = [];
  const visitar = (nodo) => {
    if (llamaA(nodo, CTORS_HECHO) && nodo.arguments.length > 0 && esTextoLiteral(nodo.arguments[0])) {
      const { lista: envolturas, externa } = envolturasDe(nodo, [ENV_REVISION, ENV_DUENO]);
      lista.push({ id: nodo.arguments[0].text, ctor: nodo.expression.text, llamada: nodo, envolturas, externa, linea: numeroDeLinea(sf, nodo), contexto: contextoDe(nodo) });
    }
    ts.forEachChild(nodo, visitar);
  };
  visitar(sf);
  return lista;
}

/** Propiedad `nombre: valor` de un literal de objeto (la primera). */
export function propiedadDe(literal, nombre) {
  return literal.properties.find((p) => ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) && p.name.text === nombre);
}

/**
 * Casos y criterios: literales `{ id: "…", …, aprobadoEn }` (con `tipo` = caso; sin él = criterio) y llamadas al ayudante `criterio("id", "texto")`.
 * Devuelve [{ tipo, id, forma: "literal"|"llamada", nodo, envolturas, externa, linea, contexto }].
 */
export function indexarAprobables(sf) {
  const lista = [];
  const visitar = (nodo) => {
    if (ts.isObjectLiteralExpression(nodo)) {
      const id = propiedadDe(nodo, "id");
      if (id && esTextoLiteral(id.initializer) && propiedadDe(nodo, "aprobadoEn")) {
        lista.push({ tipo: propiedadDe(nodo, "tipo") ? "caso" : "criterio", id: id.initializer.text, forma: "literal", nodo, envolturas: [], externa: nodo, linea: numeroDeLinea(sf, nodo), contexto: contextoDe(nodo) });
      }
    } else if (llamaA(nodo, [AYUDANTE_CRITERIO]) && nodo.arguments.length >= 2 && esTextoLiteral(nodo.arguments[0])) {
      const { lista: envolturas, externa } = envolturasDe(nodo, [ENV_APROBACION]);
      lista.push({ tipo: "criterio", id: nodo.arguments[0].text, forma: "llamada", nodo, envolturas, externa, linea: numeroDeLinea(sf, nodo), contexto: contextoDe(nodo) });
    }
    ts.forEachChild(nodo, visitar);
  };
  visitar(sf);
  return lista;
}

/** Objetos con `url` y `editor` literales (una Fuente): url → editor. Sirve para que una fuente nueva use el mismo editor que el código ya conoce. */
export function editoresPorUrl(sf) {
  const mapa = new Map();
  const visitar = (nodo) => {
    if (ts.isObjectLiteralExpression(nodo)) {
      const url = propiedadDe(nodo, "url");
      const editor = propiedadDe(nodo, "editor");
      if (url && editor && esTextoLiteral(url.initializer) && esTextoLiteral(editor.initializer) && editor.initializer.text.trim() !== "" && !mapa.has(url.initializer.text)) mapa.set(url.initializer.text, editor.initializer.text);
    }
    ts.forEachChild(nodo, visitar);
  };
  visitar(sf);
  return mapa;
}

/** Constantes `const X: Fuente = { …, url, consultadoEn }` de primer nivel: [{ nombre, url, consultadoEn, exportada, sentencia }]. Los valores no literales se omiten. */
export function constantesFuente(sf, resolverIdentificador = () => undefined) {
  const lista = [];
  for (const sentencia of sf.statements) {
    if (!ts.isVariableStatement(sentencia) || sentencia.declarationList.declarations.length !== 1) continue;
    const decl = sentencia.declarationList.declarations[0];
    if (!ts.isIdentifier(decl.name) || !decl.type || !ts.isTypeReferenceNode(decl.type) || decl.type.typeName.getText(sf) !== "Fuente") continue;
    if (!decl.initializer || !ts.isObjectLiteralExpression(decl.initializer)) continue;
    const valor = (nombre) => {
      const p = propiedadDe(decl.initializer, nombre);
      if (!p) return undefined;
      if (esTextoLiteral(p.initializer)) return p.initializer.text;
      if (ts.isIdentifier(p.initializer)) return resolverIdentificador(p.initializer.text);
      return undefined;
    };
    const url = valor("url");
    const consultadoEn = valor("consultadoEn");
    if (url === undefined || consultadoEn === undefined) continue;
    const exportada = (ts.getCombinedModifierFlags(decl) & ts.ModifierFlags.Export) !== 0;
    lista.push({ nombre: decl.name.text, url, consultadoEn, exportada, sentencia });
  }
  return lista;
}

/** Nombres importados de un módulo ("./fuentes.ts"): [{ nombre, especificador, declaracion }]. */
export function importesDe(sf, modulo) {
  const lista = [];
  for (const sentencia of sf.statements) {
    if (!ts.isImportDeclaration(sentencia) || !ts.isStringLiteral(sentencia.moduleSpecifier) || sentencia.moduleSpecifier.text !== modulo) continue;
    const enlaces = sentencia.importClause?.namedBindings;
    if (!enlaces || !ts.isNamedImports(enlaces)) continue;
    for (const e of enlaces.elements) lista.push({ nombre: e.name.text, especificador: e, declaracion: sentencia, soloTipo: sentencia.importClause.isTypeOnly || e.isTypeOnly });
  }
  return lista;
}

/** Cuántas veces aparece el identificador `nombre` en el archivo, sin contar la declaración de la propia constante ni los import. */
export function referenciasA(sf, nombre) {
  let veces = 0;
  const visitar = (nodo) => {
    if (ts.isImportDeclaration(nodo)) return;
    if (ts.isIdentifier(nodo) && nodo.text === nombre) {
      const padre = nodo.parent;
      const esDeclaracion = padre && ts.isVariableDeclaration(padre) && padre.name === nodo;
      if (!esDeclaracion) veces += 1;
    }
    ts.forEachChild(nodo, visitar);
  };
  visitar(sf);
  return veces;
}

/* ---------- Edición de texto ---------- */

/** Aplica ediciones { start, end, text } (posiciones del texto original). Falla si se solapan. */
export function aplicarEdiciones(texto, ediciones) {
  const ordenadas = [...ediciones].sort((a, b) => b.start - a.start || b.end - a.end);
  let anteriorInicio = Number.POSITIVE_INFINITY;
  let resultado = texto;
  for (const e of ordenadas) {
    if (e.end > anteriorInicio) throw new Error(`ediciones solapadas en ${e.start}-${e.end}`);
    resultado = resultado.slice(0, e.start) + e.text + resultado.slice(e.end);
    anteriorInicio = e.start;
  }
  return resultado;
}

export function sangriaDeLinea(texto, posicion) {
  const inicio = texto.lastIndexOf("\n", posicion - 1) + 1;
  return /^[ \t]*/.exec(texto.slice(inicio, posicion + 1))?.[0] ?? "";
}

/** ¿Hay solo espacios entre el inicio de la línea y la posición? */
export function esPrimeroEnLinea(texto, posicion) {
  const inicio = texto.lastIndexOf("\n", posicion - 1) + 1;
  return texto.slice(inicio, posicion).trim() === "";
}

/** ¿Contiene el nodo una plantilla (`…`) con saltos de línea? Reindentar cambiaría su contenido. */
export function tienePlantillaMultilinea(nodo, sf) {
  let hay = false;
  const visitar = (n) => {
    if ((ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateExpression(n)) && n.getText(sf).includes("\n")) hay = true;
    if (!hay) ts.forEachChild(n, visitar);
  };
  visitar(nodo);
  return hay;
}

const literalTexto = (valor) => JSON.stringify(valor);

/** Literal de una Fuente en una sola línea. */
export function fuenteLiteral(f) {
  return `{ titulo: ${literalTexto(f.titulo)}, editor: ${literalTexto(f.editor)}, url: ${literalTexto(f.url)}, consultadoEn: ${literalTexto(f.consultadoEn)} }`;
}

/**
 * Arreglo de fuentes. `elementos`: [{ ref: "NOMBRE" } | { fuente }]. En una línea si son solo constantes y cabe; si no, un elemento por línea
 * con la sangría del argumento.
 */
export function formatearFuentes(elementos, sangriaArg) {
  const items = elementos.map((e) => (e.ref !== undefined ? e.ref : fuenteLiteral(e.fuente)));
  const enUnaLinea = `[${items.join(", ")}]`;
  if (elementos.every((e) => e.ref !== undefined) && enUnaLinea.length <= 100) return enUnaLinea;
  const interna = `${sangriaArg}  `;
  return `[\n${items.map((t) => `${interna}${t},`).join("\n")}\n${sangriaArg}]`;
}

/** Envuelve el texto de una llamada: `verificadoPorDueno(<llamada>, "en", "por")`. Si la llamada ocupa varias líneas, reindenta el interior. */
export function envolverLlamada(textoLlamada, sangriaBase, nombreEnvoltura, en, por, reindentar = true) {
  if (!textoLlamada.includes("\n")) return `${nombreEnvoltura}(${textoLlamada}, ${literalTexto(en)}, ${literalTexto(por)})`;
  const interna = `${sangriaBase}  `;
  const interior = reindentar ? textoLlamada.split("\n").map((l, i) => (i === 0 || l.trim() === "" ? l : `  ${l}`)).join("\n") : textoLlamada;
  return `${nombreEnvoltura}(\n${interna}${interior},\n${interna}${literalTexto(en)},\n${interna}${literalTexto(por)},\n${sangriaBase})`;
}
