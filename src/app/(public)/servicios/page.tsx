/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { PcBackdrop } from "@/components/assembly-hero";

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

const pasos = [
  {
    n: "01",
    t: "Cotiza",
    d: "Arma un estimado en el cotizador o cuéntanos qué buscas.",
  },
  {
    n: "02",
    t: "Afinamos",
    d: "Por WhatsApp ajustamos componentes y precio a tu presupuesto real.",
  },
  {
    n: "03",
    t: "Ensamblamos",
    d: "Armamos, instalamos, formateamos y configuramos. Listo para encender.",
  },
];

export default function ServiciosPage() {
  return (
    <>
      <PcBackdrop />
      <PageHero eyebrow="Lo que ofrecemos" title="Servicios">
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

      {/* Cómo funciona */}
      <section className="border-b border-hairline bg-vanilla/40">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-[-0.02em]">
            Cómo funciona
          </h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {pasos.map((p) => (
              <div key={p.n}>
                <span className="font-mono text-2xl font-medium text-accent">
                  {p.n}
                </span>
                <h3 className="mt-2 text-xl font-semibold">{p.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-panda">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
