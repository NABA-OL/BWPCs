/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { TowerBackdrop } from "@/components/tower-hero";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

export const metadata: Metadata = {
  title: "Quiénes somos: ensamble de PC en Bogotá",
  description:
    "Conoce a B & W, el equipo detrás del ensamble de computadores y venta de componentes en Colombia. Atención personalizada y precios justos desde Bogotá.",
  keywords: [
    "B&W PCs Colombia",
    "ensamble de PC Bogotá",
    "tienda de componentes Colombia",
    "quiénes somos B&W",
  ],
  alternates: { canonical: "/nosotros" },
  openGraph: {
    title: "Nosotros · B & W",
    description:
      "Conoce a B & W: ensamble de PCs y venta de componentes en Colombia con atención personalizada.",
    url: "https://bw-pcs.com/nosotros",
  },
};

const valores = [
  {
    t: "Precio honesto",
    d: "Importamos gráficas y procesadores para conseguirte mejores precios que el mercado local. Te pasamos ese ahorro, no lo escondemos.",
  },
  {
    t: "Sin venderte de más",
    d: "Te recomendamos lo que tu uso necesita. Si una pieza no te aporta, te lo decimos.",
  },
  {
    t: "Trabajo cuidado",
    d: "Cable management ordenado, temperaturas en su punto y el equipo probado antes de entregar.",
  },
];

export default function NosotrosPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: "https://bw-pcs.com/" },
          { name: "Nosotros", url: "https://bw-pcs.com/nosotros" },
        ]}
      />
      <TowerBackdrop />
      <PageHero
        eyebrow="Sobre B & W"
        title="Armamos PCs, no plantillas."
        ctaLabel="Habla con nosotros"
        ctaHref="/contacto"
      >
        <p>
          B &amp; W nació de la pasión por el hardware y de una idea simple: que
          armar un buen computador en Colombia no tiene por qué ser caro ni
          confuso.
        </p>
      </PageHero>

      {/* Historia */}
      <section className="border-b border-hairline/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-[-0.02em]">
              Cómo trabajamos
            </h2>
            <div className="space-y-4 text-lg leading-relaxed text-panda">
              <p>
                Para las piezas que más pesan en el presupuesto (gráficas y
                procesadores) las traemos por importación. Eso nos deja
                ofrecerte un precio más justo que comprándolas aquí, y a ti te
                queda claro de dónde sale cada peso.
              </p>
              <p>
                El resto de componentes los conseguimos al mejor valor del
                momento y los sumamos a tu cotización. Tú decides: armamos todo
                el equipo o te vendemos solo la pieza que necesitas.
              </p>
              <p>
                <Link href="/ensambles" className="text-accent hover:underline">
                  Ve los equipos que hemos entregado →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="border-b bborder-hairline/50 bg-vanilla/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <dl className="divide-y divide-hairline border-y border-hairline">
            {valores.map((v) => (
              <div
                key={v.t}
                className="grid gap-2 py-8 md:grid-cols-[1fr_2fr] md:gap-12"
              >
                <dt className="text-lg font-semibold">{v.t}</dt>
                <dd className="text-sm leading-relaxed text-panda">{v.d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-component/30">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <h2 className="text-[clamp(1.5rem,4vw,2.25rem)] font-bold tracking-[-0.02em]">
            ¿Hablamos de tu próximo equipo?
          </h2>
          <ButtonLink
            href="/contacto"
            size="lg"
            className="bg-accent text-accent-ink hover:bg-accent-deep"
          >
            Contáctanos
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
