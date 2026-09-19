"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useCallback, useEffect, useState, type TouchEvent } from "react";
import { UserAvatar } from "@/components/account/user-avatar";
import { PhotoLightbox } from "@/components/reviews/photo-lightbox";
import { Stars } from "@/components/reviews/stars";
import type { PublicReview } from "@/lib/reviews/reviews";

/** Cada reseña se queda a la vista este tiempo antes de pasar a la siguiente. */
const AUTOPLAY_MS = 60_000;
/** Tarjetas visibles en la pila: la activa y las que le siguen detrás. */
const STACK_SIZE = 4;
const SWIPE_PX = 45;

interface Slot {
  transform: string;
  opacity: number;
}

// Posición de cada tarjeta en la pila (0 = al frente). Las de atrás salen hacia
// arriba y a la derecha, ligeramente giradas, para insinuar las reseñas que siguen.
const SLOTS: readonly Slot[] = [
  { transform: "translate(0px, 0px) rotate(0deg) scale(1)", opacity: 1 },
  { transform: "translate(16px, -14px) rotate(2.5deg) scale(0.97)", opacity: 0.95 },
  { transform: "translate(32px, -28px) rotate(-2.5deg) scale(0.94)", opacity: 0.8 },
  { transform: "translate(48px, -42px) rotate(3deg) scale(0.91)", opacity: 0.6 },
];
// La que entra por el fondo y la que sale por la izquierda (invisibles).
const ENTERING: Slot = { transform: "translate(60px, -52px) rotate(0deg) scale(0.88)", opacity: 0 };
const EXITING: Slot = { transform: "translate(-40px, 18px) rotate(-6deg) scale(0.96)", opacity: 0 };

const mod = (n: number, m: number) => ((n % m) + m) % m;

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
      <path d={dir === "left" ? "M19 12H5M11 6l-6 6 6 6" : "M5 12h14M13 6l6 6-6 6"} />
    </svg>
  );
}

const SQUARE_BTN =
  "flex h-10 w-10 items-center justify-center border border-hairline bg-vanilla text-panda transition-colors hover:border-panda hover:bg-panda hover:text-vanilla focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function srcSet(p: { url: string; thumbUrl: string; width: number }): string {
  return `${p.thumbUrl} ${Math.min(480, p.width)}w, ${p.url} ${p.width}w`;
}

/** Cara de una tarjeta de fondo: solo la primera foto (miniatura) o el avatar. */
function BackFace({ review }: { review: PublicReview }) {
  const photo = review.fotos[0];
  return photo ? (
    // eslint-disable-next-line @next/next/no-img-element -- miniatura ya procesada
    <img src={photo.thumbUrl} alt="" loading="lazy" draggable={false} className="h-full w-full object-cover" />
  ) : (
    <AvatarFace review={review} />
  );
}

function AvatarFace({ review }: { review: PublicReview }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-hairline/40">
      <UserAvatar
        style={review.autor.avatarStyle}
        seed={review.autor.avatarSeed}
        size={176}
        className="h-40 w-40 border border-hairline bg-vanilla"
      />
    </div>
  );
}

/**
 * Reseñas de la home: la foto es la protagonista. Una pila de tarjetas muestra la
 * reseña activa al frente y, detrás, las tres que siguen; la activa cambia sola
 * cada minuto (se pausa al pasar el mouse, con el foco o con el visor abierto y no
 * corre con "reducir movimiento"). Las fotos de una reseña se cambian con flechas
 * o deslizando, con puntos indicadores; al pulsar una se abre el visor.
 */
