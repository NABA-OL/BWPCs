/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-27
 */
import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { PcBackdrop } from "@/components/assembly-hero";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacidad",
  description:
    "Cómo trata B & W los datos de tus cotizaciones y mensajes de contacto en Colombia: qué guardamos, para qué y cómo pedir que los eliminemos.",
  alternates: { canonical: "/privacidad" },
  robots: { index: true, follow: true },
};

export default function PrivacidadPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: "https://bw-pcs.com/" },
          { name: "Privacidad", url: "https://bw-pcs.com/privacidad" },
        ]}
      />
      <PcBackdrop />
      <PageHero eyebrow="Legal" title="Privacidad">
        <p>
          B &amp; W recopila solo lo necesario para operar: no pedimos cuenta ni
          datos personales para usar el cotizador, y solo guardamos lo que tú
          mismo compartes al escribirnos.
        </p>
      </PageHero>

      <section className="border-b border-hairline/50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="space-y-8 text-panda">
            <div>
              <h2 className="text-xl font-bold">Cotizador público</h2>
              <p className="mt-2 leading-relaxed">
                El cotizador de <code>/cotizador</code> no requiere registro ni
                pide datos personales. Los cálculos se hacen en el momento a
                partir de las opciones que eliges; no queda un historial
                asociado a ti a menos que nos escribas por WhatsApp o correo con
                el resumen.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold">Cookies</h2>
              <p className="mt-2 leading-relaxed">
                Usamos una sola cookie, <code>bw_session</code>, necesaria para
                mantener la sesión de administración del panel interno. No
                usamos cookies de rastreo, publicidad ni analítica de terceros.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold">Datos de cotizaciones</h2>
              <p className="mt-2 leading-relaxed">
                Cuando confirmas un pedido y armamos una cotización formal,
                guardamos tu nombre y los datos del equipo cotizado para dar
                seguimiento al pedido y generar el PDF. No compartimos esta
                información con terceros ni la usamos para publicidad.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold">Contacto</h2>
              <p className="mt-2 leading-relaxed">
                Los mensajes por WhatsApp ({siteConfig.contact.whatsappDisplay})
                o correo ({siteConfig.contact.email}) los gestiona directamente
                el equipo de B &amp; W, no un tercero.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold">Tus derechos</h2>
              <p className="mt-2 leading-relaxed">
                Puedes pedirnos en cualquier momento acceder, corregir o
                eliminar los datos que tengamos sobre ti escribiéndonos a{" "}
                {siteConfig.contact.email}.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
