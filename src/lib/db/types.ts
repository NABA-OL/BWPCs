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
  /** Admin que firma las cuentas de cobro automáticas (ausente = el primero con firma cargada). */
  firmanteDefaultId?: string | null;
  /** Cuenta bancaria por defecto de las cuentas de cobro automáticas (ausente = la que calce con el medio de pago). */
  bancoDefaultId?: string | null;
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
  /** La autora tenía una compra pagada al enviarla (se exige para reseñar). Ausente en reseñas anteriores a esa regla. */
  compraVerificada?: boolean;
  /** "Detalles del ensamble": renglones que fija el admin al moderar (p. ej. "Procesador: Ryzen 5 7600"). Sin precios. */
  componentes?: string[];
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
  /**
   * Eje comercial, aparte de `estado` (visibilidad): el cliente pidió cambios y
   * falta enviarle una versión nueva. Ausente = sin novedades.
   */
  estadoComercial?: "en_revision" | "compra_solicitada";
  /** Versión enviada al cliente; ausente = 1. */
  version?: number;
  /** Última versión que el cliente abrió en su cuenta; menor que `version` = tiene algo nuevo por ver. */
  vistaVersion?: number;
  /** Cada versión enviada al cliente, con sus totales al momento de enviarla. */
  historial?: QuoteVersionEntry[];
}

export interface QuoteVersionEntry {
  version: number;
  enviadaEn: Date;
  /** Qué cambió, escrito por el admin (se muestra al cliente). */
  nota: string | null;
  totales: { titulo: string; totalCop: number }[];
}

export type PaymentMethod = "transferencia" | "bre-b" | "efectivo" | "tarjeta" | "pse";

/** Pedido del cliente sobre una cotización publicada: ajustarla o comprarla. */
export interface QuoteRequest {
  _id?: ObjectId;
  quoteId: string;
  /** id de `users` de quien la pide. */
  userId: string;
  tipo: "revision" | "compra";
  /** Índice de la opción que prefiere (revisión, null = sin preferencia) o que quiere comprar. */
  opcionPreferida: number | null;
  /** Solo en `compra`: cómo piensa pagar y cuánto sería en ese medio al pedirlo. */
  formaPago?: PaymentMethod;
  totalCop?: number;
  /** Cambios que pide (revisión) o comentario opcional (compra). */
  comentario: string;
  /** Versión de la cotización que el cliente estaba viendo. */
  versionBase: number;
  /** `cancelada`: la cotización cambió de dueña o se despublicó. */
  estado: "pendiente" | "atendida" | "cancelada";
  creado: Date;
  atendidaEn?: Date | null;
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
  /** Cédula o NIT. Puede ir vacía: solo se exige al emitir una cuenta de cobro. */
  identificacion: string;
  direccion: string;
  telefono: string;
  email: string;
  /** Cuenta de usuario (id de `users`) de esta persona, si se registró. Única. */
  userId?: string | null;
  /** Cómo llegó al listado: a mano desde el admin, desde su cuenta o al pedir una compra. */
  origen?: "manual" | "cuenta" | "compra";
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
  /** Renglón de recargo por el medio de pago (tarjeta): se quita o se pone al cambiar de medio y no lleva descuento. */
  recargo?: boolean;
}

/**
 * Estado de una cuenta de cobro. `borrador` no la ve el cliente; `pagada` solo la
 * fija el admin (el cliente puede llegar a `pago_reportado`, nunca más allá).
 * Sin estado (cuentas anteriores a esta función) se trata como `enviada`.
 */
export type CuentaCobroEstado =
  | "borrador"
  | "enviada"
  | "correccion_solicitada"
  | "pago_reportado"
  | "pagada"
  | "anulada";

export interface CuentaCobroEvento {
  estado: CuentaCobroEstado;
  en: Date;
  /** `sistema`: un cambio automático verificado (p. ej. el pago con tarjeta confirmado por Bold). */
  por: "admin" | "cliente" | "sistema";
  /** Motivo o comentario (p. ej. qué corregir). */
  nota: string | null;
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
  estado?: CuentaCobroEstado;
  /** Cuenta de usuario (id de `users`) que la ve y la paga; null = solo registro del admin. */
  userId?: string | null;
  historial?: CuentaCobroEvento[];
  /** Solicitud de compra de la que salió este borrador (cotización y pedido). */
  origen?: { quoteId: string; requestId: string } | null;
  /**
   * Hasta cuándo vale el precio (solo las nacidas de una solicitud de compra; ver `cuenta-cobro-vigencia.ts`).
   * Pasada esta hora, mientras siga "por pagar", el cliente no ve cómo pagar y debe pedir que se revisen los precios.
   * Ausente = sin vencimiento (cuentas manuales y anteriores).
   */
  venceEn?: Date | null;
  /**
   * Enlace de cobro con tarjeta que crea el admin en Bold cuando la tarjeta no se cobra sola
   * (sobre el tope de Bold o sin Bold configurado). El cliente paga allí y sube el comprobante.
   */
  enlacePagoTarjeta?: string | null;
  /** Enlace de pago con tarjeta de Bold (el más reciente). */
  pagoBold?: PagoBold | null;
  /** Medio con el que el cliente va a pagar; el total incluye o no el recargo según este medio. */
  formaPago?: PaymentMethod;
  /** Comprobantes subidos al reportar el pago (uno por cada vez que se reportó). */
  comprobantes?: Comprobante[];
  /** Cuándo el cliente avisó que pagó (no es una confirmación). */
  pagoReportadoEn?: Date | null;
  /** Cuándo el admin confirmó el dinero. */
  pagadaEn?: Date | null;
}

/** Enlace de pago de Bold (tarjeta) creado para una cuenta de cobro. No guarda datos de tarjeta. */
export interface PagoBold {
  linkId: string;
  url: string;
  /** Referencia que enviamos a Bold; vuelve en el webhook (`metadata.reference`). */
  reference: string;
  /** Valor del enlace en COP: el pago aprobado debe ser exactamente este. */
  totalCop: number;
  /** Ambiente en el que se creó: un enlace de pruebas nunca cierra una cuenta en producción. */
  mode: "test" | "live";
  creadoEn: Date;
  expiraEn: Date;
  /** Id del pago en Bold, cuando se aprobó. */
  paymentId?: string;
  aprobadoEn?: Date | null;
  rechazadoEn?: Date | null;
}

/** Evento de webhook de Bold ya procesado (idempotencia: Bold reintenta hasta 5 veces). */
export interface BoldEventRecord {
  /** `id` del evento en Bold. */
  _id: string;
  tipo: string;
  paymentId: string | null;
  cuentaId: string | null;
  recibidoEn: Date;
}

/** Comprobante de pago que subió el cliente (imagen en el bucket privado). */
export interface Comprobante {
  /** Id aleatorio con el que se pide la imagen a `/api/comprobantes/[id]`. */
  id: string;
  /** Clave en el bucket privado. */
  key: string;
  /** SHA-256 de la imagen ya procesada: una misma imagen no sirve para dos cuentas. */
  sha256: string;
  bytes: number;
  width: number;
  height: number;
  subidoEn: Date;
}

/** Contador atómico (p. ej. numeración de cuentas de cobro por año). */
export interface Counter {
  _id: string;
  seq: number;
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
