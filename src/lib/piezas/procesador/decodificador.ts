/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Decodificador de nombres de procesador (docs/piezas-plan-2.md §2.2). Lógica PURA y determinista: sin red, sin almacenamiento y sin
// imports de valores (solo tipos), para que `check:logic` la cargue con --experimental-strip-types.
// DESGLOSA UN PATRÓN; no comprueba que el modelo exista (AVISO_PATRON, que la interfaz muestra siempre). Todo significado sobre el
// hardware sale de las tablas de `procesador.datos.ts` con su `hechoId`: aquí solo se sabe cómo se escriben los nombres.
import type {
  DatosDecodificador,
  FamiliaCpu,
  FamiliaCpuId,
  MarcaCpu,
  MotivoInvalido,
  ResultadoDecodificacion,
  SegmentoCpu,
  SerieCpu,
  SufijoCpu,
  TrozoNombre,
} from "../types.ts";

export const LARGO_MAXIMO_NOMBRE = 60;
/** Tope previo a normalizar: evita trabajo inútil con entradas enormes. Cualquier cosa más larga ya es «muy-largo». */
const LARGO_MAXIMO_ENTRADA = 400;

export const AVISO_PATRON = "Esto explica cómo se lee el nombre; confirma en la página del fabricante que el modelo exista.";

export const MENSAJE_INVALIDO: Readonly<Record<MotivoInvalido, string>> = {
  vacio: "Escribe el nombre de un procesador para desglosarlo.",
  "muy-largo": "El nombre es demasiado largo para ser el de un procesador.",
  caracteres: "Usa solo letras, números, espacios y guiones.",
};

export const MENSAJE_FALTA: Readonly<Record<"familia" | "gama" | "numero" | "sufijo-desconocido", string>> = {
  familia: "No reconocí la familia (por ejemplo Ryzen, Core o Core Ultra).",
  gama: "Reconocí la familia, pero falta la gama o no es una de las que usa esa familia.",
  numero: "Falta el número del modelo.",
  "sufijo-desconocido": "No reconozco las letras del final.",
};

type EntradaNormalizada = { ok: true; texto: string } | { ok: false; motivo: MotivoInvalido };

