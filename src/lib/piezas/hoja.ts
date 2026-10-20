/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Esquema de las hojas de verificación (docs/piezas-plan-2.md §4): `docs/verificacion/<slug>.json` es la fuente de verdad de la revisión del dueño
// y `<slug>.md` se genera a partir de él. Solo tipos, constantes y una validación pura: la lee `scripts/hoja-verificacion.mjs` y `check:logic`.
// Sin enums ni propiedades de parámetro: se carga con `node --experimental-strip-types`. Los textos de las fuentes son DATOS: aquí nunca se ejecutan.
import { PIEZA_SLUGS } from "./types.ts";
import type { PiezaSlug } from "./types.ts";

export const HOJA_VERSION = 1;
/** Hoja de los hechos que usan dos o más piezas (se verifican una sola vez). */
export const SLUG_COMUN = "comun";
export type SlugHoja = PiezaSlug | typeof SLUG_COMUN;
export const SLUGS_HOJA: readonly SlugHoja[] = [...PIEZA_SLUGS, SLUG_COMUN];

export const TIPOS_ENTRADA = ["hecho", "caso", "criterio"] as const;
export type TipoEntrada = (typeof TIPOS_ENTRADA)[number];

/**
 * pendiente = nadie lo ha investigado (⚪ pendiente de verificar) · verificado = la fuente primaria dice lo mismo (✅)
 * parcial = solo fuente secundaria, o lo dice en parte, o hay que ajustar la redacción (🟡) · contradicho = la fuente lo contradice (❌)
 * sin-fuente = se investigó y no hay fuente primaria (⚪) · no-aplica = caso o criterio: solo lleva aprobación del dueño (⚪).
 */
export const ESTADOS_HOJA = ["pendiente", "verificado", "parcial", "contradicho", "sin-fuente", "no-aplica"] as const;
export type EstadoHoja = (typeof ESTADOS_HOJA)[number];
export const EMOJI_ESTADO: Readonly<Record<EstadoHoja, string>> = {
  pendiente: "⚪",
  verificado: "✅",
  parcial: "🟡",
  contradicho: "❌",
  "sin-fuente": "⚪",
  "no-aplica": "⚪",
};
export const ETIQUETA_ESTADO: Readonly<Record<EstadoHoja, string>> = {
  pendiente: "pendiente de verificar",
  verificado: "la fuente primaria dice lo mismo",
  parcial: "coincide en parte o con matices",
  contradicho: "la fuente lo contradice",
  "sin-fuente": "sin fuente primaria",
  "no-aplica": "no verificable con fuente (solo aprobación)",
};

export const TIPOS_FUENTE = ["primaria", "secundaria", "sin-clasificar"] as const;
export type TipoFuenteHoja = (typeof TIPOS_FUENTE)[number];
export interface FuenteHoja {
  titulo: string;
  editor: string | null;
  url: string | null; // https; null = la hoja la nombra sin enlace ("URLs arriba")
  consultadoEn: string | null; // AAAA-MM-DD; null = candidata que nadie ha abierto
  tipo: TipoFuenteHoja;
  detalle: string | null; // "copia de terceros", "fabricante de la placa"…
}

export const ACCIONES_PROPUESTA = ["mantener", "reformular", "quitar"] as const;
export type AccionPropuesta = (typeof ACCIONES_PROPUESTA)[number];
export interface PropuestaHoja {
  accion: AccionPropuesta | null;
  textoPropuesto: string | null; // el texto nuevo cuando la acción es reformular
  detalle: string | null; // la propuesta tal como la escribió quien investigó
}

export const VALORES_DECISION = ["aprobar", "ajustar", "quitar"] as const;
export type ValorDecision = (typeof VALORES_DECISION)[number];
/** Decisión del dueño. En un caso «Nos ha pasado», aprobar = confirmar que le pasó a B & W. */
export interface DecisionHoja {
  valor: ValorDecision;
  textoFinal: string | null; // obligatorio con "ajustar"
  por: string | null; // iniciales (NB)
  en: string | null; // AAAA-MM-DD
  nota: string | null;
}

export type CasoTipoHoja = "vivido" | "puede-pasar";
export interface EntradaHoja {
  id: string; // kebab-case; hechos: único en todo el sitio; casos y criterios: único en su pieza
  tipo: TipoEntrada;
  titulo: string; // nombre legible del lugar donde vive ("Socket del procesador · opción AM5")
  donde: string; // "tarjeta-madre › socket › opción am5"
  tambienEn: string[]; // otros lugares de la misma pieza donde aparece
  casoTipo: CasoTipoHoja | null; // solo en casos
  textoPublicado: string; // el del código en la última generación del esqueleto
  textoRevisado: string | null; // el que leyó el dueño al decidir (si cambió después, se avisa)
  usadoPor: PiezaSlug[]; // piezas que lo usan (hechos); en la hoja `comun` son dos o más
  fuentesCandidatas: FuenteHoja[]; // las que trae el código
  fuentesConsultadas: FuenteHoja[]; // las que se abrieron al investigar
  queDiceLaFuente: string | null; // paráfrasis de máximo 2 frases
  estado: EstadoHoja;
  propuesta: PropuestaHoja;
  decision: DecisionHoja | null;
  huerfana: boolean; // ya no existe en el código pero conserva trabajo del dueño
}

