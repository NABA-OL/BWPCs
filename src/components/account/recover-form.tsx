"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useEffect, useState, type FormEvent } from "react";
import Script from "next/script";
import { Button, ButtonLink } from "@/components/ui/button";
import { RecaptchaNotice } from "@/components/recaptcha-notice";
import {
  CAPTCHA_ERROR,
  INPUT,
  LABEL,
  captchaOptions,
  errorText,
} from "@/components/account/shared";
import { authClient } from "@/lib/user-auth/client";
import { RECAPTCHA_SITE_KEY } from "@/lib/user-auth/recaptcha-client";

type Step = "email" | "reset" | "done";

const RESEND_COOLDOWN_S = 60;

/** Recuperar contraseña: correo → código de 6 dígitos + contraseña nueva. */
export function RecoverForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function requestCode(to: string): Promise<boolean> {
    const fetchOptions = await captchaOptions("user_reset");
    if (!fetchOptions) {
      setError(CAPTCHA_ERROR);
      return false;
    }
    const { error: err } = await authClient.emailOtp.requestPasswordReset({
      email: to,
      fetchOptions,
    });
    if (err) {
      setError(errorText(err));
      return false;
    }
    setCooldown(RESEND_COOLDOWN_S);
    return true;
  }

  async function onSubmitEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const mail = String(new FormData(e.currentTarget).get("email") ?? "")
      .trim()
      .toLowerCase();
    setPending(true);
    try {
      if (await requestCode(mail)) {
        setEmail(mail);
        setStep("reset");
      }
    } finally {
      setPending(false);
    }
  }

  async function onSubmitReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    setPending(true);
    try {
      const { error: err } = await authClient.emailOtp.resetPassword({
        email,
        otp: String(data.get("otp") ?? "").trim(),
        password: String(data.get("password") ?? ""),
      });
      if (err) return setError(errorText(err));
      setStep("done");
    } finally {
      setPending(false);
    }
  }

  async function onResend() {
    setError(null);
    setPending(true);
    try {
      await requestCode(email);
    } finally {
      setPending(false);
    }
  }

  const errorBox = error && (
    <p
      role="alert"
      className="border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent"
    >
      {error}
    </p>
  );

  if (step === "done") {
    return (
      <div className="space-y-5">
        <p className="text-sm text-component">
          Listo, cambiamos tu contraseña y cerramos las sesiones abiertas.
          Ingresa con la nueva.
        </p>
        <ButtonLink href="/cuenta/ingresar" size="lg" className="w-full">
          Ingresar
        </ButtonLink>
      </div>
    );
  }

  return (
    <>
      {RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      )}

      {step === "email" ? (
        <form onSubmit={onSubmitEmail} className="space-y-5">
          <div>
            <label htmlFor="email" className={LABEL}>
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              autoFocus
              className={INPUT}
            />
          </div>
          {errorBox}
          <Button type="submit" size="lg" disabled={pending} className="w-full">
            {pending ? "Enviando…" : "Enviar código"}
          </Button>
          {RECAPTCHA_SITE_KEY && (
            <RecaptchaNotice className="text-center text-[11px] leading-relaxed text-component" />
          )}
        </form>
      ) : (
        <form onSubmit={onSubmitReset} className="space-y-5">
          <p className="text-sm text-component">
            Si <strong className="font-medium text-panda">{email}</strong>{" "}
            tiene una cuenta, le enviamos un código de 6 dígitos. Vence en 5
            minutos.
          </p>
          <div>
            <label htmlFor="otp" className={LABEL}>
              Código
            </label>
            <input
              id="otp"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              autoFocus
              className={`${INPUT} font-mono tracking-[0.4em]`}
            />
          </div>
          <div>
            <label htmlFor="password" className={LABEL}>
              Contraseña nueva
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              className={`${INPUT} font-mono`}
            />
            <p className="mt-1 text-xs text-component">Mínimo 8 caracteres.</p>
          </div>
          {errorBox}
          <Button type="submit" size="lg" disabled={pending} className="w-full">
            {pending ? "Guardando…" : "Cambiar contraseña"}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={onResend}
              disabled={pending || cooldown > 0}
              className="text-accent hover:underline disabled:text-component disabled:no-underline"
            >
              {cooldown > 0
                ? `Reenviar código (${cooldown}s)`
                : "Reenviar código"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setError(null);
              }}
              className="text-component hover:text-panda"
            >
              Cambiar correo
            </button>
          </div>
        </form>
      )}
    </>
  );
}
