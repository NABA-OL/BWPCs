/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
/**
 * Configuración estática del sitio.
 * NOTA: el contacto (WhatsApp/email) será editable desde el panel admin (settings en BD)
 * en la Fase 2. Por ahora se usan los valores actuales del negocio como respaldo.
 */
/**
 * Página pública /componentes (catálogo con precios). Está apagada: los precios
 * salen del catálogo del admin (Partes → Procesadores/Gráficas/Componentes) y solo
 * los de gráficas y procesadores se recalculan solos con la TRM; el resto cambia
 * únicamente cuando alguien los edita, así que se desactualizan. Ponla en true para
 * volver a mostrarla (menú, sitemap y página).
 */
export const SHOW_COMPONENTS_PAGE = false;

export const siteConfig = {
  name: "B & W",
  tagline: "Tu PC Master Race a buen precio",
  description:
    "Ensamble de computadores y venta de componentes en Colombia.",
  contact: {
    whatsapp: "+573188422533",
    whatsappDisplay: "(+57) 318 842 2533",
    email: "bandwmount@gmail.com",
  },
  /**
   * Responsable del tratamiento de datos (Ley 1581 de 2012) y parte de los
   * términos. Hoy es una persona natural: B & W es un emprendimiento suyo y
   * BlacKraken (aún sin constituir) NO figura como responsable, porque una
   * sociedad que no existe no puede serlo. Cuando BlacKraken se constituya:
   * cambiar `responsable` por su razón social y `descripcion` por, p. ej.,
   * "sociedad identificada con NIT ..., con domicilio en ...", subir
   * `versionPolitica`, avisar a los titulares y revisar el cambio con el abogado.
   * La cédula NO se publica (decisión del titular).
   */
  legal: {
    responsable: "Nicolas Andres Bermudez Angarita",
    descripcion:
      "persona natural titular del emprendimiento B & W, con domicilio en Bogotá, D.C., Colombia",
    versionPolitica: "2026-09-borrador",
    vigenteDesde: "18 de septiembre de 2026",
  },
  nav: [
    { label: "Inicio", href: "/" },
    { label: "Servicios", href: "/servicios" },
    ...(SHOW_COMPONENTS_PAGE
      ? [{ label: "Componentes", href: "/componentes" }]
      : []),
    { label: "Ensambles", href: "/ensambles" },
    { label: "Cotizador", href: "/cotizador" },
    { label: "Guías", href: "/guias" },
    { label: "Noticias", href: "/noticias" },
    { label: "Nosotros", href: "/nosotros" },
    { label: "Contacto", href: "/contacto" },
  ],
  /** Enlaces secundarios: solo en el footer, para enlazado interno. */
  footerLinks: [
    { label: "PC gamer por 3 millones", href: "/pc-gamer/3-millones" },
    { label: "PC gamer por 5 millones", href: "/pc-gamer/5-millones" },
    { label: "PC gamer por 8 millones", href: "/pc-gamer/8-millones" },
    { label: "PC para edición de video", href: "/pc-para/edicion-de-video" },
    { label: "PC para arquitectura", href: "/pc-para/arquitectura-y-render" },
    { label: "PC para streaming", href: "/pc-para/streaming" },
  ],
} as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${siteConfig.contact.whatsapp.replace(/\D/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
