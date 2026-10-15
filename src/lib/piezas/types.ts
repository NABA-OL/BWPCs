/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-11
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Contrato de "Piezas a fondo" (docs/piezas-plan.md §3 y docs/piezas-plan-2.md §2). Se escribe a mano. BWReel lee este archivo para saber qué ids debe emitir.
// Sin imports de valores ni `enum` ni propiedades de parámetro: lo cargan Next, `check:logic` (node --experimental-strip-types), `next.config.ts` y BWReel (esbuild).

export const PIEZA_SLUGS = ["tarjeta-madre", "procesador", "memoria-ram", "almacenamiento", "refrigeracion", "fuente-de-poder", "tarjeta-grafica"] as const;
export type PiezaSlug = (typeof PIEZA_SLUGS)[number];
export type EstadoContenido = "borrador" | "revision" | "publicado";
export type Entorno = "produccion" | "preview" | "desarrollo";

/**
 * Fuente única de las redirecciones permanentes `/piezas/<sinónimo>` → `/piezas/<slug>` (next.config.ts la importará).
 * Un sinónimo nunca es un slug real, es kebab-case y no se repite entre piezas (lo comprueba `check:logic`).
 */
export const SINONIMOS_SLUG: Readonly<Record<PiezaSlug, readonly string[]>> = {
  "tarjeta-madre": ["placa-base", "board", "motherboard"],
  procesador: ["cpu", "procesadores"],
  "memoria-ram": ["ram", "memoria"],
  almacenamiento: ["ssd", "disco-duro", "discos"],
  refrigeracion: ["disipador", "refrigeracion-liquida"],
  "fuente-de-poder": ["fuente", "psu", "fuente-de-alimentacion"],
  "tarjeta-grafica": ["grafica", "gpu", "tarjeta-de-video"],
};

/* ---------- Ids de partes y de vistas por pieza ----------
 * BWReel debe emitir exactamente estos ids (los duplica en src/parts/piezaIds.ts y compara el texto). El orden es el de lectura.
 * Una parte puede existir solo en algunas vistas: cada `ParteContenido.vistas` lo declara. */

/** Tarjeta madre (piloto): una sola vista. */
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
export const TARJETA_MADRE_VISTAS = ["unica"] as const;
export type TarjetaMadreVistaId = (typeof TARJETA_MADRE_VISTAS)[number];

export const MEMORIA_RAM_PARTES = ["contactos", "muesca", "chips-memoria", "pmic", "chip-spd", "ranura", "trabas"] as const;
export type MemoriaRamParteId = (typeof MEMORIA_RAM_PARTES)[number];
export const MEMORIA_RAM_VISTAS = ["ddr4", "ddr5"] as const;
export type MemoriaRamVistaId = (typeof MEMORIA_RAM_VISTAS)[number];

export const ALMACENAMIENTO_PARTES = [
  "llave-m2",
  "controlador",
  "memoria-nand",
  "tornillo-m2",
  "ranura-m2",
  "conector-sata-datos",
  "conector-sata-poder",
  "carcasa",
] as const;
export type AlmacenamientoParteId = (typeof ALMACENAMIENTO_PARTES)[number];
export const ALMACENAMIENTO_VISTAS = ["m2-nvme", "m2-sata", "ssd-sata", "hdd"] as const;
export type AlmacenamientoVistaId = (typeof ALMACENAMIENTO_VISTAS)[number];

export const REFRIGERACION_PARTES = ["base", "heatpipes", "aletas", "ventilador", "bloque-bomba", "mangueras", "radiador"] as const;
export type RefrigeracionParteId = (typeof REFRIGERACION_PARTES)[number];
export const REFRIGERACION_VISTAS = ["aire", "liquida"] as const;
export type RefrigeracionVistaId = (typeof REFRIGERACION_VISTAS)[number];

export const PROCESADOR_PARTES = ["ihs", "marca-pin-1", "muescas", "pines-procesador", "contactos-socket", "tapa-sujecion", "palanca", "zocalo"] as const;
export type ProcesadorParteId = (typeof PROCESADOR_PARTES)[number];
export const PROCESADOR_VISTAS = ["am4", "am5", "intel-lga"] as const;
export type ProcesadorVistaId = (typeof PROCESADOR_VISTAS)[number];

