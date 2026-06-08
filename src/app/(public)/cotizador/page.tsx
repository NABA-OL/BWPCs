import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = { title: "Cotizador" };

export default function CotizadorPage() {
  return (
    <PageHero
      eyebrow="Estimado aproximado"
      title="Cotiza tu PC"
    >
      <p>
        Marca los componentes que quieres y obtén un valor aproximado. El
        cotizador interactivo llega en la Fase 3.
      </p>
    </PageHero>
  );
}
