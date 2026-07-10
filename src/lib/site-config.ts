// Desarrollado por BlacKraken Solutions
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
    { label: "Ensambles", href: "/ensambles" },
    { label: "Cotizador", href: "/cotizador" },
    { label: "Nosotros", href: "/nosotros" },
    { label: "Contacto", href: "/contacto" },
  ],
} as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${siteConfig.contact.whatsapp.replace(/\D/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
