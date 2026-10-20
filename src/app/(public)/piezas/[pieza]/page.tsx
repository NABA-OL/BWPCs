/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-11
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Página de una pieza a fondo (docs/piezas-plan.md §5.1 y docs/piezas-plan-2.md §2.3). Sirve a las 7 piezas: recorre `contenido.bloques` en el
// orden declarado. 100 % estática: contenido y geometría viven en git (`lib/piezas`). Sin BD, sin sharp, sin sesión.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { FaqSection } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { SectionNav } from "@/components/section-nav";
import { FactoresForma } from "@/components/piezas/factores-forma";
import { PiezaCasos } from "@/components/piezas/pieza-casos";
import { PiezaComparacion } from "@/components/piezas/pieza-comparacion";
import { PiezaCriterios } from "@/components/piezas/pieza-criterios";
import { PiezaExplorador } from "@/components/piezas/pieza-explorador";
import { PiezaNombres } from "@/components/piezas/pieza-nombres";
import { PiezaPartes } from "@/components/piezas/pieza-partes";
import { PiezaVistas } from "@/components/piezas/pieza-vistas";
import { TowerBackdrop } from "@/components/tower-hero";
import { ButtonLink } from "@/components/ui/button";
import { entornoActual } from "@/lib/piezas/entorno";
import { bloquesVisibles, fechaRevision, fuentesGenerales, navDePieza } from "@/lib/piezas/pagina";
import { hayIndice, piezaPorSlug, piezasVisibles } from "@/lib/piezas/registro";
import type { BloqueId, Fuente, Hecho, ParteResumen, PiezaContenido, PiezaGeo, SeccionTexto, VistaExplorador } from "@/lib/piezas/types";
import { SITE_URL } from "@/lib/schema";
import { siteConfig } from "@/lib/site-config";

export const dynamicParams = false;

const SCROLL_BAJO_ENCABEZADO = { scrollMarginTop: "5rem" } as const; // el encabezado fijo mide 64 px
const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-panda";
const ENLACE = `${FOCO} font-medium text-panda underline underline-offset-4`;
const CONTENEDOR = "mx-auto max-w-6xl px-4 py-16 sm:px-6";
const TITULO_SECCION = "text-balance text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold tracking-[-0.02em]";

type Contenido = PiezaContenido<string, string>;
type Geo = PiezaGeo<string, string>;

interface PiezaPageProps {
  params: Promise<{ pieza: string }>;
}

export function generateStaticParams(): { pieza: string }[] {
  return piezasVisibles(entornoActual()).map((p) => ({ pieza: p.contenido.slug }));
}

export async function generateMetadata({ params }: PiezaPageProps): Promise<Metadata> {
  const { pieza: slug } = await params;
  const pieza = piezaPorSlug(slug, entornoActual());
  if (!pieza) return {};
  const { contenido, geo } = pieza;

  return {
    title: contenido.titulo,
    description: contenido.descripcion,
    keywords: [...contenido.palabrasClave],
    alternates: { canonical: `/piezas/${contenido.slug}` },
    openGraph: {
      title: `${contenido.titulo} · B & W`,
      description: contenido.descripcion,
      url: `${SITE_URL}/piezas/${contenido.slug}`,
      type: "article",
      // La imagen OG sale de BWReel junto con el dibujo: sin geometría todavía no existe y se usa la del sitio.
      ...(geo ? { images: [{ url: imagenOg(contenido), width: 1200, height: 630 }] } : {}),
    },
    ...(contenido.estado !== "publicado" ? { robots: { index: false, follow: false } } : {}),
  };
}

/* ---------- Datos derivados del contenido ---------- */

const imagenOg = (contenido: Contenido): string => `${SITE_URL}/piezas/${contenido.slug}-og.jpg`;

function aResumenes(contenido: Contenido): readonly ParteResumen[] {
  return Object.entries(contenido.partes)
    .sort(([, a], [, b]) => a.orden - b.orden)
    .map(([id, p]) => ({
      id,
      orden: p.orden,
      nombre: p.nombre,
      nombreCorto: p.nombreCorto,
      resumen: p.resumen,
      ...(p.vistas ? { vistas: p.vistas } : {}),
      ...(p.opciones && p.opciones.items.length > 0 ? { chips: p.opciones.items.map((o) => o.etiqueta) } : {}),
    }));
}

