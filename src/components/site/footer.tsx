import { Clock, MapPin, Phone } from "lucide-react";
import { cacheLife } from "next/cache";
import NextLink from "next/link";
import Link from "@/components/site/link";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon, XIcon, YouTubeIcon } from "@/components/site/brand-icons";
import { Logo } from "@/components/site/logo";
import { PROPERTY_TYPES, propertyTypes } from "@/lib/config/property-types";
import { site, whatsappLink } from "@/lib/config/site";
import { getLocations, isLocationIndexable } from "@/lib/data/locations";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary, localizedAreaName } from "@/lib/i18n/dictionaries";

/** Network names as Amharic readers know them (screen-reader text only: the icons are the visible part). */
const amharicSocial: Record<string, string> = {
  Facebook: "ፌስቡክ",
  Instagram: "ኢንስታግራም",
  TikTok: "ቲክቶክ",
  YouTube: "ዩቲዩብ",
  "X (Twitter)": "ኤክስ (ትዊተር)",
  WhatsApp: "ዋትስአፕ",
};

const socials = [
  { href: site.social.facebook, label: "Facebook", Icon: FacebookIcon },
  { href: site.social.instagram, label: "Instagram", Icon: InstagramIcon },
  { href: site.social.tiktok, label: "TikTok", Icon: TikTokIcon },
  { href: site.social.youtube, label: "YouTube", Icon: YouTubeIcon },
  { href: site.social.x, label: "X (Twitter)", Icon: XIcon },
  { href: whatsappLink(), label: "WhatsApp", Icon: WhatsAppIcon },
];

async function Copyright({ lang }: { lang: Locale }) {
  "use cache";
  cacheLife("days");
  return <>{getDictionary(lang).footer.rights(new Date().getFullYear())}</>;
}

/**
 * Site-wide internal links to every area and property-type hub: this is how
 * crawlers (and people) reach the long-tail landing pages from any page.
 */
export async function Footer({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const locations = (await getLocations(lang)).filter(isLocationIndexable).slice(0, 10);

  return (
    <footer className="mt-auto bg-brand-950 text-white/80">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-4">
          <Logo inverted height={104} loading="lazy" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">{dict.footer.description}</p>
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
                  <span className="sr-only">{lang === "am" ? (amharicSocial[label] ?? label) : label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Property types" className="lg:col-span-2">
          <h2 className="font-display text-lg font-semibold tracking-wide text-white">{dict.footer.buy}</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {PROPERTY_TYPES.map((type) => (
              <li key={type}>
                <Link href={`/for-sale/${propertyTypes[type].slug}`} className="hover:text-gold-300">
                  {dict.footer.forSale(dict.types[type].plural)}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/projects" className="hover:text-gold-300">
                {dict.footer.ourProjects}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Areas" className="lg:col-span-2">
          <h2 className="font-display text-lg font-semibold tracking-wide text-white">{dict.footer.areas}</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {locations.map((l) => (
              <li key={l.slug}>
                <Link href={`/locations/${l.slug}`} className="hover:text-gold-300">
                  {dict.footer.propertyIn(localizedAreaName(lang, l.name))}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/locations" className="hover:text-gold-300">
                {dict.common.allAreas}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="lg:col-span-4">
          <h2 className="font-display text-lg font-semibold tracking-wide text-white">{dict.footer.visitOrCall}</h2>
          {/* NAP: must match the Google Business Profile exactly. */}
          <address className="mt-4 space-y-3 text-sm not-italic">
            <p className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden="true" />
              <span>
                {dict.brand.full}
                <br />
                {dict.office.street}, {dict.office.locality}, {dict.footer.address}
              </span>
            </p>
            <p className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden="true" />
              <a href={`tel:${site.contact.phone}`} className="hover:text-gold-300">
                {site.contact.phoneDisplay}
              </a>
            </p>
            <p className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden="true" />
              <span>{dict.footer.hours}</span>
            </p>
          </address>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:text-gold-300">
                {dict.footer.aboutUs}
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-gold-300">
                {dict.footer.faq}
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-gold-300">
                {dict.footer.buyerGuides}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-gold-300">
                {dict.footer.contact}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 pb-24 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 lg:pb-6">
          <p>
            <Copyright lang={lang} />
          </p>
          <ul className="flex gap-5">
            <li>
              <Link href="/privacy-policy" className="hover:text-white">
                {dict.footer.privacy}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white">
                {dict.footer.terms}
              </Link>
            </li>
            <li>
              {/* Plain link: staff only. Not prefetched, not followed by crawlers; /admin is also noindex. */}
              {/* Not the localized Link: the admin has no language prefix. */}
              <NextLink href="/admin" prefetch={false} rel="nofollow" className="hover:text-white">
                {dict.footer.staffLogin}
              </NextLink>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
