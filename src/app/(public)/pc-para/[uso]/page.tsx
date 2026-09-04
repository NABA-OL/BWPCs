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
import { whatsappLink } from "@/lib/site-config";
import { SITE_URL } from "@/lib/schema";

export const revalidate = 3600;

interface UseCase {
  slug: string;
  titulo: string;
  h1: string;
  intro: string;
  /** Qué componente pesa más en este uso y por qué. Orden = prioridad de inversión. */
  prioridades: { pieza: string; porque: string }[];
  errorComun: string;
  keywords: string[];
}

const USE_CASES: UseCase[] = [
  {
    slug: "edicion-de-video",
    titulo: "PC para edición de video en Colombia",
    h1: "PC para edición de video",
    intro:
      "Editar video castiga cosas distintas a jugar. La línea de tiempo se traba por falta de RAM y por discos lentos mucho antes que por la gráfica, y el render depende del procesador tanto como de la GPU.",
    prioridades: [
      {
        pieza: "RAM",
        porque:
          "32 GB es el punto donde Premiere y DaVinci dejan de pelear con la línea de tiempo en 4K. Con 16 GB se puede editar 1080p, pero se sufre en cuanto hay capas y efectos.",
      },
      {
        pieza: "Almacenamiento",
        porque:
          "SSD NVMe para el proyecto activo, no un disco mecánico. El scrubbing por la línea de tiempo lee muchísimo, y ahí es donde se siente la diferencia.",
      },
      {
        pieza: "Procesador",
        porque:
          "Los núcleos mandan en el render y en la exportación. Un procesador de gama media alta rinde más que subir de gráfica si tu trabajo es cortar y exportar.",
      },
      {
        pieza: "Gráfica",
        porque:
          "Importa para efectos, aceleración de códecs y previsualización, pero no necesitas la gama entusiasta: una gama media con buena VRAM suele ser suficiente.",
      },
    ],
    errorComun:
      "Gastar todo el presupuesto en la gráfica más cara y quedarse con 16 GB de RAM y un SSD de 500 GB. En edición, eso se traduce en esperas todos los días.",
    keywords: [
      "pc para edición de video colombia",
      "computador para editar video bogotá",
      "pc para premiere davinci colombia",
      "workstation edición video colombia",
    ],
  },
  {
    slug: "arquitectura-y-render",
    titulo: "PC para arquitectura y renderizado en Colombia",
    h1: "PC para arquitectura y render",
    intro:
      "AutoCAD, Revit, SketchUp y los motores de render no piden lo mismo. El modelado depende de la potencia por núcleo; el render final, de cuántos núcleos tengas o de la gráfica, según el motor que uses.",
    prioridades: [
      {
        pieza: "Procesador",
        porque:
          "Revit y AutoCAD dependen mucho del rendimiento de un solo núcleo al modelar. Un procesador de gama alta se nota en la fluidez del día a día, no solo en el render.",
      },
      {
        pieza: "RAM",
        porque:
          "32 GB como base para proyectos con familias pesadas o modelos federados. Con 16 GB los archivos grandes empiezan a paginar a disco.",
      },
      {
        pieza: "Gráfica",
        porque:
          "Si renderizas con motores por GPU (V-Ray GPU, Lumion, Enscape, Twinmotion) la gráfica pasa a ser lo primero. Si renderizas por CPU, baja de prioridad.",
      },
      {
        pieza: "Almacenamiento",
        porque:
          "SSD NVMe para los proyectos activos. Abrir un modelo pesado desde disco mecánico cuesta minutos cada vez.",
      },
    ],
    errorComun:
      "Comprar pensando solo en el render y descuidar el procesador: el 90% del tiempo estás modelando, no renderizando.",
    keywords: [
      "pc para arquitectura colombia",
      "computador para revit autocad bogotá",
      "pc para renderizado colombia",
      "workstation a la medida colombia",
    ],
  },
  {
    slug: "streaming",
    titulo: "PC para streaming en Colombia",
    h1: "PC para streaming",
    intro:
      "Transmitir y jugar en la misma máquina es pedirle dos trabajos al mismo equipo. La clave está en el codificador: si usas el encoder de la gráfica, el procesador queda libre para el juego.",
    prioridades: [
      {
        pieza: "Gráfica",
        porque:
          "El codificador por hardware (NVENC en NVIDIA, AV1 en las generaciones recientes) hace el trabajo pesado de la transmisión sin robarle cuadros al juego. Es la pieza que más define la calidad del stream.",
      },
      {
        pieza: "Procesador",
        porque:
          "Necesitas núcleos de sobra para el juego, OBS, el chat y el navegador al tiempo. Gama media alta en adelante.",
      },
      {
        pieza: "RAM",
        porque:
          "32 GB deja espacio para el juego, OBS y todo lo que tengas abierto sin que el sistema empiece a recortar.",
      },
      {
        pieza: "Refrigeración",
        porque:
          "Transmitir mantiene el equipo cargado durante horas seguidas, no en picos. Buena refrigeración es lo que evita que baje el rendimiento a mitad de stream.",
      },
    ],
    errorComun:
      "Armar un equipo pensado solo para jugar y descubrir en la primera transmisión que el juego pierde cuadros apenas se abre OBS.",
    keywords: [
      "pc para streaming colombia",
      "computador para stream bogotá",
      "pc para obs twitch colombia",
      "pc gamer streaming a la medida",
    ],
  },
];

