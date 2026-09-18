"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/account/user-avatar";
import { INPUT, LABEL, errorText } from "@/components/account/shared";
import { Button } from "@/components/ui/button";
import {
  AVATAR_CREDITS,
  AVATAR_STYLES,
  randomAvatarSeed,
} from "@/lib/avatar-styles";
import { authClient } from "@/lib/user-auth/client";

const CANDIDATES = 8;

function Feedback({ error, ok }: { error?: string | null; ok?: string | null }) {
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
  return ok ? (
    <p role="status" className="border border-hairline px-3 py-2 text-sm">
      {ok}
    </p>
  ) : null;
}

export function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError(null);
    setOk(null);
    setPending(true);
    try {
      const { error: err } = await authClient.updateUser({
        name: String(data.get("name") ?? "").trim(),
        phone: String(data.get("phone") ?? "").replace(/\D/g, ""),
      });
      if (err) return setError(errorText(err));
      setOk("Datos guardados.");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="profile-name" className={LABEL}>
          Nombre
        </label>
        <input
          id="profile-name"
          name="name"
          defaultValue={name}
          autoComplete="name"
          minLength={2}
          maxLength={80}
          required
          className={INPUT}
        />
      </div>
      <div>
        <label htmlFor="profile-phone" className={LABEL}>
          Celular
        </label>
        <input
          id="profile-phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          defaultValue={phone}
          autoComplete="tel-national"
          pattern="3[0-9]{9}"
          maxLength={10}
          title="Celular colombiano de 10 dígitos"
          required
          className={`${INPUT} font-mono`}
        />
      </div>
      <Feedback error={error} ok={ok} />
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Guardar datos"}
      </Button>
    </form>
  );
}

interface AvatarPickerProps {
  currentStyle: string;
  currentSeed: string;
}

export function AvatarPicker({ currentStyle, currentSeed }: AvatarPickerProps) {
  const router = useRouter();
  const [style, setStyle] = useState(currentStyle);
  const [seed, setSeed] = useState(currentSeed);
  // Candidatos al azar: se generan tras montar (evita desajuste de hidratación).
  const [seeds, setSeeds] = useState<string[]>([currentSeed]);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function shuffle() {
    setSeeds([
      currentSeed,
      ...Array.from({ length: CANDIDATES - 1 }, randomAvatarSeed),
    ]);
  }

  useEffect(shuffle, []); // eslint-disable-line react-hooks/exhaustive-deps

  const changed = style !== currentStyle || seed !== currentSeed;

  async function save() {
    setError(null);
    setOk(null);
    setPending(true);
    try {
      const { error: err } = await authClient.updateUser({
        avatarStyle: style,
        avatarSeed: seed,
      });
      if (err) return setError(errorText(err));
      setOk("Avatar actualizado.");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <UserAvatar
          style={style}
          seed={seed}
          size={88}
          className="h-22 w-22 border border-hairline bg-vanilla"
        />
        <div role="group" aria-label="Estilo de avatar" className="flex flex-wrap gap-2">
          {AVATAR_STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={style === s.id}
              onClick={() => setStyle(s.id)}
              className={`rounded-[2px] border px-3 py-1.5 text-sm transition-colors ${
                style === s.id
                  ? "border-panda bg-panda text-vanilla"
                  : "border-hairline text-component hover:border-panda hover:text-panda"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="grid grid-cols-4 gap-2" aria-label="Opciones de avatar">
        {seeds.map((s) => (
          <li key={s}>
            <button
              type="button"
              aria-pressed={seed === s}
              aria-label="Elegir este avatar"
              onClick={() => setSeed(s)}
              className={`block w-full border-2 bg-vanilla p-0.5 transition-colors ${
                seed === s ? "border-accent" : "border-hairline hover:border-panda"
              }`}
            >
              <UserAvatar style={style} seed={s} size={72} className="h-auto w-full" />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="button" onClick={save} disabled={pending || !changed}>
          {pending ? "Guardando…" : "Guardar avatar"}
        </Button>
        <button
          type="button"
          onClick={shuffle}
          className="text-sm text-accent hover:underline"
        >
          Ver otras opciones
        </button>
      </div>
      <Feedback error={error} ok={ok} />

      <p className="text-[11px] leading-relaxed text-component">
        {AVATAR_CREDITS.text}{" "}
        <a
          href={AVATAR_CREDITS.author.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
        >
          {AVATAR_CREDITS.author.name}
        </a>
        , licenciada bajo{" "}
        <a
          href={AVATAR_CREDITS.license.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
        >
          {AVATAR_CREDITS.license.name}
        </a>
        .
      </p>
    </div>
  );
}