export const FUENTE_PARTES = [
  "rejilla-ventilador",
  "entrada-ac",
  "interruptor",
  "banco-modular",
  "etiqueta",
  "filtro-emi",
  "rectificador",
  "pfc",
  "condensadores-primarios",
  "transformador",
  "salida-secundaria",
  "atx-24",
  "eps-cpu",
  "pcie-6-2",
  "12v-2x6",
  "sata-poder",
  "molex",
] as const;
export type FuenteParteId = (typeof FUENTE_PARTES)[number];
export const FUENTE_VISTAS = ["por-fuera", "por-dentro", "conectores"] as const;
export type FuenteVistaId = (typeof FUENTE_VISTAS)[number];

export const TARJETA_GRAFICA_PARTES = [
  "ventiladores",
  "carcasa",
  "disipador",
  "backplate",
  "bracket",
  "conector-energia",
  "conector-pcie",
  "chip-grafico",
  "memoria-vram",
  "vrm",
] as const;
export type TarjetaGraficaParteId = (typeof TARJETA_GRAFICA_PARTES)[number];
export const TARJETA_GRAFICA_VISTAS = ["armada", "placa"] as const;
export type TarjetaGraficaVistaId = (typeof TARJETA_GRAFICA_VISTAS)[number];

/** Partes y vistas de cada pieza, para recorrerlas por slug (comprobaciones, registro, BWReel). */
export const PARTES_POR_PIEZA = {
  "tarjeta-madre": TARJETA_MADRE_PARTES,
  procesador: PROCESADOR_PARTES,
  "memoria-ram": MEMORIA_RAM_PARTES,
  almacenamiento: ALMACENAMIENTO_PARTES,
  refrigeracion: REFRIGERACION_PARTES,
  "fuente-de-poder": FUENTE_PARTES,
  "tarjeta-grafica": TARJETA_GRAFICA_PARTES,
} as const satisfies Record<PiezaSlug, readonly string[]>;
export const VISTAS_POR_PIEZA = {
  "tarjeta-madre": TARJETA_MADRE_VISTAS,
  procesador: PROCESADOR_VISTAS,
  "memoria-ram": MEMORIA_RAM_VISTAS,
  almacenamiento: ALMACENAMIENTO_VISTAS,
  refrigeracion: REFRIGERACION_VISTAS,
  "fuente-de-poder": FUENTE_VISTAS,
  "tarjeta-grafica": TARJETA_GRAFICA_VISTAS,
} as const satisfies Record<PiezaSlug, readonly string[]>;

/**
 * Bloques de la página, en el orden en que se pintan (además de "inicio", siempre primero, y de "fuentes" y "cotizar", siempre al final).
 * Cada bloque listado en `PiezaContenido.bloques` debe tener contenido (lo comprueba `check:logic`).
 */
export type BloqueId = "partes" | "lista" | "nombres" | "vistas" | "comparar" | "tamanos" | "elegir" | "errores" | "preguntas";

/** Ids de sección que ninguna parte puede usar (son anclas de la página). Además, ningún id de parte empieza por "vista-". */
export const IDS_RESERVADOS = [
  "inicio",
  "partes",
  "lista",
  "nombres",
  "vistas",
  "comparar",
  "tamanos",
  "elegir",
  "errores",
  "fuentes",
  "cotizar",
  "preguntas",
  "casos",
] as const;
/** Prefijo reservado de las anclas de vista (`#vista-ddr5`). */
export const PREFIJO_ID_VISTA = "vista-";

/* ---------- Geometría (la genera BWReel; px del viewBox = px de diseño) ---------- */
export type Pt = readonly [number, number];
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface ImagenPieza {
  href: string; // "/piezas/tarjeta-madre.webp"; en las demás vistas "/piezas/<slug>-<vista>.webp"
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
  partes: Readonly<Partial<Record<P, ParteGeo>>>; // una parte puede faltar en una vista (el PMIC no existe en DDR4)
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
  consultadoEn: string; // YYYY-MM-DD; "" = URL candidata que nadie ha abierto todavía
}
export interface Hecho {
  id: string; // kebab-case, ÚNICO en todo el sitio: dos piezas con el mismo id deben compartir el mismo objeto (`comun.hechos.ts`)
  etiqueta?: string; // título corto visible del dato ("Memoria que admite"); sin ella, el lector de pantalla oye "Dato N"
  texto: string; // lo que se muestra (aquí SÍ puede haber cifras)
  fuentes: readonly Fuente[]; // al menos una primaria para publicar
  verificadoEn: string | null; // YYYY-MM-DD; null = pendiente
  verificadoPor: string | null; // iniciales de quien revisó
  revisarCadaMeses?: 6 | 12 | 24; // 6 = datos volátiles (nombres, "se usa hoy"); 12 = por defecto; 24 = medidas de especificaciones
  nota?: string; // interno, no se muestra
}

