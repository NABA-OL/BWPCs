"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */

import { useActionState } from "react";
import { updateGuideAction, type UpdateGuideResult } from "@/app/admin/(panel)/blog/actions";
import type { Guide } from "@/lib/db/types";

const initialState: UpdateGuideResult = { ok: true };

export function GuideEditForm({ guide }: { guide: Guide }) {
  const [state, formAction, pending] = useActionState(updateGuideAction, initialState);

  return (
    <form action={formAction} className="mt-6 max-w-xl space-y-5">
      <input type="hidden" name="id" value={guide._id!.toString()} />

      <div>
        <label className="block text-sm font-medium text-component">Título</label>
        <input
          name="titulo"
          defaultValue={guide.titulo}
          className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-component">H1 (puede diferir del título)</label>
        <input
          name="h1"
          defaultValue={guide.h1}
          className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-component">
          Descripción (meta description)
        </label>
        <textarea
          name="descripcion"
          defaultValue={guide.descripcion}
          rows={2}
          className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-component">
          Keywords (separadas por coma)
        </label>
        <input
          name="keywords"
          defaultValue={guide.keywords.join(", ")}
          className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-component">
          Resumen (un bullet por línea)
        </label>
        <textarea
          name="resumen"
          defaultValue={guide.resumen.join("\n")}
          rows={4}
          className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-component">
          Intro (párrafos separados por línea en blanco)
        </label>
        <textarea
          name="intro"
          defaultValue={guide.intro.join("\n\n")}
          rows={4}
          className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-component">
          Secciones (JSON — h2, parrafos[], lista? opcional)
        </label>
        <textarea
          name="secciones"
          defaultValue={JSON.stringify(guide.secciones, null, 2)}
          rows={14}
          className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 font-mono text-xs outline-none focus:border-panda"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-component">FAQs (JSON — q, a)</label>
        <textarea
          name="faqs"
          defaultValue={JSON.stringify(guide.faqs, null, 2)}
          rows={8}
          className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 font-mono text-xs outline-none focus:border-panda"
        />
      </div>

      {state.error && (
        <p className="border border-accent/30 bg-accent/5 p-3 text-sm text-panda">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="border border-panda px-4 py-2 text-sm font-medium text-panda transition-colors hover:bg-panda hover:text-vanilla disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
