/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { PcBackdrop } from "@/components/assembly-hero";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { GUIDES } from "@/lib/guides";
import { SITE_URL } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Guías para armar tu PC en Colombia",
  description:
    "Guías prácticas para elegir componentes y armar tu computador en Colombia: cuánto cuesta, cuánta RAM necesitas y qué fuente de poder comprar.",
  keywords: [
    "guías armar pc colombia",
    "cómo elegir componentes pc",
    "consejos armar pc gamer colombia",
    "guía compra pc colombia",
  ],
  alternates: { canonical: "/guias" },
  openGraph: {
    title: "Guías · B & W",
    description:
      "Guías prácticas para elegir componentes y armar tu computador en Colombia.",
    url: `${SITE_URL}/guias`,
  },
};

export default function GuiasPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE_URL}/` },
          { name: "Guías", url: `${SITE_URL}/guias` },
        ]}
      />
      <PcBackdrop />

      <PageHero
        eyebrow="Guías"
        title="Cómo elegir bien los componentes"
        summary={[
          "Sin recomendaciones genéricas: precios y criterios del mercado colombiano.",
          "Escritas por quienes arman los equipos, no copiadas de reseñas gringas.",
        ]}
        ctaLabel="Cotiza tu PC"
        ctaHref="/cotizador"
      >
        <p>
          Lo que preguntan nuestros clientes antes de comprar, respondido en
          serio. Si después de leer te queda una duda, escríbenos.
        </p>
      </PageHero>

      <section className="border-b border-hairline/50 bg-vanilla/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-px border border-hairline bg-hairline md:grid-cols-2">
            {GUIDES.map((g) => (
              <Link
                key={g.slug}
                href={`/guias/${g.slug}`}
                className="group bg-vanilla p-7 transition-colors hover:bg-component/20"
              >
                <p className="font-mono text-xs text-component">
                  {g.actualizado}
                </p>
                <h2 className="mt-3 text-balance text-xl font-bold tracking-[-0.01em] group-hover:text-accent">
                  {g.h1}
                </h2>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-panda">
                  {g.descripcion}
                </p>
                <p className="mt-4 font-mono text-xs text-accent">Leer →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-component/30">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-balance text-[clamp(1.5rem,4vw,2.25rem)] font-bold tracking-[-0.02em]">
              ¿Ya sabes qué quieres?
            </h2>
            <p className="mt-2 max-w-md text-pretty text-panda/70">
              Arma tu configuración y mira el precio aproximado al instante.
            </p>
          </div>
          <ButtonLink
            href="/cotizador"
            size="lg"
            className="bg-accent text-accent-ink hover:bg-accent-deep"
          >
            Ir al cotizador
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
