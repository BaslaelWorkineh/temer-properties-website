import { CalendarCheck, Phone } from "lucide-react";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/site/brand-icons";
import { site, whatsappLink } from "@/lib/config/site";

/** Thumb-reachable contact actions on mobile; floating WhatsApp button on desktop. Pure links, no JS. */
export function ContactBar() {
  const waMessage = "Hello Temer Properties, I would like more information about your properties.";
  return (
    <>
      <nav
        aria-label="Quick contact"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <a href={`tel:${site.contact.phone}`} className="flex flex-col items-center gap-1 py-2.5 text-xs font-semibold text-ink">
          <Phone className="size-5 text-brand-500" aria-hidden="true" />
          Call
        </a>
        <a
          href={whatsappLink(waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 py-2.5 text-xs font-semibold text-ink"
        >
          <WhatsAppIcon className="size-5 text-[#25D366]" />
          WhatsApp
        </a>
        <Link href="/book-a-visit" className="flex flex-col items-center gap-1 bg-brand-500 py-2.5 text-xs font-semibold text-white">
          <CalendarCheck className="size-5" aria-hidden="true" />
          Book a visit
        </Link>
      </nav>
      <a
        href={whatsappLink(waMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-30 hidden size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 lg:grid"
      >
        <WhatsAppIcon className="size-7" />
        <span className="sr-only">Chat with us on WhatsApp</span>
      </a>
    </>
  );
}