export function ReviewsShowcase({ reviews }: { reviews: PublicReview[] }) {
  const n = reviews.length;
  const [active, setActive] = useState(0);
  const [photoState, setPhotoState] = useState<{ id: string; index: number }>({ id: "", index: 0 });
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = () => setReducedMotion(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const go = useCallback((delta: number) => setActive((a) => mod(a + delta, n)), [n]);

  const paused = hovered || lightbox !== null || reducedMotion || n < 2;
  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => go(1), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [active, paused, go]);

  if (n === 0) return null;

  const current = reviews[active];
  const photoIndex = photoState.id === current.id ? photoState.index : 0;
  const photos = current.fotos;
  const setPhoto = (index: number) => setPhotoState({ id: current.id, index: mod(index, photos.length) });

  // Tarjetas montadas: las visibles + una entrando por el fondo + una saliendo.
  const visible = Math.min(STACK_SIZE, n);
  const positions = Array.from({ length: visible }, (_, p) => p);
  if (n >= visible + 1) positions.push(visible);
  if (n >= visible + 2) positions.push(-1);

  function onPhotoTouchEnd(e: TouchEvent) {
    if (touchStart === null || photos.length < 2) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchStart) - touchStart;
    setTouchStart(null);
    if (Math.abs(dx) > SWIPE_PX) setPhoto(photoIndex + (dx < 0 ? 1 : -1));
  }

  return (
    <div
      className="mt-10 grid gap-8 md:grid-cols-[minmax(0,26rem)_minmax(0,28rem)] md:items-center md:justify-center md:gap-14"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Reseñas de clientes"
    >
      {/* Pila de fotos */}
      <div className="relative mx-auto w-full max-w-md pr-12 pt-12 md:mx-0">
        <div className="relative aspect-square">
          {positions.map((p) => {
            const review = reviews[mod(active + p, n)];
            const slot = p === -1 ? EXITING : p >= visible ? ENTERING : SLOTS[p];
            const front = p === 0;
            return (
              <div
                key={review.id}
                aria-hidden={front ? undefined : true}
                className={`absolute inset-0 overflow-hidden border border-hairline bg-vanilla transition-[transform,opacity] duration-700 ease-in-out ${front ? "" : "pointer-events-none"}`}
                style={{ transform: slot.transform, opacity: slot.opacity, zIndex: 20 - (p + 1) }}
              >
                {front ? (
                  photos.length > 0 ? (
                    <div className="group relative h-full w-full" onTouchStart={(e) => setTouchStart(e.touches[0]?.clientX ?? null)} onTouchEnd={onPhotoTouchEnd}>
                      {photos.map((photo, i) => (
                        // eslint-disable-next-line @next/next/no-img-element -- foto ya procesada; srcSet elige miniatura o grande
                        <img
                          key={photo.id}
                          src={photo.url}
                          srcSet={srcSet(photo)}
                          sizes="(min-width: 768px) 416px, 90vw"
                          alt={`Foto ${i + 1} de la reseña de ${review.autor.nombre}`}
                          loading={i === 0 ? "eager" : "lazy"}
                          draggable={false}
                          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${i === photoIndex ? "opacity-100" : "opacity-0"}`}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => setLightbox(photoIndex)}
                        aria-label="Ampliar foto"
                        className="absolute inset-0 cursor-zoom-in focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent"
                      />
                      {photos.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setPhoto(photoIndex - 1)}
                            aria-label="Foto anterior"
                            className={`${SQUARE_BTN} absolute left-3 top-1/2 -translate-y-1/2 border-transparent bg-vanilla/90 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:focus-visible:opacity-100`}
                          >
                            <Arrow dir="left" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPhoto(photoIndex + 1)}
                            aria-label="Foto siguiente"
                            className={`${SQUARE_BTN} absolute right-3 top-1/2 -translate-y-1/2 border-transparent bg-vanilla/90 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:focus-visible:opacity-100`}
                          >
                            <Arrow dir="right" />
                          </button>
                          <div className="absolute inset-x-0 bottom-3 flex justify-center">
                            <div className="flex items-center gap-2 bg-vanilla/90 px-3 py-2" role="group" aria-label="Fotos de la reseña">
                              {photos.map((photo, i) => (
                                <button
                                  key={photo.id}
                                  type="button"
                                  onClick={() => setPhoto(i)}
                                  aria-label={`Ver foto ${i + 1} de ${photos.length}`}
                                  aria-current={i === photoIndex ? "true" : undefined}
                                  className={`block transition-all ${i === photoIndex ? "h-2.5 w-2.5 bg-panda" : "h-1.5 w-1.5 bg-panda/30 hover:bg-panda/60"}`}
                                />
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <AvatarFace review={review} />
                  )
                ) : (
                  <BackFace review={review} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Texto y controles */}
      <div className="min-w-0">
        <div key={current.id} className="bw-review-in">
          <div className="flex items-center gap-3">
            <UserAvatar
              style={current.autor.avatarStyle}
              seed={current.autor.avatarSeed}
              size={48}
              className="h-12 w-12 shrink-0 border border-hairline"
            />
            <div>
              <h3 className="text-2xl font-bold leading-tight">{current.autor.nombre}</h3>
              <Stars value={current.estrellas} size={18} className="mt-1" />
              {current.compraVerificada && (
                <p className="mt-1 text-xs font-medium text-component">Compra verificada</p>
              )}
            </div>
          </div>
          <p className="mt-6 whitespace-pre-line text-pretty text-lg leading-relaxed text-panda md:text-xl">
            “{current.comentario}”
          </p>
        </div>

        {n > 1 && (
          <div className="mt-8 flex items-center gap-4">
            <button type="button" onClick={() => go(-1)} aria-label="Reseña anterior" className={SQUARE_BTN}>
              <Arrow dir="left" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Reseña siguiente" className={SQUARE_BTN}>
              <Arrow dir="right" />
            </button>
            <p className="font-mono text-xs text-component tabular-nums" aria-live="off">
              {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </p>
          </div>
        )}
      </div>

      {lightbox !== null && photos.length > 0 && (
        <PhotoLightbox
          photos={photos}
          index={lightbox}
          onIndexChange={(i) => {
            setLightbox(i);
            setPhoto(i);
          }}
          onClose={() => setLightbox(null)}
          label={`Fotos de la reseña de ${current.autor.nombre}`}
        />
      )}
    </div>
  );
}
