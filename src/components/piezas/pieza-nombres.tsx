/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Punto de montaje del decodificador de nombres de procesador (docs/piezas-plan-2.md §2.2). Componente de servidor.
// Pinta el texto introductorio, el formulario interactivo (isla de cliente) y, después, las tablas estáticas (lo que lee quien navega sin JS).
import { DecodificadorProcesador } from "@/components/piezas/decodificador-procesador";
import { DecodificadorTablas } from "@/components/piezas/decodificador-tablas";
import type { DatosDecodificador, SeccionTexto } from "@/lib/piezas/types";

interface PiezaNombresProps {
  datos: DatosDecodificador;
  /** Sección de texto con id «nombres» (título y párrafos); si la pieza no la trae se usa un título genérico. */
  seccion?: SeccionTexto;
}

const SCROLL_BAJO_ENCABEZADO = { scrollMarginTop: "5rem" } as const; // el encabezado fijo mide 64 px
const CONTENEDOR = "mx-auto max-w-6xl px-4 py-16 sm:px-6";
const TITULO_SECCION = "text-balance text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold tracking-[-0.02em]";

export function PiezaNombres({ datos, seccion }: PiezaNombresProps) {
  const hayDatos = datos.familias.length > 0 || datos.sufijos.length > 0;
  return (
    <section id="nombres" aria-labelledby="nombres-titulo" className="border-b border-hairline/50" style={SCROLL_BAJO_ENCABEZADO}>
      <div className={CONTENEDOR}>
        <h2 id="nombres-titulo" className={TITULO_SECCION}>
          {seccion?.titulo ?? "Cómo leer el nombre"}
        </h2>
        {seccion ? (
          <div className="mt-4 max-w-prose space-y-4 text-lg leading-relaxed text-panda">
            {seccion.parrafos.map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
          </div>
        ) : null}
        {hayDatos ? null : <p className="mt-4 font-mono text-sm text-component">El decodificador de nombres está en preparación.</p>}
        {hayDatos ? (
          <>
            <DecodificadorProcesador datos={datos} />
            <DecodificadorTablas datos={datos} />
          </>
        ) : null}
      </div>
    </section>
  );
}
