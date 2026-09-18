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
import { getEstimatorContext } from "@/lib/quote-estimator";
import { buildForBudget } from "@/lib/budget-builds";
import { formatCOP } from "@/lib/format";
import { whatsappLink } from "@/lib/site-config";
import { SITE_URL } from "@/lib/schema";

export const revalidate = 3600;

interface BudgetPreset {
  slug: string;
  montoCop: number;
  etiqueta: string;
  /** Qué esperar de verdad en este rango. */
  expectativa: string;
  paraQuien: string;
}

const PRESETS: BudgetPreset[] = [
  {
    slug: "3-millones",
    montoCop: 3_000_000,
    etiqueta: "3 millones",
    expectativa:
      "Es el punto de entrada real para jugar en 1080p con buenos cuadros por segundo en títulos competitivos: Valorant, CS2, Fortnite, League of Legends. Para juegos AAA recientes vas a bajar algunos ajustes gráficos, y eso está bien.",
    paraQuien:
      "Quien juega competitivo, estudia o trabaja con ofimática y quiere un equipo que no se quede corto en dos años.",
  },
  {
    slug: "5-millones",
    montoCop: 5_000_000,
    etiqueta: "5 millones",
    expectativa:
      "Es el rango donde el equipo deja de tener cuellos de botella: 1080p en alto sin pensarlo, 1440p en la mayoría de títulos, y suficiente RAM y almacenamiento para editar video o trabajar con varios programas abiertos.",
    paraQuien:
      "Quien juega títulos AAA, hace streaming, edita video o necesita el equipo para trabajar y jugar sin cambiar de máquina.",
  },
  {
    slug: "8-millones",
    montoCop: 8_000_000,
    etiqueta: "8 millones",
    expectativa:
      "Acá ya se arma con gráfica de gama alta, procesador de 8 núcleos o más y refrigeración en serio. 1440p en ultra, 4K en buena parte de los títulos, y renderizado o compilación sin esperar.",
    paraQuien:
      "Quien renderiza, modela en 3D, hace streaming con calidad o simplemente quiere que el equipo dure sin actualizaciones por varios años.",
  },
];

function findPreset(slug: string) {
  return PRESETS.find((p) => p.slug === slug);
}