export interface HojaVerificacion {
  version: typeof HOJA_VERSION;
  slug: SlugHoja;
  entradas: EntradaHoja[];
}

/* ---------- Validación (pura; devuelve los errores, vacío = válida) ---------- */
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}
function esTexto(valor: unknown): valor is string {
  return typeof valor === "string";
}
function textoONulo(valor: unknown): boolean {
  return valor === null || typeof valor === "string";
}
function incluye(lista: readonly string[], valor: unknown): boolean {
  return typeof valor === "string" && lista.includes(valor);
}
/** Fecha AAAA-MM-DD real del calendario. */
export function esFechaHoja(valor: unknown): boolean {
  if (typeof valor !== "string" || !FECHA.test(valor)) return false;
  const [a, m, d] = valor.split("-").map(Number);
  const f = new Date(Date.UTC(a, m - 1, d));
  return f.getUTCFullYear() === a && f.getUTCMonth() === m - 1 && f.getUTCDate() === d;
}

function erroresDeFuente(fuente: unknown, ruta: string): string[] {
  if (!esObjeto(fuente)) return [`${ruta}: no es un objeto`];
  const errores: string[] = [];
  if (!esTexto(fuente.titulo) || fuente.titulo.trim() === "") errores.push(`${ruta}: titulo vacío`);
  if (!textoONulo(fuente.editor)) errores.push(`${ruta}: editor inválido`);
  if (fuente.url !== null && (!esTexto(fuente.url) || !fuente.url.startsWith("https://"))) errores.push(`${ruta}: url debe ser https o null`);
  if (fuente.consultadoEn !== null && !esFechaHoja(fuente.consultadoEn)) errores.push(`${ruta}: consultadoEn inválido`);
  if (!incluye(TIPOS_FUENTE, fuente.tipo)) errores.push(`${ruta}: tipo inválido`);
  if (!textoONulo(fuente.detalle)) errores.push(`${ruta}: detalle inválido`);
  return errores;
}

/** Una fuente primaria que se abrió de verdad: https, con fecha de consulta. */
export function esFuentePrimariaAbierta(fuente: FuenteHoja): boolean {
  return fuente.tipo === "primaria" && typeof fuente.url === "string" && fuente.url.startsWith("https://") && esFechaHoja(fuente.consultadoEn);
}

function erroresDeDecision(decision: unknown, ruta: string): string[] {
  if (decision === null) return [];
  if (!esObjeto(decision)) return [`${ruta}: decision no es un objeto`];
  const errores: string[] = [];
  if (!incluye(VALORES_DECISION, decision.valor)) errores.push(`${ruta}: decision.valor inválido`);
  if (!esTexto(decision.por) || decision.por.trim() === "") errores.push(`${ruta}: decision.por (iniciales) vacío`);
  if (!esFechaHoja(decision.en)) errores.push(`${ruta}: decision.en debe ser AAAA-MM-DD`);
  if (!textoONulo(decision.nota)) errores.push(`${ruta}: decision.nota inválida`);
  if (!textoONulo(decision.textoFinal)) errores.push(`${ruta}: decision.textoFinal inválido`);
  if (decision.valor === "ajustar" && (!esTexto(decision.textoFinal) || decision.textoFinal.trim() === "")) errores.push(`${ruta}: "ajustar" exige textoFinal`);
  return errores;
}

