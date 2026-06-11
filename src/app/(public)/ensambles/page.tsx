import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { PcBackdrop } from "@/components/assembly-hero";
import { collections } from "@/lib/db/collections";
import { whatsappLink } from "@/lib/site-config";
import { isInstagramUrl } from "@/lib/instagram";
import { InstagramEmbed } from "@/components/instagram-embed";

export const metadata: Metadata = {
  title: "Ensambles",
  description:
    "Galería de PCs armados por B & W. Ensambles gaming, workstation y más a medida en Colombia.",
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
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
              {builds.map((b) =>
                isInstagramUrl(b.imagenUrl) ? (
                  <div key={b.id} className="col-span-full">
                    <InstagramEmbed url={b.imagenUrl} />
                    <div className="mt-3 text-center">
                      <p className="font-semibold leading-tight">{b.titulo}</p>
                      {b.specs && (
                        <p className="mt-1 font-mono text-xs leading-relaxed text-component">
                          {b.specs}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <article key={b.id} className="group">
                    <div className="aspect-square overflow-hidden border border-hairline/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={b.imagenUrl}
                        alt={b.titulo}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-3">
                      <p className="font-semibold leading-tight">{b.titulo}</p>
                      {b.specs && (
                        <p className="mt-1 font-mono text-xs leading-relaxed text-component">
                          {b.specs}
                        </p>
                      )}
                    </div>
                  </article>
                )
              )}
            </div>
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
