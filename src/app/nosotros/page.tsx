import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = { title: "Nosotros" };

export default function NosotrosPage() {
  return (
    <PageHero eyebrow="Sobre B & W" title="Nosotros">
      <p>
        Somos un emprendimiento colombiano de ensamble de computadores. Nuestra
        historia, pronto aquí.
      </p>
    </PageHero>
  );
}
