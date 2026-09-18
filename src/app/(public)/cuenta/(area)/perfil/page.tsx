/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  AvatarPicker,
  ProfileForm,
} from "@/components/account/profile-forms";
import { getUserSession } from "@/lib/user-auth/session";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function PerfilPage() {
  const session = await getUserSession();
  if (!session) redirect("/cuenta/ingresar?next=/cuenta/perfil");
  const { user } = session;

  return (
    <section className="max-w-xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Mi perfil</h1>
      <p className="mt-2 text-sm text-component">
        Tu avatar y los datos con los que te contactamos.
      </p>

      <div className="mt-8 space-y-6">
        <div className="border border-hairline bg-vanilla p-6">
          <h2 className="text-lg font-semibold">Avatar</h2>
          <div className="mt-4">
            <AvatarPicker
              currentStyle={user.avatarStyle ?? "lorelei-neutral"}
              currentSeed={user.avatarSeed ?? user.id}
            />
          </div>
        </div>

        <div className="border border-hairline bg-vanilla p-6">
          <h2 className="text-lg font-semibold">Tus datos</h2>
          <div className="mt-4">
            <ProfileForm name={user.name} phone={user.phone} />
          </div>
        </div>
      </div>
    </section>
  );
}
