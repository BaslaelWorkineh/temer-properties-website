import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Container } from "@/components/site/section";
import { site } from "@/lib/config/site";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Terms of Use",
  description: `Terms that apply to using the ${site.name} website, including listing information, prices and site-visit bookings.`,
  path: "/terms",
});

// Template text: have it reviewed by the company's legal adviser before launch.
export default function TermsPage() {
  return (
    <Container className="max-w-3xl py-10">
      <Breadcrumbs items={[{ name: "Terms of use", path: "/terms" }]} />
      <article className="prose-content mt-8">
        <h1 className="text-4xl font-bold">Terms of use</h1>
        <h2>Listing information</h2>
        <p>
          We work to keep prices, sizes, availability and images accurate, but listings are provided for information only and
          may change without notice. Images may include artist&apos;s impressions or show sample units. Nothing on this
          website is an offer or a contract; the terms of any purchase are set out only in a signed sale agreement.
        </p>
        <h2>Prices</h2>
        <p>Prices are shown in Ethiopian Birr (ETB) and must be confirmed in writing with our sales team before reserving.</p>
        <h2>Site-visit bookings</h2>
        <p>
          A booking made online is a request. It is confirmed when our team contacts you. We may need to reschedule visits
          because of weather, safety or site conditions.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about these terms: <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
        </p>
      </article>
    </Container>
  );
}
