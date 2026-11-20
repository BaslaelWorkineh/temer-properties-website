import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { LocationCard } from "@/components/site/location-card";
import { Container, PageHero } from "@/components/site/section";
import { getLocations, isLocationIndexable } from "@/lib/data/locations";
import { itemListJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Neighbourhoods: Where to Buy Property in Addis Ababa",
  description:
    "Area guides for buying property in Addis Ababa: Sarbet, Megenagna, Ayat, Haile Garment, Piassa, Bulgaria and more. See what each neighbourhood offers and the apartments and shops for sale there.",
  path: "/locations",
});

export default async function LocationsPage() {
  const locations = (await getLocations()).filter(isLocationIndexable);
  return (
    <>
      <JsonLd data={itemListJsonLd(locations.map((l) => ({ path: `/locations/${l.slug}`, name: l.name })), "Areas")} />
      <PageHero>
        <Breadcrumbs items={[{ name: "Locations", path: "/locations" }]} inverted />
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Where to buy property in Addis Ababa</h1>
        <p className="mt-3 max-w-2xl text-lg text-white/80">
          Every neighbourhood has its own character, commute and price level. Explore the areas where we build, with local
          guides and the homes and shops for sale in each.
        </p>
      </PageHero>
      <section className="py-14">
        <Container>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {locations.map((l) => (
              <li key={l.id}>
                <LocationCard location={l} />
                {l.summary ? <p className="mt-3 text-sm leading-relaxed text-muted">{l.summary}</p> : null}
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
