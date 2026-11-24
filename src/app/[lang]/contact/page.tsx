import { Clock, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { WhatsAppIcon } from "@/components/site/brand-icons";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { InquiryForm } from "@/components/site/inquiry-form";
import { JsonLd } from "@/components/site/json-ld";
import { Container, PageHero } from "@/components/site/section";
import { site, whatsappLink } from "@/lib/config/site";
import { hasLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPagesDict } from "@/lib/i18n/dict/pages";
import { organizationJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export const ensureStatic = "navigation";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  const l: Locale = hasLocale(lang) ? lang : "en";
  const pages = getPagesDict(l);
  return buildMetadata({
    title: pages.contact.metaTitle,
    description: pages.contact.metaDescription(site.contact.phoneDisplay, site.address.street, l === "en" ? site.openingHoursText : pages.hours),
    path: "/contact",
    lang: l,
    translations: locales,
  });
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang: rawLang } = await params;
  const lang: Locale = hasLocale(rawLang) ? rawLang : "en";
  const pages = getPagesDict(lang);
  const dict = pages.contact;
  const channels = [
    { icon: Phone, label: dict.callSales, value: site.contact.phoneDisplay, href: `tel:${site.contact.phone}` },
    { icon: WhatsAppIcon, label: dict.whatsapp, value: dict.chat, href: whatsappLink(dict.waMessage) },
  ];

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <PageHero>
        <Breadcrumbs items={[{ name: dict.breadcrumb, path: "/contact" }]} inverted lang={lang} />
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{dict.h1}</h1>
        <p className="mt-3 max-w-2xl text-lg text-white/80">{dict.intro}</p>
      </PageHero>
      <Container className="grid gap-12 py-14 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="space-y-6">
          <ul className="space-y-3">
            {channels.map((c) => (
              <li key={c.href}>
                <a
                  href={c.href}
                  {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex items-center gap-4 rounded-none p-4 ring-1 ring-line transition hover:bg-soft hover:ring-brand-300"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                    <c.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-muted">{c.label}</span>
                    <span className="block truncate font-semibold text-ink">{c.value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <div className="rounded-none bg-soft p-6 ring-1 ring-line">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <MapPin className="size-5 text-brand-500" aria-hidden="true" /> {dict.office}
            </h2>
            <address className="mt-2 not-italic leading-relaxed text-ink/80">
              {lang === "en" ? site.name : pages.brand}
              <br />
              {getDictionary(lang).office.street}
              <br />
              {getDictionary(lang).office.locality}, {pages.ethiopia}
            </address>
            <a href={site.address.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-semibold text-brand-700 hover:underline">
              {dict.directions}
            </a>
            <h2 className="mt-6 flex items-center gap-2 text-xl font-bold">
              <Clock className="size-5 text-brand-500" aria-hidden="true" /> {dict.openingHours}
            </h2>
            <p className="mt-2 text-ink/80">{lang === "en" ? site.openingHoursText : pages.hours}</p>
          </div>
        </div>
        <div className="rounded-none p-6 ring-1 ring-line sm:p-8">
          <h2 className="text-3xl font-bold">{dict.sendTitle}</h2>
          <p className="mt-1 text-muted">{dict.sendText}</p>
          <InquiryForm className="mt-8" />
        </div>
      </Container>
    </>
  );
}
