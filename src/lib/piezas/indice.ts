/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Lógica pura del índice `/piezas` y de los enlaces hacia las piezas (docs/piezas-plan-2.md §2.3): orden del índice, enlaces de /servicios y del
// inicio, rutas del sitemap, JSON-LD y temas reservados del blog. Vive aparte para probarla en `check:logic`; nada de aquí importa `@/`.
// Regla de oro: un enlace solo se produce si la pieza es visible en el entorno, así que en producción con borradores no hay enlaces rotos.
import { PIEZAS, hayIndice, hrefPiezaServicios, piezasVisibles } from "./registro.ts";
import type { PiezaRegistrada, Registro } from "./registro.ts";
import type { Entorno, PiezaSlug } from "./types.ts";

/** Orden del índice: el del recorrido de /servicios (procesador, gráfica, RAM, tarjeta madre, fuente, almacenamiento, refrigeración). */
export const ORDEN_INDICE: readonly PiezaSlug[] = [
  "procesador",
  "tarjeta-grafica",
  "memoria-ram",
  "tarjeta-madre",
  "fuente-de-poder",
  "almacenamiento",
  "refrigeracion",
];

/** Las piezas visibles en ese entorno, en el orden del índice. */
export function piezasDelIndice(entorno: Entorno, registro: Registro = PIEZAS): readonly PiezaRegistrada[] {
  const visibles = new Set(piezasVisibles(entorno, registro));
  return ORDEN_INDICE.map((slug) => registro[slug]).filter((p) => visibles.has(p));
}

/** Todas las visibles aún son borrador: el índice lleva `noindex`. */
export function indiceEsBorrador(entorno: Entorno, registro: Registro = PIEZAS): boolean {
  return piezasDelIndice(entorno, registro).every((p) => p.contenido.estado !== "publicado");
}

export interface EnlacePaso {
  paso: string;
  etiqueta: string;
  href: string;
}

/** Enlaces "Ver a fondo" de /servicios: un paso del recorrido por pieza visible, en el orden recibido. */
export function enlacesServicios(pasos: readonly string[], entorno: Entorno, registro: Registro = PIEZAS): readonly EnlacePaso[] {
  const enlaces: EnlacePaso[] = [];
  for (const paso of pasos) {
    const href = hrefPiezaServicios(paso, entorno, registro);
    const pieza = piezasVisibles(entorno, registro).find((p) => p.contenido.piezaServicios === paso);
    if (href && pieza) enlaces.push({ paso, etiqueta: pieza.contenido.nombreCorto, href });
  }
  return enlaces;
}

/** Palabras de la línea del inicio («GPU · CPU · RAM · …») y el paso del recorrido de /servicios al que corresponde cada una. */
export const PALABRAS_INICIO: readonly { palabra: string; paso: string }[] = [
  { palabra: "GPU", paso: "graficas" },
  { palabra: "CPU", paso: "procesador" },
  { palabra: "RAM", paso: "ram" },
  { palabra: "Board", paso: "boards" },
  { palabra: "Fuente", paso: "fuentes" },
  { palabra: "Chasis", paso: "chasis" },
  { palabra: "Refrigeración", paso: "refrigeracion" },
];

export interface PalabraInicio {
  palabra: string;
  href: string | null;
}

/** Cada palabra de la línea del inicio con su enlace, o null si su pieza no es visible (o no existe, como el chasis). */
export function enlacesInicio(entorno: Entorno, registro: Registro = PIEZAS): readonly PalabraInicio[] {
  return PALABRAS_INICIO.map(({ palabra, paso }) => ({ palabra, href: hrefPiezaServicios(paso, entorno, registro) }));
}

export interface RutaSitemap {
  ruta: string;
  modificada: string; // AAAA-MM-DD
}

/**
 * Rutas de las piezas para el sitemap: solo las PUBLICADAS (producción) y, si hay índice, `/piezas` con la fecha más reciente.
 * `modificada` es `actualizadoEn` de la pieza (el índice usa la mayor).
 */
export function rutasSitemapPiezas(registro: Registro = PIEZAS): readonly RutaSitemap[] {
  const publicadas = piezasDelIndice("produccion", registro);
  const rutas: RutaSitemap[] = publicadas.map((p) => ({ ruta: `/piezas/${p.contenido.slug}`, modificada: p.contenido.actualizadoEn }));
  if (!hayIndice("produccion", registro)) return rutas;
  const reciente = publicadas.map((p) => p.contenido.actualizadoEn).reduce((a, b) => (a > b ? a : b));
  return [{ ruta: "/piezas", modificada: reciente }, ...rutas];
}

export interface TemaReservado {
  titulo: string;
  descripcion: string;
}

/** Temas que el generador del blog no debe repetir: TODAS las piezas registradas, sin importar su estado (un borrador también se publicará). */
export function temasReservados(registro: Registro = PIEZAS): readonly TemaReservado[] {
  return ORDEN_INDICE.map((slug) => registro[slug]).map((p) => ({ titulo: p.contenido.titulo, descripcion: p.contenido.descripcion }));
}

/** `CollectionPage` con su `ItemList` (una entrada por pieza visible, en el orden del índice) para `JsonLd`. */
export function indiceSchema(piezas: readonly PiezaRegistrada[], siteUrl: string, titulo: string, descripcion: string): object {
  const url = `${siteUrl}/piezas`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: titulo,
    description: descripcion,
    url,
    inLanguage: "es-CO",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: piezas.length,
      itemListElement: piezas.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${siteUrl}/piezas/${p.contenido.slug}`,
        name: p.contenido.nombreCorto,
      })),
    },
  };
}
