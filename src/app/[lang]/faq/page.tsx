import Link from "@/components/site/link";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { FaqList } from "@/components/site/faq-list";
import { JsonLd } from "@/components/site/json-ld";
import { Container, PageHero } from "@/components/site/section";
import { generalFaqs } from "@/lib/content/faqs";
import { faqJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "FAQ: Buying an Apartment or Shop in Addis Ababa",
  description:
    "Answers to common questions about buying an apartment or shop from Temer Properties: payment plans, reservations, site visits and buying from abroad.",
  path: "/faq",
});

const groups = ["Buying", "Payments", "Visits", "Diaspora"] as const;
const groupTitles: Record<(typeof groups)[number], string> = {
  Buying: "Buying a property",
  Payments: "Prices and payment plans",
  Visits: "Site visits",
  Diaspora: "Buying from abroad",
};

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(generalFaqs)} />
      <PageHero>
        <Breadcrumbs items={[{ name: "FAQ", path: "/faq" }]} inverted />
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Frequently asked questions</h1>
        <p className="mt-3 max-w-2xl text-lg text-white/80">
          Can&apos;t find your answer?{" "}
          <Link href="/contact" className="font-semibold text-gold-300 underline">
            Ask our sales team
          </Link>
          .
        </p>
      </PageHero>
      <Container className="max-w-4xl py-14">
        {groups.map((group) => (
          <section key={group} className="mt-10 first:mt-0">
            <h2 className="text-2xl font-bold">{groupTitles[group]}</h2>
            <div className="mt-4">
              <FaqList faqs={generalFaqs.filter((f) => f.group === group)} />
            </div>
          </section>
        ))}
      </Container>
      <CtaBand />
    </>
  );
}
