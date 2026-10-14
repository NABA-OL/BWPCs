/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-11
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Página de una pieza a fondo (docs/piezas-plan.md §5.1). 100 % estática: contenido y geometría viven en git (`lib/piezas`).
// El orden del DOM es el orden de lectura. Sin BD, sin sharp, sin sesión.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { FaqSection } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { SectionNav, type SectionNavItem } from "@/components/section-nav";
import { FactoresForma } from "@/components/piezas/factores-forma";
import { PiezaExplorador } from "@/components/piezas/pieza-explorador";
import { PiezaPartes } from "@/components/piezas/pieza-partes";
import { TowerBackdrop } from "@/components/tower-hero";
import { ButtonLink } from "@/components/ui/button";
import { entornoActual } from "@/lib/piezas/entorno";
import { piezaPorSlug, piezasVisibles } from "@/lib/piezas/registro";
import type { Fuente, Hecho, ParteResumen, PiezaContenido, SeccionTexto } from "@/lib/piezas/types";
import { SITE_URL } from "@/lib/schema";
import { siteConfig } from "@/lib/site-config";

export const dynamicParams = false;

const ETIQUETA_FIGURA = "Dibujo de una tarjeta madre ATX típica. La ubicación de cada parte cambia según el modelo.";
const SCROLL_BAJO_ENCABEZADO = { scrollMarginTop: "5rem" } as const; // el encabezado fijo mide 64 px
const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-panda";
const ENLACE = `${FOCO} font-medium text-panda underline underline-offset-4`;
const CONTENEDOR = "mx-auto max-w-6xl px-4 py-16 sm:px-6";
const TITULO_SECCION = "text-balance text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold tracking-[-0.02em]";

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
  const { contenido } = pieza;
  const imagen = `${SITE_URL}/piezas/${contenido.slug}-og.jpg`;

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
      images: [{ url: imagen, width: 1200, height: 630 }],
    },
    ...(contenido.estado !== "publicado" ? { robots: { index: false, follow: false } } : {}),
  };
}

/* ---------- Datos derivados del contenido ---------- */

/** Todos los hechos de la pieza: partes, opciones, secciones y tamaños. */
function todosLosHechos(contenido: PiezaContenido<string>): readonly Hecho[] {
  const deLasPartes = Object.values(contenido.partes).flatMap((p) => [...p.hechos, ...(p.opciones?.items.flatMap((o) => o.hechos) ?? [])]);
  const deLasSecciones = contenido.secciones.flatMap((s) => s.hechos ?? []);
  const deLosTamanos = (contenido.factoresForma ?? []).map((f) => f.hecho);
  return [...deLasPartes, ...deLasSecciones, ...deLosTamanos];
}

/** Fecha (AAAA-MM-DD) de la verificación más reciente; si ningún hecho está verificado, la de la última actualización. */
function fechaRevision(contenido: PiezaContenido<string>): string {
  const fechas = todosLosHechos(contenido)
    .map((h) => h.verificadoEn)
    .filter((f): f is string => f !== null);
  return fechas.length > 0 ? fechas.reduce((a, b) => (a > b ? a : b)) : contenido.actualizadoEn;
}

function aResumenes(contenido: PiezaContenido<string>): readonly ParteResumen[] {
  return Object.entries(contenido.partes)
    .sort(([, a], [, b]) => a.orden - b.orden)
    .map(([id, p]) => ({
      id,
      orden: p.orden,
      nombre: p.nombre,
      nombreCorto: p.nombreCorto,
      resumen: p.resumen,
      ...(p.opciones && p.opciones.items.length > 0 ? { chips: p.opciones.items.map((o) => o.etiqueta) } : {}),
    }));
}

/** Fuentes únicas (por URL) de los hechos de las secciones generales y de los tamaños; las de cada parte ya van en su sección. */
function fuentesGenerales(contenido: PiezaContenido<string>): readonly Fuente[] {
  const hechos = [...contenido.secciones.flatMap((s) => s.hechos ?? []), ...(contenido.factoresForma ?? []).map((f) => f.hecho)];
  const vistas = new Set<string>();
  const unicas: Fuente[] = [];
  for (const hecho of hechos) {
    for (const f of hecho.fuentes) {
      if (vistas.has(f.url)) continue;
      vistas.add(f.url);
      unicas.push(f);
    }
  }
  return unicas;
}

