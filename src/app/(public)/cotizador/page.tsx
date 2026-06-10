import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { PcBackdrop } from "@/components/assembly-hero";
import { collections } from "@/lib/db/collections";
import { getSettings } from "@/lib/admin/settings";
import {
  ESTIMATOR_CATEGORIES,
  CATEGORY_LABELS,
  DEFAULT_ESTIMATOR_OPTIONS,
} from "@/lib/categories";
import {
  CotizadorEstimator,
  type EstimatorCategory,
} from "@/components/cotizador-estimator";
import { whatsappLink } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Cotizador",
  description:
    "Arma un estimado aproximado de tu PC en segundos y escríbenos por WhatsApp.",
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
  let ready = false;

  try {
    const settings = await getSettings();
    servicioBase = settings.servicioBase;
    tarjetaPct = settings.mediosPago.tarjeta;
    psePct = settings.mediosPago.pse;

    const col = await collections.categoryOptions();
    const docs = await col.find({}).toArray();
    const map = new Map(docs.map((d) => [d.categoria, d.opciones]));

    categories = ESTIMATOR_CATEGORIES.map((cat) => {
      const opciones = (
        map.get(cat) ?? DEFAULT_ESTIMATOR_OPTIONS[cat] ?? []
      ).filter((o) => o && o.label && o.precioCop > 0);
      return {
        key: cat,
        label: CATEGORY_LABELS[cat],
        options: opciones,
        defaultOn: CORE.has(cat), // checkbox marcado en categorías core
        defaultIndex: Math.max(0, Math.min(1, opciones.length - 1)), // gama media o 1.ª
      };
    }).filter((c) => c.options.length > 0);

    ready = categories.length > 0;
  } catch {
    ready = false;
  }

  return (
    <>
      <PcBackdrop />
      <PageHero eyebrow="Estimado aproximado" title="Cotiza tu PC">
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
            />
          ) : (
            <div className="border border-hairline p-8 text-center">
              <h2 className="text-xl font-semibold">
                Cotizador en preparación
              </h2>
              <p className="mx-auto mt-2 max-w-md text-component">
                Estamos afinando las opciones. Mientras tanto, escríbenos directo
                y armamos tu cotización a la medida.
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
