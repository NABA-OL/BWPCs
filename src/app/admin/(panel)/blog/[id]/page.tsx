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
import { GuideEditForm } from "@/components/admin/guide-edit-form";
import { publishGuideAction, unpublishGuideAction, deleteGuideAction } from "../actions";
import { TrashLabel } from "@/components/ui/trash-label";

export const metadata: Metadata = {
  title: "Editar guía",
  robots: { index: false, follow: false },
};

export default async function EditarGuiaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const col = await collections.guides();
  const guide = await col.findOne({ _id: new ObjectId(id) });
  if (!guide) notFound();

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/admin/blog" className="text-sm text-component hover:text-panda">
            ← Blog
          </Link>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
            {guide.estado === "borrador" ? "Editar borrador" : "Editar guía publicada"}
          </h1>
        </div>
        {guide.slug && (
          <span className="shrink-0 font-mono text-xs text-component">/guias/{guide.slug}</span>
        )}
      </div>

      <GuideEditForm guide={guide} />

      <div className="mt-8 flex items-center gap-4 border-t border-hairline pt-6">
        {guide.estado === "borrador" ? (
          <form action={publishGuideAction}>
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="border border-panda bg-panda px-4 py-2 text-sm font-medium text-vanilla transition-colors hover:bg-accent"
            >
              Publicar
            </button>
          </form>
        ) : (
          <form action={unpublishGuideAction}>
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="border border-hairline px-4 py-2 text-sm font-medium text-component transition-colors hover:border-panda hover:text-panda"
            >
              Despublicar
            </button>
          </form>
        )}
        <form action={deleteGuideAction}>
          <input type="hidden" name="id" value={id} />
          <button type="submit" className="text-sm text-component hover:text-accent">
            <TrashLabel />
          </button>
        </form>
      </div>
    </>
  );
}
