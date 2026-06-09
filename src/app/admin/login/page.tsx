import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Acceso administrador",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // Si ya hay sesión, no mostrar el login.
  if (await getSession()) redirect("/admin");

  const { next } = await searchParams;
  const safeNext = next?.startsWith("/admin") ? next : "/admin";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/brand/logo-solo.png"
            alt=""
            width={56}
            height={56}
            priority
            className="h-14 w-14 object-contain"
          />
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
            Panel B &amp; W
          </h1>
          <p className="mt-1 text-sm text-component">
            Acceso restringido al administrador.
          </p>
        </div>

        <div className="mt-8 border border-hairline bg-vanilla p-6">
          <LoginForm next={safeNext} />
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-component transition-colors hover:text-panda"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
