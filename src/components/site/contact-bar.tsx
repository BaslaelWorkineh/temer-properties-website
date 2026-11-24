import { CalendarCheck, Phone } from "lucide-react";
import Link from "@/components/site/link";
import { WhatsAppIcon } from "@/components/site/brand-icons";
import { FloatingContact } from "@/components/site/floating-contact";
import { site, whatsappLink } from "@/lib/config/site";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

/**
 * Thumb-reachable contact actions on mobile (pure links, no JS); on desktop, a floating button that expands
 * into phone and WhatsApp.
 */
export function ContactBar({ lang = "en" }: { lang?: Locale }) {
  const dict = getDictionary(lang);
  const waMessage = "Hello Temer Properties, I would like more information about your properties.";
  return (
    <>
      <nav
        aria-label={dict.common.quickContact}
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <a href={`tel:${site.contact.phone}`} className="flex flex-col items-center gap-1 py-2.5 text-xs font-semibold text-ink">
          <Phone className="size-5 text-brand-500" aria-hidden="true" />
          {dict.common.call}
        </a>
        <a
          href={whatsappLink(waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 py-2.5 text-xs font-semibold text-ink"
        >
          <WhatsAppIcon className="size-5 text-[#25D366]" />
          {dict.common.whatsapp}
        </a>
        <Link href="/book-a-visit" className="flex flex-col items-center gap-1 bg-brand-500 py-2.5 text-xs font-semibold text-white">
          <CalendarCheck className="size-5" aria-hidden="true" />
          {dict.common.bookVisit}
        </Link>
      </nav>
      <FloatingContact
        phone={site.contact.phone}
        phoneDisplay={site.contact.phoneDisplay}
        whatsappHref={whatsappLink(waMessage)}
        labels={{
          call: dict.common.call,
          whatsapp: dict.common.whatsapp,
          open: dict.common.contactOptions,
          close: dict.common.closeContactOptions,
        }}
      />
    </>
  );
}
