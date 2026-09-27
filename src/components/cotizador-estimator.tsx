"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useCallback, useMemo, useState, useTransition } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { RecaptchaNotice } from "@/components/recaptcha-notice";
import { formatCOP } from "@/lib/format";
import { whatsappLink, SHOW_PSE } from "@/lib/site-config";
import { submitLead } from "@/lib/leads/actions";
import { RECAPTCHA_ACTION } from "@/lib/leads/constants";
import { SaveEstimate } from "@/components/account/save-estimate";
import { ACCOUNTS_ENABLED } from "@/lib/user-auth/enabled";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

/** Ejecuta reCAPTCHA v3 y devuelve el token, o undefined si no está configurado. */
function getRecaptchaToken(): Promise<string | undefined> {
  if (!RECAPTCHA_SITE_KEY || !window.grecaptcha) {
    return Promise.resolve(undefined);
  }
  return new Promise((resolve) => {
    window.grecaptcha!.ready(() => {
      window
        .grecaptcha!.execute(RECAPTCHA_SITE_KEY, { action: RECAPTCHA_ACTION })
        .then(resolve)
        .catch(() => resolve(undefined));
    });
  });
}

export interface EstimatorOption {
  label: string;
  precioCop: number;
}

export interface EstimatorCategory {
  key: string;
  label: string;
  options: EstimatorOption[];
  defaultOn: boolean; // checkbox marcado por defecto
  defaultIndex: number; // gama preseleccionada (índice válido)
}

