import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig, whatsappLink } from "@/lib/site-config";
import { PcBackdrop } from "@/components/assembly-hero";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escríbenos por WhatsApp o correo y armamos tu PC a la medida. Bogotá y envíos a todo el país.",
};

const mediosPago = ["Bre-B", "Bold", "Tarjeta", "PSE", "Daviplata"];

export default function ContactoPage() {
  return (
    <>
      <PcBackdrop />
      <PageHero eyebrow="Hablemos" title="Contacto">
        <p>
          La forma más rápida es WhatsApp: cuéntanos qué buscas y te ayudamos a
          armar el equipo ideal para tu presupuesto.
        </p>
      </PageHero>

      <section className="border-b border-hairline">
        <div className="mx-auto grid max-w-6xl gap-px overflow-hidden border-x border-hairline bg-hairline px-0 md:grid-cols-2">
          {/* WhatsApp — canal principal */}
          <div className="bg-vanilla p-8 sm:p-10">
            <span className="font-mono text-sm text-accent">
              Canal principal
            </span>
            <h2 className="mt-3 text-2xl font-bold">WhatsApp</h2>
            <p className="mt-2 leading-relaxed text-panda">
              Respondemos cotizaciones, dudas y pedidos. Escríbenos con el
              resumen de tu cotizador y afinamos los detalles.
            </p>
            <p className="mt-4 font-mono text-lg">
              {siteConfig.contact.whatsappDisplay}
            </p>
            <ButtonLink
              href={whatsappLink("Hola B & W, quiero cotizar un PC.")}
              size="lg"
              className="mt-6"
              target="_blank"
              rel="noopener noreferrer"
            >
              Escribir por WhatsApp
            </ButtonLink>
          </div>

          {/* Correo + datos */}
          <div className="bg-vanilla p-8 sm:p-10">
            <h2 className="text-2xl font-bold">Otros medios</h2>
            <dl className="mt-4 space-y-5 text-panda">
              <div>
                <dt className="text-sm font-medium text-component">Correo</dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    className="hover:text-accent hover:underline"
                  >
                    {siteConfig.contact.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-component">
                  Cobertura
                </dt>
                <dd className="mt-1">Bogotá y envíos a todo el país.</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-component">
                  Medios de pago
                </dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {mediosPago.map((m) => (
                    <span
                      key={m}
                      className="border border-hairline px-3 py-1 font-mono text-sm"
                    >
                      {m}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* CTA cotizador */}
      <section className="bg-component/30">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[clamp(1.5rem,4vw,2.25rem)] font-bold tracking-[-0.02em]">
              ¿Aún no tienes tu cotización?
            </h2>
            <p className="mt-2 max-w-md text-panda/70">
              Arma un estimado en segundos antes de escribirnos.
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
