/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-27
 */
import type { Metadata } from "next";
import { Button, ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Style Guide",
  robots: { index: false, follow: false },
};

const colors = [
  {
    name: "Vanilla Surface",
    hex: "#FAF8F3",
    cls: "bg-vanilla border border-hairline",
    use: 'Fondo base de todo el sitio ("workbench").',
  },
  {
    name: "Panda Black",
    hex: "#0A0A0A",
    cls: "bg-panda",
    use: "Texto principal, fondos de CTA primario y footer.",
  },
  {
    name: "Component Gray",
    hex: "#6B6B6B",
    cls: "bg-component",
    use: "Texto secundario, metadatos, labels de formulario.",
  },
  {
    name: "Hairline Gray",
    hex: "#E5E5E5",
    cls: "bg-hairline",
    use: "Bordes, separadores de fila, líneas de grid.",
  },
  {
    name: "Accent (carmesí)",
    hex: "#C83C2A",
    cls: "bg-accent",
    use: "Único acento del sitio. CTAs, eyebrows, precios, focus.",
  },
  {
    name: "Accent Deep",
    hex: "#9E2E1F",
    cls: "bg-accent-deep",
    use: "Hover / estado activo del acento.",
  },
];

function SectionTitle({
  title,
  desc,
}: {
  title: string;
  desc?: React.ReactNode;
}) {
  return (
    <>
      <h2 className="text-[clamp(1.4rem,3vw,1.9rem)] font-bold tracking-[-0.02em]">
        {title}
      </h2>
      {desc && (
        <p className="mt-1.5 max-w-2xl text-component">{desc}</p>
      )}
    </>
  );
}

