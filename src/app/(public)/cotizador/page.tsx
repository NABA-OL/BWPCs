/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { FaqSection } from "@/components/faq-section";
import { ButtonLink } from "@/components/ui/button";
import { PcBackdrop } from "@/components/assembly-hero";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { getEstimatorContext } from "@/lib/quote-estimator";
import { JsonLd } from "@/components/json-ld";
import { estimatorOfferSchema } from "@/lib/schema";
import {
  CotizadorEstimator,
  type EstimatorCategory,
} from "@/components/cotizador-estimator";
import { whatsappLink } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Cotizador de PC gamer: precio en Colombia",
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
    url: "https://bw-pcs.com/cotizador",
  },
};

export const revalidate = 3600;

const faqs = [
  {
    q: "¿El precio del cotizador es el precio final?",
    a: "No. Es un estimado aproximado según la gama que elijas. El precio final se confirma por WhatsApp según los modelos exactos disponibles y el dólar del día.",
  },
  {
    q: "¿Necesito registrarme para cotizar?",
    a: "No. El cotizador es público y gratuito, no pide correo ni datos personales. Solo nos escribes si quieres avanzar.",
  },
  {
    q: "¿Qué incluye el valor del ensamblaje?",
    a: "Armado del equipo, instalación del sistema operativo, formateo, configuración, cable management y pruebas de temperatura y estabilidad antes de entregar.",
  },
  {
    q: "¿Por qué el total cambia según el medio de pago?",
    a: "Tarjeta y PSE cobran una comisión que se refleja en el total. Con Bre-B no hay recargo. El cotizador te muestra los tres valores para que compares.",
  },
  {
    q: "¿Puedo cotizar solo algunos componentes?",
    a: "Sí. Desmarca las categorías que no necesitas y el total se ajusta. Si solo quieres una pieza suelta, mira el catálogo de componentes.",
  },
];

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
  // Rango real de precio de un equipo core, para el schema Product/AggregateOffer.
  let minCop = 0;
  let maxCop = 0;

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

    const core = ctx.categories.filter((c) => CORE.has(c.key));
    const prices = core.map((c) => c.options.map((o) => o.precioCop));
    minCop =
      prices.reduce((sum, p) => sum + Math.min(...p), 0) + ctx.servicioBase;
    maxCop =
      prices.reduce((sum, p) => sum + Math.max(...p), 0) + ctx.servicioBase;

    ready = categories.length > 0;
  } catch {
    ready = false;
  }

  return (
    <>
      {ready && minCop > 0 && (
        <JsonLd data={estimatorOfferSchema(minCop, maxCop)} />
      )}
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: "https://bw-pcs.com/" },
          { name: "Cotizador", url: "https://bw-pcs.com/cotizador" },
        ]}
      />
      <PcBackdrop />
      <PageHero
        eyebrow="Estimado aproximado"
        title="Cotiza tu PC a la medida"
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

      {/* Configuraciones por presupuesto — enlazado interno + intención comercial */}
      <section className="border-y border-hairline/50 bg-vanilla/40">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-balance text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold tracking-[-0.02em]">
            ¿Prefieres partir de un presupuesto?
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-panda">
            Ya armamos la mejor configuración posible para los presupuestos más
            comunes, con estos mismos precios.
          </p>
          <div className="mt-8 grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
            {[
              { slug: "3-millones", etiqueta: "3 millones" },
              { slug: "5-millones", etiqueta: "5 millones" },
              { slug: "8-millones", etiqueta: "8 millones" },
            ].map((b) => (
              <Link
                key={b.slug}
                href={`/pc-gamer/${b.slug}`}
                className="group bg-vanilla p-6 transition-colors hover:bg-component/20"
              >
                <p className="font-mono text-xs text-component">{b.etiqueta}</p>
                <h3 className="mt-2 font-semibold group-hover:text-accent">
                  PC gamer por {b.etiqueta} →
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FaqSection items={faqs} />
    </>
  );
}
