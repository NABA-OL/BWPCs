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
  title: "Política de tratamiento de datos personales",
  description:
    "Qué datos personales recopila B & W, para qué los usa, cuáles son tus derechos como titular y cómo hacer una consulta o un reclamo en Colombia.",
  alternates: { canonical: "/tratamiento-de-datos" },
  robots: { index: true, follow: true },
};

const { legal, contact } = siteConfig;

// BORRADOR: revisar con un abogado antes de abrir el registro de usuarios.
const secciones: readonly LegalSection[] = [
  {
    titulo: "Responsable del tratamiento",
    parrafos: [
      `${legal.responsable}, ${legal.descripcion}, actúa como Responsable del Tratamiento de los datos personales que se recopilan a través de bw-pcs.com y de sus canales de contacto.`,
      `Puedes escribirnos a ${contact.email} o al WhatsApp ${contact.whatsappDisplay}.`,
    ],
  },
  {
    titulo: "Datos que recopilamos",
    parrafos: [
      "Recopilamos solo los datos que necesitamos para cada función del sitio.",
    ],
    lista: [
      "Cotizador: nombre, teléfono y correo, únicamente si decides enviar tu cotización por WhatsApp.",
      "Cuenta de usuario: nombre, correo, teléfono, contraseña (la guardamos cifrada con hash, nunca en texto legible) y el avatar que elijas.",
      "Cotizaciones de tu cuenta: los componentes que cotizaste y las cotizaciones formales que preparamos para ti.",
      "Cuentas de cobro: tu nombre, identificación (si nos la diste), dirección, los conceptos y valores, y el estado del pago.",
      "Pagos con tarjeta: si eliges pagar con tarjeta, te llevamos a Bold, la pasarela de pagos. A Bold le enviamos tu correo, el valor y una referencia de la cuenta de cobro; los datos de tu tarjeta los escribes en Bold y nosotros nunca los vemos ni los guardamos. Bold nos informa si el pago fue aprobado o rechazado, y guardamos ese resultado y el identificador del pago.",
      "Comprobantes de pago: la imagen que subas al avisar un pago. La guardamos en un almacenamiento privado, sin metadatos (como la ubicación) y sin enlace público; solo la vemos nosotros y tú, y la conservamos junto con la cuenta de cobro a la que respalda.",
      "Solicitudes sobre una cotización: los cambios que nos pidas o la opción y forma de pago con las que quieras comprar. Si quieres, también tu cédula o NIT y tu dirección; son opcionales y solo se usan para preparar tu cuenta de cobro.",
      "Reseñas: la calificación, el comentario y las fotos que decidas publicar.",
      "Datos de seguridad: dirección IP y navegador al registrarte y al aceptar esta política, para poder demostrar tu autorización, y al iniciar sesión, para limitar intentos abusivos.",
    ],
  },
  {
    titulo: "Datos sensibles y menores de edad",
    parrafos: [
      "No solicitamos datos sensibles. Las cuentas son solo para mayores de 18 años y no recopilamos datos de niños, niñas ni adolescentes.",
    ],
  },
  {
    titulo: "Finalidades",
    parrafos: ["Usamos tus datos para lo siguiente:"],
    lista: [
      "Crear y administrar tu cuenta, verificar tu correo y proteger el acceso.",
      "Atender tus cotizaciones y pedidos, y contactarte por WhatsApp, correo o teléfono para darles seguimiento.",
      "Preparar y enviarte las cuentas de cobro de tus compras, y llevar el control de su pago (si te enviamos una, la ves en tu cuenta y puedes avisar tu pago o pedir una corrección).",
      "Ajustar tus cotizaciones cuando nos pidas cambios: guardamos lo que nos escribas y la opción que prefieras para preparar la versión nueva.",
      "Avisarte cuando una cotización tuya esté lista o actualizada y enviarte los mensajes necesarios del servicio, como códigos de verificación y avisos de cambio de correo o de contraseña.",
      "Mostrar tus reseñas y fotos en el sitio, después de nuestra revisión.",
      "Prevenir fraude y abuso, y cumplir obligaciones legales.",
    ],
  },
  {
    titulo: "Autorización",
    parrafos: [
      "Al registrarte marcas una casilla de autorización. Es distinta de la casilla de los términos y no viene marcada de antemano. Con ella autorizas, de forma previa, expresa e informada, el tratamiento de tus datos para las finalidades de esta política.",
      "Guardamos la prueba de esa autorización: la versión de la política que aceptaste, la fecha y hora, y tu dirección IP. Puedes revocarla en cualquier momento eliminando tu cuenta o escribiéndonos, salvo que exista un deber legal o contractual de conservar los datos.",
    ],
  },
  {
    titulo: "Tus derechos como titular",
    parrafos: ["Tienes derecho a:"],
    lista: [
      "Conocer, actualizar y rectificar tus datos.",
      "Pedir prueba de la autorización que nos diste.",
      "Saber cómo usamos tus datos.",
      "Acceder de forma gratuita a tus datos personales.",
      "Revocar la autorización y pedir la supresión de tus datos.",
      "Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones a la ley.",
    ],
  },
  {
    titulo: "Consultas y reclamos",
    parrafos: [
      `Envía tu consulta o reclamo a ${contact.email}, con tu nombre, el correo con el que te registraste y lo que solicitas. Desde tu perfil también puedes editar tus datos y eliminar tu cuenta.`,
      "Respondemos las consultas en máximo 10 días hábiles y los reclamos en máximo 15 días hábiles, contados desde el día siguiente a la recepción. Si necesitamos más tiempo, te informamos antes del vencimiento el motivo y la nueva fecha, que no superará 5 días hábiles adicionales en consultas ni 8 en reclamos.",
    ],
  },
  {
    titulo: "Proveedores que tratan datos por nuestra cuenta",
    parrafos: [
      "Para operar el sitio usamos proveedores que pueden almacenar o procesar datos fuera de Colombia, incluido Estados Unidos. Al aceptar esta política autorizas esa transmisión y transferencia.",
    ],
    lista: [
      "Vercel: alojamiento del sitio, almacenamiento de fotos y medición agregada de visitas sin cookies.",
      "MongoDB Atlas: base de datos.",
      "Resend: envío de correos de verificación y avisos.",
      "Upstash: límite de intentos de inicio de sesión.",
      "Google reCAPTCHA: verificación antiabuso en formularios.",
      "Telegram: avisos internos al equipo cuando llega una solicitud.",
    ],
  },
  {
    titulo: "Seguridad",
    parrafos: [
      "Guardamos las contraseñas con hash, limitamos los intentos de acceso, verificamos tu correo con un código de seis dígitos que vence a los pocos minutos y restringimos el acceso interno a los datos al equipo de B & W.",
      "Ningún sistema es infalible. Si ocurre un incidente que afecte tus datos, te lo informaremos y lo reportaremos a la autoridad cuando corresponda.",
    ],
  },
  {
    titulo: "Conservación",
    parrafos: [
      "Conservamos tus datos mientras tu cuenta esté activa o los necesitemos para atender tus pedidos.",
      "Si eliminas tu cuenta, borramos tu correo, tu teléfono, tu perfil, tus sesiones, las selecciones que guardaste en el cotizador, tus solicitudes sobre cotizaciones y los datos de facturación (cédula o NIT y dirección) que nos diste al pedir una compra. Si tienes una reseña publicada, te preguntamos si quieres mantenerla (con tu primer nombre, la inicial de tu apellido, tu avatar, tu comentario y tus fotos, sin vínculo con tu cuenta) o borrarla junto con tus fotos; si no eliges, se borra. Puedes pedir el retiro de una reseña conservada escribiendo al correo de contacto y la retiramos en un plazo de 30 días. Las solicitudes de cotización que nos enviaste, las cotizaciones que preparamos para ti (con el nombre con que las emitimos) y las cuentas de cobro que te emitimos (con tu nombre, tu identificación y los valores, y los comprobantes de pago que las respaldan) se conservan como registro comercial y contable, sin vínculo con tu cuenta, durante el tiempo que la ley exija para los soportes de una venta.",
    ],
  },
  {
    titulo: "Cambios a esta política",
    parrafos: [
      "Si la modificamos de forma sustancial, publicamos la nueva versión en esta página y te pedimos una nueva autorización cuando la ley lo exija. La versión y la fecha de vigencia aparecen al inicio.",
    ],
  },
];

export default function TratamientoDeDatosPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: "https://bw-pcs.com/" },
          {
            name: "Tratamiento de datos",
            url: "https://bw-pcs.com/tratamiento-de-datos",
          },
        ]}
      />
      <PcBackdrop />
      <PageHero eyebrow="Legal" title="Política de tratamiento de datos personales">
        <p>
          Versión {legal.versionPolitica}, vigente desde {legal.vigenteDesde}.
          Cumple la Ley 1581 de 2012 y sus decretos reglamentarios. Léela junto
          con los{" "}
          <Link href="/terminos" className="text-accent hover:underline">
            términos y condiciones
          </Link>{" "}
          y la{" "}
          <Link href="/privacidad" className="text-accent hover:underline">
            página de privacidad
          </Link>
          .
        </p>
      </PageHero>

      <LegalSections sections={secciones} />
    </>
  );
}
