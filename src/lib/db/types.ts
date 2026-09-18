/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { ObjectId } from "mongodb";

/** Categorías de componente que maneja el catálogo y el cotizador. */
export const COMPONENT_CATEGORIES = [
  "Procesador",
  "Grafica",
  "Board",
  "Ram",
  "Almacenamiento",
  "Fuente",
  "Chasis",
  "RefrigeracionProce",
  "Refrigeracion",
  "Mouse",
  "Teclado",
  "Monitor",
  "Audifonos",
  "Combo",
] as const;

export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number];

/** Cómo se ingresa el precio de CPU/GPU: en dólares (se convierte) o fijo en pesos. */
export type PriceMode = "USD" | "COP";

export interface Settings {
  _id?: ObjectId;
  trmScrapeado: number; // último TRM oficial (Superfinanciera, vía cron)
  trmRecargo: number; // se suma al automático (148)
  trmManual: number | null; // override manual opcional (tiene prioridad)
  trmActualizado: Date | null; // cuándo se trajo el TRM automático
  envioCPU: number; // envío casillero procesadores (110000)
  envioGPU: number; // envío casillero gráficas (170000)
  servicioBase: number; // valor base del servicio de ensamble (200000)
  mediosPago: {
    tarjeta: number; // 0.06
    pse: number; // 0.03
    breB: number; // 0 (Bre-B no cobra comisión); también aplica a Daviplata
  };
  contacto: {
    whatsapp: string;
    email: string;
  };
  // Frases que el wordmark "B & W" revela y rota (B…& W…). Editables en el admin.
  wordmarkPhrases: { left: string; right: string }[];
  actualizado: Date;
}

/** Solicitud de cotización capturada antes de abrir WhatsApp (cotizador público). */
export interface WebLead {
  _id?: ObjectId;
  nombre: string;
  telefono: string;
  correo: string;
  resumen: string; // detalle de la cotización (componentes + total) al momento del envío
  pagina: string; // de qué página vino, ej. "cotizador"
  revisado: boolean;
  creado: Date;
  /** Cuenta de usuario (id de `users`) si estaba logueado al enviar/guardar. */
  userId?: string | null;
  /** "guardada" = selección guardada en la cuenta, sin avisar a B & W. Ausente = solicitud. */
  tipo?: "solicitud" | "guardada";
}

/** Foto de reseña subida por un usuario (guardada en el almacenamiento de objetos). */
export interface Upload {
  _id?: ObjectId;
  /** id de `users`; null si la foto quedó en una reseña conservada tras eliminar la cuenta. */
  userId: string | null;
  key: string; // clave de la imagen principal (WebP)
  thumbKey: string; // clave de la miniatura
  width: number;
  height: number;
  bytes: number; // peso de la imagen principal ya procesada
  /** "pendiente" hasta que una reseña la adjunta (fase 6); las pendientes vencen. */
  estado: "pendiente" | "adjunta";
  /** Reseña a la que pertenece (id como string) cuando `estado` es "adjunta". */
  reviewId?: string | null;
  creado: Date;
}

/** Reseña de una cuenta sobre B & W. Una por cuenta; editarla la vuelve a moderación. */
export interface Review {
  _id?: ObjectId;
  /** id de `users`; único. Ausente si la cuenta se eliminó y la reseña se conservó. */
  userId?: string;
  estrellas: number; // 1-5
  comentario: string;
  fotoIds: string[]; // ids de `uploads` (máx. 3)
  estado: "pendiente" | "aprobada" | "rechazada";
  /** Motivo de un rechazo, visible solo para su autora. */
  motivo?: string | null;
  /** Autor tal como se muestra en la home, fijado al aprobar (no cambia solo). */
  autor?: { nombre: string; avatarStyle: string; avatarSeed: string } | null;
  creado: Date;
  actualizado: Date;
  moderadaEn?: Date | null;
  /** Elección de la autora al eliminar su cuenta: dejar esta reseña publicada. Se fija justo antes de borrar. */
  conservarAlEliminar?: boolean;
  /** La cuenta de la autora ya no existe; la reseña se conservó con su autorización. */
  cuentaEliminada?: boolean;
}

export interface Processor {
  _id?: ObjectId;
  modelo: string; // "Ryzen 7600x"
  marca: "AMD" | "Intel";
  modoPrecio: PriceMode;
  baseUsd: number | null; // si modoPrecio = USD
  precioManualCop: number | null; // si modoPrecio = COP
  activo: boolean;
  actualizado: Date;
}

export type GpuBrand = "AMD" | "NVIDIA" | "Intel";

export interface Graphic {
  _id?: ObjectId;
  modelo: string; // "RX 9060 XT 16gb"
  marca: GpuBrand; // chip: NVIDIA / AMD / Intel
  ensambladora: string; // Descripción (obligatoria) — AIB u otro detalle. Se usa como descripción del ítem al cotizar desde catálogo.
  modoPrecio: PriceMode;
  baseUsd: number | null;
  precioManualCop: number | null;
  activo: boolean;
  actualizado: Date;
}

export interface ComponentItem {
  _id?: ObjectId;
  categoria: ComponentCategory;
  marca: string;
  modelo: string;
  descripcion: string;
  /** Por defecto COP fijo (precio directo, ej. Amazon Colombia); "Combo" nace
   * en USD ya que suele cotizarse en dólares — ver componentPrice() en pricing.ts. */
  modoPrecio: PriceMode;
  baseUsd: number | null;
  precioManualCop: number | null;
  activo: boolean;
  actualizado: Date;
}

export interface CategoryAverage {
  _id?: ObjectId;
  categoria: ComponentCategory;
  promedioCop: number; // valor de referencia para el estimado público
}

