// Desarrollado por BlacKraken Solutions
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { adminNav } from "@/lib/admin-nav";
import { logoutAction } from "@/lib/auth/actions";

export function AdminShell({
  usuario,
  children,
}: {
  usuario: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-0.5">
      {adminNav.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        const base =
          "flex items-center justify-between px-3 py-2 text-sm transition-colors";
        if (!item.ready) {
          return (
            <span
              key={item.href}
              className={`${base} cursor-default text-vanilla/30`}
            >
              {item.label}
              <span className="font-mono text-[10px] text-vanilla/30">
                pronto
              </span>
            </span>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`${base} ${
              active
                ? "bg-vanilla text-panda"
                : "text-vanilla/70 hover:bg-vanilla/10 hover:text-vanilla"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      {/* Topbar móvil */}
      <div className="flex items-center justify-between border-b border-hairline bg-panda px-4 py-3 text-vanilla md:hidden">
        <div className="flex items-center gap-2">
          <Image
            src="/brand/logo-solo.png"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 object-contain invert"
          />
          <span className="font-extrabold">Panel B &amp; W</span>
        </div>
        <button
          type="button"
          aria-label="Menú"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="text-sm underline"
        >
          {open ? "Cerrar" : "Menú"}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          open ? "block" : "hidden"
        } bg-panda text-vanilla md:sticky md:top-0 md:block md:h-screen`}
      >
        <div className="flex h-full flex-col p-4">
          <div className="mb-6 hidden items-center gap-2.5 px-1 md:flex">
            <Image
              src="/brand/logo-solo.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 object-contain invert"
            />
            <span className="font-extrabold tracking-tight">Panel B &amp; W</span>
          </div>

          {nav}

          <div className="mt-auto border-t border-vanilla/10 pt-4">
            <p className="px-3 text-xs text-vanilla/50">
              Sesión: <span className="font-mono">{usuario}</span>
            </p>
            <form action={logoutAction}>
              <button
                type="submit"
                className="mt-2 w-full px-3 py-2 text-left text-sm text-vanilla/70 transition-colors hover:bg-vanilla/10 hover:text-vanilla"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Contenido */}
      <div className="min-w-0">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
