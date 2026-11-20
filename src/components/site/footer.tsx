import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { FacebookIcon, InstagramIcon, TelegramIcon, TikTokIcon, WhatsAppIcon, XIcon, YouTubeIcon } from "@/components/site/brand-icons";
import { Logo } from "@/components/site/logo";
import { PROPERTY_TYPES, propertyTypes } from "@/lib/config/property-types";
import { site, whatsappLink } from "@/lib/config/site";
import { getLocations, isLocationIndexable } from "@/lib/data/locations";

const socials = [
  { href: site.social.facebook, label: "Facebook", Icon: FacebookIcon },
  { href: site.social.instagram, label: "Instagram", Icon: InstagramIcon },
  { href: site.social.tiktok, label: "TikTok", Icon: TikTokIcon },
  { href: site.social.youtube, label: "YouTube", Icon: YouTubeIcon },
  { href: site.social.x, label: "X (Twitter)", Icon: XIcon },
  { href: site.contact.telegram, label: "Telegram", Icon: TelegramIcon },
  { href: whatsappLink(), label: "WhatsApp", Icon: WhatsAppIcon },
];

async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

/**
 * Site-wide internal links to every area and property-type hub: this is how
 * crawlers (and people) reach the long-tail landing pages from any page.
 */
export async function Footer() {
  const locations = (await getLocations()).filter(isLocationIndexable).slice(0, 10);

  return (
    <footer className="mt-auto bg-brand-950 text-white/80">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-4">
          <Logo inverted height={104} loading="lazy" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">{site.description}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-gold-500 hover:text-brand-950"
                >
                  <Icon className="size-4.5" />
                  <span className="sr-only">{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Property types" className="lg:col-span-2">
          <h2 className="font-display text-lg font-semibold tracking-wide text-white">Buy</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {PROPERTY_TYPES.map((type) => (
              <li key={type}>
                <Link href={`/for-sale/${propertyTypes[type].slug}`} className="hover:text-gold-300">
                  {propertyTypes[type].plural} for sale
                </Link>
              </li>
            ))}
            <li>
              <Link href="/projects" className="hover:text-gold-300">
                Our projects
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Areas" className="lg:col-span-2">
          <h2 className="font-display text-lg font-semibold tracking-wide text-white">Areas</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {locations.map((l) => (
              <li key={l.slug}>
                <Link href={`/locations/${l.slug}`} className="hover:text-gold-300">
                  Property in {l.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/locations" className="hover:text-gold-300">
                All areas
              </Link>
            </li>
          </ul>
        </nav>

        <div className="lg:col-span-4">
          <h2 className="font-display text-lg font-semibold tracking-wide text-white">Visit or call us</h2>
          {/* NAP: must match the Google Business Profile exactly. */}
          <address className="mt-4 space-y-3 text-sm not-italic">
            <p className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden="true" />
              <span>
                {site.name}
                <br />
                {site.address.street}, {site.address.locality}, Ethiopia
              </span>
            </p>
            <p className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden="true" />
              <a href={`tel:${site.contact.phone}`} className="hover:text-gold-300">
                {site.contact.phoneDisplay}
              </a>
            </p>
            <p className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden="true" />
              <a href={`mailto:${site.contact.email}`} className="break-all hover:text-gold-300">
                {site.contact.email}
              </a>
            </p>
            <p className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden="true" />
              <span>{site.openingHoursText}</span>
            </p>
          </address>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:text-gold-300">
                About us
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-gold-300">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-gold-300">
                Buyer guides
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-gold-300">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 pb-24 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 lg:pb-6">
          <p>
            © <CopyrightYear /> {site.legalName}. All rights reserved.
          </p>
          <ul className="flex gap-5">
            <li>
              <Link href="/privacy-policy" className="hover:text-white">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white">
                Terms of use
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