/** Opción/gama de una categoría en el cotizador público (ej. "Gama media", precio). */
export interface CategoryOption {
  label: string;
  precioCop: number;
}

export interface CategoryOptions {
  _id?: ObjectId;
  categoria: ComponentCategory;
  opciones: CategoryOption[];
}

export interface QuoteOption {
  titulo: string; // "Opción 1"
  items: Array<{
    categoria: ComponentCategory;
    modelo: string;
    precioCop: number;
    descripcion: string;
  }>;
  servicio: number;
  totales: { base: number; conTarjeta: number; conPse: number };
}

export interface Quote {
  _id?: ObjectId;
  codigo: string; // "2025-30"
  fecha: Date;
  cliente: string | null;
  opciones: QuoteOption[];
  creado: Date;
  /** Cuenta de usuario (id de `users`) a la que se le muestra la cotización. */
  userId?: string | null;
  /** Ausente = borrador. Solo las publicadas las ve el cliente en su cuenta. */
  estado?: "borrador" | "publicada";
  publicadaEn?: Date | null;
  /** Cuándo salió el correo "tu cotización está lista" (null = no ha salido). */
  avisoEnviadoEn?: Date | null;
}

export interface Admin {
  _id?: ObjectId;
  usuario: string;
  passwordHash: string;
  nombreCompleto: string; // nombre real, para firmar cuentas de cobro (usuario es solo el login)
  cedula: string;
  firmaBase64: string | null; // solo el base64 puro, sin "data:image/png;base64,"
  creado: Date;
}

/** Cliente guardado para reutilizar en cuentas de cobro. */
export interface Client {
  _id?: ObjectId;
  nombre: string;
  identificacion: string; // cédula o NIT
  direccion: string;
  telefono: string;
  email: string;
  creado: Date;
}

/** Cuenta bancaria guardada para reutilizar en cuentas de cobro. Cuenta normal
 * (tipoCuenta/numero) y llave Bre-B (transferencia inmediata interbancaria,
 * Colombia) no son excluyentes: puede tener una, otra, o ambas. */
export interface BankAccount {
  _id?: ObjectId;
  banco: string;
  tipoCuenta: "Ahorros" | "Corriente" | null; // presente si tiene cuenta normal
  numero: string | null; // presente si tiene cuenta normal
  llave: string | null; // presente si tiene llave Bre-B
  titular: string;
  creado: Date;
}

export interface CuentaCobroItem {
  descripcion: string;
  cantidad: number;
  valorUnitario: number;
}

/** Cuenta de cobro. Cliente/cuenta/firmante quedan como snapshot: si el
 * cliente o la cuenta bancaria guardados cambian después, el documento ya
 * generado no se ve afectado. */
export interface CuentaCobro {
  _id?: ObjectId;
  numero: string; // "2026-01"
  fecha: Date;
  cliente: {
    nombre: string;
    identificacion: string;
    direccion: string;
    telefono: string;
    email: string;
  };
  cuentaBanco: {
    banco: string;
    tipoCuenta: "Ahorros" | "Corriente" | null;
    numero: string | null;
    llave: string | null;
    titular: string;
  };
  firmante: {
    nombre: string;
    cedula: string;
    firmaBase64: string | null;
  };
  items: CuentaCobroItem[];
  descuentoPct: number;
  subtotal: number;
  descuentoValor: number;
  total: number;
  creado: Date;
}

/** Un ensamble/build realizado que se muestra en la galería pública. */
export interface Build {
  _id?: ObjectId;
  titulo: string;       // "Gaming Mid · Bogotá"
  specs: string;        // "Ryzen 5 7600 · RTX 4060 · 32GB DDR5"
  imagenUrl: string;    // URL externa de la imagen
  orden: number;        // posición en la galería (menor = primero)
  activo: boolean;
  creado: Date;
}

export type GuideEstado = "borrador" | "publicado";

export interface GuideSection {
  h2: string;
  parrafos: string[];
  lista?: string[];
}

export interface GuideFaq {
  q: string;
  a: string;
}

/**
 * Guía del blog (/guias). Nace "borrador" cuando la redacta la IA (tarea
 * programada semanal, separada del escaneo de noticias); un admin humano
 * revisa, edita si quiere, y publica desde el panel.
 */
export interface Guide {
  _id?: ObjectId;
  slug: string;
  titulo: string;
  h1: string;
  descripcion: string;
  keywords: string[];
  publicado: string | null; // ISO yyyy-mm-dd, se fija al publicar
  actualizado: string; // ISO yyyy-mm-dd
  resumen: string[];
  intro: string[];
  secciones: GuideSection[];
  faqs: GuideFaq[];
  /** Marca la guía pilar: incluye la tabla de presupuestos en vivo. Solo la original. */
  incluyeTablaPresupuestos?: boolean;
  estado: GuideEstado;
  creado: Date;
}

export type NewsPostTipo = "articulo" | "video";
export type NewsPostEstado = "borrador" | "publicado";

/**
 * Borrador/publicación de blog o noticias. SIEMPRE nace en "borrador" —
 * lo crea el escaneo automático (RSS / YouTube), nunca se auto-publica.
 * Un admin humano revisa, edita si quiere, y publica desde el panel.
 */
export interface NewsPost {
  _id?: ObjectId;
  tipo: NewsPostTipo;
  titulo: string;
  slug: string;
  resumen: string;       // dek corto para la lista y el <meta description>
  cuerpo: string;        // texto de contexto/intro que escribimos nosotros
  fuenteUrl: string;     // link original (artículo o video) — atribución
  fuenteNombre: string;  // "Xataka", "Rincón de Varo", etc.
  youtubeId: string | null; // solo si tipo === "video"
  estado: NewsPostEstado;
  creado: Date;
  publicado: Date | null;
  actualizado: Date;
}
