// Desarrollado por BlacKraken Solutions
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { AssemblyHero } from "@/components/assembly-hero";
import { collections } from "@/lib/db/collections";
import { isInstagramUrl } from "@/lib/instagram";

export const revalidate = 3600;

const steps = [
  {
    title: "Cotiza en la web",
    body: "Marca los componentes que quieres e ingresa tu presupuesto. Obtienes un estimado en segundos, sin registrarte.",
  },
  {
    title: "Confirma por WhatsApp",
    body: "Escríbenos con el resumen. Elegimos los modelos exactos y ajustamos el precio final contigo.",
  },
  {
    title: "Recibe tu equipo",
    body: "Armamos tu PC con cuidado y la entregamos lista para encender. Bogotá o envío a donde estés.",
  },
];

export default async function HomePage() {
  // Últimos 3 ensambles activos para la sección de muestra.
  let recentBuilds: { id: string; titulo: string; specs: string; imagenUrl: string }[] = [];
  try {
    const col = await collections.builds();
    const docs = await col
      .find({ activo: true })
      .sort({ orden: 1, creado: -1 })
      .limit(9)
      .toArray();
    recentBuilds = docs
      .filter((d) => !isInstagramUrl(d.imagenUrl))
      .slice(0, 3)
      .map((d) => ({
        id: d._id!.toString(),
        titulo: d.titulo,
        specs: d.specs,
        imagenUrl: d.imagenUrl,
      }));
  } catch {
    // fail silently
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "B & W",
    description:
      "Ensamble de computadores y venta de componentes en Colombia. Builds gaming, workstation y escritorio a la medida.",
    url: "https://bwpcs.vercel.app",
    telephone: "+573188422533",
    email: "bandwmount@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bogotá",
      addressRegion: "Cundinamarca",
      addressCountry: "CO",
    },
    areaServed: "Colombia",
    priceRange: "$$",
    knowsAbout: [
      "Ensamble de computadores",
      "Componentes de PC",
      "Gaming PCs",
      "Workstation",
      "Tarjetas gráficas",
      "Procesadores",
      "Memorias RAM",
    ],
    sameAs: ["https://www.instagram.com/bw_mountpc/"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero — PC line-art que se ensambla y queda fijo en el centro al hacer scroll */}
      <AssemblyHero>
        <p className="font-mono text-sm text-component">
          Ensamble &amp; componentes · Colombia
        </p>
        <h1 className="mt-4 text-balance text-[clamp(3rem,8vw,6rem)] font-extrabold leading-[0.95] tracking-[-0.04em]">
          <span className="relative inline-block whitespace-nowrap">
            Ensamblamos
            <span
              aria-hidden="true"
              className="bw-accent-mark absolute right-[-0.18em] top-[0.16em] h-[0.24em] w-[0.24em] bg-accent"
            />
          </span>
          <br />
          tu PC.
        </h1>
        <p className="mt-6 max-w-md text-pretty text-lg leading-relaxed text-panda">
          Armamos tu equipo con los componentes que elegimos contigo, al precio
          justo. ¿Solo necesitas una pieza? También.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/cotizador" size="lg">
            Cotiza tu PC
          </ButtonLink>
          <ButtonLink href="/servicios" size="lg" variant="secondary">
            Ver servicios
          </ButtonLink>
        </div>
      </AssemblyHero>

      {/* Lo que hacemos */}
      <section className="border-t border-hairline/50 bg-vanilla/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <h2 className="text-balance text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-[-0.02em]">
            Lo que hacemos
          </h2>
          <div className="mt-10 grid md:grid-cols-[3fr_2fr]">
            <div className="md:pr-12">
              <h3 className="text-balance text-2xl font-bold">
                Ensamblaje a la medida
              </h3>
              <p className="mt-4 max-w-prose text-pretty leading-relaxed text-panda">
                Seleccionamos cada componente según tu uso y presupuesto.
                Armamos, formateamos y configuramos tu equipo desde cero. Entrega
                con todo funcionando.
              </p>
              <p className="mt-5 font-mono text-sm text-component">
                GPU · CPU · RAM · Board · Fuente · Chasis · Refrigeración
              </p>
            </div>
            <div className="mt-10 border-t border-hairline/50 pt-10 md:mt-0 md:border-l md:border-t-0 md:pl-12 md:pt-0">
              <h3 className="text-balance text-xl font-semibold">
                Componentes sueltos
              </h3>
              <p className="mt-4 text-pretty leading-relaxed text-panda">
                Compramos por ti al mejor precio. Gráficas, procesadores, RAM,
                boards, fuentes, chasis y refrigeración. Una pieza o todas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ensambles recientes — solo aparece si hay builds cargados */}
      {recentBuilds.length > 0 && (
        <section className="border-t border-hairline/50 bg-vanilla/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-balance text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-[-0.02em]">
                Ensambles recientes
              </h2>
              <Link
                href="/ensambles"
                className="shrink-0 text-sm text-component hover:text-panda hover:underline"
              >
                Ver todos →
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
              {recentBuilds.map((b) => (
                <Link key={b.id} href="/ensambles" className="group">
                  <div className="aspect-square overflow-hidden border border-hairline/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.imagenUrl}
                      alt={b.titulo}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3">
                    <p className="font-semibold leading-tight">{b.titulo}</p>
                    {b.specs && (
                      <p className="mt-1 font-mono text-xs text-component">
                        {b.specs}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cómo funciona */}
      <section className="border-t border-hairline/50 bg-vanilla/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-balance text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-[-0.02em]">
            Cómo funciona
          </h2>
          <ol className="mt-8 border-b border-hairline">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="border-t border-hairline py-6 md:grid md:grid-cols-[2.5rem_1fr_2fr] md:items-baseline md:gap-8"
              >
                <span
                  aria-hidden="true"
                  className="block font-mono text-xs font-medium text-component tabular-nums"
                >
                  {i + 1}
                </span>
                <h3 className="mt-2 text-lg font-semibold md:mt-0">
                  {step.title}
                </h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-panda md:mt-0">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA cotizador */}
      <section className="border-t border-hairline/50 bg-component/30">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-balance text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-[-0.02em]">
              ¿Cuánto costaría tu PC?
            </h2>
            <p className="mt-2 max-w-md text-pretty text-panda/70">
              Arma un estimado en segundos y escríbenos por WhatsApp para
              afinar los detalles.
            </p>
          </div>
          <ButtonLink
            href="/cotizador"
            size="lg"
            className="bg-accent text-accent-ink hover:bg-accent-deep"
          >
            Empezar a cotizar
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
