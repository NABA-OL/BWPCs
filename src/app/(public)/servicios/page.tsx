/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { PcBackdrop } from "@/components/assembly-hero";
import { FaqSection } from "@/components/faq-section";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Ensamblaje de PCs a la medida, venta de componentes y asesoría técnica en Colombia. GPU, CPU, RAM, boards, fuentes, chasis y refrigeración.",
  keywords: [
    "ensamblaje de PC Colombia",
    "venta de componentes PC",
    "asesoría de PC Bogotá",
    "tarjetas gráficas Colombia",
    "procesadores AMD Intel Colombia",
    "memorias RAM DDR5 Colombia",
  ],
  alternates: { canonical: "/servicios" },
  openGraph: {
    title: "Servicios · B & W",
    description:
      "Ensamblaje de PCs a la medida, venta de componentes y asesoría técnica en Colombia.",
    url: "https://bw-pcs.vercel.app/servicios",
  },
};

const componentes = [
  { t: "Procesadores", d: "AMD e Intel, según tu uso y presupuesto." },
  { t: "Tarjetas gráficas", d: "Desde gama media hasta entusiasta." },
  { t: "Memorias RAM", d: "DDR4 y DDR5, en las frecuencias que rinden." },
  { t: "Boards", d: "La base correcta para tu procesador." },
  { t: "Fuentes de poder", d: "80+ certificadas, el vatiaje justo." },
  { t: "Chasis", d: "Flujo de aire y espacio para crecer." },
  { t: "Refrigeración", d: "Aire o líquida, y ventiladores de chasis." },
  { t: "Almacenamiento", d: "SSD NVMe veloces para arrancar al instante." },
];

const faqs = [
  {
    q: "¿Cuánto se demora el ensamblaje?",
    a: "Entre 2 y 5 días hábiles desde que confirmamos los componentes por WhatsApp, según disponibilidad de piezas.",
  },
  {
    q: "¿Hacen envíos fuera de Bogotá?",
    a: "Sí, enviamos a todo Colombia. En Bogotá coordinamos entrega directa; al resto del país por transportadora.",
  },
  {
    q: "¿El equipo tiene garantía?",
    a: "Sí. Cada componente lleva la garantía de su fabricante, y el ensamblaje en sí queda cubierto por nosotros.",
  },
  {
    q: "¿Qué medios de pago aceptan?",
    a: "Bre-B, tarjeta, PSE, Daviplata y Nequi. Puedes ver el total con cada recargo desde el cotizador.",
  },
  {
    q: "¿Puedo comprar solo una pieza sin ensamble?",
    a: "Sí. Vendemos componentes sueltos — gráficas, procesadores, RAM y más — sin obligación de armar el equipo completo.",
  },
];

const pasos = [
  {
    n: "01",
    t: "Cuéntanos qué necesitas",
    d: "Nos dices para qué vas a usar el equipo — juegos, trabajo, edición — y tu presupuesto.",
    icon: "chat",
  },
  {
    n: "02",
    t: "Evaluamos tu caso",
    d: "Si ya tienes PC, vemos qué conservar y qué cambiar. Si es desde cero, definimos armado completo o piezas sueltas.",
    icon: "search",
  },
  {
    n: "03",
    t: "Cotización",
    d: "Armamos la propuesta con precio aproximado y la afinamos contigo por WhatsApp.",
    icon: "doc",
  },
  {
    n: "04",
    t: "Compra de componentes",
    d: "Conseguimos cada pieza al mejor precio, incluidas gráficas y procesadores importados.",
    icon: "cart",
  },
  {
    n: "05",
    t: "Ensamblaje y pruebas",
    d: "Armamos, ordenamos el cable management y probamos temperaturas y estabilidad.",
    icon: "build",
  },
  {
    n: "06",
    t: "Entrega y soporte",
    d: "Recibes el equipo listo para encender, en Bogotá o envío nacional, con soporte post-venta.",
    icon: "rocket",
  },
] as const;

