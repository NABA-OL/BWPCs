"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useState } from "react";
import { PhotoLightbox, type LightboxPhoto } from "@/components/reviews/photo-lightbox";

interface GalleryPhoto extends LightboxPhoto {
  id: string;
  thumbUrl: string;
}

/** Miniaturas de una reseña; al pulsar una se abre el visor con flechas. */
export function PhotoGallery({ photos, label }: { photos: GalleryPhoto[]; label: string }) {
  const [open, setOpen] = useState<number | null>(null);
  if (photos.length === 0) return null;

  return (
    <>
      <ul className="mt-3 flex flex-wrap gap-2">
        {photos.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Ampliar foto ${i + 1} de ${photos.length}`}
              className="block cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- miniatura ya procesada */}
              <img
                src={p.thumbUrl}
                alt=""
                width={80}
                height={80}
                className="h-20 w-20 border border-hairline object-cover transition-opacity hover:opacity-80"
              />
            </button>
          </li>
        ))}
      </ul>
      {open !== null && (
        <PhotoLightbox
          photos={photos}
          index={open}
          onIndexChange={setOpen}
          onClose={() => setOpen(null)}
          label={label}
        />
      )}
    </>
  );
}