function articleSchema(contenido: Contenido, conDibujo: boolean) {
  const url = `${SITE_URL}/piezas/${contenido.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: contenido.h1,
    description: contenido.descripcion,
    inLanguage: "es-CO",
    keywords: contenido.palabrasClave.join(", "),
    datePublished: contenido.publicadoEn ?? contenido.actualizadoEn,
    dateModified: fechaRevision(contenido),
    ...(conDibujo ? { image: imagenOg(contenido) } : {}),
    author: { "@type": "Organization", name: siteConfig.name, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/logo-solo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

const conMayuscula = (texto: string): string => texto.charAt(0).toUpperCase() + texto.slice(1);

/* ---------- Piezas de la página ---------- */

function ListaDatos({ hechos }: { hechos: readonly Hecho[] }) {
  return (
    <dl className="mt-6 space-y-2">
      {hechos.map((h, i) => (
        <div key={h.id}>
          <dt className={h.etiqueta ? "mb-1 text-xs font-medium text-component" : "sr-only"}>{h.etiqueta ?? `Dato ${i + 1}`}</dt>
          <dd className="m-0 border-l-2 border-hairline pl-3 font-mono text-sm text-panda">{h.texto}</dd>
        </div>
      ))}
    </dl>
  );
}

function CuerpoSeccion({ parrafos, vinetas, hechos }: Pick<SeccionTexto, "parrafos" | "vinetas" | "hechos">) {
  return (
    <>
      <div className="mt-4 max-w-prose space-y-4 text-lg leading-relaxed text-panda">
        {parrafos.map((p) => (
          <p key={p.slice(0, 48)}>{p}</p>
        ))}
      </div>
      {vinetas && vinetas.length > 0 ? (
        <ul className="mt-5 max-w-prose list-disc space-y-2 pl-5 text-panda marker:text-component">
          {vinetas.map((v) => (
            <li key={v.slice(0, 48)}>{v}</li>
          ))}
        </ul>
      ) : null}
      {hechos && hechos.length > 0 ? <ListaDatos hechos={hechos} /> : null}
    </>
  );
}

/** Sección de texto (elegir, errores…). `extra` va después del cuerpo: los casos del taller o los criterios de B & W. */
function SeccionTextual({ seccion, extra }: { seccion: SeccionTexto; extra?: ReactNode }) {
  const tituloId = `${seccion.id}-titulo`;
  return (
    <section id={seccion.id} aria-labelledby={tituloId} className="border-b border-hairline/50" style={SCROLL_BAJO_ENCABEZADO}>
      <div className={CONTENEDOR}>
        <h2 id={tituloId} className={TITULO_SECCION}>
          {seccion.titulo}
        </h2>
        <CuerpoSeccion parrafos={seccion.parrafos} vinetas={seccion.vinetas} hechos={seccion.hechos} />
        {extra}
      </div>
    </section>
  );
}

/** Tamaños: el primer párrafo es el aviso destacado (el tamaño no define la calidad) y va junto al dibujo a escala. */
function SeccionTamanos({ seccion, contenido }: { seccion: SeccionTexto; contenido: Contenido }) {
  const factores = contenido.factoresForma ?? [];
  const [mensaje, ...resto] = seccion.parrafos;
  return (
    <section id="tamanos" aria-labelledby="tamanos-titulo" className="border-b border-hairline/50" style={SCROLL_BAJO_ENCABEZADO}>
      <div className={CONTENEDOR}>
        <h2 id="tamanos-titulo" className={TITULO_SECCION}>
          {seccion.titulo}
        </h2>
        {factores.length > 0 && mensaje ? (
          <div className="mt-6">
            <FactoresForma factores={factores} mensaje={mensaje} />
          </div>
        ) : null}
        <CuerpoSeccion parrafos={factores.length > 0 && mensaje ? resto : seccion.parrafos} vinetas={seccion.vinetas} hechos={seccion.hechos} />
      </div>
    </section>
  );
}

/** Vistas del contenido que tienen dibujo, listas para el explorador (las que BWReel aún no generó se omiten). */
function aVistasExplorador(contenido: Contenido, geo: Geo): readonly VistaExplorador[] {
  return contenido.vistas.flatMap((v) =>
    Object.prototype.hasOwnProperty.call(geo.vistas, v.id)
      ? [{ id: v.id, etiqueta: v.etiqueta, geo: geo.vistas[v.id], etiquetaFigura: v.etiquetaFigura, notas: Object.fromEntries(Object.entries(v.notasPorParte ?? {}).filter((par): par is [string, string] => typeof par[1] === "string")) }]
      : [],
  );
}

/** Explorador de partes. Solo se monta con dibujo (`geo`); sin él, `bloquesVisibles` no incluye este bloque y queda la lista de partes. */
function SeccionExplorador({ contenido, geo }: { contenido: Contenido; geo: Geo }) {
  const vistas = aVistasExplorador(contenido, geo);
  return (
    <section id="partes" aria-labelledby="partes-titulo" className="border-b border-hairline/50" style={SCROLL_BAJO_ENCABEZADO}>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <h2 id="partes-titulo" className="sr-only">
          Explora las partes
        </h2>
        <div className="border border-hairline bg-vanilla p-3 sm:p-6">
          {vistas.length > 0 ? (
            <PiezaExplorador slug={contenido.slug} vistas={vistas} partes={aResumenes(contenido)} selectorTitulo={contenido.selectorVistas} />
          ) : (
            <p className="font-mono text-sm text-component">El dibujo de esta pieza está en preparación.</p>
          )}
        </div>
      </div>
    </section>
  );
}

/** Vistas: cada una con su figura, su resumen y sus criterios. Es el respaldo sin JS del selector del explorador. */
function SeccionVistas({ contenido, geo }: { contenido: Contenido; geo: Geo | null }) {
  return (
    <section id="vistas" aria-labelledby="vistas-titulo" className="border-b border-hairline/50" style={SCROLL_BAJO_ENCABEZADO}>
      <div className={CONTENEDOR}>
        <h2 id="vistas-titulo" className={TITULO_SECCION}>
          Las vistas, una por una
        </h2>
        <PiezaVistas contenido={contenido} geo={geo} />
      </div>
    </section>
  );
}

function SeccionComparar({ contenido }: { contenido: Contenido }) {
  const etiquetas = Object.fromEntries(contenido.vistas.map((v) => [v.id, v.etiqueta]));
  return (
    <section id="comparar" aria-labelledby="comparar-titulo" className="border-b border-hairline/50" style={SCROLL_BAJO_ENCABEZADO}>
      <div className={CONTENEDOR}>
        <h2 id="comparar-titulo" className={TITULO_SECCION}>
          Compara lado a lado
        </h2>
        <div className="mt-6 space-y-8">
          {(contenido.comparaciones ?? []).map((comparacion) => (
            <PiezaComparacion key={comparacion.id} comparacion={comparacion} etiquetas={etiquetas} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FuentesGenerales({ fuentes }: { fuentes: readonly Fuente[] }) {
  if (fuentes.length === 0) return null;
  return (
    <section id="fuentes" className="border-b border-hairline/50" style={SCROLL_BAJO_ENCABEZADO}>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <details className="border border-hairline px-3 py-2">
          <summary className={`${FOCO} cursor-pointer text-sm font-medium text-panda`}>Fuentes de esta página</summary>
          <ul className="mt-2 space-y-2 text-sm text-component">
            {fuentes.map((f) => (
              <li key={f.url}>
                {f.url.startsWith("https://") ? (
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className={ENLACE}>
                    {f.titulo}
                  </a>
                ) : (
                  <span className="text-panda">{f.titulo}</span>
                )}
                <span>
                  {" "}
                  · {f.editor} · consultado el <span className="font-mono">{f.consultadoEn}</span>
                </span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}

/** Pinta un bloque de la pieza. Los ids de sección salen de `NAV_POR_BLOQUE` (lib/piezas/pagina.ts): cámbialos en los dos lados. */
function Bloque({ bloque, contenido, geo }: { bloque: BloqueId; contenido: Contenido; geo: Geo | null }) {
  const seccion = (id: string): SeccionTexto | undefined => contenido.secciones.find((s) => s.id === id);
  switch (bloque) {
    case "nombres":
      return contenido.decodificador ? <PiezaNombres datos={contenido.decodificador} seccion={seccion("nombres")} /> : null;
    case "partes":
      return geo ? <SeccionExplorador contenido={contenido} geo={geo} /> : null;
    case "lista":
      return (
        <div className="border-b border-hairline/50">
          <div className={CONTENEDOR}>
            <PiezaPartes contenido={contenido} />
          </div>
        </div>
      );
    case "vistas":
      return <SeccionVistas contenido={contenido} geo={geo} />;
    case "comparar":
      return <SeccionComparar contenido={contenido} />;
    case "tamanos": {
      const tamanos = seccion("tamanos");
      return tamanos ? <SeccionTamanos seccion={tamanos} contenido={contenido} /> : null;
    }
    case "elegir": {
      const elegir = seccion("elegir");
      return elegir ? <SeccionTextual seccion={elegir} extra={<PiezaCriterios sueltos={contenido.criterios} nivel={3} />} /> : null;
    }
    case "errores": {
      const errores = seccion("errores");
      return errores ? <SeccionTextual seccion={errores} extra={<PiezaCasos casos={contenido.casos ?? []} />} /> : null;
    }
    case "preguntas":
      return contenido.faq && contenido.faq.length > 0 ? (
        <div id="preguntas" style={SCROLL_BAJO_ENCABEZADO}>
          <FaqSection items={[...contenido.faq]} />
        </div>
      ) : null;
  }
}

export default async function PiezaPage({ params }: PiezaPageProps) {
  const { pieza: slug } = await params;
  const entorno = entornoActual();
  const pieza = piezaPorSlug(slug, entorno);
  if (!pieza) notFound();

  const { contenido, geo } = pieza;
  const publicado = contenido.estado === "publicado";
  const conDibujo = geo !== null;
  const bloques = bloquesVisibles(contenido, conDibujo);
  const navItems = [...navDePieza(contenido, conDibujo)];
  const fuentes = fuentesGenerales(contenido);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE_URL}/` },
          // El paso intermedio solo existe cuando hay índice /piezas (2 o más piezas visibles).
          ...(hayIndice(entorno) ? [{ name: "Piezas del PC", url: `${SITE_URL}/piezas` }] : []),
          { name: contenido.nombreCorto, url: `${SITE_URL}/piezas/${contenido.slug}` },
        ]}
      />
      <JsonLd data={articleSchema(contenido, conDibujo)} />
      <TowerBackdrop />
      <SectionNav items={navItems} />

      <div id="inicio">
        <PageHero
          eyebrow={`${conMayuscula(contenido.eyebrow)} · revisado ${fechaRevision(contenido)}`}
          title={contenido.h1}
          ctaLabel="Cotiza tu PC"
          ctaHref="/cotizador"
        >
          {contenido.intro.map((p) => (
            <p key={p.slice(0, 48)} className="mt-4 first:mt-0">
              {p}
            </p>
          ))}
        </PageHero>
      </div>

      {publicado ? null : (
        <div role="note" className="border-b border-hairline bg-vanilla">
          <p className="mx-auto max-w-6xl px-4 py-3 font-mono text-sm text-panda sm:px-6">
            <span className="font-semibold">Borrador: no publicado.</span> Esta página solo se ve fuera de producción y no se indexa.
          </p>
        </div>
      )}

      {bloques.map((bloque) => (
        <Bloque key={bloque} bloque={bloque} contenido={contenido} geo={geo} />
      ))}

      <FuentesGenerales fuentes={fuentes} />

      <section id="cotizar" className="bg-component/30" style={SCROLL_BAJO_ENCABEZADO}>
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-balance text-[clamp(1.5rem,4vw,2.25rem)] font-bold tracking-[-0.02em]">{contenido.cta.titulo}</h2>
            <p className="mt-2 max-w-md text-pretty text-panda/70">{contenido.cta.texto}</p>
            <p className="mt-3 text-sm">
              <Link href="/guias" className={ENLACE}>
                Ver las guías para armar tu PC
              </Link>
            </p>
          </div>
          <ButtonLink href={contenido.cta.href} size="lg" className="bg-accent text-accent-ink hover:bg-accent-deep">
            {contenido.cta.etiqueta}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
