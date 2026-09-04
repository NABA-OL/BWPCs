/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */
import { siteConfig } from "@/lib/site-config";

export const SITE_URL = "https://bw-pcs.com";

/**
 * Datos estructurados del sitio — fuente única.
 * Solo incluye datos verificables del negocio: no se inventan horarios,
 * coordenadas, dirección de local ni reseñas.
 */

const BUSINESS_ID = `${SITE_URL}/#business`;

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": BUSINESS_ID,
    name: siteConfig.name,
    alternateName: "B&W PCs",
    description:
      "Ensamble de computadores y venta de componentes en Colombia. Builds gaming, workstation y escritorio a la medida.",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo-solo.png`,
    image: `${SITE_URL}/brand/logo.png`,
    telephone: siteConfig.contact.whatsapp,
    email: siteConfig.contact.email,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.contact.whatsapp,
      email: siteConfig.contact.email,
      contactType: "customer service",
      areaServed: "CO",
      availableLanguage: "es",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bogotá",
      addressRegion: "Cundinamarca",
      addressCountry: "CO",
    },
    areaServed: [
      { "@type": "City", name: "Bogotá" },
      { "@type": "Country", name: "Colombia" },
    ],
    priceRange: "$$",
    currenciesAccepted: "COP",
    paymentAccepted: "Bre-B, Tarjeta de crédito, PSE, Daviplata, Nequi",
    knowsAbout: [
      "Ensamble de computadores",
      "Componentes de PC",
      "Gaming PCs",
      "Workstation",
      "Tarjetas gráficas",
      "Procesadores",
      "Memorias RAM",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios de B & W",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Ensamblaje de PC a la medida",
            url: `${SITE_URL}/servicios`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Venta de componentes de PC",
            url: `${SITE_URL}/servicios`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Asesoría técnica y cotización",
            url: `${SITE_URL}/cotizador`,
          },
        },
      ],
    },
    sameAs: ["https://www.instagram.com/bw_mountpc/"],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: siteConfig.name,
    inLanguage: "es-CO",
    publisher: { "@id": BUSINESS_ID },
  };
}

/** Servicio de ensamblaje, con el rango de precio real que maneja el cotizador. */
export function assemblyServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Ensamblaje de PC a la medida",
    serviceType: "Ensamble de computadores",
    description:
      "Selección de componentes, armado, instalación de sistema, formateo y configuración del equipo. Incluye pruebas de temperatura y estabilidad antes de la entrega.",
    provider: { "@id": BUSINESS_ID },
    areaServed: [
      { "@type": "City", name: "Bogotá" },
      { "@type": "Country", name: "Colombia" },
    ],
    url: `${SITE_URL}/servicios`,
    offers: {
      "@type": "Offer",
      priceCurrency: "COP",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/cotizador`,
    },
  };
}

/** Oferta del cotizador: rango real de precios de un equipo armado. */
export function estimatorOfferSchema(minCop: number, maxCop: number) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "PC a la medida ensamblado por B & W",
    description:
      "Computador armado a la medida según la gama elegida en cada componente: procesador, gráfica, board, RAM, almacenamiento, fuente, chasis y refrigeración.",
    brand: { "@type": "Brand", name: siteConfig.name },
    url: `${SITE_URL}/cotizador`,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "COP",
      lowPrice: minCop,
      highPrice: maxCop,
      offerCount: 1,
      availability: "https://schema.org/InStock",
      seller: { "@id": BUSINESS_ID },
    },
  };
}
