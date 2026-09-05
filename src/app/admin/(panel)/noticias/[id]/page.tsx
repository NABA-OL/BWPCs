/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db/collections";
import {
  updatePostAction,
  publishPostAction,
  unpublishPostAction,
  deletePostAction,
} from "../actions";

export const metadata: Metadata = {
  title: "Editar noticia",
  robots: { index: false, follow: false },
};

export default async function EditarNoticiaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let post: {
    id: string;
    tipo: "articulo" | "video";
    titulo: string;
    resumen: string;
    cuerpo: string;
    fuenteUrl: string;
    fuenteNombre: string;
    youtubeId: string | null;
    estado: "borrador" | "publicado";
  } | null = null;

  try {
    const col = await collections.newsPosts();
    const doc = await col.findOne({ _id: new ObjectId(id) });
    if (doc) {
      post = {
        id: doc._id!.toString(),
        tipo: doc.tipo,
        titulo: doc.titulo,
        resumen: doc.resumen,
        cuerpo: doc.cuerpo,
        fuenteUrl: doc.fuenteUrl,
        fuenteNombre: doc.fuenteNombre,
        youtubeId: doc.youtubeId,
        estado: doc.estado,
      };
    }
  } catch {
    post = null;
  }

  if (!post) notFound();

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/noticias"
            className="text-sm text-component hover:text-panda"
          >
            ← Noticias
          </Link>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
            {post.estado === "borrador" ? "Editar borrador" : "Editar publicación"}
          </h1>
        </div>
        <span className="shrink-0 font-mono text-xs uppercase tracking-wide text-component">
          {post.tipo === "video" ? "🎥 video" : "📰 artículo"} ·{" "}
          {post.fuenteNombre}
        </span>
      </div>

      {post.tipo === "video" && post.youtubeId && (
        <div className="mt-6 aspect-video max-w-xl overflow-hidden border border-hairline">
          <iframe
            src={`https://www.youtube.com/embed/${post.youtubeId}`}
            title={post.titulo}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      )}

      <form action={updatePostAction} className="mt-6 max-w-xl space-y-5">
        <input type="hidden" name="id" value={post.id} />

        <div>
          <label className="block text-sm font-medium text-component">
            Título
          </label>
          <input
            name="titulo"
            defaultValue={post.titulo}
            className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-component">
            Resumen (para la lista pública)
          </label>
          <textarea
            name="resumen"
            defaultValue={post.resumen}
            rows={3}
            className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-component">
            {post.tipo === "video" ? "Texto de contexto (opcional)" : "Cuerpo"}
          </label>
          <textarea
            name="cuerpo"
            defaultValue={post.cuerpo}
            rows={8}
            className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda"
          />
        </div>

        <p className="text-xs text-component">
          Fuente original:{" "}
          <a
            href={post.fuenteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            {post.fuenteUrl}
          </a>
        </p>

        <button
          type="submit"
          className="border border-panda px-4 py-2 text-sm font-medium text-panda transition-colors hover:bg-panda hover:text-vanilla"
        >
          Guardar cambios
        </button>
      </form>

      <div className="mt-8 flex items-center gap-4 border-t border-hairline pt-6">
        {post.estado === "borrador" ? (
          <form action={publishPostAction}>
            <input type="hidden" name="id" value={post.id} />
            <button
              type="submit"
              className="border border-panda bg-panda px-4 py-2 text-sm font-medium text-vanilla transition-colors hover:bg-accent"
            >
              Publicar
            </button>
          </form>
        ) : (
          <form action={unpublishPostAction}>
            <input type="hidden" name="id" value={post.id} />
            <button
              type="submit"
              className="border border-hairline px-4 py-2 text-sm font-medium text-component transition-colors hover:border-panda hover:text-panda"
            >
              Despublicar
            </button>
          </form>
        )}
        <form action={deletePostAction}>
          <input type="hidden" name="id" value={post.id} />
          <button
            type="submit"
            className="text-sm text-component hover:text-accent"
          >
            Eliminar
          </button>
        </form>
      </div>
    </>
  );
}
