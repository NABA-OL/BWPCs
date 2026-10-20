/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Índice «Piezas del PC, una por una» (docs/piezas-plan-2.md §2.3). 100 % estático. Existe solo con 2 o más piezas visibles en el entorno:
// en producción con borradores es un 404. Fuera de producción se ve con el aviso «Borrador» y `noindex`.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { TowerBackdrop } from "@/components/tower-hero";
import { ButtonLink } from "@/components/ui/button";
import { entornoActual } from "@/lib/piezas/entorno";
import { indiceEsBorrador, indiceSchema, piezasDelIndice } from "@/lib/piezas/indice";
import { hayIndice } from "@/lib/piezas/registro";
import type { PiezaRegistrada } from "@/lib/piezas/registro";
import { SITE_URL } from "@/lib/schema";

const TITULO = "Piezas del PC explicadas una por una";
const DESCRIPCION =
  "Cada pieza del PC explicada por dentro: sus partes, qué cambia entre versiones y qué mirar antes de elegir. Guías de B & W para armar tu equipo.";
const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-panda";

export function generateMetadata(): Metadata {
  const entorno = entornoActual();
  if (!hayIndice(entorno)) return {};
  return {
    title: TITULO,
    description: DESCRIPCION,
    alternates: { canonical: "/piezas" },
    openGraph: { title: `${TITULO} · B & W`, description: DESCRIPCION, url: `${SITE_URL}/piezas`, type: "website" },
    ...(indiceEsBorrador(entorno) ? { robots: { index: false, follow: false } } : {}),
  };
}

function TarjetaPieza({ pieza }: { pieza: PiezaRegistrada }) {
  const { contenido } = pieza;
  const borrador = contenido.estado !== "publicado";
  // Una sola vista (la tarjeta madre) no necesita chips: solo se listan cuando hay versiones que elegir.
  const vistas = contenido.vistas.length >= 2 ? contenido.vistas : [];
  return (
    <li className="border-b border-r border-hairline">
      <Link href={`/piezas/${contenido.slug}`} className={`${FOCO} group block h-full bg-vanilla p-7 transition-colors hover:bg-component/20`}>
        {borrador ? <p className="font-mono text-xs text-component">Borrador</p> : null}
        <h2 className={`${borrador ? "mt-3" : ""} text-balance text-xl font-bold tracking-[-0.01em] group-hover:text-accent`}>{contenido.nombreCorto}</h2>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-panda">{contenido.descripcion}</p>
        {vistas.length > 0 ? (
          <ul aria-label="Versiones que se explican" className="mt-4 flex flex-wrap gap-2">
            {vistas.map((v) => (
              <li key={v.id} className="border border-hairline px-2 py-0.5 font-mono text-xs text-component">
                {v.etiqueta}
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-4 font-mono text-xs text-accent">
          Ver las partes<span className="sr-only"> de {contenido.nombreCorto.toLowerCase()}</span> →
        </p>
      </Link>
    </li>
  );
}

export default function PiezasIndicePage() {
  const entorno = entornoActual();
  // Con menos de dos piezas visibles no hay índice (en producción, mientras sean borrador).
  if (!hayIndice(entorno)) notFound();

  const piezas = piezasDelIndice(entorno);
  const borrador = indiceEsBorrador(entorno);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE_URL}/` },
          { name: "Piezas del PC", url: `${SITE_URL}/piezas` },
        ]}
      />
      <JsonLd data={indiceSchema(piezas, SITE_URL, TITULO, DESCRIPCION)} />
      <TowerBackdrop />

      <PageHero eyebrow="Piezas a fondo" title="Piezas del PC, una por una" ctaLabel="Cotiza tu PC" ctaHref="/cotizador">
        <p>
          Toca cada parte del dibujo y entiende qué hace, qué cambia entre versiones y qué conviene mirar antes de elegir. Sin tecnicismos de más:
          lo que explicamos a nuestros clientes en el taller.
        </p>
      </PageHero>

      {borrador ? (
        <div role="note" className="border-b border-hairline bg-vanilla">
          <p className="mx-auto max-w-6xl px-4 py-3 font-mono text-sm text-panda sm:px-6">
            <span className="font-semibold">Borrador: no publicado.</span> Esta página solo se ve fuera de producción y no se indexa.
          </p>
        </div>
      ) : null}

      <section id="piezas" aria-labelledby="piezas-titulo" className="border-b border-hairline/50 bg-vanilla/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 id="piezas-titulo" className="sr-only">
            Las piezas
          </h2>
          <ul className="grid border-l border-t border-hairline md:grid-cols-2 lg:grid-cols-3">
            {piezas.map((pieza) => (
              <TarjetaPieza key={pieza.contenido.slug} pieza={pieza} />
            ))}
          </ul>
        </div>
      </section>

      <section id="cotizar" className="bg-component/30">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-balance text-[clamp(1.5rem,4vw,2.25rem)] font-bold tracking-[-0.02em]">¿Ya sabes qué quieres?</h2>
            <p className="mt-2 max-w-md text-pretty text-panda/70">Arma tu configuración y mira el precio aproximado al instante.</p>
            <p className="mt-3 text-sm">
              <Link href="/guias" className={`${FOCO} font-medium text-panda underline underline-offset-4`}>
                Ver las guías para armar tu PC
              </Link>
            </p>
          </div>
          <ButtonLink href="/cotizador" size="lg" className="bg-accent text-accent-ink hover:bg-accent-deep">
            Ir al cotizador
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
