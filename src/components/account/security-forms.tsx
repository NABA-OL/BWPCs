"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/account/otp-input";
import { PasswordStrength } from "@/components/account/password-strength";
import { INPUT, LABEL, errorText } from "@/components/account/shared";
import {
  deleteAccountAction,
  requestEmailChangeAction,
} from "@/app/(public)/cuenta/(area)/seguridad/actions";
import { siteConfig } from "@/lib/site-config";
import { authClient } from "@/lib/user-auth/client";

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border border-hairline bg-vanilla p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Message({ error, ok }: { error?: string | null; ok?: string | null }) {
  if (error) {
    return (
      <p
        role="alert"
        className="border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent"
      >
        {error}
      </p>
    );
  }
  if (ok) {
    return (
      <p role="status" className="border border-hairline px-3 py-2 text-sm">
        {ok}
      </p>
    );
  }
  return null;
}

export function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setError(null);
    setOk(null);
    setPending(true);
    try {
      const { error: err } = await authClient.changePassword({
        currentPassword: String(data.get("current") ?? ""),
        newPassword: String(data.get("next") ?? ""),
        revokeOtherSessions: true,
      });
      if (err) return setError(errorText(err));
      form.reset();
      setNewPassword("");
      setOk("Contraseña actualizada. Cerramos tus otras sesiones.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card title="Cambiar contraseña">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="current" className={LABEL}>
            Contraseña actual
          </label>
          <input
            id="current"
            name="current"
            type="password"
            autoComplete="current-password"
            maxLength={128}
            required
            className={`${INPUT} font-mono`}
          />
        </div>
        <div>
          <label htmlFor="next" className={LABEL}>
            Contraseña nueva
          </label>
          <input
            id="next"
            name="next"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
            onChange={(e) => setNewPassword(e.target.value)}
            className={`${INPUT} font-mono`}
          />
          <PasswordStrength password={newPassword} />
        </div>
        <Message error={error} ok={ok} />
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Cambiar contraseña"}
        </Button>
      </form>
    </Card>
  );
}

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const router = useRouter();
  const [newEmail, setNewEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onRequest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const target = String(data.get("newEmail") ?? "").trim().toLowerCase();
    setError(null);
    setOk(null);
    setPending(true);
    try {
      const result = await requestEmailChangeAction({
        newEmail: target,
        password: String(data.get("password") ?? ""),
      });
      if (!result.ok) return setError(result.error);
      setNewEmail(target);
    } finally {
      setPending(false);
    }
  }

  async function onConfirm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newEmail) return;
    const otp = String(new FormData(e.currentTarget).get("otp") ?? "").trim();
    setError(null);
    setPending(true);
    try {
      const { error: err } = await authClient.emailOtp.changeEmail({
        newEmail,
        otp,
      });
      if (err) return setError(errorText(err));
      setOk(`Listo, tu correo ahora es ${newEmail}.`);
      setNewEmail(null);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Card title="Cambiar correo">
      <p className="mb-4 text-sm text-component">
        Correo actual: <strong className="font-medium text-panda">{currentEmail}</strong>
      </p>
      {newEmail ? (
        <form onSubmit={onConfirm} className="space-y-4">
          <p className="text-sm text-component">
            Enviamos un código de 6 dígitos a{" "}
            <strong className="font-medium text-panda">{newEmail}</strong>. Vence
            en 5 minutos.
          </p>
          <div>
            <label htmlFor="otp-email" className={LABEL}>
              Código
            </label>
            <OtpInput id="otp-email" />
          </div>
          <Message error={error} />
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={pending}>
              {pending ? "Confirmando…" : "Confirmar"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setNewEmail(null);
                setError(null);
              }}
              className="text-sm text-component hover:text-panda"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={onRequest} className="space-y-4">
          <div>
            <label htmlFor="newEmail" className={LABEL}>
              Correo nuevo
            </label>
            <input
              id="newEmail"
              name="newEmail"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              className={INPUT}
            />
          </div>
          <div>
            <label htmlFor="email-password" className={LABEL}>
              Tu contraseña
            </label>
            <input
              id="email-password"
              name="password"
              type="password"
              autoComplete="current-password"
              maxLength={128}
              required
              className={`${INPUT} font-mono`}
            />
          </div>
          <Message error={error} ok={ok} />
          <Button type="submit" disabled={pending}>
            {pending ? "Enviando…" : "Enviar código al correo nuevo"}
          </Button>
        </form>
      )}
    </Card>
  );
}

export function DeleteAccountForm({
  hasApprovedReview,
}: {
  hasApprovedReview: boolean;
}) {
  const router = useRouter();
  const [keep, setKeep] = useState<"keep" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    if (hasApprovedReview && keep === null) {
      return setError("Elige qué hacemos con tu reseña.");
    }
    setError(null);
    setPending(true);
    try {
      const result = await deleteAccountAction({
        password,
        keepReview: hasApprovedReview && keep === "keep",
      });
      if (!result.ok) return setError(result.error);
      router.push("/");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Card title="Eliminar cuenta">
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-sm text-component">
          Borramos tu cuenta, tu correo, tu teléfono y tus datos de acceso. Es
          permanente y no se puede deshacer.
        </p>

        {hasApprovedReview && (
          <fieldset className="space-y-2">
            <legend className={LABEL}>¿Qué hacemos con tu reseña publicada?</legend>
            <label className="flex items-start gap-2 border border-hairline p-3 text-sm">
              <input
                type="radio"
                name="keep"
                checked={keep === "keep"}
                onChange={() => setKeep("keep")}
                className="mt-0.5 h-4 w-4 accent-accent"
              />
              <span>
                <strong className="font-medium">Mantenerla publicada.</strong>{" "}
                <span className="text-component">
                  Seguirá visible con tu primer nombre, la inicial de tu
                  apellido, tu avatar, tu comentario y tus fotos, sin cuenta ni
                  correo. Puedes pedir que la retiremos cuando quieras
                  escribiendo a {siteConfig.contact.email}.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2 border border-hairline p-3 text-sm">
              <input
                type="radio"
                name="keep"
                checked={keep === "delete"}
                onChange={() => setKeep("delete")}
                className="mt-0.5 h-4 w-4 accent-accent"
              />
              <span>
                <strong className="font-medium">Borrarla también</strong>{" "}
                <span className="text-component">
                  junto con mis fotos.
                </span>
              </span>
            </label>
          </fieldset>
        )}

        <div>
          <label htmlFor="delete-password" className={LABEL}>
            Tu contraseña
          </label>
          <input
            id="delete-password"
            name="password"
            type="password"
            autoComplete="current-password"
            maxLength={128}
            required
            className={`${INPUT} font-mono`}
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-component">
          <input
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 accent-accent"
          />
          <span>Entiendo que se elimina de forma permanente.</span>
        </label>
        <Message error={error} />
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Eliminando…" : "Eliminar mi cuenta"}
        </Button>
      </form>
    </Card>
  );
}