export function CotizadorEstimator({
  categories,
  servicioBase,
  tarjetaPct,
  psePct,
  breBPct,
}: {
  categories: EstimatorCategory[];
  servicioBase: number;
  tarjetaPct: number;
  psePct: number;
  breBPct: number;
}) {
  const [included, setIncluded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(categories.map((c) => [c.key, c.defaultOn])),
  );
  const [choice, setChoice] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      categories.map((c) => [c.key, Math.max(0, c.defaultIndex)]),
    ),
  );
  const [servicio, setServicio] = useState(true);

  const hasSelection = useMemo(
    () =>
      servicio ||
      categories.some((c) => included[c.key] && c.options.length > 0),
    [categories, included, servicio],
  );

  const { total, conTarjeta, conPse, conBreB, chosen } = useMemo(() => {
    const chosen: { label: string; opcion: string }[] = [];
    let sub = 0;
    for (const c of categories) {
      const i = choice[c.key];
      if (included[c.key] && c.options[i]) {
        sub += c.options[i].precioCop;
        chosen.push({ label: c.label, opcion: c.options[i].label });
      }
    }
    const total = sub + (servicio ? servicioBase : 0);
    return {
      chosen,
      total,
      conTarjeta: Math.round(total * (1 + tarjetaPct)),
      conPse: Math.round(total * (1 + psePct)),
      conBreB: Math.round(total * (1 + breBPct)),
    };
  }, [
    categories,
    included,
    choice,
    servicio,
    servicioBase,
    tarjetaPct,
    psePct,
    breBPct,
  ]);

  // Para qué va a usar el equipo (opcional): ayuda a afinar la propuesta (p. ej. más gráfica que procesador).
  const [comentario, setComentario] = useState("");

  const resumen = useMemo(() => {
    const items = chosen.map((c) => `• ${c.label}: ${c.opcion}`).join("\n");
    const uso = comentario.replace(/\s+/g, " ").trim();
    return (
      `${items}${servicio ? "\n• Ensamblaje" : ""}\n\n` +
      `Estimado aproximado: ${formatCOP(total)} (con tarjeta ${formatCOP(conTarjeta)}).` +
      (uso ? `\n\nComentarios del cliente: ${uso}` : "")
    );
  }, [chosen, servicio, total, conTarjeta, comentario]);

  function buildWaMessage(nombre: string) {
    return `Hola B & W, mi nombre es ${nombre}. Estoy interesado en cotizar un PC con:\n${resumen}\n\n¿Me ayudan a afinarlo?`;
  }

  // Datos de contacto — se piden antes de abrir WhatsApp para poder darle
  // seguimiento a la solicitud (se guarda internamente, no es para nadie más).
  const [contactOpen, setContactOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Con sesión iniciada, prellena el contacto sin pisar lo que ya se escribió.
  const prefill = useCallback(
    (u: { name: string; phone: string; email: string }) => {
      setNombre((v) => v || u.name);
      setTelefono((v) => v || u.phone);
      setCorreo((v) => v || u.email);
    },
    [],
  );

  // El botón principal del panel (arriba, con acento) ya ofrece crear cuenta o solicitar
  // desde ella; WhatsApp queda como vía secundaria, sin escalón intermedio.
  function handleContinue() {
    setFormError(null);
    if (!nombre.trim() || !telefono.trim() || !correo.trim()) {
      setFormError("Completa los tres campos para continuar.");
      return;
    }
    startTransition(async () => {
      const recaptchaToken = await getRecaptchaToken();
      const result = await submitLead({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        correo: correo.trim(),
        resumen,
        pagina: "cotizador",
        recaptchaToken,
      });
      if (!result.ok) {
        setFormError(result.error ?? "Algo salió mal. Intenta de nuevo.");
        return;
      }
      window.open(whatsappLink(buildWaMessage(nombre.trim())), "_blank");
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      {RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      )}

      {/* Selección por categoría */}
      <div>
        <h2 className="text-xl font-semibold">Arma tu equipo</h2>
        <p className="mt-1 text-sm text-component">
          Marca lo que quieres incluir y elige la gama de cada componente.
        </p>

        <div className="mt-5 divide-y divide-hairline border border-hairline">
          {categories.map((c) => {
            const on = included[c.key];
            return (
              <div
                key={c.key}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3"
              >
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={(e) =>
                      setIncluded((s) => ({ ...s, [c.key]: e.target.checked }))
                    }
                    className="h-4 w-4 accent-accent"
                  />
                  <span className={`font-medium ${on ? "" : "text-component"}`}>
                    {c.label}
                  </span>
                </label>

                <div className="relative min-w-[200px]">
                  <select
                    value={choice[c.key]}
                    disabled={!on}
                    onChange={(e) =>
                      setChoice((s) => ({
                        ...s,
                        [c.key]: Number(e.target.value),
                      }))
                    }
                    className="w-full appearance-none border border-hairline bg-vanilla px-3 py-2 pr-8 text-sm outline-none focus:border-panda disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {c.options.map((o, i) => (
                      <option key={i} value={i}>
                        {o.label} · {formatCOP(o.precioCop)}
                      </option>
                    ))}
                  </select>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5"
                  >
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-component"
                    >
                      <path d="M1 1l4 4 4-4" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Servicio de ensamble */}
        <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 border border-hairline px-4 py-3.5">
          <span>
            <span className="font-medium">Servicio de ensamblaje</span>
            <span className="block text-xs text-component">
              Armado, formateo y configuración completos.
            </span>
          </span>
          <input
            type="checkbox"
            checked={servicio}
            onChange={(e) => setServicio(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
        </label>

        <div className="mt-4">
          <label htmlFor="estimator-comment" className="text-sm font-medium">
            ¿Para qué lo vas a usar? <span className="font-normal text-component">(opcional)</span>
          </label>
          <textarea
            id="estimator-comment"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            maxLength={400}
            rows={3}
            placeholder="Ej.: jugar en 1440p, editar video, estudiar arquitectura… Así afinamos la propuesta (quizá no necesitas tanto procesador y sí una mejor gráfica)."
            className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 text-sm outline-none focus:border-panda"
          />
          <p className="mt-1 text-xs text-component">{comentario.length}/400</p>
        </div>
      </div>

      {/* Panel de estimado */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="border border-panda bg-panda p-6 text-vanilla">
          <p className="font-mono text-sm text-vanilla/60">
            Estimado aproximado
          </p>
          <p className="mt-1 font-mono text-4xl font-semibold tracking-tight">
            ≈ {formatCOP(total)}
          </p>
          <p className="mt-1 text-xs text-vanilla/50">
            según la gama elegida · no es el precio final
          </p>

          <dl className="mt-5 space-y-2 border-t border-vanilla/15 pt-5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-vanilla/60">Con tarjeta</dt>
              <dd className="font-mono">{formatCOP(conTarjeta)}</dd>
            </div>
            {SHOW_PSE && (
              <div className="flex items-center justify-between">
                <dt className="text-vanilla/60">Con PSE</dt>
                <dd className="font-mono">{formatCOP(conPse)}</dd>
              </div>
            )}
            <div className="flex items-center justify-between">
              <dt className="text-vanilla/60">
                Con Bre-B{breBPct === 0 ? " (sin recargo)" : ""}
              </dt>
              <dd className="font-mono">{formatCOP(conBreB)}</dd>
            </div>
          </dl>

          {/* Acción principal: cotizar desde la web (crear cuenta o, con sesión, solicitar directo). */}
          {ACCOUNTS_ENABLED && (
            <SaveEstimate resumen={resumen} disabled={!hasSelection} onUser={prefill} />
          )}

          {/* WhatsApp: vía secundaria, para dudas o para quien prefiere no crear cuenta. */}
          {!contactOpen ? (
            <Button
              type="button"
              disabled={!hasSelection}
              onClick={() => setContactOpen(true)}
              size="lg"
              className={
                ACCOUNTS_ENABLED
                  ? "mt-3 w-full border border-vanilla/40 bg-transparent text-vanilla hover:bg-vanilla hover:text-panda"
                  : "mt-6 w-full bg-accent text-accent-ink hover:bg-accent-deep"
              }
            >
              Cotizar por WhatsApp
            </Button>
          ) : (
            <div className="mt-6 space-y-3 border-t border-vanilla/15 pt-5">
              <p className="text-sm text-vanilla/70">
                Para darte seguimiento, cuéntanos quién eres:
              </p>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre completo"
                className="w-full border border-vanilla/20 bg-transparent px-3 py-2.5 text-sm text-vanilla placeholder:text-vanilla/40 outline-none focus:border-vanilla/50"
              />
              <input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Teléfono"
                type="tel"
                className="w-full border border-vanilla/20 bg-transparent px-3 py-2.5 text-sm text-vanilla placeholder:text-vanilla/40 outline-none focus:border-vanilla/50"
              />
              <input
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="Correo"
                type="email"
                className="w-full border border-vanilla/20 bg-transparent px-3 py-2.5 text-sm text-vanilla placeholder:text-vanilla/40 outline-none focus:border-vanilla/50"
              />
              {formError && (
                <p className="text-xs text-accent">{formError}</p>
              )}
              <Button
                type="button"
                disabled={pending}
                onClick={handleContinue}
                size="lg"
                className="w-full bg-accent text-accent-ink hover:bg-accent-deep"
              >
                {pending ? "Enviando…" : "Continuar a WhatsApp"}
              </Button>
              <p className="text-center text-[11px] leading-relaxed text-vanilla/40">
                Guardamos estos datos solo para darte seguimiento a esta
                cotización.
              </p>
              {RECAPTCHA_SITE_KEY && (
                <RecaptchaNotice className="text-center text-[11px] leading-relaxed text-vanilla/40" />
              )}
            </div>
          )}
          {!hasSelection && (
            <p className="mt-2 px-1 text-center text-xs text-component">
              Selecciona al menos un componente para cotizar.
            </p>
          )}
        </div>

        <p className="mt-3 px-1 text-xs leading-relaxed text-component">
          <strong className="font-medium text-panda">
            Este valor es solo un aproximado
          </strong>{" "}
          según la gama que elegiste, para que te hagas una idea. No es el
          precio final y puede variar: a veces sale más económico y otras un poco
          más alto, según los modelos, la disponibilidad y el dólar. El valor
          exacto lo confirmamos contigo por WhatsApp.
        </p>
      </div>
    </div>
  );
}
