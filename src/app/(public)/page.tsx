/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { TowerHero } from "@/components/tower-hero";
import { ShareButton } from "@/components/share-button";
import { collections } from "@/lib/db/collections";
import { isInstagramUrl } from "@/lib/instagram";
import { JsonLd } from "@/components/json-ld";
import { localBusinessSchema, websiteSchema } from "@/lib/schema";
import { SectionNav } from "@/components/section-nav";
import { ReviewsSection } from "@/components/reviews/reviews-section";
import { getApprovedReviews, getReviewStats } from "@/lib/reviews/reviews";
import { ACCOUNTS_ENABLED } from "@/lib/user-auth/enabled";
import { entornoActual } from "@/lib/piezas/entorno";
import { enlacesInicio } from "@/lib/piezas/indice";
import { hayIndice } from "@/lib/piezas/registro";
import { ARMADO_CORTO, ARMADO_TITULO } from "@/lib/service-promise";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 3600;

const entornoPiezas = entornoActual();
/** Palabras de la línea de piezas con su página "a fondo"; sin ninguna visible (producción con borradores) la línea queda como texto plano. */
const palabrasPiezas = enlacesInicio(entornoPiezas);
const hayEnlacesPiezas = palabrasPiezas.some((p) => p.href !== null);

const trust = [
  {
    title: "Garantía",
    body: "Cada componente lleva la garantía de su fabricante, y el ensamblaje queda cubierto por nosotros.",
  },
  {
    title: ARMADO_TITULO,
    body: ARMADO_CORTO,
  },
  {
    title: "Pagos seguros",
    body: "Pagas con Bre-B o con tarjeta en la pasarela segura de Bold. Los datos de tu tarjeta nunca pasan por nosotros.",
  },
  {
    title: "Todo por escrito",
    body: "Recibes una cotización formal en PDF con cada componente y su precio, y una cuenta de cobro numerada por tu compra.",
  },
];

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
  let recentBuilds: {
    id: string;
    titulo: string;
    specs: string;
    imagenUrl: string;
  }[] = [];
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

  // Reseñas aprobadas: solo con cuentas activas; si algo falla, la sección se omite.
  let reviews: Awaited<ReturnType<typeof getApprovedReviews>> = [];
  let reviewStats = { count: 0, average: 0 };
  if (ACCOUNTS_ENABLED) {
    try {
      [reviews, reviewStats] = await Promise.all([
        getApprovedReviews(12),
        getReviewStats(),
      ]);
    } catch {
      // fail silently
    }
  }

  // Secciones del indicador lateral, en el mismo orden y con las mismas condiciones que la página.
  const navItems = [
    { id: "inicio", label: "Inicio" },
    { id: "confianza", label: "Confianza" },
    { id: "hacemos", label: "Lo que hacemos" },
    ...(recentBuilds.length > 0 ? [{ id: "ensambles", label: "Ensambles" }] : []),
    { id: "funciona", label: "Cómo funciona" },
    ...(reviews.length > 0 ? [{ id: "opiniones", label: "Opiniones" }] : []),
    ...(ACCOUNTS_ENABLED ? [{ id: "cuenta", label: "Tu cuenta" }] : []),
    { id: "cotizar", label: "Cotizar" },
  ];

  return (
    <>
      <JsonLd data={localBusinessSchema()} />
      <JsonLd data={websiteSchema()} />
      {/* Indicador de sección (margen izquierdo, pantallas anchas) */}
      <SectionNav items={navItems} />

      {/* Hero — PC line-art que se ensambla y queda fijo en el centro al hacer scroll */}
      <div id="inicio">
        <TowerHero>
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
            tu PC a la medida.
          </h1>
          <p className="mt-6 max-w-md text-pretty text-lg leading-relaxed text-panda">
            Armamos tu equipo con los componentes que elegimos contigo, al precio
            justo. ¿Solo necesitas una pieza? También.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={siteConfig.contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de B & W (@bw_mountpc)"
                className="inline-flex items-center justify-center self-start rounded-[2px] bg-accent p-4 text-accent-ink transition-colors hover:bg-accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-panda sm:self-auto"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4.2" />
                  <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <ButtonLink href="/cotizador" size="lg">
                Cotiza tu PC
              </ButtonLink>
              <ButtonLink href="/servicios" size="lg" variant="secondary">
                Ver servicios
              </ButtonLink>
            </div>
            <ShareButton title="B & W — Tu PC Master Race a buen precio" />
          </div>
        </TowerHero>
      </div>

      {/* Confianza: lo que respalda la compra (todo lo que dice ya es política del negocio) */}
      <section
        id="confianza"
        aria-labelledby="confianza-titulo"
        className="border-t border-hairline/50 bg-vanilla/40"
      >
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 id="confianza-titulo" className="text-balance text-xl font-bold">
            Compra con tranquilidad
          </h2>
          <ul className="mt-6 grid gap-x-10 gap-y-6 border-y border-hairline py-6 sm:grid-cols-2 lg:grid-cols-4">
            {trust.map((item) => (
              <li key={item.title}>
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-panda">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Lo que hacemos */}
      <section id="hacemos" className="border-t border-hairline/50 bg-vanilla/40">
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
                Armamos, formateamos y configuramos tu equipo desde cero.
                Entrega con todo funcionando.
              </p>
              <p className="mt-5 font-mono text-sm text-component">
                {hayEnlacesPiezas ? (
                  <>
                    {palabrasPiezas.map((p, i) => (
                      <span key={p.palabra}>
                        {i > 0 && " · "}
                        {p.href ? (
                          <Link href={p.href} className="underline underline-offset-4 hover:text-panda">
                            {p.palabra}
                          </Link>
                        ) : (
                          p.palabra
                        )}
                      </span>
                    ))}
                    {hayIndice(entornoPiezas) ? (
                      <span className="mt-2 block font-sans">
                        <Link href="/piezas" className="underline underline-offset-4 hover:text-panda">
                          Conoce cada pieza por dentro →
                        </Link>
                      </span>
                    ) : null}
                  </>
                ) : (
                  "GPU · CPU · RAM · Board · Fuente · Chasis · Refrigeración"
                )}
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
        <section id="ensambles" className="border-t border-hairline/50 bg-vanilla/40">
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
                      loading="lazy"
                      decoding="async"
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
      <section id="funciona" className="border-t border-hairline/50 bg-vanilla/40">
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

      {/* Reseñas de clientes — solo aparece si hay aprobadas */}
      {reviews.length > 0 && (
        <div id="opiniones">
          <ReviewsSection
            reviews={reviews}
            count={reviewStats.count}
            average={reviewStats.average}
          />
        </div>
      )}

      {/* Tu cuenta: explica para qué sirve la cuenta y el inicio de sesión con Google (requisito de verificación de Google) */}
      {ACCOUNTS_ENABLED && (
        <section id="cuenta" className="border-t border-hairline/50 bg-vanilla/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-balance text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-[-0.02em]">
              Tu cuenta en B &amp; W
            </h2>
            <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-panda">
              B &amp; W ensambla computadores a la medida y vende componentes en Colombia.
              Con una cuenta, que puedes crear con tu correo o con Google, guardas tus
              cotizaciones, ves su estado, pides cambios, sigues tus cuentas de cobro y
              dejas una reseña de tu compra. Si entras con Google solo usamos tu nombre y
              tu correo para crear y abrir tu cuenta; no los compartimos ni los usamos para
              publicidad. Más detalles en la{" "}
              <Link href="/privacidad" className="text-accent hover:underline">
                política de privacidad
              </Link>
              .
            </p>
          </div>
        </section>
      )}

      {/* CTA cotizador */}
      <section id="cotizar" className="border-t border-hairline/50 bg-component/30">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-balance text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-[-0.02em]">
              ¿Cuánto costaría tu PC?
            </h2>
            <p className="mt-2 max-w-md text-pretty text-panda/70">
              Arma un estimado en segundos y escríbenos por WhatsApp para afinar
              los detalles.
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
