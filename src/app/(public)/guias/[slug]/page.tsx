/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { PcBackdrop } from "@/components/assembly-hero";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { FaqSection } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { GUIDES, findGuide } from "@/lib/guides";
import { SITE_URL } from "@/lib/schema";
import { siteConfig } from "@/lib/site-config";
import { getEstimatorContext } from "@/lib/quote-estimator";
import { buildForBudget } from "@/lib/budget-builds";
import { formatCOP } from "@/lib/format";

export const revalidate = 3600;

/** Presupuestos que la guía pilar muestra con precios en vivo. */
const BUDGETS = [
  { slug: "3-millones", etiqueta: "3 millones", montoCop: 3_000_000 },
  { slug: "5-millones", etiqueta: "5 millones", montoCop: 5_000_000 },
  { slug: "8-millones", etiqueta: "8 millones", montoCop: 8_000_000 },
];

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = findGuide(slug);
  if (!guide) return {};

  return {
    title: guide.titulo,
    description: guide.descripcion,
    keywords: guide.keywords,
    alternates: { canonical: `/guias/${guide.slug}` },
    openGraph: {
      title: `${guide.titulo} · B & W`,
      description: guide.descripcion,
      url: `${SITE_URL}/guias/${guide.slug}`,
      type: "article",
    },
  };
}

function articleSchema(guide: (typeof GUIDES)[number]) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.titulo,
    description: guide.descripcion,
    inLanguage: "es-CO",
    datePublished: guide.publicado,
    dateModified: guide.actualizado,
    author: { "@type": "Organization", name: siteConfig.name, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/brand/logo-solo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/guias/${guide.slug}`,
    },
  };
}

export default async function GuiaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = findGuide(slug);
  if (!guide) notFound();

  // Solo la guía pilar carga precios en vivo del catálogo.
  let tabla: { etiqueta: string; slug: string; total: number }[] = [];
  if (guide.incluyeTablaPresupuestos) {
    try {
      const ctx = await getEstimatorContext();
      tabla = BUDGETS.map((b) => {
        const build = buildForBudget(ctx, b.montoCop);
        return {
          etiqueta: b.etiqueta,
          slug: b.slug,
          total: build && !build.excedePresupuesto ? build.total : 0,
        };
      }).filter((t) => t.total > 0);
    } catch {
      tabla = [];
    }
  }

  const otras = GUIDES.filter((g) => g.slug !== guide.slug);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE_URL}/` },
          { name: "Guías", url: `${SITE_URL}/guias` },
          { name: guide.h1, url: `${SITE_URL}/guias/${guide.slug}` },
        ]}
      />
      <JsonLd data={articleSchema(guide)} />
      <PcBackdrop />

      <PageHero
        eyebrow={`Guía · actualizada ${guide.actualizado}`}
        title={guide.h1}
        summary={guide.resumen}
        ctaLabel="Cotiza tu PC"
        ctaHref="/cotizador"
      >
        {guide.intro.map((p) => (
          <p key={p.slice(0, 40)} className="mt-4 first:mt-0">
            {p}
          </p>
        ))}
      </PageHero>

      {/* Tabla de presupuestos en vivo — solo en la guía pilar */}
      {tabla.length > 0 && (
        <section className="border-b border-hairline/50 bg-vanilla/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-balance text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold tracking-[-0.02em]">
              Qué se arma con cada presupuesto
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-panda">
              Totales calculados con los precios que tenemos hoy en catálogo,
              servicio de ensamblaje incluido. Se actualizan solos cuando cambia
              el precio de los componentes.
            </p>

            <dl className="mt-8 divide-y divide-hairline border-y border-hairline">
              {tabla.map((t) => (
                <div
                  key={t.slug}
                  className="flex flex-col gap-2 py-4 sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <dt className="w-44 shrink-0 font-medium">
                    Cerca de {t.etiqueta}
                  </dt>
                  <dd className="flex-1">
                    <Link
                      href={`/pc-gamer/${t.slug}`}
                      className="text-sm text-accent hover:underline"
                    >
                      Ver la configuración completa →
                    </Link>
                  </dd>
                  <dd className="shrink-0 font-mono tabular-nums">
                    ≈ {formatCOP(t.total)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* Cuerpo del artículo */}
      <section className="border-b border-hairline/50 bg-vanilla/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <article className="max-w-2xl space-y-12">
            {guide.secciones.map((s) => (
              <div key={s.h2}>
                <h2 className="text-balance text-[clamp(1.35rem,3vw,1.9rem)] font-bold tracking-[-0.02em]">
                  {s.h2}
                </h2>
                <div className="mt-4 space-y-4 text-lg leading-relaxed text-panda">
                  {s.parrafos.map((p) => (
                    <p key={p.slice(0, 40)}>{p}</p>
                  ))}
                </div>
                {s.lista && (
                  <ul className="mt-5 space-y-2">
                    {s.lista.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-panda"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2.5 h-1 w-1 shrink-0 bg-accent"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </article>
        </div>
      </section>

      <FaqSection items={guide.faqs} />

      {/* Otras guías */}
      {otras.length > 0 && (
        <section className="border-b border-hairline/50 bg-vanilla/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-balance text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold tracking-[-0.02em]">
              Otras guías
            </h2>
            <div className="mt-8 grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
              {otras.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guias/${g.slug}`}
                  className="group bg-vanilla p-6 transition-colors hover:bg-component/20"
                >
                  <h3 className="text-lg font-semibold group-hover:text-accent">
                    {g.h1} →
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-component">
                    {g.descripcion}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-component/30">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-balance text-[clamp(1.5rem,4vw,2.25rem)] font-bold tracking-[-0.02em]">
              Pasemos de la teoría al presupuesto
            </h2>
            <p className="mt-2 max-w-md text-pretty text-panda/70">
              Arma tu configuración y mira el total aproximado al instante.
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
