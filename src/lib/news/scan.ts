/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */
import "server-only";
import { collections } from "@/lib/db/collections";
import { sendTelegramMessage } from "@/lib/telegram";
import { slugify } from "@/lib/slug";

/**
 * Escaneo de fuentes de noticias/hardware. SIEMPRE crea borradores, nunca
 * publica solo — Google penaliza fuerte el contenido auto-publicado sin
 * revisión humana. Un admin entra al panel, revisa/edita y publica.
 */

// Rincón de Varo — canal de noticias de hardware/PC semanal, confirmado por el
// cliente. channel_id resuelto desde @rincondelvaro (no cambia aunque cambie
// el handle).
const YOUTUBE_CHANNEL_ID = "UCnxubBCPlg0hHdZw_UehrTw";
const YOUTUBE_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
// Filtro de título: solo nos interesa su serie semanal de noticias, no todo lo que sube.
const YOUTUBE_TITLE_FILTER = /noticias\s*pc/i;

interface RssSource {
  nombre: string;
  url: string;
}

const RSS_SOURCES: RssSource[] = [
  { nombre: "Xataka", url: "https://www.xataka.com/index.xml" },
  { nombre: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index" },
  { nombre: "Tom's Hardware", url: "https://www.tomshardware.com/feeds/all" },
  { nombre: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
];

const MAX_ITEMS_PER_SOURCE = 5;

// Borradores sin revisar más viejos que esto se descartan en cada escaneo —
// ya no son noticia. Lo publicado NUNCA se toca acá.
const MAX_DRAFT_AGE_DAYS = 7;

// Algunos medios (ej. Xataka) bloquean requests sin User-Agent con una
// respuesta vacía en vez de un error — sin esto, el escaneo "funciona" pero
// no encuentra nada.
const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; BWPCsNewsBot/1.0; +https://bw-pcs.com)",
};

// ponytail: XML parseado con regex, no una librería. Estos 5 feeds tienen
// forma estable (RSS 2.0 / Atom estándar); si alguno cambia de formato y el
// parseo se rompe, migrar a fast-xml-parser en vez de sumar más regex.
function stripCdata(s: string): string {
  const m = s.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
  return m ? m[1] : s;
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function extractTag(block: string, tag: string): string | null {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? decodeXmlEntities(stripCdata(m[1])).trim() : null;
}

function extractLinkHref(block: string): string | null {
  const m = block.match(/<link[^>]*\bhref="([^"]+)"/i);
  return m ? m[1] : null;
}

interface RssItem {
  titulo: string;
  link: string;
  resumen: string;
}

/** Soporta RSS 2.0 (<item>) y Atom (<entry>) — The Verge, entre otros, usa Atom. */
function parseRssItems(xml: string): RssItem[] {
  const blocks =
    xml.match(/<item[\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];
  const items: RssItem[] = [];
  for (const block of blocks.slice(0, MAX_ITEMS_PER_SOURCE)) {
    const titulo = extractTag(block, "title");
    // RSS: <link>texto</link>. Atom: <link href="..."/>. Se intenta primero
    // la forma con texto (más específica); si sale vacía o es solo espacio,
    // se cae al atributo href.
    const linkText = extractTag(block, "link");
    const link = linkText && linkText.startsWith("http") ? linkText : extractLinkHref(block);
    if (!titulo || !link) continue;
    const descripcion =
      extractTag(block, "description") ??
      extractTag(block, "summary") ??
      extractTag(block, "content") ??
      "";
    const resumen = descripcion.replace(/<[^>]+>/g, "").trim().slice(0, 400);
    items.push({ titulo, link, resumen });
  }
  return items;
}

interface YoutubeEntry {
  titulo: string;
  videoId: string;
  link: string;
}

function parseYoutubeEntries(xml: string): YoutubeEntry[] {
  const blocks = xml.match(/<entry>[\s\S]*?<\/entry>/gi) ?? [];
  const entries: YoutubeEntry[] = [];
  for (const block of blocks) {
    const titulo = extractTag(block, "title");
    const videoId = extractTag(block, "yt:videoId");
    const link = extractLinkHref(block);
    if (titulo && videoId && link) entries.push({ titulo, videoId, link });
  }
  return entries;
}

export interface ScanResult {
  creados: number;
  borrados: number;
  detalles: string[];
  errores: string[];
}

/** Escanea YouTube + RSS y crea borradores para lo que sea nuevo. No publica nada. */
export async function runNewsScan(): Promise<ScanResult> {
  const col = await collections.newsPosts();
  const detalles: string[] = [];
  const errores: string[] = [];

  // --- YouTube: solo su serie semanal de noticias, dedupe por videoId ---
  try {
    const res = await fetch(YOUTUBE_FEED_URL, {
      cache: "no-store",
      headers: FETCH_HEADERS,
    });
    if (res.ok) {
      const xml = await res.text();
      const entries = parseYoutubeEntries(xml).filter((e) =>
        YOUTUBE_TITLE_FILTER.test(e.titulo),
      );
      for (const entry of entries) {
        const existe = await col.findOne({ youtubeId: entry.videoId });
        if (existe) continue;

        await col.insertOne({
          tipo: "video",
          titulo: entry.titulo,
          slug: slugify(entry.titulo),
          resumen: `Resumen semanal de noticias de hardware y PC, por Rincón de Varo.`,
          cuerpo: "",
          fuenteUrl: entry.link,
          fuenteNombre: "Rincón de Varo",
          youtubeId: entry.videoId,
          estado: "borrador",
          creado: new Date(),
          publicado: null,
          actualizado: new Date(),
        });
        detalles.push(`🎥 ${entry.titulo}`);
      }
    } else {
      errores.push(`YouTube: HTTP ${res.status}`);
    }
  } catch (error) {
    errores.push(`YouTube: ${error instanceof Error ? error.message : "error"}`);
  }

  // --- RSS: dedupe por fuenteUrl ---
  for (const source of RSS_SOURCES) {
    try {
      const res = await fetch(source.url, {
        cache: "no-store",
        headers: FETCH_HEADERS,
      });
      if (!res.ok) {
        errores.push(`${source.nombre}: HTTP ${res.status}`);
        continue;
      }
      const xml = await res.text();
      const items = parseRssItems(xml);

      for (const item of items) {
        const existe = await col.findOne({ fuenteUrl: item.link });
        if (existe) continue;

        await col.insertOne({
          tipo: "articulo",
          titulo: item.titulo,
          slug: slugify(item.titulo),
          resumen: item.resumen || item.titulo,
          cuerpo: item.resumen,
          fuenteUrl: item.link,
          fuenteNombre: source.nombre,
          youtubeId: null,
          estado: "borrador",
          creado: new Date(),
          publicado: null,
          actualizado: new Date(),
        });
        detalles.push(`📰 [${source.nombre}] ${item.titulo}`);
      }
    } catch (error) {
      errores.push(
        `${source.nombre}: ${error instanceof Error ? error.message : "error"}`,
      );
    }
  }

  // --- Limpieza: borradores viejos sin revisar ya no son noticia ---
  const limite = new Date(Date.now() - MAX_DRAFT_AGE_DAYS * 24 * 60 * 60 * 1000);
  const { deletedCount } = await col.deleteMany({ estado: "borrador", creado: { $lt: limite } });

  if (detalles.length > 0) {
    const lista = detalles.map((d) => `• ${d}`).join("\n");
    await sendTelegramMessage(
      `📝 <b>${detalles.length} borrador${detalles.length === 1 ? "" : "es"} nuevo${
        detalles.length === 1 ? "" : "s"
      } en Noticias</b>\n${lista}\n\nRevísalos en el panel antes de publicar.`,
      "contenido",
    );
  }

  return { creados: detalles.length, borrados: deletedCount, detalles, errores };
}
