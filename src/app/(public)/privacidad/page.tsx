/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-27
 */
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { PcBackdrop } from "@/components/assembly-hero";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacidad",
  description:
    "Cómo trata B & W los datos de tus cotizaciones, tu cuenta y tus mensajes en Colombia: qué guardamos, para qué y cómo pedir que los eliminemos.",
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
          B &amp; W recopila solo lo necesario para operar. El cotizador se usa
          sin cuenta, y la cuenta es opcional: la necesitas para guardar tus
          cotizaciones y dejar reseñas. Esta página resume el tratamiento; el
          detalle completo está en la{" "}
          <Link
            href="/tratamiento-de-datos"
            className="text-accent hover:underline"
          >
            política de tratamiento de datos
          </Link>
          .
        </p>
      </PageHero>

      <section className="border-b border-hairline/50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="space-y-8 text-panda">
            <div>
              <h2 className="text-xl font-bold">Cotizador público</h2>
              <p className="mt-2 leading-relaxed">
                El cotizador de <code>/cotizador</code> no requiere registro.
                Los cálculos se hacen en el momento a partir de las opciones
                que eliges y no quedan guardados. Solo si decides continuar por
                WhatsApp te pedimos nombre, teléfono y correo. Los guardamos
                para poder darle seguimiento a esa solicitud (verla en nuestro
                panel interno y notificarnos internamente por Telegram). No se
                usan para publicidad ni se comparten con terceros.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold">Cookies</h2>
              <p className="mt-2 leading-relaxed">
                Usamos cookies mínimas y ninguna de publicidad.
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6 leading-relaxed">
                <li>
                  <code>bw_user</code>: mantiene tu sesión si inicias sesión. Es
                  necesaria para que la cuenta funcione.
                </li>
                <li>
                  <code>bw_session</code>: sesión del panel interno. Solo se
                  crea para el equipo de B &amp; W.
                </li>
                <li>
                  Google reCAPTCHA: al cargar formularios protegidos (cotizador,
                  registro e inicio de sesión), Google puede guardar cookies
                  para distinguir personas de robots.
                </li>
              </ul>
              <p className="mt-3 leading-relaxed">
                Medimos las visitas con Vercel Web Analytics, que no usa cookies
                ni identifica personas. Tu decisión sobre el aviso de cookies se
                guarda en el almacenamiento local del navegador, no en una
                cookie.
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
              <h2 className="text-xl font-bold">Tu cuenta</h2>
              <p className="mt-2 leading-relaxed">
                Si creas una cuenta guardamos tu nombre, correo, teléfono, el
                avatar que elijas y tu contraseña cifrada con hash. Verificamos
                tu correo con un código de seis dígitos. Tus cotizaciones
                quedan asociadas a la cuenta para que puedas verlas y descargar
                el PDF.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold">Reseñas y fotos</h2>
              <p className="mt-2 leading-relaxed">
                Si dejas una reseña, la revisamos antes de publicarla y
                mostramos tu primer nombre y la inicial de tu apellido, tu
                avatar, la calificación, el comentario y las fotos que subas.
                Comprimimos las fotos y les quitamos la metadata, como la
                ubicación. Si editas tu reseña, la revisamos de nuevo. Al
                eliminar tu cuenta eliges si tu reseña sigue publicada (con
                tu primer nombre, la inicial de tu apellido, tu avatar y tus
                fotos, sin tu correo ni tu teléfono) o se borra; en ambos casos
                puedes pedir que la retiremos cuando quieras.
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
                {siteConfig.contact.email}. Desde tu perfil también puedes
                editar tus datos y eliminar tu cuenta. Los plazos y el
                procedimiento están en la{" "}
                <Link
                  href="/tratamiento-de-datos"
                  className="text-accent hover:underline"
                >
                  política de tratamiento de datos
                </Link>
                , y las reglas de uso en los{" "}
                <Link href="/terminos" className="text-accent hover:underline">
                  términos y condiciones
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
