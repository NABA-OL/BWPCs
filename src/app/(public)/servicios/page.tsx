/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { SectionNav } from "@/components/section-nav";
import { ButtonLink } from "@/components/ui/button";
import { TowerBackdrop } from "@/components/tower-hero";
import { ComponentShowcase, type ShowcaseItem } from "@/components/component-showcase";
import { FaqSection } from "@/components/faq-section";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { JsonLd } from "@/components/json-ld";
import { entornoActual } from "@/lib/piezas/entorno";
import { enlacesServicios } from "@/lib/piezas/indice";
import { hayIndice } from "@/lib/piezas/registro";
import { assemblyServiceSchema } from "@/lib/schema";
import { PAYMENT_MEDIA_TEXT } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Ensamblaje de PC a la medida y componentes",
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
    url: "https://bw-pcs.com/servicios",
  },
};

const entorno = entornoActual();

const pasosComponentes: ShowcaseItem[] = [
  { id: "procesador", t: "Procesadores", d: "AMD e Intel, según tu uso y presupuesto." },
  { id: "graficas", t: "Tarjetas gráficas", d: "Desde gama media hasta entusiasta." },
  { id: "ram", t: "Memorias RAM", d: "DDR4 y DDR5, en las frecuencias que rinden." },
  { id: "boards", t: "Boards", d: "La base correcta para tu procesador." },
  { id: "fuentes", t: "Fuentes de poder", d: "80+ certificadas, el vatiaje justo." },
  { id: "chasis", t: "Chasis", d: "Flujo de aire y espacio para crecer." },
  {
    id: "refrigeracion",
    t: "Refrigeración",
    d: "Por aire o líquida: elige la que mejor te funcione.",
    variants: [
      { id: "aire", label: "Aire", d: "Disipador de torre con heatpipes y ventilador." },
      { id: "liquida", label: "Líquida", d: "Bomba sobre el procesador y radiador con ventiladores, unidos por dos tubos." },
    ],
  },
  {
    id: "almacenamiento",
    t: "Almacenamiento",
    d: "M.2 NVMe, SSD SATA o disco duro, según velocidad y capacidad.",
    variants: [
      { id: "m2", label: "M.2 NVMe", d: "El más rápido: ideal para el sistema operativo y los juegos." },
      { id: "sata", label: "SSD SATA", d: "Rápido y económico: una buena opción para programas y juegos extra." },
      { id: "hdd", label: "HDD 3,5″", d: "Mucho espacio al menor precio: para archivos, fotos y copias de seguridad." },
    ],
  },
];

/** Páginas "a fondo" por paso; un paso solo lleva `href` si su pieza es visible (producción con borrador: nada cambia en el HTML). */
const enlacesPiezas = enlacesServicios(pasosComponentes.map((p) => p.id), entorno);
const hrefPorPaso = new Map(enlacesPiezas.map((e) => [e.paso, e.href]));
const componentes: ShowcaseItem[] = pasosComponentes.map((c) => {
  const href = hrefPorPaso.get(c.id);
  return href ? { ...c, href } : c;
});

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
    a: `${PAYMENT_MEDIA_TEXT}. Puedes ver el total con cada recargo desde el cotizador.`,
  },
  {
    q: "¿Puedo comprar solo una pieza sin ensamble?",
    a: "Sí. Vendemos componentes sueltos (gráficas, procesadores, RAM y más) sin obligación de armar el equipo completo. Puedes ver precios en el catálogo de componentes.",
  },
  {
    q: "¿Cuánto cuesta armar un PC con ustedes?",
    a: "Depende de la gama de cada componente. En el cotizador eliges gama por categoría y ves el total aproximado al instante, con el ensamblaje ya incluido. También tenemos configuraciones armadas por presupuesto: 3, 5 y 8 millones.",
  },
  {
    q: "¿Puedo aprovechar componentes que ya tengo?",
    a: "Sí. Si ya tienes chasis, fuente, almacenamiento o cualquier otra pieza en buen estado, la revisamos y te cotizamos solo lo que falta.",
  },
  {
    q: "¿El precio incluye sistema operativo y configuración?",
    a: "El servicio incluye armado, instalación del sistema, formateo y configuración. Recibes el equipo encendido y listo para usar, con el cable management ordenado y las temperaturas verificadas.",
  },
  {
    q: "¿Por qué cambian los precios de las gráficas y procesadores?",
    a: "Son componentes importados: su precio en pesos depende del dólar del día más los costos de importación. Por eso una cotización de hace un mes puede no coincidir con la de hoy.",
  },
  {
    q: "¿Arman equipos para trabajo, no solo para juegos?",
    a: "Sí. Armamos equipos para edición de video, arquitectura y renderizado, streaming y estaciones de trabajo. Las prioridades de componentes cambian según el uso, y eso lo definimos contigo antes de cotizar.",
  },
  {
    q: "¿Qué pasa si un componente sale defectuoso?",
    a: "Cada componente tiene la garantía de su fabricante y nosotros gestionamos el proceso. El ensamblaje en sí queda cubierto por nosotros.",
  },
];

