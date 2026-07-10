// Desarrollado por BlacKraken Solutions
"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
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
    </form>
  );
}
