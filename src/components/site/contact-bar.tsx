import { CalendarCheck, Phone } from "lucide-react";
import Link from "@/components/site/link";
import { WhatsAppIcon } from "@/components/site/brand-icons";
import { site, whatsappLink } from "@/lib/config/site";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

/** Thumb-reachable contact actions on mobile; floating call button on desktop. Pure links, no JS. */
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
      <a
        href={`tel:${site.contact.phone}`}
        className="fixed bottom-6 right-6 z-30 hidden size-14 place-items-center rounded-full bg-gold-500 text-brand-700 shadow-lg transition hover:scale-105 hover:bg-gold-400 lg:grid"
      >
        {/* Lucide has no filled phone; filling the outline gives a solid glyph. */}
        <Phone className="size-6" fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
        <span className="sr-only">{dict.common.callUs(site.contact.phoneDisplay)}</span>
      </a>
    </>
  );
}
