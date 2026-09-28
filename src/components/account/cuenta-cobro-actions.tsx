"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { INPUT, LABEL } from "@/components/account/shared";
import {
  requestCorrectionAction,
  requestRepriceAction,
  type CuentaCobroResult,
} from "@/app/(public)/cuenta/(area)/cuentas-cobro/[id]/actions";

const MAX_MB = 8;

/** Acciones del cliente sobre una cuenta de cobro por pagar: avisar el pago o pedir una corrección. */
export function CuentaCobroActions({ id, canReportPayment }: { id: string; canReportPayment: boolean }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function run(action: () => Promise<CuentaCobroResult>) {
    setError(null);
    setPending(true);
    try {
      const result = await action();
      if (!result.ok) return setError(result.error);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function onPayment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = new FormData(e.currentTarget).get("file");
    if (!(file instanceof File) || file.size === 0) return setError("Adjunta la imagen del comprobante.");
    if (file.size > MAX_MB * 1024 * 1024) return setError(`La imagen pesa demasiado (máximo ${MAX_MB} MB).`);
    await run(async () => {
      const body = new FormData();
      body.set("file", file);
      try {
        const res = await fetch(`/api/cuentas-cobro/${id}/pago`, { method: "POST", body });
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        return res.ok ? { ok: true } : { ok: false, error: data?.error ?? "No se pudo enviar el comprobante." };
      } catch {
        return { ok: false, error: "No se pudo enviar el comprobante. Revisa tu conexión." };
      }
    });
  }

  function onCorrection(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void run(() => requestCorrectionAction({ id, nota: note }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {canReportPayment && (
      <form onSubmit={onPayment} className="border border-hairline p-6">
        <h3 className="font-semibold">Ya hice el pago</h3>
        <p className="mb-4 mt-1 text-sm text-component">
          Adjunta la captura o foto del comprobante y lo confirmamos contra el banco. Solo se
          aceptan imágenes JPG, PNG o WebP; solo nosotros y tú la vemos.
        </p>
        <label htmlFor="cc-proof" className={LABEL}>
          Comprobante de pago
        </label>
        <input
          id="cc-proof"
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          className="mt-1.5 block w-full text-sm file:mr-3 file:border file:border-hairline file:bg-vanilla file:px-3 file:py-2 file:text-sm hover:file:border-panda"
        />
        <div className="mt-4">
          <Button type="submit" disabled={pending}>
            {pending ? "Enviando…" : "Avisar que ya pagué"}
          </Button>
        </div>
      </form>
      )}

      <form onSubmit={onCorrection} className="border border-hairline p-6">
        <h3 className="font-semibold">Hay algo que corregir</h3>
        <p className="mb-4 mt-1 text-sm text-component">
          ¿Un nombre, un valor o un dato está mal? Cuéntanos y te enviamos la cuenta corregida.
        </p>
        <label htmlFor="cc-correction" className={LABEL}>
          ¿Qué hay que corregir?
        </label>
        <textarea
          id="cc-correction"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          minLength={10}
          maxLength={500}
          required
          className={INPUT}
        />
        <div className="mt-4">
          <Button type="submit" variant="secondary" disabled={pending}>
            Pedir corrección
          </Button>
        </div>
      </form>

      {error && (
        <p role="alert" className="border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent lg:col-span-2">
          {error}
        </p>
      )}
    </div>
  );
}

/** Cuenta vencida: en vez de los datos de pago, el aviso y el botón para enviarla a revisión de precios. */
export function ExpiredNotice({ id, venceEn }: { id: string; venceEn: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onReprice() {
    setError(null);
    setPending(true);
    try {
      const result = await requestRepriceAction(id);
      if (!result.ok) return setError(result.error);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3 border border-accent/30 bg-accent/5 p-5 text-sm">
      <h2 className="font-semibold">Esta cuenta de cobro venció</h2>
      <p>
        Pasaron más de 72 horas desde que la enviamos (venció el {venceEn}). Los precios pudieron cambiar por ofertas,
        por subidas o bajadas de precio en Estados Unidos o por el dólar, así que por ahora no la pagues.
      </p>
      <p>
        Envíala a revisión: confirmamos que los precios sigan iguales (o te los actualizamos) y te mandamos la cuenta con
        una vigencia nueva.
      </p>
      <Button type="button" onClick={onReprice} disabled={pending}>
        {pending ? "Enviando…" : "Enviar la cuenta a revisión de precios"}
      </Button>
      {error && (
        <p role="alert" className="border border-accent/30 bg-vanilla px-3 py-2 text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
