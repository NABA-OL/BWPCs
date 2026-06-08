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
    "Ensamble de computadores y venta de componentes en Colombia. Cotiza tu PC a la medida con precios justos.",
  metadataBase: new URL("https://bwpcs.vercel.app"),
  openGraph: {
    title: "B & W — Tu PC Master Race a buen precio",
    description:
      "Ensamble de computadores y venta de componentes en Colombia.",
    locale: "es_CO",
    type: "website",
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