/** Aprobación del dueño de algo que no se verifica con fuente (un caso del taller o un criterio de B & W). */
export interface Aprobacion {
  aprobadoEn: string | null; // YYYY-MM-DD; null = pendiente
  aprobadoPor: string | null; // iniciales
}
/**
 * Experiencia del taller. `tipo: "vivido"` se pinta «Nos ha pasado» y `"puede-pasar"` «Puede pasar»: el rótulo lo pone la UI,
 * el texto nunca empieza por esas frases. Un caso `vivido` solo se publica si el dueño confirmó que le pasó (`confirmadoPorDueno`).
 */
export interface Caso extends Aprobacion {
  id: string; // kebab-case, único en la pieza
  tipo: "vivido" | "puede-pasar";
  texto: string; // sin cifras (si las necesita, van en `hechos`)
  confirmadoPorDueno?: boolean; // solo para `vivido`: la experiencia la contó el dueño
  hechos?: readonly Hecho[]; // datos con fuente que sostienen el caso
}
/** Criterio de B & W (opinión de taller, sin fuente): lo aprueba el dueño, nunca es un `Hecho` ni dice «mejor/peor». */
export interface Criterio extends Aprobacion {
  id: string; // kebab-case, único en la pieza
  texto: string;
}
export type Celda = { tipo: "hecho"; hecho: Hecho } | { tipo: "criterio"; criterio: Criterio } | { tipo: "texto"; texto: string };
export interface Comparacion<V extends string> {
  id: string;
  titulo: string;
  columnas: readonly V[];
  filas: readonly { etiqueta: string; valores: Readonly<Record<V, Celda>> }[];
}

/** Una vista de la pieza (chip del selector). La primera de `PiezaContenido.vistas` es la inicial. */
export interface VistaContenido<P extends string, V extends string> {
  id: V;
  etiqueta: string; // chip: "DDR5", "Por dentro"
  resumen: string; // sin cifras
  etiquetaFigura: string; // pie de la figura
  notasPorParte?: Readonly<Partial<Record<P, string>>>; // obligatoria para cada parte que no existe en esta vista
  aFavor?: readonly Criterio[]; // «A favor» (rótulo «Criterio de B & W»)
  aConsiderar?: readonly Criterio[]; // «A considerar»
}

/** Enlace de una parte: interno fijo, o a otra pieza resuelto con el registro (si el destino no es visible en el entorno, no se pinta). */
export type EnlaceParte = { etiqueta: string; href: `/${string}` } | { etiqueta: string; pieza: PiezaSlug; parte?: string };

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
  relacionadas?: readonly string[]; // ids de otras partes de la misma pieza ("vrm" ↔ "conector-cpu")
  enlaces?: readonly EnlaceParte[];
  vistas?: readonly string[]; // vistas donde existe la parte; sin definir = todas
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
  anchoMm: number; // medida de la especificación (hecho F1-F3); dibuja el SVG a escala
  altoMm: number;
  resumen: string; // sin cifras: cómo es y para qué chasis
  paraQuien: string; // sin cifras: a quién le sirve. NUNCA presentarlo como mejor o peor que otro tamaño
  hecho: Hecho; // las medidas, con fuente
}