function articleSchema(contenido: PiezaContenido<string>) {
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
    image: `${SITE_URL}/piezas/${contenido.slug}-og.jpg`,
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

function SeccionTextual({ seccion }: { seccion: SeccionTexto }) {
  const tituloId = `${seccion.id}-titulo`;
  return (
    <section id={seccion.id} aria-labelledby={tituloId} className="border-b border-hairline/50" style={SCROLL_BAJO_ENCABEZADO}>
      <div className={CONTENEDOR}>
        <h2 id={tituloId} className={TITULO_SECCION}>
          {seccion.titulo}
        </h2>
        <CuerpoSeccion parrafos={seccion.parrafos} vinetas={seccion.vinetas} hechos={seccion.hechos} />
      </div>
    </section>
  );
}

/** Tamaños: el primer párrafo es el aviso destacado (el tamaño no define la calidad) y va junto al dibujo a escala. */
function SeccionTamanos({ seccion, contenido }: { seccion: SeccionTexto; contenido: PiezaContenido<string> }) {
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

function FuentesGenerales({ fuentes }: { fuentes: readonly Fuente[] }) {
  if (fuentes.length === 0) return null;
  return (
    <section id="fuentes" className="border-b border-hairline/50" style={SCROLL_BAJO_ENCABEZADO}>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <details className="border border-hairline px-3 py-2">
          <summary className={`${FOCO} cursor-pointer text-sm font-medium text-panda`}>Fuentes de los tamaños y de los criterios para elegir</summary>
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

export default async function PiezaPage({ params }: PiezaPageProps) {
  const { pieza: slug } = await params;
  const pieza = piezaPorSlug(slug, entornoActual());
  if (!pieza) notFound();

  const { contenido, geo } = pieza;
  const publicado = contenido.estado === "publicado";
  const seccion = (id: string): SeccionTexto | undefined => contenido.secciones.find((s) => s.id === id);
  const tamanos = seccion("tamanos");
  const elegir = seccion("elegir");
  const errores = seccion("errores");
  const fuentes = fuentesGenerales(contenido);
  const hayPreguntas = (contenido.faq?.length ?? 0) > 0;

  // Indicador lateral: solo las secciones que esta pieza realmente tiene, en el orden de la página.
  const navItems: SectionNavItem[] = [
    { id: "inicio", label: "Inicio" },
    { id: "partes", label: "Explorar" },
    { id: "lista", label: "Las partes" },
    ...(tamanos ? [{ id: "tamanos", label: "Tamaños" }] : []),
    ...(elegir ? [{ id: elegir.id, label: "Al elegir" }] : []),
    ...(errores ? [{ id: errores.id, label: "Errores" }] : []),
    ...(hayPreguntas ? [{ id: "preguntas", label: "Preguntas" }] : []),
    { id: "cotizar", label: "Cotizar" },
  ];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE_URL}/` },
          { name: "Tarjeta madre", url: `${SITE_URL}/piezas/${contenido.slug}` },
        ]}
      />
      <JsonLd data={articleSchema(contenido)} />
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

      <section id="partes" aria-labelledby="partes-titulo" className="border-b border-hairline/50" style={SCROLL_BAJO_ENCABEZADO}>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <h2 id="partes-titulo" className="sr-only">
            Explora las partes
          </h2>
          <div className="border border-hairline bg-vanilla p-3 sm:p-6">
            <PiezaExplorador slug={contenido.slug} vista={geo.vistas.unica} partes={aResumenes(contenido)} etiquetaFigura={ETIQUETA_FIGURA} />
          </div>
        </div>
      </section>

      <div className="border-b border-hairline/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <PiezaPartes contenido={contenido} />
        </div>
      </div>

      {tamanos ? <SeccionTamanos seccion={tamanos} contenido={contenido} /> : null}
      {elegir ? <SeccionTextual seccion={elegir} /> : null}
      {errores ? <SeccionTextual seccion={errores} /> : null}

      {contenido.faq && contenido.faq.length > 0 ? (
        <div id="preguntas" style={SCROLL_BAJO_ENCABEZADO}>
          <FaqSection items={[...contenido.faq]} />
        </div>
      ) : null}

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
