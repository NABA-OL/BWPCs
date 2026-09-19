"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { useState } from "react";
import Image from "next/image";
import { PhotoLightbox } from "@/components/reviews/photo-lightbox";

/** Imagen (el QR de Bre-B) que se amplía al pulsarla, con el mismo visor de las fotos de reseñas. */
export function QrZoom({
  src,
  width,
  height,
  alt,
}: {
  src: string;
  width: number;
  height: number;
  alt: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Ampliar: ${alt}`}
        className="group relative block cursor-zoom-in border border-hairline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Image src={src} width={width} height={height} alt={alt} className="h-auto w-56" />
        <span className="absolute bottom-2 right-2 bg-vanilla/90 px-2 py-1 text-[11px] text-component">Pulsa para ampliar</span>
      </button>
      {open && (
        <PhotoLightbox
          photos={[{ url: src, width, height }]}
          index={0}
          onIndexChange={() => undefined}
          onClose={() => setOpen(false)}
          label={alt}
        />
      )}
    </>
  );
}
