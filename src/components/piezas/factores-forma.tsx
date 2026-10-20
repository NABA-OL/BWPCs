/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-11
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Tamaños de tarjeta madre dibujados a escala real y anidados en la misma esquina (docs/piezas-plan.md, adenda 2026-10-11).
// Componente de servidor, SVG sin imágenes. Ningún tamaño se presenta como mejor o peor que otro.
import type { FactorForma } from "@/lib/piezas/types";

interface FactoresFormaProps {
  factores: readonly FactorForma[];
  /** Línea destacada sobre el dibujo: el aviso de que el tamaño no define la calidad. */
  mensaje: string;
}

const MARGEN_MM = 8;
const ALTO_NOMBRE = 12;
const ALTO_MEDIDAS = 10.5;
const SEPARACION_ROTULOS = 36; // alto que ocupa un rótulo de dos líneas más su aire

const formatoMm = (n: number): string => String(n).replace(".", ",");
const medidas = (f: FactorForma): string => `${formatoMm(f.anchoMm)} × ${formatoMm(f.altoMm)} mm`;

interface Rotulo {
  factor: FactorForma;
  /** Línea base de las medidas; el nombre va una línea arriba. */
  y: number;
}

/**
 * De la placa más grande a la más pequeña: cada rótulo se ancla abajo a la derecha dentro de su placa y sube lo necesario para no
 * pisar al anterior (las placas comparten esquina, así que sus bordes inferiores pueden coincidir).
 */
function ubicarRotulos(ordenadas: readonly FactorForma[]): readonly Rotulo[] {
  const rotulos: Rotulo[] = [];
  let tope = Infinity;
  for (const factor of ordenadas) {
    const y = Math.min(factor.altoMm - 10, tope - SEPARACION_ROTULOS);
    rotulos.push({ factor, y });
    tope = y;
  }
  return rotulos;
}

export function FactoresForma({ factores, mensaje }: FactoresFormaProps) {
  if (factores.length === 0) return null;
  const validos = factores.filter((f) => f.anchoMm > 0 && f.altoMm > 0);
  if (validos.length === 0) return null;

  // La más grande de fondo, las demás encima (se dibujan después).
  const ordenadas = [...validos].sort((a, b) => b.anchoMm * b.altoMm - a.anchoMm * a.altoMm);
  const anchoMax = Math.max(...ordenadas.map((f) => f.anchoMm));
  const altoMax = Math.max(...ordenadas.map((f) => f.altoMm));
  const rotulos = ubicarRotulos(ordenadas);
  const descripcion = `Tamaños de tarjeta madre a escala y superpuestos: ${ordenadas.map((f) => `${f.nombre}, ${medidas(f)}`).join("; ")}.`;

  return (
    <div>
      <p className="border-l-2 border-panda pl-4 text-xl font-bold leading-snug text-panda">{mensaje}</p>

      <svg
        viewBox={`0 0 ${anchoMax + MARGEN_MM * 2} ${altoMax + MARGEN_MM * 2}`}
        role="img"
        aria-label={descripcion}
        className="mt-6 block h-auto w-full max-w-xl text-panda"
      >
        <g transform={`translate(${MARGEN_MM} ${MARGEN_MM})`}>
          {ordenadas.map((f) => (
            // Hover con el acento: único uso de color del dibujo. pointer-events "all" para que el interior (sin relleno) también responda.
            <g key={f.id} className="text-panda transition-colors duration-150 hover:text-accent motion-reduce:transition-none">
              <rect
                x={0}
                y={0}
                width={f.anchoMm}
                height={f.altoMm}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
                pointerEvents="all"
              />
            </g>
          ))}
          {rotulos.map(({ factor, y }) => (
            <g key={factor.id} textAnchor="end" className="fill-panda stroke-vanilla" strokeWidth={4} strokeLinejoin="round" style={{ paintOrder: "stroke" }}>
              <text x={factor.anchoMm - 8} y={y - ALTO_NOMBRE - 2} fontSize={ALTO_NOMBRE} fontWeight={600}>
                {factor.nombre}
              </text>
              <text x={factor.anchoMm - 8} y={y} fontSize={ALTO_MEDIDAS} fontFamily="var(--font-jetbrains), ui-monospace, Menlo, monospace">
                {medidas(factor)}
              </text>
            </g>
          ))}
        </g>
      </svg>

      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {factores.map((f) => (
          <li key={f.id} className="border border-hairline bg-vanilla p-4">
            <h3 className="text-lg font-semibold text-panda">{f.nombre}</h3>
            <p className="mt-1 font-mono text-xs text-component">{medidas(f)}</p>
            <p className="mt-3 text-base text-panda">{f.resumen}</p>
            <p className="mt-3 text-sm text-panda">
              <span className="font-semibold">Para quién: </span>
              {f.paraQuien}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
