/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-11
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Contrato de "Piezas a fondo" (docs/piezas-plan.md §3). Se escribe a mano. BWReel lee este archivo para saber qué ids debe emitir.
// Sin imports de valores: lo cargan tanto Next como `check:logic` (node --experimental-strip-types) y BWReel (esbuild).

export const PIEZA_SLUGS = ["tarjeta-madre"] as const; // luego: "memoria-ram" | "procesador" | "tarjeta-grafica" | "fuente-de-poder"
export type PiezaSlug = (typeof PIEZA_SLUGS)[number];
export type EstadoContenido = "borrador" | "revision" | "publicado";
export type Entorno = "produccion" | "preview" | "desarrollo";

/** IDs fijos de la tarjeta madre: BWReel debe emitir exactamente estos. El orden es el orden de lectura. */
export const TARJETA_MADRE_PARTES = [
  "socket",
  "chipset",
  "vrm",
  "conector-cpu",
  "ranuras-ram",
  "pcie-principal",
  "pcie-secundarias",
  "m2",
  "sata",
  "conector-24-pines",
  "puertos-traseros",
  "cabezales-ventilador",
  "conectores-frontales",
  "bateria-cmos",
] as const;
export type TarjetaMadreParteId = (typeof TARJETA_MADRE_PARTES)[number];

/** Ids de sección que ninguna parte puede usar (son anclas de la página). */
export const IDS_RESERVADOS = ["partes", "lista", "tamanos", "elegir", "errores", "fuentes", "cotizar", "preguntas"] as const;

/* ---------- Geometría (la genera BWReel; px del viewBox = px de diseño) ---------- */
export type Pt = readonly [number, number];
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface ImagenPieza {
  href: string; // "/piezas/tarjeta-madre.webp"
  hrefSm: string; // "/piezas/tarjeta-madre-sm.webp"
  ancho: number; // px reales del archivo grande
  alto: number;
  anchoSm: number;
  altoSm: number;
}
export interface ParteGeo {
  ancla: Pt; // centro del marcador, sobre la zona VISIBLE de la parte
  contornos: readonly (readonly Pt[])[]; // polígonos proyectados (uno o varios: p. ej. 2 ranuras), para resaltar
  foco: Rect; // recuadro con margen para ampliar (fase 2)
  visible: number; // 0..1: fracción visible de la cara superior (raycast)
}
export interface VistaGeo<P extends string> {
  w: number; // viewBox; w/h = ancho/alto de la imagen (exacto)
  h: number;
  imagen: ImagenPieza;
  partes: Readonly<Partial<Record<P, ParteGeo>>>;
}
export interface PiezaGeo<P extends string, V extends string = "unica"> {
  generadoEn: string; // ISO
  modelo: string; // hash corto de los fuentes 3D (detecta desfase)
  vistas: Readonly<Record<V, VistaGeo<P>>>;
}