function findUseCase(slug: string) {
  return USE_CASES.find((u) => u.slug === slug);
}

export function generateStaticParams() {
  return USE_CASES.map((u) => ({ uso: u.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uso: string }>;
}): Promise<Metadata> {
  const { uso } = await params;
  const caso = findUseCase(uso);
  if (!caso) return {};

  return {
    title: caso.titulo,
    description: `${caso.intro.slice(0, 145)}…`,
    keywords: caso.keywords,
    alternates: { canonical: `/pc-para/${caso.slug}` },
    openGraph: {
      title: `${caso.titulo} · B & W`,
      description: caso.intro.slice(0, 150),
      url: `${SITE_URL}/pc-para/${caso.slug}`,
    },
  };
}

export default async function PcParaUsoPage({
  params,
}: {
  params: Promise<{ uso: string }>;
}) {
  const { uso } = await params;
  const caso = findUseCase(uso);
  if (!caso) notFound();

  const otros = USE_CASES.filter((u) => u.slug !== caso.slug);

  const faqs = [
    {
      q: `¿Cuánto cuesta un ${caso.h1.toLowerCase()}?`,
      a: "Depende de la gama de cada pieza. En el cotizador puedes elegir gama por categoría y ver el total aproximado al instante, sin registrarte. El precio final lo confirmamos por WhatsApp.",
    },
    {
      q: "¿Puedo aprovechar componentes que ya tengo?",
      a: "Sí. Si ya tienes chasis, fuente o almacenamiento, los revisamos y te cotizamos solo lo que falta. No te vendemos piezas que no necesitas.",
    },
    {
      q: "¿El equipo viene listo para trabajar?",
      a: "Sí. Armamos, instalamos el sistema, formateamos y configuramos. Lo entregamos encendido y probado, con las temperaturas verificadas.",
    },
    {
      q: "¿Hacen envíos a todo el país?",
      a: "Sí. En Bogotá coordinamos entrega directa; al resto de Colombia por transportadora.",
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE_URL}/` },
          { name: "Servicios", url: `${SITE_URL}/servicios` },
          { name: caso.h1, url: `${SITE_URL}/pc-para/${caso.slug}` },
        ]}
      />
      <PcBackdrop />

      <PageHero
        eyebrow="Por caso de uso"
        title={caso.h1}
        summary={caso.prioridades.map(
          (p) => `${p.pieza}: ${p.porque.split(".")[0]}.`,
        )}
        ctaLabel="Cotiza tu equipo"
        ctaHref="/cotizador"
      >
        <p>{caso.intro}</p>
      </PageHero>

      {/* Prioridades de inversión */}
      <section className="border-b border-hairline/50 bg-vanilla/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-balance text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-[-0.02em]">
            Dónde poner la plata
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-panda">
            En orden de impacto real para este uso. Si el presupuesto aprieta,
            recorta de abajo hacia arriba.
          </p>

          <ol className="mt-8 border-b border-hairline">
            {caso.prioridades.map((p, i) => (
              <li
                key={p.pieza}
                className="border-t border-hairline py-6 md:grid md:grid-cols-[2.5rem_1fr_2fr] md:items-baseline md:gap-8"
              >
                <span
                  aria-hidden="true"
                  className="block font-mono text-xs font-medium text-component tabular-nums"
                >
                  {i + 1}
                </span>
                <h3 className="mt-2 text-lg font-semibold md:mt-0">
                  {p.pieza}
                </h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-panda md:mt-0">
                  {p.porque}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Error común */}
      <section className="border-b border-hairline/50 bg-vanilla/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
            <h2 className="text-balance text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold tracking-[-0.02em]">
              El error que más vemos
            </h2>
            <div className="space-y-4 text-lg leading-relaxed text-panda">
              <p>{caso.errorComun}</p>
              <p>
                Por eso preguntamos primero para qué vas a usar el equipo. La
                misma plata bien repartida rinde mucho más.
              </p>
              <p>
                <Link href="/servicios" className="text-accent hover:underline">
                  Ver cómo trabajamos paso a paso →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Otros usos */}
      <section className="border-b border-hairline/50 bg-vanilla/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-balance text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold tracking-[-0.02em]">
            Otros usos
          </h2>
          <div className="mt-8 grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
            {otros.map((o) => (
              <Link
                key={o.slug}
                href={`/pc-para/${o.slug}`}
                className="group bg-vanilla p-6 transition-colors hover:bg-component/20"
              >
                <h3 className="text-lg font-semibold group-hover:text-accent">
                  {o.h1} →
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-component">
                  {o.intro.split(".")[0]}.
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
              Cuéntanos tu caso
            </h2>
            <p className="mt-2 max-w-md text-pretty text-panda/70">
              Con qué programas trabajas y qué presupuesto tienes. Con eso
              armamos la configuración correcta.
            </p>
          </div>
          <ButtonLink
            href={whatsappLink(
              `Hola B & W, busco un ${caso.h1.toLowerCase()}.`,
            )}
            size="lg"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent text-accent-ink hover:bg-accent-deep"
          >
            Escribir por WhatsApp
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
