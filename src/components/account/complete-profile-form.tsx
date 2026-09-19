"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-19
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  completeProfileAction,
  discardIncompleteAccountAction,
} from "@/app/(public)/cuenta/completar/actions";
import { INPUT, LABEL } from "@/components/account/shared";
import { Button } from "@/components/ui/button";

/** Último paso de una cuenta creada con Google: celular + aceptación de términos y datos. */
export function CompleteProfileForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await completeProfileAction({
        phone: String(data.get("phone") ?? "").replace(/\D/g, ""),
        acceptTerms: data.get("acceptTerms") === "on",
      });
      if (!result.ok) return setError(result.error);
      router.push(next);
      router.refresh();
    });
  }

  function onCancel() {
    startTransition(async () => {
      await discardIncompleteAccountAction();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="phone" className={LABEL}>
          Celular
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="3001234567"
          pattern="3[0-9]{9}"
          maxLength={10}
          title="Celular colombiano de 10 dígitos"
          required
          autoFocus
          className={`${INPUT} font-mono`}
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-component">
        <input type="checkbox" name="acceptTerms" required className="mt-0.5 h-4 w-4 accent-accent" />
        <span>
          Acepto los{" "}
          <Link href="/terminos" target="_blank" className="text-accent hover:underline">
            términos y condiciones
          </Link>{" "}
          y autorizo el tratamiento de mis datos según la{" "}
          <Link href="/tratamiento-de-datos" target="_blank" className="text-accent hover:underline">
            política de tratamiento de datos
          </Link>
          .
        </span>
      </label>

      {error && (
        <p role="alert" className="border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Guardando…" : "Continuar"}
      </Button>
      <button
        type="button"
        onClick={onCancel}
        disabled={pending}
        className="block w-full text-center text-sm text-component hover:text-panda disabled:opacity-50"
      >
        No quiero continuar (borrar los datos que envió Google)
      </button>
    </form>
  );
}
