// Desarrollado por BlacKraken Solutions
import type { Metadata } from "next";
import { getQuoteBuilderData } from "@/lib/admin/quote-data";
import { QuoteBuilder } from "@/components/admin/quote-builder";
import type { QuoteInput } from "@/lib/quote";

export const metadata: Metadata = {
  title: "Nueva cotización",
  robots: { index: false, follow: false },
};

export default async function NuevaCotizacionPage() {
  let error: string | null = null;
  let data = null;
  try {
    data = await getQuoteBuilderData();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar datos.";
  }

  const initial: QuoteInput | null = data
    ? {
        codigo: data.nextCode,
        cliente: "",
        fecha: new Date().toISOString().slice(0, 10),
        opciones: [
          {
            titulo: "Opción 1",
            items: [], // empieza vacía; el admin agrega los ítems
            servicio: data.servicioBase,
          },
        ],
      }
    : null;

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Nueva cotización
        </h1>
        <p className="mt-1 text-component">
          Arma las opciones, agrega ítems desde el catálogo o manualmente.
        </p>
      </header>

      {error || !data || !initial ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
          <p className="text-sm text-panda">
            {error ?? "No se pudieron cargar los datos."}
          </p>
        </div>
      ) : (
        <QuoteBuilder
          id=""
          initial={initial}
          catalog={data.catalog}
          tarjetaPct={data.tarjetaPct}
          psePct={data.psePct}
        />
      )}
    </>
  );
}