export default function StyleGuidePage() {
  return (
    <div className="min-h-full bg-vanilla text-panda">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <header className="border-b border-hairline py-12">
          <p className="font-mono text-sm text-accent">Sistema de diseño</p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[0.98] tracking-[-0.03em]">
            B &amp; W — Style Guide
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-component">
            Monocromo (vainilla / panda / gris) + un único acento carmesí, en
            ≤10% de la pantalla. Jerarquía por peso tipográfico, no por color.
            Sin sombras en superficies estáticas, radio 2px, bordes hairline.
            Fuente base <strong className="text-panda">Geist</strong>,
            precios/specs en{" "}
            <strong className="text-panda">JetBrains Mono</strong>.
          </p>
        </header>

        {/* Colores */}
        <section className="border-b border-hairline py-12">
          <SectionTitle
            title="Colores"
            desc="Un solo acento. El resto es escala de grises. El acento se reserva para CTAs, precios activos, eyebrows y estados interactivos."
          />
          <div className="mt-8 grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-3">
            {colors.map((c) => (
              <div key={c.hex} className="bg-vanilla p-5">
                <div className={`h-16 rounded-[2px] ${c.cls}`} />
                <p className="mt-3 font-semibold">{c.name}</p>
                <p className="mt-0.5 font-mono text-sm text-component">
                  {c.hex}
                </p>
                <p className="mt-1.5 text-sm text-component">{c.use}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tipografía */}
        <section className="border-b border-hairline py-12">
          <SectionTitle
            title="Tipografía"
            desc="Jerarquía por contraste de peso (800 ↔ 400). font-mono reservado para precios, specs numéricas y eyebrows."
          />
          <div className="mt-4 divide-y divide-hairline">
            <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:gap-8">
              <span className="w-40 shrink-0 font-mono text-xs text-component">
                H1 · 800 · sans
              </span>
              <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-extrabold leading-[0.95] tracking-[-0.04em]">
                Ensamblamos tu PC.
              </h1>
            </div>
            <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:gap-8">
              <span className="w-40 shrink-0 font-mono text-xs text-component">
                H2 · 700 · sans
              </span>
              <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-[-0.02em]">
                Cómo trabajamos
              </h2>
            </div>
            <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:gap-8">
              <span className="w-40 shrink-0 font-mono text-xs text-component">
                H3 · 600 · sans
              </span>
              <h3 className="text-xl font-semibold">
                Ensamblaje a la medida
              </h3>
            </div>
            <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:gap-8">
              <span className="w-40 shrink-0 font-mono text-xs text-component">
                Body · 400
              </span>
              <p className="max-w-xl text-lg leading-relaxed">
                Elegimos cada componente contigo según para qué vas a usar el
                equipo: juegos, edición, trabajo o estudio.
              </p>
            </div>
            <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:gap-8">
              <span className="w-40 shrink-0 font-mono text-xs text-component">
                Eyebrow · mono
              </span>
              <p className="font-mono text-sm text-accent">
                Ensamble &amp; componentes · Colombia
              </p>
            </div>
            <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:gap-8">
              <span className="w-40 shrink-0 font-mono text-xs text-component">
                Precio · mono
              </span>
              <p className="font-mono text-2xl font-medium">$ 2.650.000</p>
            </div>
          </div>
        </section>

        {/* Botones */}
        <section className="border-b border-hairline py-12">
          <SectionTitle
            title="Botones"
            desc="Dos variantes, dos tamaños. Radio 2px, uppercase, sin sombra."
          />
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <ButtonLink href="/style-guide" size="lg">
              Cotiza tu PC
            </ButtonLink>
            <ButtonLink href="/style-guide" size="lg" variant="secondary">
              Ver servicios
            </ButtonLink>
            <ButtonLink
              href="/style-guide"
              size="lg"
              className="bg-accent text-accent-ink hover:bg-accent-deep"
            >
              Empezar a cotizar
            </ButtonLink>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Button size="md">Escribir por WhatsApp</Button>
            <Button size="md" variant="secondary">
              Volver al inicio
            </Button>
            <Button size="md" disabled>
              Deshabilitado
            </Button>
          </div>
        </section>

        {/* Formularios */}
        <section className="border-b border-hairline py-12">
          <SectionTitle
            title="Formularios"
            desc="Borde hairline, foco = borde negro sólido, sin glow. Campos técnicos en mono."
          />
          <div className="mt-6 max-w-sm space-y-5">
            <div>
              <label className="block text-sm font-medium text-component">
                Usuario
              </label>
              <input
                readOnly
                value="admin"
                className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 text-panda outline-none focus:border-panda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-component">
                Contraseña
              </label>
              <input
                readOnly
                value="••••••••"
                className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 font-mono text-panda outline-none focus:border-panda"
              />
            </div>
            <p className="border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent">
              Usuario o contraseña incorrectos.
            </p>
          </div>
        </section>

        {/* Cards / grid de proceso */}
        <section className="border-b border-hairline py-12">
          <SectionTitle
            title="Cards & grids"
            desc='Grid con hairline compartida entre celdas (gap-px sobre fondo gris) en vez de sombra o radio.'
          />
          <div className="mt-6 grid gap-px overflow-hidden border border-hairline bg-hairline sm:grid-cols-3">
            {[
              {
                n: "01",
                t: "Cuéntanos qué necesitas",
                d: "Nos dices para qué vas a usar el equipo y tu presupuesto.",
              },
              {
                n: "02",
                t: "Evaluamos tu caso",
                d: "Armado completo o piezas sueltas, según lo que ya tengas.",
              },
              {
                n: "03",
                t: "Cotización",
                d: "Propuesta con precio aproximado, afinada por WhatsApp.",
              },
            ].map((s) => (
              <div key={s.n} className="bg-vanilla p-6">
                <span className="font-mono text-xs text-component">
                  {s.n}
                </span>
                <h4 className="mt-3 font-semibold">{s.t}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-panda">
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Listas de especificación */}
        <section className="border-b border-hairline py-12">
          <SectionTitle
            title="Listas de especificación"
            desc="Filas dt/dd separadas por hairline — catálogos de componentes, valores de marca."
          />
          <dl className="mt-6 divide-y divide-hairline border-y border-hairline">
            {[
              ["Procesadores", "AMD e Intel, según tu uso y presupuesto."],
              ["Tarjetas gráficas", "Desde gama media hasta entusiasta."],
              [
                "Memorias RAM",
                "DDR4 y DDR5, en las frecuencias que rinden.",
              ],
            ].map(([t, d]) => (
              <div
                key={t}
                className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:gap-10"
              >
                <dt className="w-48 shrink-0 font-medium">{t}</dt>
                <dd className="text-sm text-component">{d}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Chips */}
        <section className="border-b border-hairline py-12">
          <SectionTitle
            title="Chips / badges"
            desc="Etiquetas mono con borde fino — medios de pago, marcas, metadatos cortos."
          />
          <div className="mt-6 flex flex-wrap gap-2">
            {["Bre-B", "Tarjeta", "PSE", "Daviplata", "Nequi"].map((m) => (
              <span
                key={m}
                className="border border-hairline px-3 py-1 font-mono text-sm"
              >
                {m}
              </span>
            ))}
          </div>
        </section>

        {/* Enlaces */}
        <section className="border-b border-hairline py-12">
          <SectionTitle title="Enlaces" />
          <div className="mt-6 flex flex-col gap-4">
            <a href="#" className="w-fit text-accent hover:underline">
              Mira ejemplos reales de equipos que hemos armado →
            </a>
            <div className="flex gap-8">
              <a
                href="#"
                className="relative py-1 text-sm font-medium text-panda after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-accent"
              >
                Inicio
              </a>
              <a
                href="#"
                className="py-1 text-sm font-medium text-panda transition-colors hover:text-accent"
              >
                Servicios
              </a>
            </div>
          </div>
        </section>

        {/* Banner */}
        <section className="border-b border-hairline py-12">
          <SectionTitle
            title="Banners"
            desc="Única superficie del sitio con sombra: el aviso de cookies, flotante sobre el contenido."
          />
          <div className="mt-6 flex max-w-2xl flex-col gap-4 border border-hairline bg-vanilla p-4 shadow-[0_4px_24px_rgba(0,0,0,0.1)] sm:flex-row sm:items-center sm:gap-6">
            <p className="text-sm leading-relaxed text-panda">
              Usamos cookies <strong className="font-medium">necesarias</strong>{" "}
              para el funcionamiento del sitio.{" "}
              <a href="#" className="text-accent hover:underline">
                Más info
              </a>
            </p>
            <div className="flex shrink-0 gap-2">
              <button className="rounded-[2px] border border-hairline px-4 py-2 text-sm font-medium text-component hover:border-panda hover:text-panda">
                Rechazar
              </button>
              <button className="rounded-[2px] bg-panda px-4 py-2 text-sm font-medium uppercase tracking-wide text-vanilla hover:bg-accent">
                Aceptar
              </button>
            </div>
          </div>
        </section>

        {/* Modal (sugerido) */}
        <section className="border-b border-hairline py-12">
          <SectionTitle
            title="Modal / diálogo"
            desc={
              <>
                <em>Patrón sugerido — el sitio no usa modales actualmente.</em>{" "}
                Borde sólido en vez de sombra, sin radio decorativo.
              </>
            }
          />
          <div className="mt-6 flex justify-center bg-hairline p-10">
            <div className="w-full max-w-sm border border-panda bg-vanilla p-7">
              <h4 className="text-lg font-bold">Eliminar componente</h4>
              <p className="mt-2 text-sm text-component">
                Esta acción no se puede deshacer. ¿Seguro que quieres
                continuar?
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <Button size="md" variant="secondary">
                  Cancelar
                </Button>
                <Button
                  size="md"
                  className="bg-accent text-accent-ink hover:bg-accent-deep"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Tokens */}
        <section className="py-12">
          <SectionTitle title="Radio, bordes y motion" />
          <dl className="mt-6 divide-y divide-hairline border-y border-hairline">
            {[
              ["Radio", "2px — casi nulo, técnico, no juguetón."],
              [
                "Borde estándar",
                "1px sólido, hairline (#E5E5E5) o panda en foco/hover.",
              ],
              [
                "Sombra",
                "Ninguna en superficies estáticas. Única excepción: banner de cookies.",
              ],
              [
                "Transiciones",
                "150–300ms, solo color/background-color/border-color/transform/opacity.",
              ],
              [
                "Reduced motion",
                "Todas las animaciones respetan prefers-reduced-motion: reduce.",
              ],
            ].map(([t, d]) => (
              <div
                key={t}
                className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:gap-10"
              >
                <dt className="w-48 shrink-0 font-medium">{t}</dt>
                <dd className="text-sm text-component">{d}</dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className="pb-16 text-xs text-component">
          Generado a partir de <code>globals.css</code>,{" "}
          <code>components/ui/button.tsx</code> y patrones vivos del sitio.
          Ver <code>docs/DESIGN.md</code>. Ruta no listada en navegación ni en
          sitemap — solo referencia interna.
        </footer>
      </div>
    </div>
  );
}