export function generateStaticParams() {
  return PRESETS.map((p) => ({ presupuesto: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ presupuesto: string }>;
}): Promise<Metadata> {
  const { presupuesto } = await params;
  const preset = findPreset(presupuesto);
  if (!preset) return {};

  const title = `PC gamer por ${preset.etiqueta} en Colombia`;
  return {
    title,
    description: `Qué PC gamer se puede armar con ${preset.etiqueta} de pesos en Colombia: componentes, precios reales y para qué alcanza. Cotización afinada por WhatsApp.`,
    keywords: [
      `pc gamer ${preset.etiqueta} colombia`,
      `armar pc ${preset.etiqueta}`,
      `pc gamer ${preset.etiqueta} bogotá`,
      "cuánto cuesta armar un pc colombia",
      "presupuesto pc gamer colombia",
    ],
    alternates: { canonical: `/pc-gamer/${preset.slug}` },
    openGraph: {
      title: `${title} · B & W`,
      description: `Componentes y precios reales para un PC gamer de ${preset.etiqueta} en Colombia.`,
      url: `${SITE_URL}/pc-gamer/${preset.slug}`,
    },
  };
}

export default async function PcGamerPresupuestoPage({
  params,
}: {
  params: Promise<{ presupuesto: string }>;
}) {
  const { presupuesto } = await params;
  const preset = findPreset(presupuesto);
  if (!preset) notFound();

  let build: ReturnType<typeof buildForBudget> = null;
  try {
    const ctx = await getEstimatorContext();
    build = buildForBudget(ctx, preset.montoCop);
  } catch {
    build = null;
  }

  const otros = PRESETS.filter((p) => p.slug !== preset.slug);

  const faqs = [
    {
      q: `¿Alcanza realmente para un PC gamer con ${preset.etiqueta}?`,
      a: preset.expectativa,
    },
    {
      q: "¿Estos precios incluyen el ensamblaje?",
      a: "Sí. El total incluye el servicio de armado, instalación del sistema, formateo y configuración. Recibes el equipo encendido y listo para usar.",
    },
    {
      q: "¿Los precios cambian?",
      a: "Sí. Las gráficas y procesadores son importados, así que el precio se mueve con el dólar. Esta página usa los precios que tenemos hoy en catálogo; el valor final se confirma por WhatsApp antes de comprar.",
    },
    {
      q: "¿Puedo cambiar algún componente de esta lista?",
      a: "Claro. Esta es una configuración de referencia dentro del presupuesto. En el cotizador puedes subir o bajar la gama de cada pieza y ver cómo cambia el total al instante.",
    },
    {
      q: "¿Hacen envíos fuera de Bogotá?",
      a: "Sí, enviamos a todo Colombia. En Bogotá coordinamos entrega directa; al resto del país por transportadora.",
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE_URL}/` },
          { name: "Cotizador", url: `${SITE_URL}/cotizador` },
          {
            name: `PC gamer por ${preset.etiqueta}`,
            url: `${SITE_URL}/pc-gamer/${preset.slug}`,
          },
        ]}
      />
      <PcBackdrop />

      <PageHero
        eyebrow={`Presupuesto · ${preset.etiqueta}`}
        title={`PC gamer por ${preset.etiqueta} en Colombia`}
        summary={[
          "Configuración armada con los precios que manejamos hoy en catálogo.",
          "El total ya incluye el servicio de ensamblaje.",
          "Puedes ajustar cualquier pieza en el cotizador.",
        ]}
        ctaLabel="Ajustar en el cotizador"
        ctaHref="/cotizador"
      >
        <p>{preset.expectativa}</p>
      </PageHero>

      {/* Configuración recomendada */}
      <section className="border-b border-hairline/50 bg-vanilla/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-balance text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-[-0.02em]">
            Qué se arma con {preset.etiqueta}
          </h2>

          {build && !build.excedePresupuesto ? (
            <>
              <p className="mt-3 max-w-2xl text-lg text-panda">
                Esta es la mejor configuración que cabe en el presupuesto con
                nuestros precios actuales, priorizando gráfica y procesador, que
                es donde más se nota la plata.
              </p>

              <dl className="mt-8 divide-y divide-hairline border-y border-hairline">
                {build.picks.map((p) => (
                  <div
                    key={p.categoria}
                    className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:gap-6"
                  >
                    <dt className="w-44 shrink-0 font-medium">{p.categoria}</dt>
                    <dd className="flex-1 text-sm text-component">
                      {p.opcion}
                    </dd>
                    <dd className="shrink-0 font-mono text-sm tabular-nums">
                      {formatCOP(p.precioCop)}
                    </dd>
                  </div>
                ))}
                <div className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:gap-6">
                  <dt className="w-44 shrink-0 font-medium">Ensamblaje</dt>
                  <dd className="flex-1 text-sm text-component">
                    Armado, formateo y configuración
                  </dd>
                  <dd className="shrink-0 font-mono text-sm tabular-nums">
                    {formatCOP(build.servicioBase)}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4 border border-panda p-6">
                <div>
                  <p className="font-mono text-sm text-component">
                    Total aproximado
                  </p>
                  <p className="mt-1 font-mono text-[clamp(1.75rem,5vw,2.5rem)] font-medium tabular-nums">
                    ≈ {formatCOP(build.total)}
                  </p>
                  <p className="mt-2 max-w-md text-sm text-component">
                    Estimado con los precios de hoy. No es el precio final: lo
                    confirmamos por WhatsApp según disponibilidad y dólar.
                  </p>
                </div>
                <ButtonLink
                  href={whatsappLink(
                    `Hola B & W, me interesa el PC gamer de ${preset.etiqueta}.`,
                  )}
                  size="lg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-accent text-accent-ink hover:bg-accent-deep"
                >
                  Confirmar por WhatsApp
                </ButtonLink>
              </div>
            </>
          ) : (
            <div className="mt-6 border border-hairline/50 p-8">
              <p className="max-w-xl text-panda">
                Con {preset.etiqueta} el presupuesto queda justo frente a los
                precios que manejamos hoy. Escríbenos y armamos una opción
                ajustada a lo que tienes disponible.
              </p>
              <ButtonLink
                href={whatsappLink(
                  `Hola B & W, quiero armar un PC con ${preset.etiqueta}.`,
                )}
                size="lg"
                className="mt-6"
                target="_blank"
                rel="noopener noreferrer"
              >
                Escribir por WhatsApp
              </ButtonLink>
            </div>
          )}
        </div>
      </section>

      {/* Para quién */}
      <section className="border-b border-hairline/50 bg-vanilla/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
            <h2 className="text-balance text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold tracking-[-0.02em]">
              Para quién es este equipo
            </h2>
            <div className="space-y-4 text-lg leading-relaxed text-panda">
              <p>{preset.paraQuien}</p>
              <p>
                Si tu uso es otro (edición, render, arquitectura) cambia el
                orden de prioridades: se invierte más en procesador y RAM que en
                gráfica. Cuéntanos para qué lo vas a usar y lo ajustamos.
              </p>
              <p>
                <Link href="/servicios" className="text-accent hover:underline">
                  Ver qué incluye el servicio de ensamblaje →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Otros presupuestos */}
      <section className="border-b border-hairline/50 bg-vanilla/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-balance text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold tracking-[-0.02em]">
            Otros presupuestos
          </h2>
          <div className="mt-8 grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
            {otros.map((o) => (
              <Link
                key={o.slug}
                href={`/pc-gamer/${o.slug}`}
                className="group bg-vanilla p-6 transition-colors hover:bg-component/20"
              >
                <p className="font-mono text-xs text-component">{o.etiqueta}</p>
                <h3 className="mt-2 text-lg font-semibold group-hover:text-accent">
                  PC gamer por {o.etiqueta} →
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-component">
                  {o.paraQuien}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FaqSection items={faqs} />

      {/* CTA */}
      <section className="bg-component/30">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-balance text-[clamp(1.5rem,4vw,2.25rem)] font-bold tracking-[-0.02em]">
              ¿Otro presupuesto en mente?
            </h2>
            <p className="mt-2 max-w-md text-pretty text-panda/70">
              Arma el tuyo componente por componente y mira el total en vivo.
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
