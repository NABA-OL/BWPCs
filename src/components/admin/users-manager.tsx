// Desarrollado por NABA-OL
"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  changePasswordAction,
  createAdminAction,
  deleteAdminAction,
  resetAdminPasswordAction,
  type PasswordState,
  type CreateUserState,
  type ResetPasswordState,
} from "@/app/admin/(panel)/usuarios/actions";
import { Button } from "@/components/ui/button";

export interface AdminRow {
  id: string;
  usuario: string;
  creado: string;
}

export function UsersManager({
  admins,
  currentUserId,
  currentUser,
}: {
  admins: AdminRow[];
  currentUserId: string;
  currentUser: string;
}) {
  const router = useRouter();

  const [pwState, pwAction, pwPending] = useActionState<PasswordState, FormData>(
    changePasswordAction,
    {},
  );
  const [newState, newAction, newPending] = useActionState<
    CreateUserState,
    FormData
  >(createAdminAction, {});

  const [resetState, resetAction, resetPending] = useActionState<
    ResetPasswordState,
    FormData
  >(resetAdminPasswordAction, {});

  useEffect(() => {
    if (newState.createdUser) router.refresh();
  }, [newState.createdUser, router]);

  const inputCls =
    "mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda";

  return (
    <div className="mt-8 space-y-8">
      {/* Cambiar mi contraseña */}
      <section className="border border-hairline p-6">
        <h2 className="text-lg font-semibold">Mi contraseña</h2>
        <p className="mt-1 text-sm text-component">
          Sesión actual: <span className="font-mono">{currentUser}</span>
        </p>
        <form
          action={pwAction}
          key={pwState.ok ? "ok" : "form"}
          className="mt-4 grid gap-4 sm:grid-cols-2"
        >
          <label className="block">
            <span className="text-sm font-medium text-component">
              Nueva contraseña
            </span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className={`${inputCls} font-mono`}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-component">
              Confirmar
            </span>
            <input
              name="confirmar"
              type="password"
              autoComplete="new-password"
              required
              className={`${inputCls} font-mono`}
            />
          </label>
          <div className="sm:col-span-2 flex items-center gap-3">
            <Button type="submit" disabled={pwPending}>
              {pwPending ? "Guardando…" : "Cambiar contraseña"}
            </Button>
            {pwState.ok && (
              <span className="text-sm text-component">Contraseña actualizada ✓</span>
            )}
            {pwState.error && (
              <span role="alert" className="text-sm text-accent">
                {pwState.error}
              </span>
            )}
          </div>
        </form>
      </section>

      {/* Crear nuevo admin */}
      <section className="border border-hairline p-6">
        <h2 className="text-lg font-semibold">Crear administrador</h2>
        <p className="mt-1 text-sm text-component">
          Se genera una contraseña automática para compartirla. La persona puede
          cambiarla luego desde aquí.
        </p>
        <form action={newAction} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="block grow">
            <span className="text-sm font-medium text-component">Usuario</span>
            <input
              name="usuario"
              required
              placeholder="amigo"
              className={inputCls}
            />
          </label>
          <Button type="submit" disabled={newPending}>
            {newPending ? "Creando…" : "Crear"}
          </Button>
        </form>

        {newState.error && (
          <p role="alert" className="mt-3 text-sm text-accent">
            {newState.error}
          </p>
        )}
        {newState.createdUser && newState.generatedPassword && (
          <div className="mt-4 border border-accent/30 bg-accent/5 p-4 text-sm">
            <p>
              Usuario <strong>{newState.createdUser}</strong> creado. Contraseña
              (cópiala y compártela; no se vuelve a mostrar):
            </p>
            <p className="mt-2 select-all font-mono text-base font-semibold">
              {newState.generatedPassword}
            </p>
          </div>
        )}
      </section>

      {/* Lista de admins */}
      <section className="border border-hairline">
        <h2 className="border-b border-hairline px-6 py-4 text-lg font-semibold">
          Administradores
        </h2>

        {resetState.resetUser && resetState.generatedPassword && (
          <div className="border-b border-accent/30 bg-accent/5 px-6 py-4 text-sm">
            <p>
              Contraseña de <strong>{resetState.resetUser}</strong> reseteada.
              Nueva contraseña (cópiala; no se vuelve a mostrar):
            </p>
            <p className="mt-2 select-all font-mono text-base font-semibold">
              {resetState.generatedPassword}
            </p>
          </div>
        )}
        {resetState.error && (
          <p role="alert" className="border-b border-hairline px-6 py-3 text-sm text-accent">
            {resetState.error}
          </p>
        )}

        <table className="w-full text-sm">
          <thead className="border-b border-hairline bg-hairline/30 text-left">
            <tr>
              <th className="px-6 py-3 font-medium">Usuario</th>
              <th className="px-6 py-3 font-medium">Creado</th>
              <th className="px-6 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-b border-hairline last:border-0">
                <td className="px-6 py-3 font-mono font-medium">
                  {a.usuario}
                  {a.id === currentUserId && (
                    <span className="ml-2 text-xs text-component">(tú)</span>
                  )}
                </td>
                <td className="px-6 py-3 text-component">{a.creado}</td>
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-4">
                    {/* Resetear contraseña — disponible para todos */}
                    <form
                      action={resetAction}
                      onSubmit={(e) => {
                        if (
                          !confirm(
                            `¿Resetear la contraseña de ${a.usuario}? Se generará una nueva contraseña temporal.`,
                          )
                        )
                          e.preventDefault();
                      }}
                    >
                      <input type="hidden" name="id" value={a.id} />
                      <button
                        type="submit"
                        disabled={resetPending}
                        className="text-component hover:text-panda hover:underline"
                      >
                        Resetear
                      </button>
                    </form>

                    {/* Eliminar — no para admin inicial ni para sí mismo */}
                    {a.usuario !== "admin" && a.id !== currentUserId ? (
                      <form
                        action={deleteAdminAction}
                        onSubmit={(e) => {
                          if (!confirm(`¿Eliminar al usuario ${a.usuario}?`))
                            e.preventDefault();
                        }}
                      >
                        <input type="hidden" name="id" value={a.id} />
                        <button
                          type="submit"
                          className="text-accent hover:underline"
                        >
                          Eliminar
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs text-component">
                        {a.usuario === "admin" ? "Protegido" : "—"}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
