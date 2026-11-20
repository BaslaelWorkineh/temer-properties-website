import { Mail, Phone } from "lucide-react";
import { TelegramIcon, WhatsAppIcon } from "@/components/site/brand-icons";
import { site, whatsappLink } from "@/lib/config/site";
import { cn } from "@/lib/utils";

const base =
  "flex h-12 items-center justify-center gap-2.5 px-4 text-[0.95rem] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";

/**
 * Four full-width contact buttons for the side column of a detail page, stacked: call, WhatsApp, Telegram, email.
 * Contact details come from src/lib/config/site.ts.
 */
export function ContactPanel({ subject, className }: { subject: string; className?: string }) {
  const { contact } = site;
  const message = `Hello Temer Properties, I'm interested in: ${subject}`;
  const outline = cn(base, "border border-line bg-soft text-ink hover:border-ink");
  return (
    <div className={cn("grid gap-2.5", className)} role="group" aria-label={`Contact us about ${subject}`}>
      <a href={`tel:${contact.phone}`} className={cn(base, "bg-[#1f9d63] text-white hover:bg-[#188652]")}>
        <Phone className="size-[1.1rem]" aria-hidden="true" /> Call {contact.phoneDisplay}
      </a>
      <a
        href={whatsappLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(base, "bg-[#17a34a] text-white hover:bg-[#13893e]")}
      >
        <WhatsAppIcon className="size-[1.1rem]" /> WhatsApp us
      </a>
      <a href={contact.telegram} target="_blank" rel="noopener noreferrer" className={outline}>
        <TelegramIcon className="size-[1.1rem]" /> Telegram
      </a>
      <a href={`mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`} className={outline}>
        <Mail className="size-[1.1rem]" aria-hidden="true" /> Email
      </a>
    </div>
  );
}