/* ---------- Contenido (a mano) ---------- */
export interface Fuente {
  titulo: string;
  editor: string; // "AMD", "Intel", "PCI-SIG", "JEDEC", "SATA-IO", "Manual <modelo>"
  url: string; // https
  consultadoEn: string; // YYYY-MM-DD
}
export interface Hecho {
  id: string; // kebab-case, único en la pieza ("am5-memoria")
  etiqueta?: string; // título corto visible del dato ("Memoria que admite"); sin ella, el lector de pantalla oye "Dato N"
  texto: string; // lo que se muestra (aquí SÍ puede haber cifras)
  fuentes: readonly Fuente[]; // al menos una primaria para publicar
  verificadoEn: string | null; // YYYY-MM-DD; null = pendiente
  verificadoPor: string | null; // iniciales de quien revisó
  nota?: string; // interno, no se muestra
}
export interface OpcionParte {
  // socket → AM4 / AM5 / LGA 1700 / LGA 1851
  id: string;
  etiqueta: string; // texto del chip, nunca logo
  marca?: "AMD" | "Intel" | "NVIDIA";
  resumen: string; // sin cifras
  vigente: boolean; // plataforma actual o anterior (en vez de fechas)
  hechos: readonly Hecho[];
}
export interface ParteContenido {
  orden: number; // 1..n: número del marcador y de la sección
  nombre: string; // "Socket del procesador"
  nombreCorto: string; // "Socket"
  alias?: readonly string[]; // "zócalo"
  resumen: string; // panel, ≤ 160 caracteres, sin cifras
  queHace: string; // sin cifras
  alElegir: readonly string[]; // viñetas, sin cifras
  hechos: readonly Hecho[];
  opciones?: { titulo: string; items: readonly OpcionParte[] };
  relacionadas?: readonly string[]; // ids de otras partes ("vrm" ↔ "conector-cpu")
  enlaces?: readonly { etiqueta: string; href: `/${string}` }[]; // solo internos
}
export interface SeccionTexto {
  id: string;
  titulo: string;
  parrafos: readonly string[];
  vinetas?: readonly string[];
  hechos?: readonly Hecho[];
}
export interface FactorForma {
  id: string; // "atx" | "micro-atx" | "mini-itx"
  nombre: string;
  anchoMm: number; // medida de la especificación (por verificar: hecho F1-F3); dibuja el SVG a escala
  altoMm: number;
  resumen: string; // sin cifras: cómo es y para qué chasis
  paraQuien: string; // sin cifras: a quién le sirve. NUNCA presentarlo como mejor o peor que otro tamaño
  hecho: Hecho; // las medidas, con fuente
}

/* Variantes y comparaciones: listas para RAM/CPU; el piloto NO las usa (check:logic lo exige). */
export interface VarianteContenido<P extends string, V extends string> {
  id: V;
  etiqueta: string; // "DDR4"
  resumen: string;
  notasPorParte?: Readonly<Partial<Record<P, string>>>;
}
export interface Comparacion<V extends string> {
  titulo: string;
  columnas: readonly V[];
  filas: readonly { etiqueta: string; valores: Readonly<Record<V, Hecho>> }[];
}

export interface PiezaContenido<P extends string, V extends string = "unica"> {
  slug: PiezaSlug;
  estado: EstadoContenido;
  piezaServicios?: string; // PieceId del recorrido de /servicios ("boards") para "Ver a fondo"
  titulo: string; // ≤ 60 caracteres
  descripcion: string; // 120 a 160 caracteres
  h1: string;
  eyebrow: string; // sin mayúsculas sostenidas
  intro: readonly string[];
  palabrasClave: readonly string[];
  terminos: readonly string[]; // nombres de estándar permitidos en prosa: "M.2", "DDR4", "DDR5", "AM5", "LGA 1700"…
  publicadoEn: string | null;
  actualizadoEn: string;
  partes: Readonly<Record<P, ParteContenido>>; // exhaustivo
  secciones: readonly SeccionTexto[]; // "elegir", "errores"
  factoresForma?: readonly FactorForma[];
  faq?: readonly { q: string; a: string }[];
  variantes?: readonly VarianteContenido<P, V>[];
  comparaciones?: readonly Comparacion<V>[];
  cta: { titulo: string; texto: string; etiqueta: string; href: "/cotizador" };
}

/** Lo único que recibe el componente de cliente (no se manda el texto largo al navegador). */
export interface ParteResumen {
  id: string;
  orden: number;
  nombre: string;
  nombreCorto: string;
  resumen: string;
  chips?: readonly string[]; // etiquetas de las `opciones` de la parte (socket: AM4 · AM5 · LGA 1700…), solo texto
}

/** Props fijas del componente de cliente `PiezaExplorador` (src/components/piezas/pieza-explorador.tsx). */
export interface PiezaExploradorProps {
  slug: PiezaSlug;
  vista: VistaGeo<string>;
  partes: readonly ParteResumen[];
  etiquetaFigura: string;
}
