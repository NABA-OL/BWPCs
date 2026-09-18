"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { submitReviewAction } from "@/app/(public)/cuenta/(area)/resena/actions";
import { INPUT, LABEL } from "@/components/account/shared";
import { Button } from "@/components/ui/button";
import {
  REVIEW_MAX_CHARS,
  REVIEW_MAX_PHOTOS,
  REVIEW_MIN_CHARS,
} from "@/lib/reviews/rules";

export interface FormPhoto {
  id: string;
  thumbUrl: string;
  width: number;
  height: number;
}

interface ReviewFormProps {
  initial: {
    estrellas: number;
    comentario: string;
    estado: "pendiente" | "aprobada" | "rechazada";
    motivo: string | null;
    photos: FormPhoto[];
  } | null;
}

const STATUS_TEXT = {
  pendiente: "Tu reseña está en revisión. La publicamos en cuanto la aprobemos.",
  aprobada:
    "Tu reseña está publicada en la página principal. Si la editas, la revisamos de nuevo y deja de verse hasta entonces.",
  rechazada: "No pudimos publicar tu reseña.",
} as const;

export function ReviewForm({ initial }: ReviewFormProps) {
  const router = useRouter();
  const [stars, setStars] = useState(initial?.estrellas ?? 0);
  const [text, setText] = useState(initial?.comentario ?? "");
  const [photos, setPhotos] = useState<FormPhoto[]>(initial?.photos ?? []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  // Fotos que ya eran de la reseña: quitarlas solo se aplica al guardar.
  const attachedIds = new Set(initial?.photos.map((p) => p.id));

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      let count = photos.length;
      for (const file of files) {
        if (count >= REVIEW_MAX_PHOTOS) {
          setError(`Máximo ${REVIEW_MAX_PHOTOS} fotos.`);
          break;
        }
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/uploads/review-photo", { method: "POST", body });
        const data = (await res.json().catch(() => null)) as
          | (FormPhoto & { thumbUrl: string })
          | { error?: string }
          | null;
        if (!res.ok || !data || !("id" in data)) {
          setError((data && "error" in data && data.error) || "No se pudo subir la foto.");
          break;
        }
        setPhotos((prev) => [...prev, data]);
        count += 1;
      }
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto(photo: FormPhoto) {
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    if (!attachedIds.has(photo.id)) {
      // Subida nueva que nadie usa: se borra ya del almacenamiento.
      await fetch(`/api/uploads/review-photo?id=${photo.id}`, { method: "DELETE" });
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setDone(false);
    setPending(true);
    try {
      const result = await submitReviewAction({
        estrellas: stars,
        comentario: text,
        fotoIds: photos.map((p) => p.id),
      });
      if (!result.ok) return setError(result.error);
      setDone(true);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  const remaining = REVIEW_MAX_CHARS - text.length;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {initial && !done && (
        <div
          role="status"
          className={`border px-3 py-2 text-sm ${
            initial.estado === "rechazada"
              ? "border-accent/30 bg-accent/5 text-accent"
              : "border-hairline"
          }`}
        >
          {STATUS_TEXT[initial.estado]}
          {initial.estado === "rechazada" && initial.motivo && (
            <span className="mt-1 block text-panda">Motivo: {initial.motivo}</span>
          )}
        </div>
      )}

      <div>
        <span id="stars-label" className={LABEL}>
          Tu calificación
        </span>
        <div
          role="radiogroup"
          aria-labelledby="stars-label"
          className="mt-1.5 flex gap-1"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={stars === n}
              aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
              onClick={() => setStars(n)}
              className="p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="currentColor"
                className={stars >= n ? "text-accent" : "text-hairline hover:text-accent/40"}
              >
                <path d="M12 2.5l2.94 6.1 6.56.9-4.8 4.6 1.2 6.6L12 17.6l-5.9 3.1 1.2-6.6-4.8-4.6 6.56-.9L12 2.5z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="review-text" className={LABEL}>
          Cuéntanos tu experiencia
        </label>
        <textarea
          id="review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          maxLength={REVIEW_MAX_CHARS}
          minLength={REVIEW_MIN_CHARS}
          required
          className={`${INPUT} resize-y`}
        />
        <p className="mt-1 text-right font-mono text-xs text-component">
          {remaining}
        </p>
      </div>

      <div>
        <span className={LABEL}>Fotos (opcional, hasta {REVIEW_MAX_PHOTOS})</span>
        <ul className="mt-2 flex flex-wrap gap-3">
          {photos.map((p) => (
            <li key={p.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- miniatura ya procesada */}
              <img
                src={p.thumbUrl}
                alt="Foto de tu reseña"
                width={96}
                height={96}
                className="h-24 w-24 border border-hairline object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(p)}
                aria-label="Quitar foto"
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-panda text-xs text-vanilla hover:bg-accent"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        {photos.length < REVIEW_MAX_PHOTOS && (
          <label className="mt-3 inline-block cursor-pointer border border-panda px-4 py-2 text-sm font-medium uppercase tracking-wide transition-colors hover:bg-panda hover:text-vanilla">
            {uploading ? "Subiendo…" : "Agregar foto"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={uploading}
              onChange={onPick}
              className="sr-only"
            />
          </label>
        )}
        <p className="mt-2 text-xs text-component">
          JPG, PNG o WebP de hasta 8 MB. Quitamos la ubicación y los datos de
          la cámara de tus fotos.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent"
        >
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="border border-hairline px-3 py-2 text-sm">
          Recibimos tu reseña. La revisamos antes de publicarla.
        </p>
      )}

      <Button type="submit" disabled={pending || uploading || stars === 0}>
        {pending ? "Enviando…" : initial ? "Guardar cambios" : "Enviar reseña"}
      </Button>
    </form>
  );
}
