/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */
import "server-only";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { collections } from "@/lib/db/collections";
import { sendTelegramMessage } from "@/lib/telegram";
import { slugify } from "@/lib/slug";
import { GuideSectionSchema, GuideFaqSchema } from "@/lib/blog/schema";

/*
 * Redacta UN borrador de guía nueva por corrida, vía Gemini (API directa,
 * no Vercel AI Gateway — usa la cuota gratis de Google AI Studio), evitando
 * temas ya cubiertos. SIEMPRE nace "borrador" — nunca se auto-publica, igual
 * que las noticias. No hace falta cachear el temario aparte: consultar los
 * títulos actuales en cada corrida es una lectura de BD barata, no un
 * escaneo externo costoso.
 */

// gemini-3.6-flash: gratis en Google AI Studio dentro de la cuota diaria/por
// minuto (no es la promo de un proveedor con fecha de expiración).
const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = google("gemini-3.6-flash");

const GuideDraftSchema = z.object({
  titulo: z.string(),
  h1: z.string(),
  descripcion: z.string(),
  keywords: z.array(z.string()).min(3).max(6),
  resumen: z.array(z.string()).min(3).max(5),
  intro: z.array(z.string()).min(1).max(2),
  secciones: z.array(GuideSectionSchema).min(3).max(5),
  faqs: z.array(GuideFaqSchema).min(3).max(5),
});

export interface GenerateBlogDraftResult {
  ok: boolean;
  titulo?: string;
  error?: string;
}

export async function generateBlogDraft(): Promise<GenerateBlogDraftResult> {
  const col = await collections.guides();
  const existentes = await col
    .find({}, { projection: { titulo: 1, descripcion: 1, _id: 0 } })
    .toArray();

  const temario =
    existentes.length > 0
      ? existentes.map((g) => `- ${g.titulo}: ${g.descripcion}`).join("\n")
      : "(todavía no hay ninguna guía)";

  try {
    const { object } = await generateObject({
      model: MODEL,
      schema: GuideDraftSchema,
      prompt: `Eres redactor técnico de B & W, empresa colombiana (Bogotá) de ensamble de PC y venta de componentes. Escribes guías prácticas para el blog del sitio (bw-pcs.com/guias), en español de Colombia, tono directo, sin relleno, sin inventar precios exactos ni cifras específicas de producto.

Guías que YA existen en el sitio (no repitas el tema; un ángulo relacionado pero distinto sí vale — ej. si ya hay una guía general de fuentes de poder, una sobre una certificación específica es válida):
${temario}

Escribe UNA guía nueva sobre hardware o armado de PC, útil para alguien en Colombia decidiendo qué comprar o cómo armar su equipo. resumen: bullets cortos. intro: 1-2 párrafos de apertura. Cada sección: un h2 y 2-4 párrafos (lista opcional). faqs: 3-5 preguntas reales y específicas, no genéricas.`,
    });

    const slug = slugify(object.titulo);
    if (await col.findOne({ slug })) {
      return { ok: false, error: "El tema generado colisiona con uno existente, intenta de nuevo." };
    }

    await col.insertOne({
      slug,
      titulo: object.titulo,
      h1: object.h1,
      descripcion: object.descripcion,
      keywords: object.keywords,
      publicado: null,
      actualizado: new Date().toISOString().slice(0, 10),
      resumen: object.resumen,
      intro: object.intro,
      secciones: object.secciones,
      faqs: object.faqs,
      estado: "borrador",
      creado: new Date(),
    });

    await sendTelegramMessage(
      `📝 <b>Nuevo borrador de blog</b>\n${object.titulo}\n\nRevísalo en el panel antes de publicar.`,
      "contenido",
    );

    return { ok: true, titulo: object.titulo };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error generando el borrador.",
    };
  }
}
