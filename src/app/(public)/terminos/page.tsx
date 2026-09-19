/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { PcBackdrop } from "@/components/assembly-hero";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { LegalSections, type LegalSection } from "@/components/legal-sections";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Reglas de uso del sitio de B & W: cotizador, cuentas de usuario, reseñas, compras y garantías en Colombia.",
  alternates: { canonical: "/terminos" },
  robots: { index: true, follow: true },
};

const { legal, contact } = siteConfig;

// BORRADOR: revisar con un abogado antes de abrir el registro de usuarios.
const secciones: readonly LegalSection[] = [
  {
    titulo: "Aceptación",
    parrafos: [
      "Al usar bw-pcs.com o crear una cuenta aceptas estos términos. Si no estás de acuerdo, no uses el sitio.",
    ],
  },
  {
    titulo: "Quiénes somos",
    parrafos: [
      `B & W es un emprendimiento de ${legal.responsable}, ${legal.descripcion}. Contacto: ${contact.email} o WhatsApp ${contact.whatsappDisplay}.`,
    ],
  },
  {
    titulo: "El cotizador y los precios",
    parrafos: [
      "El cotizador entrega un estimado aproximado según la gama que eliges. No es una oferta vinculante ni el precio final.",
      "El precio final se confirma por WhatsApp con los modelos exactos disponibles. Los componentes importados dependen del dólar del día y de los costos de importación, así que una cotización puede cambiar de un mes a otro.",
    ],
  },
  {
    titulo: "Cuentas de usuario",
    lista: [
      "Debes ser mayor de 18 años.",
      "Los datos que registras deben ser verdaderos y estar al día.",
      "Verificas tu correo con un código de seis dígitos que te enviamos.",
      "Eres responsable de tu contraseña y de lo que ocurra desde tu cuenta.",
      "Podemos suspender o cerrar cuentas por uso abusivo, suplantación o incumplimiento de estos términos.",
      "Puedes eliminar tu cuenta cuando quieras desde tu perfil.",
    ],
  },
  {
    titulo: "Cotizaciones formales y compras",
    parrafos: [
      "Una cotización formal es una propuesta. Sus precios pueden cambiar si varía el dólar o la disponibilidad antes de que la confirmes.",
      "La compra se concreta cuando ambas partes confirman por escrito, por WhatsApp o correo, los componentes, el precio, el medio de pago y el plazo de entrega. Pedir una compra desde tu cuenta es una solicitud: no te cobra nada ni nos obliga hasta que la confirmemos.",
      "Después te enviamos una cuenta de cobro que ves en tu cuenta. Al pagar, puedes avisarlo adjuntando el comprobante (una imagen), pero avisar no confirma el pago: el pago solo queda confirmado cuando lo verificamos en nuestra cuenta bancaria. Si eliges pagar con tarjeta, el pago se hace en Bold, una pasarela de pagos externa: allí escribes los datos de tu tarjeta y B & W no los recibe. Si algo de la cuenta de cobro está mal, puedes pedir una corrección antes de pagar.",
      "Las garantías, los cambios y el derecho de retracto se rigen por la Ley 1480 de 2011 (Estatuto del Consumidor). Cada componente tiene la garantía de su fabricante, y el ensamblaje queda cubierto por nosotros según lo informado en cada pedido.",
    ],
  },
  {
    titulo: "Reseñas y contenido que publicas",
    parrafos: [
      "Puedes dejar una reseña si tienes al menos una cotización que te hayamos publicado en tu cuenta. Revisamos cada reseña y sus fotos antes de mostrarlas, y podemos rechazar u ocultar las que incumplan estas reglas.",
    ],
    lista: [
      "Debe basarse en tu experiencia real con B & W y solo puedes dejar una por cuenta.",
      "Las fotos deben ser tuyas y no mostrar a terceros, datos personales ni información privada.",
      "No se permite contenido ofensivo, ilegal, engañoso, publicitario o que infrinja derechos de terceros.",
      "Nos otorgas una licencia gratuita y no exclusiva para mostrar en el sitio tu reseña, tu nombre, tu avatar y tus fotos mientras la reseña esté publicada. Puedes pedir que la retiremos en cualquier momento.",
      "Comprimimos las fotos y les quitamos la metadata, como la ubicación, antes de publicarlas.",
    ],
  },
  {
    titulo: "Uso permitido",
    parrafos: ["Al usar el sitio te comprometes a no:"],
    lista: [
      "Acceder sin autorización a cuentas o sistemas de otras personas o de B & W.",
      "Automatizar consultas de forma masiva ni sobrecargar el servicio.",
      "Eludir controles de seguridad, como el límite de intentos o la verificación reCAPTCHA.",
      "Usar el sitio para fines ilícitos o para suplantar a otra persona.",
    ],
  },
  {
    titulo: "Propiedad intelectual",
    parrafos: [
      "El sitio, la marca B & W, el logo, los textos y el diseño pertenecen a sus titulares y no puedes usarlos sin autorización escrita. Las marcas de componentes que aparecen en el sitio pertenecen a sus fabricantes.",
    ],
  },
  {
    titulo: "Enlaces y noticias de terceros",
    parrafos: [
      "La sección de noticias enlaza a fuentes externas. No controlamos su contenido ni respondemos por él.",
    ],
  },
  {
    titulo: "Limitación de responsabilidad",
    parrafos: [
      "Las guías y recomendaciones son orientativas. Procuramos mantener la información al día, pero puede contener errores o cambiar sin aviso. En la medida en que la ley lo permita, no respondemos por interrupciones del sitio ni por daños indirectos derivados de su uso.",
    ],
  },
  {
    titulo: "Cambios a estos términos",
    parrafos: [
      "Podemos actualizar estos términos. La versión vigente es la publicada en esta página, con su fecha. Cuando el cambio sea sustancial, te lo informaremos.",
    ],
  },
  {
    titulo: "Ley aplicable y jurisdicción",
    parrafos: [
      "Estos términos se rigen por las leyes de la República de Colombia. Las controversias se someten a los jueces de Bogotá, D.C., sin perjuicio de las acciones que las normas de protección al consumidor y la Superintendencia de Industria y Comercio te permitan.",
    ],
  },
];

export default function TerminosPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: "https://bw-pcs.com/" },
          { name: "Términos", url: "https://bw-pcs.com/terminos" },
        ]}
      />
      <PcBackdrop />
      <PageHero eyebrow="Legal" title="Términos y condiciones">
        <p>
          Vigentes desde {legal.vigenteDesde}. Aplican al sitio, al cotizador y
          a las cuentas de usuario. Léelos junto con la{" "}
          <Link
            href="/tratamiento-de-datos"
            className="text-accent hover:underline"
          >
            política de tratamiento de datos
          </Link>
          .
        </p>
      </PageHero>

      <LegalSections sections={secciones} />
    </>
  );
}
