"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-19
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { useState } from "react";
import { PhotoLightbox } from "@/components/reviews/photo-lightbox";

export interface ProofImage {
  id: string;
  width: number;
  height: number;
  /** Texto bajo la miniatura (solo en `ProofThumbs`), p. ej. la fecha. */
  caption?: string;
}

const src = (id: string) => `/api/comprobantes/${id}`;

function useViewer(proofs: ProofImage[]) {
  const [index, setIndex] = useState<number | null>(null);
  const viewer =
    index !== null ? (
      <PhotoLightbox
        photos={proofs.map((p) => ({ url: src(p.id), width: p.width, height: p.height }))}
        index={index}
        onIndexChange={setIndex}
        onClose={() => setIndex(null)}
        label="Comprobante de pago"
      />
    ) : null;
  return { setIndex, viewer };
}

/** Enlace de texto que abre el comprobante en un visor (sin salir de la página). */
export function ProofLink({ proofs, children }: { proofs: ProofImage[]; children: React.ReactNode }) {
  const { setIndex, viewer } = useViewer(proofs);
  return (
    <>
      <button
        type="button"
        onClick={() => setIndex(proofs.length - 1)}
        className="text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {children}
      </button>
      {viewer}
    </>
  );
}

/** Miniaturas de los comprobantes (admin): al pulsar una se abre el visor con flechas si hay varias. */
export function ProofThumbs({ proofs }: { proofs: ProofImage[] }) {
  const { setIndex, viewer } = useViewer(proofs);
  return (
    <>
      <ul className="mt-3 flex flex-wrap gap-4">
        {proofs.map((p, i) => (
          <li key={p.id} className="text-xs text-component">
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label="Ampliar comprobante"
              className="block cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- imagen privada servida con sesión */}
              <img
                src={src(p.id)}
                alt="Comprobante de pago"
                width={p.width}
                height={p.height}
                className="max-h-56 w-auto border border-hairline"
              />
            </button>
            {p.caption && <p className="mt-1 font-mono">{p.caption}</p>}
          </li>
        ))}
      </ul>
      {viewer}
    </>
  );
}
