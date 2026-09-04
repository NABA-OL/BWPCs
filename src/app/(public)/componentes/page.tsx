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
import { collections } from "@/lib/db/collections";
import { getSettings } from "@/lib/admin/settings";
import { processorPrice, graphicPrice } from "@/lib/pricing";
import { CATEGORY_LABELS } from "@/lib/categories";
import { formatCOP } from "@/lib/format";
import { whatsappLink } from "@/lib/site-config";
import { SITE_URL } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Componentes de PC con precio en Colombia",
  description:
    "Precios actualizados de procesadores, tarjetas gráficas, RAM, boards, fuentes y chasis en Colombia. Compra la pieza suelta o el equipo completo.",
  keywords: [
    "componentes de pc colombia",
    "precio tarjetas gráficas colombia",
    "precio procesadores colombia",
    "comprar componentes pc bogotá",
    "precio ram ddr5 colombia",
    "catálogo componentes pc colombia",
  ],
  alternates: { canonical: "/componentes" },
  openGraph: {
    title: "Catálogo de componentes · B & W",
    description:
      "Precios actualizados de procesadores, gráficas, RAM y más en Colombia.",
    url: `${SITE_URL}/componentes`,
  },
};

export const revalidate = 3600;

interface CatalogRow {
  modelo: string;
  detalle: string;
  precioCop: number;
}

interface CatalogGroup {
  titulo: string;
  nota: string;
  rows: CatalogRow[];
}

async function loadCatalog(): Promise<CatalogGroup[]> {
  const settings = await getSettings();
  const groups: CatalogGroup[] = [];

  const [procCol, gpuCol, compCol] = await Promise.all([
    collections.processors(),
    collections.graphics(),
    collections.components(),
  ]);

  const [procs, gpus, comps] = await Promise.all([
    procCol.find({ activo: true }).sort({ modelo: 1 }).toArray(),
    gpuCol.find({ activo: true }).sort({ modelo: 1 }).toArray(),
    compCol.find({ activo: true }).sort({ categoria: 1, modelo: 1 }).toArray(),
  ]);

  const procRows = procs
    .map((p) => ({
      modelo: p.modelo,
      detalle: p.marca,
      precioCop: processorPrice(p, settings) ?? 0,
    }))
    .filter((r) => r.precioCop > 0);
  if (procRows.length) {
    groups.push({
      titulo: "Procesadores",
      nota: "AMD e Intel. Precio en pesos con la TRM del día e importación incluida.",
      rows: procRows,
    });
  }

  const gpuRows = gpus
    .map((g) => ({
      modelo: g.modelo,
      detalle: [g.marca, g.ensambladora].filter(Boolean).join(" · "),
      precioCop: graphicPrice(g, settings) ?? 0,
    }))
    .filter((r) => r.precioCop > 0);
  if (gpuRows.length) {
    groups.push({
      titulo: "Tarjetas gráficas",
      nota: "NVIDIA, AMD e Intel. Precio en pesos con la TRM del día e importación incluida.",
      rows: gpuRows,
    });
  }

  // El resto de categorías, agrupadas por categoría.
  const porCategoria = new Map<string, CatalogRow[]>();
  for (const c of comps) {
    if (c.precioCop <= 0) continue;
    const label = CATEGORY_LABELS[c.categoria] ?? c.categoria;
    const rows = porCategoria.get(label) ?? [];
    rows.push({
      modelo: `${c.marca} ${c.modelo}`.trim(),
      detalle: c.descripcion,
      precioCop: c.precioCop,
    });
    porCategoria.set(label, rows);
  }
  for (const [titulo, rows] of porCategoria) {
    groups.push({ titulo, nota: "Precio en pesos colombianos.", rows });
  }

  return groups;
}

export default async function ComponentesPage() {
  let groups: CatalogGroup[] = [];
  try {
    groups = await loadCatalog();
  } catch {
    groups = [];
  }

  const total = groups.reduce((sum, g) => sum + g.rows.length, 0);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE_URL}/` },
          { name: "Componentes", url: `${SITE_URL}/componentes` },
        ]}
      />
      <PcBackdrop />

      <PageHero
        eyebrow="Catálogo"
        title="Componentes con precio en Colombia"
        summary={[
          "Precios en pesos, con la TRM del día ya aplicada en lo importado.",
          "Compra la pieza suelta, sin obligación de armar el equipo completo.",
          "¿No ves lo que buscas? Lo conseguimos y te lo cotizamos.",
        ]}
        ctaLabel="Cotizar equipo completo"
        ctaHref="/cotizador"
      >
        <p>
          Gráficas y procesadores los traemos por importación, por eso el precio
          se mueve con el dólar. El valor que ves ya incluye ese cálculo; lo
          confirmamos por WhatsApp antes de cerrar cualquier compra.
        </p>
      </PageHero>

      {total > 0 ? (
        groups.map((g) => (
          <section
            key={g.titulo}
            className="border-b border-hairline/50 bg-vanilla/40"
          >
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
              <h2 className="text-balance text-[clamp(1.4rem,3vw,2rem)] font-bold tracking-[-0.02em]">
                {g.titulo}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-component">{g.nota}</p>

              <dl className="mt-6 divide-y divide-hairline border-y border-hairline">
                {g.rows.map((r) => (
                  <div
                    key={`${g.titulo}-${r.modelo}`}
                    className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:gap-6"
                  >
                    <dt className="flex-1 font-medium">{r.modelo}</dt>
                    {r.detalle && (
                      <dd className="flex-1 text-sm text-component">
                        {r.detalle}
                      </dd>
                    )}
                    <dd className="shrink-0 font-mono text-sm tabular-nums">
                      {formatCOP(r.precioCop)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        ))
      ) : (
        <section className="border-b border-hairline/50 bg-vanilla/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="border border-hairline/50 p-8 text-center">
              <h2 className="text-xl font-semibold">
                Catálogo en actualización
              </h2>
              <p className="mx-auto mt-2 max-w-md text-component">
                Estamos ajustando precios. Escríbenos y te cotizamos la pieza
                que necesitas al valor de hoy.
              </p>
              <ButtonLink
                href={whatsappLink(
                  "Hola B & W, quiero cotizar un componente suelto.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                className="mt-6"
              >
                Cotizar por WhatsApp
              </ButtonLink>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-component/30">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-balance text-[clamp(1.5rem,4vw,2.25rem)] font-bold tracking-[-0.02em]">
              ¿Prefieres el equipo armado?
            </h2>
            <p className="mt-2 max-w-md text-pretty text-panda/70">
              Arma tu configuración en el cotizador y mira el total con todo
              incluido, o mira{" "}
              <Link href="/servicios" className="text-accent hover:underline">
                qué incluye el ensamblaje
              </Link>
              .
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
