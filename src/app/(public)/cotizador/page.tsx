/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { PcBackdrop } from "@/components/assembly-hero";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { getEstimatorContext } from "@/lib/quote-estimator";
import {
  CotizadorEstimator,
  type EstimatorCategory,
} from "@/components/cotizador-estimator";
import { whatsappLink } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Cotizador de PC",
  description:
    "Cotiza tu PC a la medida en segundos. Elige las gamas de cada componente y obtén un estimado de precio en Colombia. Sin registro, gratis.",
  keywords: [
    "cotizar PC Colombia",
    "precio de PC gaming Colombia",
    "cotizador de PC Bogotá",
    "cuánto cuesta armar un PC Colombia",
    "presupuesto PC gaming",
    "precio componentes PC Colombia",
  ],
  alternates: { canonical: "/cotizador" },
  openGraph: {
    title: "Cotizador de PC · B & W",
    description:
      "Cotiza tu PC a la medida en segundos. Sin registro, gratis. Bogotá, Colombia.",
    url: "https://bw-pcs.vercel.app/cotizador",
  },
};

export const revalidate = 3600;

// Categorías que vienen preseleccionadas (gama media) en un build típico.
const CORE = new Set([
  "Procesador",
  "Grafica",
  "Board",
  "Ram",
  "Almacenamiento",
  "Fuente",
  "Chasis",
]);

export default async function CotizadorPage() {
  let categories: EstimatorCategory[] = [];
  let servicioBase = 0;
  let tarjetaPct = 0;
  let psePct = 0;
  let breBPct = 0;
  let ready = false;

  try {
    const ctx = await getEstimatorContext();
    servicioBase = ctx.servicioBase;
    tarjetaPct = ctx.tarjetaPct;
    psePct = ctx.psePct;
    breBPct = ctx.breBPct;

    categories = ctx.categories.map((cat) => ({
      key: cat.key,
      label: cat.label,
      options: cat.options,
      defaultOn: CORE.has(cat.key), // checkbox marcado en categorías core
      defaultIndex: Math.max(0, Math.min(1, cat.options.length - 1)), // gama media o 1.ª
    }));

    ready = categories.length > 0;
  } catch {
    ready = false;
  }

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: "https://bw-pcs.vercel.app/" },
          { name: "Cotizador", url: "https://bw-pcs.vercel.app/cotizador" },
        ]}
      />
      <PcBackdrop />
      <PageHero
        eyebrow="Estimado aproximado"
        title="Cotiza tu PC"
        summary={[
          "Elige la gama de cada componente: procesador, gráfica, RAM y más.",
          "Ve el total aproximado en pesos colombianos al instante.",
          "Compara el precio con tarjeta, PSE o Bre-B.",
          "Sin registro. Confirmas y afinas detalles por WhatsApp.",
        ]}
      >
        <p>
          Elige la gama de cada componente y te damos un valor aproximado al
          instante. Sin registrarte. Luego lo afinamos contigo por WhatsApp.
        </p>
      </PageHero>

      <section>
        <div className="bg-vanilla/40 mx-auto max-w-6xl px-4 py-12 sm:px-6">
          {ready ? (
            <CotizadorEstimator
              categories={categories}
              servicioBase={servicioBase}
              tarjetaPct={tarjetaPct}
              psePct={psePct}
              breBPct={breBPct}
            />
          ) : (
            <div className="border border-hairline/50 p-8 text-center">
              <h2 className="text-xl font-semibold">
                Cotizador en preparación
              </h2>
              <p className="mx-auto mt-2 max-w-md text-component">
                Estamos afinando las opciones. Mientras tanto, escríbenos
                directo y armamos tu cotización a la medida.
              </p>
              <ButtonLink
                href={whatsappLink("Hola B & W, quiero cotizar un PC.")}
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                className="mt-6"
              >
                Cotizar por WhatsApp
              </ButtonLink>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
