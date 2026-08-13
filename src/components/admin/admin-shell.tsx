"use client";
/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { adminNav, isAdminNavGroup, type AdminNavItem } from "@/lib/admin-nav";
import { logoutAction } from "@/lib/auth/actions";

function isItemActive(item: AdminNavItem, pathname: string): boolean {
  return item.href === "/admin"
    ? pathname === "/admin"
    : pathname.startsWith(item.href);
}

function NavLink({
  item,
  active,
  onClick,
}: {
  item: AdminNavItem;
  active: boolean;
  onClick: () => void;
}) {
  const base =
    "flex items-center justify-between px-3 py-2 text-sm transition-colors";
  if (!item.ready) {
    return (
      <span className={`${base} cursor-default text-vanilla/30`}>
        {item.label}
        <span className="font-mono text-[10px] text-vanilla/30">pronto</span>
      </span>
    );
  }
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`${base} ${
        active
          ? "bg-vanilla text-panda"
          : "text-vanilla/70 hover:bg-vanilla/10 hover:text-vanilla"
      }`}
    >
      {item.label}
    </Link>
  );
}

export function AdminShell({
  usuario,
  children,
}: {
  usuario: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const entry of adminNav) {
      if (
        isAdminNavGroup(entry) &&
        entry.items.some((i) => isItemActive(i, pathname))
      ) {
        initial.add(entry.label);
      }
    }
    return initial;
  });

  // Si navegas a un ítem de un grupo cerrado, ábrelo (sin cerrar los que ya abriste).
  useEffect(() => {
    setOpenGroups((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const entry of adminNav) {
        if (
          isAdminNavGroup(entry) &&
          !next.has(entry.label) &&
          entry.items.some((i) => isItemActive(i, pathname))
        ) {
          next.add(entry.label);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [pathname]);

  function toggleGroup(label: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  const nav = (
    <nav className="flex flex-col gap-0.5">
      {adminNav.map((entry) => {
        if (!isAdminNavGroup(entry)) {
          return (
            <NavLink
              key={entry.href}
              item={entry}
              active={isItemActive(entry, pathname)}
              onClick={() => setOpen(false)}
            />
          );
        }

        const expanded = openGroups.has(entry.label);
        return (
          <div key={entry.label}>
            <button
              type="button"
              onClick={() => toggleGroup(entry.label)}
              aria-expanded={expanded}
              className="flex w-full items-center justify-between px-3 py-2 text-sm text-vanilla/70 transition-colors hover:bg-vanilla/10 hover:text-vanilla"
            >
              {entry.label}
              <span
                className={`transition-transform ${expanded ? "rotate-90" : ""}`}
              >
                ›
              </span>
            </button>
            {expanded && (
              <div className="ml-3 flex flex-col gap-0.5 border-l border-vanilla/10 pl-2">
                {entry.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    active={isItemActive(item, pathname)}
                    onClick={() => setOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>
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
            <span className="font-extrabold tracking-tight">
              Panel B &amp; W
            </span>
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
