// Desarrollado por BlacKraken Solutions
import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { PcBackdrop } from "@/components/assembly-hero";
import { collections } from "@/lib/db/collections";
import { whatsappLink } from "@/lib/site-config";
import { BuildsGrid } from "@/components/builds-grid";

export const metadata: Metadata = {
  title: "Ensambles",
  description:
    "Galería de PCs armados por B & W. Builds gaming, workstation y escritorio a la medida para clientes en Colombia. Cada equipo, hecho con cuidado.",
  keywords: [
    "builds de PC Colombia",
    "galería ensambles PC Bogotá",
    "PC gaming armado Colombia",
    "workstation ensamblado Colombia",
    "resultados B&W PCs",
  ],
  alternates: { canonical: "/ensambles" },
  openGraph: {
    title: "Ensambles · B & W",
    description:
      "Galería de PCs armados a la medida. Builds gaming, workstation y más en Colombia.",
    url: "https://bw-pcs.vercel.app/ensambles",
  },
};

export const revalidate = 3600;

export default async function EnsamblesPage() {
  let builds: {
    id: string;
    titulo: string;
    specs: string;
    imagenUrl: string;
  }[] = [];

  try {
    const col = await collections.builds();
    const docs = await col
      .find({ activo: true })
      .sort({ orden: 1, creado: -1 })
      .toArray();
    builds = docs.map((d) => ({
      id: d._id!.toString(),
      titulo: d.titulo,
      specs: d.specs,
      imagenUrl: d.imagenUrl,
    }));
  } catch {
    // fail silently — muestra vacío
  }

  return (
    <>
      <PcBackdrop />
      <PageHero eyebrow="Trabajo real" title="Ensambles">
        <p>
          Cada equipo que sale de nuestras manos está aquí. Builds gaming,
          workstation, escritorio y más — armados a la medida de cada cliente.
        </p>
      </PageHero>

      <section className="border-b border-hairline/50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          {builds.length === 0 ? (
            <div className="border border-hairline/50 p-10 text-center">
              <p className="text-lg font-semibold">Pronto aquí</p>
              <p className="mx-auto mt-2 max-w-sm text-component">
                Estamos documentando los primeros builds. ¿Quieres ser el
                primero?
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
          ) : (
            <BuildsGrid builds={builds} />
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-component/30">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[clamp(1.5rem,4vw,2.25rem)] font-bold tracking-[-0.02em]">
              ¿El próximo eres tú?
            </h2>
            <p className="mt-2 max-w-md text-panda/70">
              Arma un estimado en segundos o escríbenos directo.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/cotizador" size="lg">
              Cotizar tu PC
            </ButtonLink>
            <ButtonLink
              href={whatsappLink("Hola B & W, quiero cotizar un PC.")}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              variant="secondary"
            >
              WhatsApp
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