const pasos = [
  {
    n: "01",
    t: "Cuéntanos qué necesitas",
    d: "Nos dices para qué vas a usar el equipo (juegos, trabajo, edición) y tu presupuesto.",
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
  chat: <path d="M4 5.5h16v10H9l-4 3.5v-3.5H4v-10Z" />,
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

// Secciones del indicador lateral, en el orden de la página.
const navItems = [
  { id: "inicio", label: "Inicio" },
  { id: "ensamblaje", label: "Ensamblaje" },
  { id: "componentes", label: "Componentes" },
  { id: "proceso", label: "Cómo trabajamos" },
  { id: "preguntas", label: "Preguntas" },
  { id: "cotizar", label: "Cotizar" },
];

export default function ServiciosPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: "https://bw-pcs.com/" },
          { name: "Servicios", url: "https://bw-pcs.com/servicios" },
        ]}
      />
      <JsonLd data={assemblyServiceSchema()} />
      <TowerBackdrop />
      <SectionNav items={navItems} />
      <div id="inicio">
        <PageHero
          eyebrow="Lo que ofrecemos"
          title="Ensamblaje de PC y venta de componentes"
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
      </div>

      {/* Ensamblaje — servicio principal */}
      <section id="ensamblaje" className="border-b border-hairline/50 bg-vanilla/40">
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
                <Link href="/ensambles" className="text-accent hover:underline">
                  Mira ejemplos reales de equipos que hemos armado →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Componentes */}
      <section id="componentes" className="border-b border-hairline/50 bg-vanilla/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-[-0.02em]">
            Componentes
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-panda">
            ¿Solo necesitas una pieza? Compra el componente que te falta, sin
            obligación de ensamble.
          </p>
          {enlacesPiezas.length > 0 ? (
            <p className="mt-3 max-w-2xl text-sm">
              <span className="text-component">Ver a fondo: </span>
              {enlacesPiezas.map((e, i) => (
                <span key={e.paso}>
                  {i > 0 && " · "}
                  <Link href={e.href} className="font-medium underline underline-offset-4">
                    {e.etiqueta}
                  </Link>
                </span>
              ))}
              {hayIndice(entorno) ? (
                <>
                  {" · "}
                  <Link href="/piezas" className="font-medium underline underline-offset-4">
                    Todas las piezas →
                  </Link>
                </>
              ) : null}
            </p>
          ) : null}
          <dl className="cs-list mt-8 divide-y divide-hairline border-y border-hairline">
            {componentes.map((c) => (
              <div
                key={c.t}
                className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:gap-10"
              >
                <dt className="w-48 shrink-0 font-medium">{c.t}</dt>
                <dd className="text-sm text-component">
                  {c.d}
                  {c.variants && (
                    <ul className="mt-1.5 space-y-1 text-sm">
                      {c.variants.map((v) => (
                        <li key={v.id}>
                          <span className="font-medium">{v.label}:</span> {v.d}
                        </li>
                      ))}
                    </ul>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        {/* Con JS y sin movimiento reducido el escenario reemplaza a la lista (ver .cs-track / .cs-list en globals.css) */}
        <ComponentShowcase items={componentes} />
      </section>

      {/* Cómo trabajamos */}
      <section id="proceso" className="border-b border-hairline bg-vanilla/40">
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
                <span className="font-mono text-xs text-component">{p.n}</span>
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

      <div id="preguntas">
        <FaqSection items={faqs} />
      </div>

      {/* CTA */}
      <section id="cotizar" className="bg-component/30">
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
