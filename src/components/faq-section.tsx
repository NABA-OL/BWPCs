/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 */
import { jsonLdString } from "@/components/json-ld";

export interface FaqItem {
  q: string;
  a: string;
}

/** Bloque de preguntas frecuentes, visible (no acordeón) para que buscadores
 * y motores de IA puedan extraer las respuestas directamente del HTML.
 * Incluye el JSON-LD de FAQPage a partir de los mismos datos. */
export function FaqSection({
  title = "Preguntas frecuentes",
  items,
}: {
  title?: string;
  items: FaqItem[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <section className="border-b border-hairline/50 bg-vanilla/40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-[-0.02em]">
          {title}
        </h2>
        <div className="mt-8 divide-y divide-hairline border-y border-hairline">
          {items.map((item) => (
            <div key={item.q} className="py-6">
              <h3 className="text-lg font-semibold">{item.q}</h3>
              <p className="mt-2 max-w-2xl text-pretty leading-relaxed text-panda">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
