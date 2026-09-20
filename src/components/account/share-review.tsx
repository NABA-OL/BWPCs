"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-19
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Tema = "claro" | "oscuro";

const TEMAS: readonly { id: Tema; label: string }[] = [
  { id: "claro", label: "Fondo blanco" },
  { id: "oscuro", label: "Fondo negro" },
];

const FILE_NAME = "mi-resena-bw.png";

/**
 * "Compartir mi reseña": la imagen 9:16 de la reseña ya publicada, para subirla a las historias de
 * Instagram o al estado de WhatsApp. En el celular abre el menú de compartir del sistema (ahí sale
 * Instagram); donde no se puede compartir un archivo, la descarga. La imagen se pide de antemano
 * para que el clic llegue al menú de compartir sin esperas (los navegadores exigen que sea inmediato).
 */
export function ShareReview({ version }: { version: string }) {
  const [tema, setTema] = useState<Tema>("claro");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const url = `/cuenta/resena/historia?tema=${tema}&v=${encodeURIComponent(version)}`;

  useEffect(() => {
    let cancelled = false;
    let previewUrl: string | null = null;
    setFile(null);
    setPreview(null);
    setError(null);
    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        previewUrl = URL.createObjectURL(blob);
        setPreview(previewUrl);
        setFile(new File([blob], FILE_NAME, { type: "image/png" }));
      })
      .catch(() => {
        if (!cancelled) setError("No pudimos preparar la imagen. Intenta de nuevo en un momento.");
      });
    return () => {
      cancelled = true;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [url]);

  function download(f: File) {
    const href = URL.createObjectURL(f);
    const a = document.createElement("a");
    a.href = href;
    a.download = FILE_NAME;
    a.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }

  async function share() {
    if (!file) return;
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Mi reseña en B & W", text: "Mi reseña en B & W · bw-pcs.com" });
      } catch (e) {
        // Cerrar el menú de compartir no es un error.
        if (!(e instanceof DOMException && e.name === "AbortError")) download(file);
      }
      return;
    }
    download(file);
  }

  return (
    <div className="mt-6 border border-hairline bg-vanilla p-6">
      <h2 className="text-lg font-semibold">Comparte tu reseña</h2>
      <p className="mt-1 text-sm text-component">
        Tu reseña ya está publicada. Compártela como historia en Instagram o en tu estado de WhatsApp.
      </p>

      <div className="mt-5 flex flex-wrap items-start gap-6">
        <div className="w-40 shrink-0 border border-hairline bg-hairline/30" style={{ aspectRatio: "9 / 16" }}>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Vista previa de tu reseña como historia" className="h-full w-full" />
          ) : (
            <div className="flex h-full items-center justify-center px-3 text-center text-xs text-component">
              {error ? "—" : "Preparando…"}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <fieldset>
            <legend className="text-sm font-medium text-component">Fondo</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {TEMAS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTema(t.id)}
                  aria-pressed={tema === t.id}
                  className={`border px-4 py-2 text-sm font-medium transition-colors ${
                    tema === t.id
                      ? "border-panda bg-panda text-vanilla"
                      : "border-hairline text-component hover:border-panda hover:text-panda"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={share} disabled={!file}>
              Compartir
            </Button>
            <Button type="button" variant="secondary" onClick={() => file && download(file)} disabled={!file}>
              Descargar imagen
            </Button>
          </div>
          {error && (
            <p role="alert" className="text-sm text-accent">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
