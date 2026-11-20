import { CalendarCheck2, Phone, ShieldCheck, Video } from "lucide-react";
import { Suspense } from "react";
import { BookingForm } from "@/components/site/booking-form";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Container, PageHero } from "@/components/site/section";
import { site } from "@/lib/config/site";
import { getProjectOptions } from "@/lib/data/projects";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Book a Free Site Visit",
  description:
    "Book a free site visit or a live video walkthrough of Temer Properties' apartments and shops in Addis Ababa. Pick a date and time online; our team confirms by phone.",
  path: "/book-a-visit",
});

const points = [
  { icon: CalendarCheck2, title: "Pick a time that suits you", text: "Visits run Monday to Saturday. Choose a slot online in under a minute." },
  { icon: Video, title: "Abroad? Join by video", text: "A sales advisor walks you through the site and units on a live video call." },
  { icon: ShieldCheck, title: "Free, no obligation", text: "See finished units and construction quality before you decide anything." },
];

export default async function BookAVisitPage({ searchParams }: PageProps<"/book-a-visit">) {
  const projects = await getProjectOptions();
  const options = projects.filter((p) => p.status !== "delivered").map((p) => ({ id: p.id, name: p.name }));

  return (
    <>
      <PageHero>
        <Breadcrumbs items={[{ name: "Book a visit", path: "/book-a-visit" }]} inverted />
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Book a free site visit</h1>
        <p className="mt-3 max-w-2xl text-lg text-white/80">
          See the building, the finishing and the neighbourhood for yourself, in person or on a video call.
        </p>
      </PageHero>
      <Container className="grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_30rem]">
        <div>
          <ul className="space-y-6">
            {points.map((p) => (
              <li key={p.title} className="flex gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                  <p.icon className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-xl font-bold">{p.title}</h2>
                  <p className="mt-1 text-muted">{p.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-10 rounded-2xl bg-soft p-6 text-ink/80 ring-1 ring-line">
            Prefer to talk first? Call{" "}
            <a href={`tel:${site.contact.phone}`} className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
              <Phone className="size-4" aria-hidden="true" />
              {site.contact.phoneDisplay}
            </a>{" "}
            ({site.openingHoursText}).
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-xl shadow-brand-950/5 ring-1 ring-line sm:p-8">
          <h2 className="text-2xl font-bold">Your visit</h2>
          {/* The fallback is a fully working form, so the static HTML never shows a spinner. */}
          <Suspense fallback={<BookingForm projectOptions={options} whatsapp={site.contact.whatsapp} className="mt-6" />}>
            <PreselectedBookingForm searchParams={searchParams} projects={projects} options={options} />
          </Suspense>
        </div>
      </Container>
    </>
  );
}

/** Pre-selects the project when linked as /book-a-visit?project=<slug>. */
async function PreselectedBookingForm({
  searchParams,
  projects,
  options,
}: {
  searchParams: PageProps<"/book-a-visit">["searchParams"];
  projects: Array<{ id: number; slug: string }>;
  options: Array<{ id: number; name: string }>;
}) {
  const { project } = await searchParams;
  const slug = Array.isArray(project) ? project[0] : project;
  const match = slug ? projects.find((p) => p.slug === slug) : undefined;
  return <BookingForm projectOptions={options} defaultProjectId={match?.id} whatsapp={site.contact.whatsapp} className="mt-6" />;
}
