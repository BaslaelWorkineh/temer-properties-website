import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { TelegramIcon, WhatsAppIcon } from "@/components/site/brand-icons";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { InquiryForm } from "@/components/site/inquiry-form";
import { JsonLd } from "@/components/site/json-ld";
import { Container, PageHero } from "@/components/site/section";
import { site, whatsappLink } from "@/lib/config/site";
import { organizationJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Contact Temer Properties",
  description: `Call ${site.contact.phoneDisplay}, message us on WhatsApp or Telegram, or visit our office at ${site.address.street}, Addis Ababa. Open ${site.openingHoursText}.`,
  path: "/contact",
});

export default function ContactPage() {
  const channels = [
    { icon: Phone, label: "Call sales", value: site.contact.phoneDisplay, href: `tel:${site.contact.phone}` },
    ...(site.contact.salesPhone
      ? [{ icon: Phone, label: "Sales line 2", value: site.contact.salesPhoneDisplay, href: `tel:${site.contact.salesPhone}` }]
      : []),
    { icon: WhatsAppIcon, label: "WhatsApp", value: "Chat with us", href: whatsappLink("Hello Temer Properties, I have a question.") },
    { icon: TelegramIcon, label: "Telegram", value: "Message us", href: site.contact.telegram },
    { icon: Mail, label: "Email", value: site.contact.email, href: `mailto:${site.contact.email}` },
  ];

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <PageHero>
        <Breadcrumbs items={[{ name: "Contact", path: "/contact" }]} inverted />
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Contact us</h1>
        <p className="mt-3 max-w-2xl text-lg text-white/80">
          Have a question? Let&apos;s find the right place for you. Our sales team replies quickly during office hours.
        </p>
      </PageHero>
      <Container className="grid gap-12 py-14 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="space-y-6">
          <ul className="space-y-3">
            {channels.map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex items-center gap-4 rounded-2xl p-4 ring-1 ring-line transition hover:bg-soft hover:ring-brand-300"
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
          <div className="rounded-2xl bg-soft p-6 ring-1 ring-line">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <MapPin className="size-5 text-brand-500" aria-hidden="true" /> Office
            </h2>
            <address className="mt-2 not-italic leading-relaxed text-ink/80">
              {site.name}
              <br />
              {site.address.street}
              <br />
              {site.address.locality}, Ethiopia
            </address>
            <a href={site.address.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-semibold text-brand-700 hover:underline">
              Get directions
            </a>
            <h2 className="mt-6 flex items-center gap-2 text-xl font-bold">
              <Clock className="size-5 text-brand-500" aria-hidden="true" /> Opening hours
            </h2>
            <p className="mt-2 text-ink/80">{site.openingHoursText}</p>
          </div>
        </div>
        <div className="rounded-2xl p-6 ring-1 ring-line sm:p-8">
          <h2 className="text-3xl font-bold">Send us a message</h2>
          <p className="mt-1 text-muted">Tell us what you are looking for and we&apos;ll call you back.</p>
          <InquiryForm className="mt-8" />
        </div>
      </Container>
    </>
  );
}
