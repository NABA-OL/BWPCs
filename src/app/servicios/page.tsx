import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = { title: "Servicios" };

export default function ServiciosPage() {
  return (
    <PageHero eyebrow="Lo que ofrecemos" title="Servicios">
      <p>
        Ensamblaje completo, venta de componentes y asesoría. El detalle de
        cada servicio llega pronto.
      </p>
    </PageHero>
  );
}
