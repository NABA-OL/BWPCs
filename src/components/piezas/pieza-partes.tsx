/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-11
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Lista completa de partes (docs/piezas-plan.md §5.1 punto 3): es el contenido que leen los buscadores y quien navega sin JS.
// Componente de servidor. Muestra todo el contenido, también el borrador (la puerta de publicación vive en check:logic y en el registro).
import Link from "next/link";
import { entornoActual } from "@/lib/piezas/entorno";
import { enlacesResueltos } from "@/lib/piezas/registro";
import type { Fuente, Hecho, OpcionParte, ParteContenido, PiezaContenido } from "@/lib/piezas/types";

interface PiezaPartesProps {
  contenido: PiezaContenido<string, string>;
}

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-panda";
const ENLACE = `${FOCO} font-medium text-panda underline underline-offset-4`;
const SCROLL_BAJO_ENCABEZADO = { scrollMarginTop: "5rem" } as const; // el encabezado fijo mide 64 px

const dosCifras = (n: number): string => String(n).padStart(2, "0");

/** Solo se enlazan URLs https: una fuente con otro esquema (p. ej. javascript:) se muestra como texto. */
const esHttps = (url: string): boolean => url.startsWith("https://");

function ListaHechos({ hechos }: { hechos: readonly Hecho[] }) {
  return (
    <dl className="mt-2 space-y-2">
      {hechos.map((h, i) => (
        <div key={h.id}>
          <dt className={h.etiqueta ? "mb-1 text-xs font-medium text-component" : "sr-only"}>{h.etiqueta ?? `Dato ${i + 1}`}</dt>
          <dd className="m-0 border-l-2 border-hairline pl-3 font-mono text-sm text-panda">{h.texto}</dd>
        </div>
      ))}
    </dl>
  );
}

function Opciones({ titulo, items }: { titulo: string; items: readonly OpcionParte[] }) {
  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-panda">{titulo}</h4>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((op) => (
          <li key={op.id} className="border border-hairline p-3">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="inline-block border border-panda px-2 py-0.5 font-mono text-sm text-panda">{op.etiqueta}</span>
              {op.marca ? <span className="text-xs text-component">{op.marca}</span> : null}
              {op.vigente ? null : <span className="text-xs text-component">plataforma anterior</span>}
            </p>
            <p className="mt-2 text-sm text-panda">{op.resumen}</p>
            {op.hechos.length > 0 ? <ListaHechos hechos={op.hechos} /> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Fuentes únicas (por URL) de los hechos de la parte y de sus opciones, en orden de aparición. */
function fuentesDe(parte: ParteContenido): readonly Fuente[] {
  const hechos: Hecho[] = [...parte.hechos, ...(parte.opciones?.items.flatMap((op) => op.hechos) ?? [])];
  const vistas = new Set<string>();
  const unicas: Fuente[] = [];
  for (const hecho of hechos) {
    for (const f of hecho.fuentes) {
      if (vistas.has(f.url)) continue;
      vistas.add(f.url);
      unicas.push(f);
    }
  }
  return unicas;
}

function Fuentes({ fuentes }: { fuentes: readonly Fuente[] }) {
  if (fuentes.length === 0) return null;
  return (
    <details className="mt-6 border border-hairline px-3 py-2">
      <summary className={`${FOCO} cursor-pointer text-sm font-medium text-panda`}>Fuentes</summary>
      <ul className="mt-2 space-y-2 text-sm text-component">
        {fuentes.map((f) => (
          <li key={f.url}>
            {esHttps(f.url) ? (
              <a href={f.url} target="_blank" rel="noopener noreferrer" className={ENLACE}>
                {f.titulo}
              </a>
            ) : (
              <span className="text-panda">{f.titulo}</span>
            )}
            <span>
              {" "}
              · {f.editor} · consultado el <span className="font-mono">{f.consultadoEn}</span>
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}

function ParteSeccion({ id, parte, contenido }: { id: string; parte: ParteContenido; contenido: PiezaContenido<string, string> }) {
  const tituloId = `${id}-titulo`;
  const relacionadas = (parte.relacionadas ?? []).filter((rid) => Object.prototype.hasOwnProperty.call(contenido.partes, rid));
  // Los enlaces a otras piezas solo se pintan si el destino es visible en este entorno (en producción un borrador es 404).
  const enlaces = enlacesResueltos(parte.enlaces, entornoActual());
  return (
    <section id={id} aria-labelledby={tituloId} className="border-t border-hairline py-8" style={SCROLL_BAJO_ENCABEZADO}>
      <h3 id={tituloId} className="flex items-baseline gap-3 text-xl font-semibold text-panda">
        <span className="font-mono text-sm font-normal text-component">{dosCifras(parte.orden)}</span>
        <span>{parte.nombre}</span>
      </h3>
      {parte.alias && parte.alias.length > 0 ? <p className="mt-1 text-sm text-component">También se le dice: {parte.alias.join(", ")}.</p> : null}

      <p className="mt-4 max-w-prose text-base text-panda">{parte.queHace}</p>

      {parte.alElegir.length > 0 ? (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-panda">Al elegir</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-base text-panda marker:text-component">
            {parte.alElegir.map((punto) => (
              <li key={punto}>{punto}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {parte.hechos.length > 0 ? (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-panda">Datos</h4>
          <ListaHechos hechos={parte.hechos} />
        </div>
      ) : null}

      {parte.opciones ? <Opciones titulo={parte.opciones.titulo} items={parte.opciones.items} /> : null}

      {relacionadas.length > 0 ? (
        <p className="mt-6 text-sm text-panda">
          <span className="font-semibold">Relacionadas: </span>
          {relacionadas.map((rid, i) => (
            <span key={rid}>
              {i > 0 ? ", " : null}
              <a href={`#${rid}`} className={ENLACE}>
                {contenido.partes[rid].nombreCorto}
              </a>
            </span>
          ))}
        </p>
      ) : null}

      {enlaces.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {enlaces.map((e) => (
            <li key={e.href}>
              <Link href={e.href} className={ENLACE}>
                {e.etiqueta}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <Fuentes fuentes={fuentesDe(parte)} />
    </section>
  );
}

export function PiezaPartes({ contenido }: PiezaPartesProps) {
  const partes = Object.entries(contenido.partes).sort(([, a], [, b]) => a.orden - b.orden);
  return (
    <section id="lista" aria-labelledby="lista-titulo" style={SCROLL_BAJO_ENCABEZADO}>
      <h2 id="lista-titulo" className="text-2xl font-bold text-panda">
        Las partes, una por una
      </h2>
      <div className="mt-6">
        {partes.map(([id, parte]) => (
          <ParteSeccion key={id} id={id} parte={parte} contenido={contenido} />
        ))}
      </div>
    </section>
  );
}