/** Pasa a minúsculas, quita ™ ® ©, unifica guiones y espacios. Idempotente. No lanza excepciones. */
export function normalizarNombre(entrada: string): EntradaNormalizada {
  if (typeof entrada !== "string") return { ok: false, motivo: "vacio" };
  if (entrada.length > LARGO_MAXIMO_ENTRADA) return { ok: false, motivo: "muy-largo" };
  // Las marcas se quitan ANTES de NFKC: esa normalización convierte ™ en «TM».
  const sinMarcas = entrada.replace(/[™®©]/g, "");
  const texto = sinMarcas
    .normalize("NFKC")
    .replace(/[‐-―−]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  if (texto.length === 0) return { ok: false, motivo: "vacio" };
  if (texto.length > LARGO_MAXIMO_NOMBRE) return { ok: false, motivo: "muy-largo" };
  if (!/^[a-z0-9 +-]+$/.test(texto)) return { ok: false, motivo: "caracteres" };
  return { ok: true, texto };
}

/* ---------- Emparejamiento de la familia: cómo se ESCRIBE cada familia (no qué es) ---------- */
interface PatronFamilia {
  id: FamiliaCpuId;
  expresion: RegExp;
  /** El patrón ya incluye la gama (alias «r5»). */
  conGama?: boolean;
}
// Orden: la forma más larga primero (ryzen ai > ryzen; core ultra > core i > core).
const PATRONES_FAMILIA: readonly PatronFamilia[] = [
  { id: "ryzen-ai", expresion: /^ryzen[ -]?ai(?![a-z])/ },
  { id: "ryzen", expresion: /^ryzen(?![a-z])/ },
  { id: "ryzen", expresion: /^r(?=[3579](?!\d))/, conGama: true },
  { id: "core-ultra", expresion: /^core[ -]?ultra(?![a-z])/ },
  { id: "core-i", expresion: /^core[ -]?i(?![a-z])/ },
  { id: "core-i", expresion: /^i(?=[ -]?\d)/ },
  { id: "core", expresion: /^core(?![a-z])/ },
];

const SEPARADORES = /^[ +-]+/;
const MARCAS_ESCRITAS: Readonly<Record<string, MarcaCpu>> = { amd: "AMD", intel: "Intel" };

function sinSeparadores(texto: string): string {
  return texto.replace(/[ -]/g, "");
}

/** Texto de la familia tal como se muestra en su caja. */
function textoFamilia(fragmento: string, familia: FamiliaCpu): string {
  if (sinSeparadores(fragmento) === sinSeparadores(familia.nombre.toLowerCase())) return familia.nombre;
  return fragmento === "i" ? "i" : fragmento.toUpperCase();
}

function primerHecho(ids: readonly string[]): { hechoId?: string } {
  const primero = ids[0];
  return primero === undefined ? {} : { hechoId: primero };
}

/** Sufijos de la familia ordenados del token más largo al más corto (X3D antes que X; KF antes que K). */
function sufijosDeFamilia(datos: DatosDecodificador, familia: FamiliaCpuId): readonly SufijoCpu[] {
  return datos.sufijos.filter((s) => s.familias.includes(familia)).sort((a, b) => b.token.length - a.token.length);
}

interface ConsumoSufijos {
  trozos: TrozoNombre[];
  segmento: SegmentoCpu | null;
  resto: string;
}

/** Consume sufijos al comienzo de `texto`, el más largo primero, hasta que no quede nada o aparezca algo desconocido. */
function consumirSufijos(texto: string, candidatos: readonly SufijoCpu[], segmentoInicial: SegmentoCpu | null): ConsumoSufijos {
  const trozos: TrozoNombre[] = [];
  let segmento = segmentoInicial;
  let resto = texto.replace(SEPARADORES, "");
  while (resto.length > 0) {
    const coinciden = candidatos.filter((c) => resto.startsWith(c.token.toLowerCase()));
    const elegido = coinciden.find((c) => segmento === null || c.segmento === segmento) ?? coinciden[0];
    if (elegido === undefined) break;
    if (segmento === null) segmento = elegido.segmento;
    trozos.push({ texto: elegido.token, tipo: "sufijo", significado: elegido.significado, hechoId: elegido.hechoId });
    resto = resto.slice(elegido.token.length).replace(SEPARADORES, "");
  }
  return { trozos, segmento, resto };
}

function elegirSerie(datos: DatosDecodificador, familia: FamiliaCpuId, numero: string, segmento: SegmentoCpu | null): SerieCpu | null {
  let mejor: SerieCpu | null = null;
  for (const serie of datos.series) {
    if (serie.familia !== familia || serie.digitos !== numero.length || !numero.startsWith(serie.prefijo)) continue;
    if (serie.segmento !== undefined && segmento !== null && serie.segmento !== segmento) continue;
    if (mejor === null || serie.prefijo.length > mejor.prefijo.length) mejor = serie;
  }
  return mejor;
}

function incompleto(
  normalizado: string,
  trozos: readonly TrozoNombre[],
  falta: "familia" | "gama" | "numero" | "sufijo-desconocido",
  resto?: string,
): ResultadoDecodificacion {
  return resto === undefined || resto === "" ? { estado: "incompleto", normalizado, trozos, falta } : { estado: "incompleto", normalizado, trozos, falta, resto };
}

/** Desglosa un nombre de procesador con las tablas dadas. Nunca lanza una excepción. */
export function decodificarNombre(entrada: string, datos: DatosDecodificador): ResultadoDecodificacion {
  const norma = normalizarNombre(entrada);
  if (!norma.ok) return { estado: "invalido", motivo: norma.motivo };
  const normalizado = norma.texto;
  const trozos: TrozoNombre[] = [];
  let texto = normalizado;

  // 1. Marca opcional.
  let marcaEscrita: MarcaCpu | null = null;
  const marca = /^(amd|intel)[ -]*/.exec(texto);
  if (marca !== null) {
    marcaEscrita = MARCAS_ESCRITAS[marca[1]] ?? null;
    if (marcaEscrita !== null) {
      trozos.push({ texto: marcaEscrita, tipo: "marca", significado: `Fabricante: ${marcaEscrita}.` });
      texto = texto.slice(marca[0].length);
    }
  }

  // 2. Familia (la forma más larga primero), solo entre las que existen en las tablas.
  let familia: FamiliaCpu | null = null;
  let fragmento = "";
  let conGama = false;
  for (const patron of PATRONES_FAMILIA) {
    const hallada = datos.familias.find((f) => f.id === patron.id);
    const coincide = hallada === undefined ? null : patron.expresion.exec(texto);
    if (hallada === undefined || coincide === null) continue;
    familia = hallada;
    fragmento = coincide[0];
    conGama = patron.conGama === true;
    break;
  }
  if (familia === null) return incompleto(normalizado, trozos, "familia", texto);
  if (marcaEscrita !== null && marcaEscrita !== familia.marca) return incompleto(normalizado, trozos, "familia", texto);
  texto = texto.slice(fragmento.length);

  // 3. Gama: un solo dígito que la familia use. En el alias «r5» el dígito va pegado a la r.
  const separador = /^[ -]*/.exec(texto)?.[0] ?? "";
  const tras = texto.slice(separador.length);
  const gama = /^(\d)(?!\d)/.exec(tras)?.[1];
  if (gama === undefined || !familia.gamas.some((g) => g === gama)) {
    trozos.push({ texto: textoFamilia(fragmento, familia), tipo: "familia", significado: familia.resumen, ...primerHecho(familia.hechoIds) });
    return incompleto(normalizado, trozos, "gama", tras);
  }
  if (conGama) {
    const nombreCompleto = `${familia.nombre} ${gama}`;
    trozos.push({
      texto: `${fragmento}${gama}`.toUpperCase(),
      tipo: "familia",
      significado: `«${fragmento}${gama}» es una forma abreviada de escribir «${nombreCompleto}». ${familia.resumen}`,
      ...primerHecho(familia.hechoIds),
    });
  } else {
    trozos.push({ texto: textoFamilia(fragmento, familia), tipo: "familia", significado: familia.resumen, ...primerHecho(familia.hechoIds) });
    trozos.push({
      texto: gama,
      tipo: "gama",
      significado: `Gama ${gama} dentro de ${familia.nombre}. Un mismo número en otra marca no significa el mismo rendimiento.`,
    });
  }
  texto = tras.slice(gama.length);

  // 4. Letras opcionales ANTES del número («HX 370») y número del modelo.
  const modelo = /^[ -]*(?:([a-z]+)[ -]?)?(\d+)(.*)$/.exec(texto);
  if (modelo === null) return incompleto(normalizado, trozos, "numero", texto.replace(SEPARADORES, ""));
  const candidatos = sufijosDeFamilia(datos, familia.id);
  const previos = modelo[1] === undefined ? { trozos: [], segmento: null, resto: "" } : consumirSufijos(modelo[1], candidatos, null);
  const numero = modelo[2];
  const posteriores = consumirSufijos(modelo[3], candidatos, previos.segmento);
  const segmentoSufijos = posteriores.segmento;

  // 5. Serie: el prefijo más largo del número que figure en las tablas; el resto del número es el modelo.
  const serie = elegirSerie(datos, familia.id, numero, segmentoSufijos);
  trozos.push(...previos.trozos);
  if (previos.resto !== "") return incompleto(normalizado, trozos, "sufijo-desconocido", previos.resto);
  if (serie === null) {
    trozos.push({ texto: numero, tipo: "modelo", significado: "Número de modelo. Esta serie no está en las tablas, así que no se puede explicar más." });
  } else {
    trozos.push({ texto: serie.prefijo, tipo: "serie", significado: serie.etiqueta, hechoId: serie.hechoId });
    const restoNumero = numero.slice(serie.prefijo.length);
    if (restoNumero !== "") trozos.push({ texto: restoNumero, tipo: "modelo", significado: "Resto del número: identifica el modelo dentro de su serie." });
  }
  trozos.push(...posteriores.trozos);
  if (posteriores.resto !== "") return incompleto(normalizado, trozos, "sufijo-desconocido", posteriores.resto);

  const segmento = segmentoSufijos ?? serie?.segmento ?? null;
  return { estado: "reconocido", normalizado, marca: familia.marca, familia: familia.id, segmento, trozos };
}

/** Texto corto para el anuncio en vivo («aria-live»): se dice una vez al enviar, no en cada tecla. */
export function describirResultado(resultado: ResultadoDecodificacion): string {
  if (resultado.estado === "invalido") return MENSAJE_INVALIDO[resultado.motivo];
  const n = resultado.trozos.length;
  const partes = n === 1 ? "1 parte reconocida" : `${n} partes reconocidas`;
  if (resultado.estado === "reconocido") return `${resultado.normalizado}: ${partes}.`;
  return `${resultado.normalizado}: ${partes}. ${MENSAJE_FALTA[resultado.falta]}`;
}