function erroresDeEntrada(entrada: unknown, ruta: string): string[] {
  if (!esObjeto(entrada)) return [`${ruta}: no es un objeto`];
  const errores: string[] = [];
  const id = esTexto(entrada.id) ? entrada.id : "";
  const donde = `${ruta} (${id || "sin id"})`;
  if (!KEBAB.test(id)) errores.push(`${donde}: id debe ser kebab-case`);
  if (!incluye(TIPOS_ENTRADA, entrada.tipo)) errores.push(`${donde}: tipo inválido`);
  if (!incluye(ESTADOS_HOJA, entrada.estado)) errores.push(`${donde}: estado inválido`);
  for (const campo of ["titulo", "donde", "textoPublicado"] as const) {
    if (!esTexto(entrada[campo])) errores.push(`${donde}: ${campo} debe ser texto`);
  }
  if (!textoONulo(entrada.textoRevisado)) errores.push(`${donde}: textoRevisado inválido`);
  if (!textoONulo(entrada.queDiceLaFuente)) errores.push(`${donde}: queDiceLaFuente inválido`);
  if (entrada.casoTipo !== null && !incluye(["vivido", "puede-pasar"], entrada.casoTipo)) errores.push(`${donde}: casoTipo inválido`);
  if (entrada.tipo === "caso" && entrada.casoTipo === null) errores.push(`${donde}: un caso exige casoTipo`);
  if (!Array.isArray(entrada.tambienEn) || !entrada.tambienEn.every(esTexto)) errores.push(`${donde}: tambienEn debe ser una lista de textos`);
  if (!Array.isArray(entrada.usadoPor) || !entrada.usadoPor.every((s) => incluye(PIEZA_SLUGS, s))) errores.push(`${donde}: usadoPor debe listar slugs de pieza`);
  if (typeof entrada.huerfana !== "boolean") errores.push(`${donde}: huerfana debe ser booleano`);

  const consultadas = Array.isArray(entrada.fuentesConsultadas) ? entrada.fuentesConsultadas : null;
  const candidatas = Array.isArray(entrada.fuentesCandidatas) ? entrada.fuentesCandidatas : null;
  if (!consultadas) errores.push(`${donde}: fuentesConsultadas debe ser una lista`);
  if (!candidatas) errores.push(`${donde}: fuentesCandidatas debe ser una lista`);
  consultadas?.forEach((f, i) => errores.push(...erroresDeFuente(f, `${donde} fuentesConsultadas[${i}]`)));
  candidatas?.forEach((f, i) => errores.push(...erroresDeFuente(f, `${donde} fuentesCandidatas[${i}]`)));

  const propuesta = entrada.propuesta;
  if (!esObjeto(propuesta)) errores.push(`${donde}: propuesta debe ser un objeto`);
  else {
    if (propuesta.accion !== null && !incluye(ACCIONES_PROPUESTA, propuesta.accion)) errores.push(`${donde}: propuesta.accion inválida`);
    if (!textoONulo(propuesta.textoPropuesto) || !textoONulo(propuesta.detalle)) errores.push(`${donde}: propuesta con textos inválidos`);
  }
  errores.push(...erroresDeDecision(entrada.decision, donde));

  // Reglas de fondo
  const tipo = entrada.tipo;
  const estado = entrada.estado;
  if (tipo !== "hecho" && estado !== "no-aplica") errores.push(`${donde}: un ${String(tipo)} no se verifica con fuente: su estado es no-aplica`);
  if (tipo === "hecho" && estado === "no-aplica") errores.push(`${donde}: un hecho no puede ser no-aplica`);
  if (estado === "verificado") {
    const abiertas = (consultadas ?? []).filter((f) => esObjeto(f) && esFuentePrimariaAbierta(f as unknown as FuenteHoja));
    if (abiertas.length === 0) errores.push(`${donde}: ✅ sin ninguna fuente primaria abierta (https, con fecha de consulta)`);
  }
  const decision = entrada.decision;
  if (esObjeto(decision) && tipo === "hecho") {
    if (decision.valor === "aprobar" && estado !== "verificado" && estado !== "parcial") {
      errores.push(`${donde}: no se puede aprobar un hecho en estado ${String(estado)} (ajusta o quita)`);
    }
    if (decision.valor !== "quitar" && (consultadas ?? []).length === 0) errores.push(`${donde}: decisión ${String(decision.valor)} sin ninguna fuente consultada`);
  }
  return errores;
}

/** Valida el JSON de una hoja. Devuelve la lista de errores; vacía = válida. Nunca lanza. */
export function validarHoja(json: unknown): readonly string[] {
  if (!esObjeto(json)) return ["la hoja no es un objeto"];
  const errores: string[] = [];
  if (json.version !== HOJA_VERSION) errores.push(`version debe ser ${HOJA_VERSION}`);
  if (!incluye(SLUGS_HOJA, json.slug)) errores.push(`slug inválido: ${String(json.slug)}`);
  if (!Array.isArray(json.entradas)) {
    errores.push("entradas debe ser una lista");
    return errores;
  }
  const vistos = new Set<string>();
  json.entradas.forEach((entrada, i) => {
    errores.push(...erroresDeEntrada(entrada, `entradas[${i}]`));
    if (esObjeto(entrada) && esTexto(entrada.id)) {
      const clave = `${String(entrada.tipo)}:${entrada.id}`;
      if (vistos.has(clave)) errores.push(`entradas[${i}] (${entrada.id}): ${String(entrada.tipo)} repetido en la hoja`);
      vistos.add(clave);
    }
  });
  return errores;
}