/* ---------- Decodificador de nombres de procesador (docs/piezas-plan-2.md §2.2). Solo los tipos: la lógica es de B2. ---------- */
export type MarcaCpu = "AMD" | "Intel";
export type SegmentoCpu = "escritorio" | "portatil";
export type FamiliaCpuId = "ryzen" | "ryzen-ai" | "core-i" | "core" | "core-ultra";
export type GamaCpu = "3" | "5" | "7" | "9";
export interface FamiliaCpu {
  id: FamiliaCpuId;
  marca: MarcaCpu;
  nombre: string;
  gamas: readonly GamaCpu[];
  vigente: boolean;
  resumen: string;
  hechoIds: readonly string[];
}
export interface SerieCpu {
  familia: FamiliaCpuId;
  prefijo: string;
  digitos: 3 | 4 | 5;
  etiqueta: string; // "12.ª generación", "serie 7000"
  segmento?: SegmentoCpu;
  hechoId: string;
}
export interface SufijoCpu {
  token: string;
  familias: readonly FamiliaCpuId[];
  segmento: SegmentoCpu;
  significado: string;
  compone?: readonly string[]; // KF compone ["K", "F"]
  hechoId: string;
}
export interface EquivalenciaGama {
  gama: GamaCpu;
  amd: string | null;
  intelClasico: string | null;
  intelActual: readonly string[];
}
export interface EjemploCpu {
  nombre: string;
  hechoId: string;
}
export interface DatosDecodificador {
  familias: readonly FamiliaCpu[];
  series: readonly SerieCpu[];
  sufijos: readonly SufijoCpu[];
  ejemplos: readonly EjemploCpu[];
  equivalencias: readonly EquivalenciaGama[];
  revisadoEn: string; // YYYY-MM-DD; se advierte a los 6 meses
}
export interface TrozoNombre {
  texto: string;
  tipo: "marca" | "familia" | "gama" | "serie" | "modelo" | "sufijo";
  significado: string;
  hechoId?: string;
}
export type MotivoInvalido = "vacio" | "muy-largo" | "caracteres";
export type ResultadoDecodificacion =
  | { estado: "reconocido"; normalizado: string; marca: MarcaCpu; familia: FamiliaCpuId; segmento: SegmentoCpu | null; trozos: readonly TrozoNombre[] }
  | {
      estado: "incompleto";
      normalizado: string;
      trozos: readonly TrozoNombre[];
      falta: "familia" | "gama" | "numero" | "sufijo-desconocido";
      resto?: string;
    }
  | { estado: "invalido"; motivo: MotivoInvalido };

/* ---------- Contenido de una pieza ---------- */
export interface PiezaContenido<P extends string, V extends string = "unica"> {
  slug: PiezaSlug;
  estado: EstadoContenido;
  piezaServicios?: string; // PieceId del recorrido de /servicios ("boards") para "Ver a fondo"
  nombreCorto: string; // breadcrumb y enlaces: "Tarjeta madre"
  titulo: string; // ≤ 60 caracteres
  descripcion: string; // 120 a 160 caracteres
  h1: string;
  eyebrow: string; // sin mayúsculas sostenidas
  intro: readonly string[];
  palabrasClave: readonly string[];
  terminos: readonly string[]; // nombres de estándar permitidos en prosa: "M.2", "DDR4", "DDR5", "AM5", "LGA 1700"…
  sinonimos: readonly string[]; // cada uno debe aparecer exactamente una vez en la prosa (placa base, motherboard, board)
  publicadoEn: string | null;
  actualizadoEn: string;
  bloques: readonly BloqueId[];
  vistas: readonly VistaContenido<P, V>[]; // al menos una; la primera es la inicial
  selectorVistas?: string; // aria-label del selector: "Elige la generación"
  partes: Readonly<Record<P, ParteContenido>>; // exhaustivo
  secciones: readonly SeccionTexto[]; // "elegir", "errores", "tamanos"
  factoresForma?: readonly FactorForma[];
  casos?: readonly Caso[];
  criterios?: readonly Criterio[];
  comparaciones?: readonly Comparacion<V>[];
  decodificador?: DatosDecodificador;
  faq?: readonly { q: string; a: string }[];
  sinDibujo?: boolean; // salida de emergencia: se puede publicar con `geo: null` solo si esto es true
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
  vistas?: readonly string[]; // en cuáles vistas existe; sin definir = todas
}

/** Una vista lista para el componente de cliente. */
export interface VistaExplorador {
  id: string;
  etiqueta: string;
  geo: VistaGeo<string>;
  etiquetaFigura: string;
  notas: Readonly<Record<string, string>>; // nota por parte (sobre todo para las ausentes en esa vista)
}
/** Props del explorador MULTIVISTA (contrato para B1). */
export interface PiezaExploradorProps {
  slug: PiezaSlug;
  vistas: readonly VistaExplorador[];
  partes: readonly ParteResumen[];
  selectorTitulo?: string;
}
/** Props del explorador de UNA vista (piloto). B1 lo reemplaza por `PiezaExploradorProps`. */
export interface PiezaExploradorUnaVistaProps {
  slug: PiezaSlug;
  vista: VistaGeo<string>;
  partes: readonly ParteResumen[];
  etiquetaFigura: string;
}
