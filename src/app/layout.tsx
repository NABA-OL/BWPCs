/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeSync } from "@/components/theme/theme-sync";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ensamble de PC gamer a la medida en Colombia · B & W",
    template: "%s · B & W",
  },
  description:
    "Ensamble de computadores y venta de componentes en Colombia. Cotiza tu PC gaming o workstation a la medida con precios justos. Bogotá y envíos nacionales.",
  metadataBase: new URL("https://bw-pcs.com"),
  alternates: { canonical: "/" },
  keywords: [
    "ensamble de PC Colombia",
    "computadores a la medida Bogotá",
    "componentes de PC Colombia",
    "cotizar PC Colombia",
    "gaming PC Colombia",
    "armar PC Bogotá",
    "tarjetas gráficas Colombia",
    "procesadores Colombia",
    "B&W PCs",
    "bwpcs",
  ],
  icons: {
    icon: "/brand/logo-solo.ico",
    shortcut: "/brand/logo-solo.ico",
    apple: "/brand/logo-solo.png",
  },
  openGraph: {
    title: "B & W — Tu PC Master Race a buen precio",
    description:
      "Ensamble de computadores y venta de componentes en Colombia. Cotiza tu PC a la medida.",
    locale: "es_CO",
    type: "website",
    url: "https://bw-pcs.com",
    siteName: "B & W",
    images: [
      { url: "/brand/logo.png", alt: "B & W — Ensamble de PC Colombia" },
    ],
  },
  twitter: {
    card: "summary",
    title: "B & W — Tu PC Master Race a buen precio",
    description:
      "Ensamble de computadores y venta de componentes en Colombia. Cotiza tu PC a la medida.",
    images: ["/brand/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-CO"
      // El script de abajo pone `data-theme` antes de que React hidrate: sin esto,
      // React compararía el `<html>` del servidor (sin el atributo) con el del
      // navegador (con él) y avisaría de un desajuste de hidratación.
      suppressHydrationWarning
      className={`${geist.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-vanilla text-panda">
        {/* Antes de la primera pintura: si el usuario había elegido oscuro, lo aplica
            ya mismo (evita el parpadeo de claro a oscuro al cargar). Sin datos del
            usuario: solo arma constantes de src/lib/theme.ts. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <ThemeSync />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
