import { Mail, Phone } from "lucide-react";
import { TelegramIcon, WhatsAppIcon } from "@/components/site/brand-icons";
import { site, whatsappLink } from "@/lib/config/site";

const base =
  "inline-flex size-10 items-center justify-center border transition focus-visible:outline-2 focus-visible:outline-offset-2";
const lightButton = `${base} border-line bg-white text-brand-700 hover:border-brand-500 hover:bg-brand-600 hover:text-white focus-visible:outline-brand-600`;
const darkButton = `${base} border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-brand-950 focus-visible:outline-white`;

/**
 * Call / WhatsApp / Telegram / Email buttons for a listing or project card.
 * `relative z-10` lifts them above the card's stretched link so they stay clickable.
 * All contact details come from src/lib/config/site.ts.
 */
export function ContactActions({ subject, tone = "light", round }: { subject: string; tone?: "light" | "dark"; round?: boolean }) {
  const button = `${tone === "dark" ? darkButton : lightButton}${round ? " rounded-full" : ""}`;
  const { contact } = site;
  const message = `Hello Temer Properties, I'm interested in: ${subject}`;
  return (
    <div className="relative z-10 flex items-center gap-2" role="group" aria-label={`Contact us about ${subject}`}>
      <a href={`tel:${contact.phone}`} className={button} title="Call">
        <Phone className="size-4" aria-hidden="true" />
        <span className="sr-only">Call {contact.phoneDisplay}</span>
      </a>
      <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" className={button} title="WhatsApp">
        <WhatsAppIcon className="size-4" />
        <span className="sr-only">WhatsApp</span>
      </a>
      <a href={contact.telegram} target="_blank" rel="noopener noreferrer" className={button} title="Telegram">
        <TelegramIcon className="size-4" />
        <span className="sr-only">Telegram</span>
      </a>
      <a
        href={`mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`}
        className={button}
        title="Email"
      >
        <Mail className="size-4" aria-hidden="true" />
        <span className="sr-only">Email</span>
      </a>
    </div>
  );
}
