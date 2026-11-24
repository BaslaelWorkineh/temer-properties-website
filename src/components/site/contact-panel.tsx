import { Mail, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/site/brand-icons";
import { site, whatsappLink } from "@/lib/config/site";
import type { Locale } from "@/lib/i18n/config";
import { getPropertiesDict } from "@/lib/i18n/dict/properties";
import { cn } from "@/lib/utils";

const base =
  "flex h-12 items-center justify-center gap-2.5 px-4 text-[0.95rem] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";

/**
 * Three full-width contact buttons for the side column of a detail page, stacked: call, WhatsApp, email.
 * Contact details come from src/lib/config/site.ts.
 */
export function ContactPanel({ subject, className, lang = "en" }: { subject: string; className?: string; lang?: Locale }) {
  const { contact } = site;
  const pd = getPropertiesDict(lang);
  const message = pd.contact.message(subject);
  const outline = cn(base, "border border-line bg-soft text-ink hover:border-ink");
  return (
    <div className={cn("grid gap-2.5", className)} role="group" aria-label={pd.contact.about(subject)}>
      <a href={`tel:${contact.phone}`} className={cn(base, "bg-[#1f9d63] text-white hover:bg-[#188652]")}>
        <Phone className="size-[1.1rem]" aria-hidden="true" /> {pd.contact.call} {contact.phoneDisplay}
      </a>
      <a
        href={whatsappLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(base, "bg-[#17a34a] text-white hover:bg-[#13893e]")}
      >
        <WhatsAppIcon className="size-[1.1rem]" /> {pd.contact.whatsappUs}
      </a>
      <a href={`mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`} className={outline}>
        <Mail className="size-[1.1rem]" aria-hidden="true" /> {pd.contact.email}
      </a>
    </div>
  );
}
