import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 md:pt-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="font-mono text-sm text-component">
              Ensamble &amp; componentes · Colombia
            </p>
            <h1 className="mt-4 text-[clamp(3rem,8vw,6rem)] font-extrabold leading-[0.95] tracking-[-0.04em]">
              Tu PC a la
              <br />
              medida.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-panda">
              Ensamblamos tu equipo con componentes que elegimos contigo, al
              precio justo. ¿Solo necesitas una pieza? También.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/cotizador" size="lg">
                Cotiza tu PC
              </ButtonLink>
              <ButtonLink href="/servicios" size="lg" variant="secondary">
                Ver servicios
              </ButtonLink>
            </div>
          </div>

          {/* Panda — momento de carácter, no patrón repetido */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="aspect-square border border-hairline bg-white">
              <Image
                src="/brand/logo.jpg"
                alt="Mascota de B & W: un panda gamer"
                width={600}
                height={600}
                priority
                className="h-full w-full object-contain p-6"
              />
            </div>
            {/* Acento geométrico del lenguaje de marca (PDF) */}
            <div className="absolute -right-3 -top-3 h-6 w-6 bg-accent" />
          </div>
        </div>
      </section>

      {/* Qué hacemos */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-[-0.02em]">
            Qué hacemos
          </h2>
          <div className="mt-8 grid gap-px overflow-hidden border border-hairline bg-hairline md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Ensamblaje",
                d: "Armado, formateo y configuración completa. Nuestro servicio principal: tu equipo listo para encender.",
              },
              {
                n: "02",
                t: "Componentes",
                d: "Gráficas, procesadores, RAM, boards, fuentes, chasis y refrigeración. Compra una pieza o todas.",
              },
              {
                n: "03",
                t: "Asesoría",
                d: "Te ayudamos a elegir según tu uso y presupuesto. Sin venderte de más, sin tecnicismos vacíos.",
              },
            ].map((c) => (
              <div key={c.n} className="bg-vanilla p-6">
                <span className="font-mono text-sm text-accent">{c.n}</span>
                <h3 className="mt-3 text-xl font-semibold">{c.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-panda">
                  {c.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA cotizador */}
      <section className="border-t border-hairline bg-panda text-vanilla">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-[-0.02em]">
              ¿Cuánto costaría tu PC?
            </h2>
            <p className="mt-2 max-w-md text-vanilla/70">
              Arma un estimado en segundos y escríbenos por WhatsApp para
              afinar los detalles.
            </p>
          </div>
          <ButtonLink
            href="/cotizador"
            size="lg"
            className="bg-accent text-accent-ink hover:bg-vanilla hover:text-panda"
          >
            Empezar a cotizar
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
