import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
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
    default: "B & W — Tu PC Master Race a buen precio",
    template: "%s · B & W",
  },
  description:
    "Ensamble de computadores y venta de componentes en Colombia. Cotiza tu PC gaming o workstation a la medida con precios justos. Bogotá y envíos nacionales.",
  metadataBase: new URL("https://bwpcs.vercel.app"),
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
    url: "https://bwpcs.vercel.app",
    siteName: "B & W",
    images: [{ url: "/brand/logo.png", alt: "B & W — Ensamble de PC Colombia" }],
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
      className={`${geist.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-vanilla text-panda">{children}</body>
    </html>
  );
}
