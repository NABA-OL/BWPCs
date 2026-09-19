"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useActionState } from "react";
import Script from "next/script";
import { loginAction, type LoginState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { RecaptchaNotice } from "@/components/recaptcha-notice";
import { RECAPTCHA_SITE_KEY, getRecaptchaToken } from "@/lib/user-auth/recaptcha-client";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    async (previous, formData) => {
      // Token de reCAPTCHA v3 justo antes de enviar; el servidor lo verifica de forma estricta.
      formData.set("recaptcha", (await getRecaptchaToken("admin_login")) ?? "");
      return loginAction(previous, formData);
    },
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
      {RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      )}
      <input type="hidden" name="next" value={next} />

      <div>
        <label
          htmlFor="usuario"
          className="block text-sm font-medium text-component"
        >
          Usuario
        </label>
        <input
          id="usuario"
          name="usuario"
          type="text"
          autoComplete="username"
          autoFocus
          required
          className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 text-panda outline-none focus:border-panda"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-component"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 font-mono text-panda outline-none focus:border-panda"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent"
        >
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Ingresando…" : "Ingresar"}
      </Button>
      {RECAPTCHA_SITE_KEY && (
        <RecaptchaNotice className="text-center text-[11px] leading-relaxed text-component" />
      )}
    </form>
  );
}