const stepIcons: Record<(typeof pasos)[number]["icon"], React.ReactNode> = {
  chat: (
    <path d="M4 5.5h16v10H9l-4 3.5v-3.5H4v-10Z" />
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <line x1="15" y1="15" x2="20" y2="20" />
    </>
  ),
  doc: (
    <>
      <path d="M6 3.5h9l4 4v13H6v-17Z" />
      <line x1="9" y1="10.5" x2="16" y2="10.5" />
      <line x1="9" y1="14" x2="16" y2="14" />
      <line x1="9" y1="17.5" x2="13" y2="17.5" />
    </>
  ),
  cart: (
    <>
      <circle cx="9.5" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <path d="M3.5 4.5h2.5l2.4 11.2h9.9l2.2-8.2H7" />
    </>
  ),
  build: (
    <path d="M15.5 4.5 19 8l-3 3-2-.6-4 4 2.5 2.5-2 2-6-6 2-2 2.5 2.5 4-4-.6-2Z" />
  ),
  rocket: (
    <>
      <path d="M12 3c3 1.5 4.5 4.7 4.5 8.5 0 2-1 3.8-2 5l-2.5 3-2.5-3c-1-1.2-2-3-2-5C7.5 7.7 9 4.5 12 3Z" />
      <circle cx="12" cy="10.5" r="1.6" />
      <path d="M8 16.5 5.5 19M16 16.5 18.5 19" />
    </>
  ),
};

export default function ServiciosPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: "https://bw-pcs.vercel.app/" },
          { name: "Servicios", url: "https://bw-pcs.vercel.app/servicios" },
        ]}
      />
      <PcBackdrop />
      <PageHero
        eyebrow="Lo que ofrecemos"
        title="Servicios"
        summary={[
          "Ensamblaje a la medida: armado, formateo y configuración incluidos.",
          "Componentes sueltos, sin obligación de ensamble completo.",
          "Envíos a todo Colombia desde Bogotá.",
          "Precio afinado contigo por WhatsApp antes de confirmar.",
        ]}
        ctaLabel="Cotiza tu PC"
        ctaHref="/cotizador"
      >
        <p>
          Nuestro fuerte es el ensamblaje a la medida, pero si solo necesitas
          una pieza, también te la conseguimos. Sin venderte de más.
        </p>
      </PageHero>

      {/* Ensamblaje — servicio principal */}
      <section className="border-b border-hairline/50 bg-vanilla/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
            <div>
              <span className="font-mono text-sm text-accent">Principal</span>
              <h2 className="mt-3 text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-[-0.02em]">
                Ensamblaje a la medida
              </h2>
            </div>
            <div className="space-y-4 text-lg leading-relaxed text-panda">
              <p>
                Elegimos cada componente contigo según para qué vas a usar el
                equipo: juegos, edición, trabajo o estudio. Nada de plantillas
                genéricas ni piezas que no necesitas.
              </p>
              <p>
                El servicio incluye{" "}
                <strong className="font-semibold">
                  armado, instalación de sistema, formateo y configuración
                </strong>
                . Recibes el equipo encendido y listo para usar, con el cable
                management ordenado y las temperaturas en su punto.
              </p>
              <p>
                <Link
                  href="/ensambles"
                  className="text-accent hover:underline"
                >
                  Mira ejemplos reales de equipos que hemos armado →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Componentes */}
      <section className="border-b border-hairline/50 bg-vanilla/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-[-0.02em]">
            Componentes
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-panda">
            ¿Solo necesitas una pieza? Compra el componente que te falta, sin
            obligación de ensamble.
          </p>
          <dl className="mt-8 divide-y divide-hairline border-y border-hairline">
            {componentes.map((c) => (
              <div
                key={c.t}
                className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:gap-10"
              >
                <dt className="w-48 shrink-0 font-medium">{c.t}</dt>
                <dd className="text-sm text-component">{c.d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Cómo trabajamos */}
      <section className="border-b border-hairline bg-vanilla/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="font-mono text-sm text-accent">Proceso</span>
          <h2 className="mt-3 text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-[-0.02em]">
            Cómo trabajamos
          </h2>
          <p className="mt-3 max-w-xl text-lg text-panda">
            Seis pasos desde que nos cuentas qué necesitas hasta que enciendes
            tu equipo.
          </p>
          <div className="mt-10 grid gap-px overflow-hidden border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
            {pasos.map((p) => (
              <div key={p.n} className="bg-vanilla p-6 sm:p-7">
                <span className="font-mono text-xs text-component">
                  {p.n}
                </span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-3 text-accent"
                  aria-hidden="true"
                >
                  {stepIcons[p.icon]}
                </svg>
                <h3 className="mt-3 text-lg font-semibold">{p.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-panda">{p.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <ButtonLink href="/cotizador" variant="secondary">
              Cotiza tu PC
            </ButtonLink>
          </div>
        </div>
      </section>

      <FaqSection items={faqs} />

      {/* CTA */}
      <section className="bg-component/30">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <h2 className="text-[clamp(1.5rem,4vw,2.25rem)] font-bold tracking-[-0.02em]">
            Listo para armar tu equipo
          </h2>
          <ButtonLink
            href="/cotizador"
            size="lg"
            className="bg-accent text-accent-ink hover:bg-accent-deep"
          >
            Cotiza tu PC
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
