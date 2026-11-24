import { Mail, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/site/brand-icons";
import { site, whatsappLink } from "@/lib/config/site";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPropertiesDict } from "@/lib/i18n/dict/properties";

const base =
  "inline-flex size-10 items-center justify-center border transition focus-visible:outline-2 focus-visible:outline-offset-2";
const lightButton = `${base} border-line bg-white text-brand-700 hover:border-brand-500 hover:bg-brand-600 hover:text-white focus-visible:outline-brand-600`;
const darkButton = `${base} border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-brand-950 focus-visible:outline-white`;

/**
 * Call / WhatsApp / Email buttons for a listing or project card.
 * `relative z-10` lifts them above the card's stretched link so they stay clickable.
 * All contact details come from src/lib/config/site.ts.
 */
export function ContactActions({
  subject,
  tone = "light",
  round,
  lang = "en",
}: {
  subject: string;
  tone?: "light" | "dark";
  round?: boolean;
  lang?: Locale;
}) {
  const dict = getDictionary(lang);
  const pd = getPropertiesDict(lang);
  const button = `${tone === "dark" ? darkButton : lightButton}${round ? " rounded-full" : ""}`;
  const { contact } = site;
  const message = pd.contact.message(subject);
  return (
    <div className="relative z-10 flex items-center gap-2" role="group" aria-label={pd.contact.about(subject)}>
      <a href={`tel:${contact.phone}`} className={button} title={dict.common.call}>
        <Phone className="size-4" aria-hidden="true" />
        <span className="sr-only">{dict.common.call} {contact.phoneDisplay}</span>
      </a>
      <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" className={button} title={dict.common.whatsapp}>
        <WhatsAppIcon className="size-4" />
        <span className="sr-only">{dict.common.whatsapp}</span>
      </a>
      <a
        href={`mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`}
        className={button}
        title={pd.contact.email}
      >
        <Mail className="size-4" aria-hidden="true" />
        <span className="sr-only">{pd.contact.email}</span>
      </a>
    </div>
  );
}
