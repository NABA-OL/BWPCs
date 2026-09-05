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
  nav: [
    { label: "Inicio", href: "/" },
    { label: "Servicios", href: "/servicios" },
    { label: "Componentes", href: "/componentes" },
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
