import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { siteConfig, whatsappLink } from "@/lib/site-config";

export const metadata: Metadata = { title: "Contacto" };

export default function ContactoPage() {
  return (
    <PageHero eyebrow="Hablemos" title="Contacto">
      <p>Escríbenos y armamos tu equipo a la medida.</p>
      <div className="mt-6 space-y-2 text-base">
        <a
          href={whatsappLink("Hola B & W, quiero cotizar un PC.")}
          target="_blank"
          rel="noopener noreferrer"
          className="block font-mono text-accent hover:underline"
        >
          WhatsApp {siteConfig.contact.whatsappDisplay}
        </a>
        <a
          href={`mailto:${siteConfig.contact.email}`}
          className="block text-panda hover:underline"
        >
          {siteConfig.contact.email}
        </a>
      </div>
    </PageHero>
  );
}
