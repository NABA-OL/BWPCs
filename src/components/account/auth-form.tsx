"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RecaptchaNotice } from "@/components/recaptcha-notice";
import { authClient } from "@/lib/user-auth/client";
import {
  CAPTCHA_ERROR,
  INPUT,
  LABEL,
  captchaOptions,
  errorText,
} from "@/components/account/shared";
import { RECAPTCHA_SITE_KEY } from "@/lib/user-auth/recaptcha-client";

type Mode = "registro" | "ingreso";
type Step = "form" | "verify";

const RESEND_COOLDOWN_S = 60;

export function AuthForm({ mode, next }: { mode: Mode; next: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function sendCode(to: string): Promise<boolean> {
    const fetchOptions = await captchaOptions("user_send_code");
    if (!fetchOptions) {
      setError(CAPTCHA_ERROR);
      return false;
    }
    const { error: err } = await authClient.emailOtp.sendVerificationOtp({
      email: to,
      type: "email-verification",
      fetchOptions,
    });
    if (err) {
      setError(errorText(err));
      return false;
    }
    setCooldown(RESEND_COOLDOWN_S);
    return true;
  }

  async function onSubmitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const mail = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");
    setPending(true);
    try {
      if (mode === "registro") {
        const fetchOptions = await captchaOptions("user_register");
        if (!fetchOptions) return setError(CAPTCHA_ERROR);
        const { error: err } = await authClient.signUp.email({
          email: mail,
          password,
          name: String(data.get("name") ?? "").trim(),
          phone: String(data.get("phone") ?? "").replace(/\D/g, ""),
          acceptTerms: data.get("acceptTerms") === "on",
          fetchOptions,
        });
        if (err) return setError(errorText(err));
        setEmail(mail);
        setCooldown(RESEND_COOLDOWN_S);
        setStep("verify");
        return;
      }

      const fetchOptions = await captchaOptions("user_login");
      if (!fetchOptions) return setError(CAPTCHA_ERROR);
      const { error: err } = await authClient.signIn.email({
        email: mail,
        password,
        fetchOptions,
      });
      if (!err) {
        router.push(next);
        router.refresh();
        return;
      }
      if (err.code === "EMAIL_NOT_VERIFIED") {
        setEmail(mail);
        if (await sendCode(mail)) setStep("verify");
        return;
      }
      setError(errorText(err));
    } finally {
      setPending(false);
    }
  }

  async function onSubmitCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const otp = String(new FormData(e.currentTarget).get("otp") ?? "").trim();
    setPending(true);
    try {
      const { error: err } = await authClient.emailOtp.verifyEmail({
        email,
        otp,
      });
      if (err) return setError(errorText(err));
      router.push(next);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function onResend() {
    setError(null);
    setPending(true);
    try {
      await sendCode(email);
    } finally {
      setPending(false);
    }
  }

  const recaptcha = RECAPTCHA_SITE_KEY && (
    <Script
      src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
      strategy="afterInteractive"
    />
  );

  const errorBox = error && (
    <p
      role="alert"
      className="border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent"
    >
      {error}
    </p>
  );

  if (step === "verify") {
    return (
      <form onSubmit={onSubmitCode} className="space-y-5">
        {recaptcha}
        <p className="text-sm text-component">
          Te enviamos un código de 6 dígitos a{" "}
          <strong className="font-medium text-panda">{email}</strong>. Vence en
          5 minutos.
        </p>
        <div>
          <label htmlFor="otp" className={LABEL}>
            Código de verificación
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
        {errorBox}
        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending ? "Verificando…" : "Verificar"}
        </Button>
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={onResend}
            disabled={pending || cooldown > 0}
            className="text-accent hover:underline disabled:text-component disabled:no-underline"
          >
            {cooldown > 0 ? `Reenviar código (${cooldown}s)` : "Reenviar código"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("form");
              setError(null);
            }}
            className="text-component hover:text-panda"
          >
            Cambiar correo
          </button>
        </div>
        {mode === "registro" && (
          <p className="text-xs text-component">
            Si ya tienes una cuenta con este correo no recibirás código.{" "}
            <Link href="/cuenta/ingresar" className="text-accent hover:underline">
              Ingresa aquí
            </Link>
            .
          </p>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={onSubmitForm} className="space-y-5">
      {recaptcha}

      {mode === "registro" && (
        <>
          <div>
            <label htmlFor="name" className={LABEL}>
              Nombre
            </label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              minLength={2}
              maxLength={80}
              required
              autoFocus
              className={INPUT}
            />
          </div>
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
              className={`${INPUT} font-mono`}
            />
          </div>
        </>
      )}

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
          autoFocus={mode === "ingreso"}
          className={INPUT}
        />
      </div>

      <div>
        <label htmlFor="password" className={LABEL}>
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "registro" ? "new-password" : "current-password"}
          minLength={8}
          maxLength={128}
          required
          className={`${INPUT} font-mono`}
        />
        {mode === "registro" ? (
          <p className="mt-1 text-xs text-component">Mínimo 8 caracteres.</p>
        ) : (
          <Link
            href="/cuenta/recuperar"
            className="mt-1.5 inline-block text-xs text-accent hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        )}
      </div>

      {mode === "registro" && (
        <label className="flex items-start gap-2 text-sm text-component">
          <input
            type="checkbox"
            name="acceptTerms"
            required
            className="mt-0.5 h-4 w-4 accent-accent"
          />
          <span>
            Acepto los{" "}
            <Link
              href="/terminos"
              target="_blank"
              className="text-accent hover:underline"
            >
              términos y condiciones
            </Link>{" "}
            y autorizo el tratamiento de mis datos según la{" "}
            <Link
              href="/tratamiento-de-datos"
              target="_blank"
              className="text-accent hover:underline"
            >
              política de tratamiento de datos
            </Link>
            .
          </span>
        </label>
      )}

      {errorBox}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending
          ? mode === "registro"
            ? "Creando cuenta…"
            : "Ingresando…"
          : mode === "registro"
            ? "Crear cuenta"
            : "Ingresar"}
      </Button>

      {RECAPTCHA_SITE_KEY && (
        <RecaptchaNotice className="text-center text-[11px] leading-relaxed text-component" />
      )}
    </form>
  );
}
