import { BadgeCheck, Handshake, Heart, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "@/components/site/link";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { Container, PageHero, SectionHeading } from "@/components/site/section";
import { site } from "@/lib/config/site";
import { getProjects } from "@/lib/data/projects";
import { hasLocale, locales, type Locale } from "@/lib/i18n/config";
import { getPagesDict } from "@/lib/i18n/dict/pages";
import { localizedAreaName } from "@/lib/i18n/dictionaries";
import { organizationJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

const valueIcons = [Sparkles, Heart, Handshake];

export const ensureStatic = "navigation";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  const l: Locale = hasLocale(lang) ? lang : "en";
  const dict = getPagesDict(l).about;
  return buildMetadata({ title: dict.metaTitle, description: dict.metaDescription, path: "/about", lang: l, translations: locales });
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang: rawLang } = await params;
  const lang: Locale = hasLocale(rawLang) ? rawLang : "en";
  const pages = getPagesDict(lang);
  const dict = pages.about;
  const delivered = (await getProjects({}, lang)).filter((p) => p.status === "delivered");

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <PageHero>
        <Breadcrumbs items={[{ name: dict.breadcrumb, path: "/about" }]} inverted lang={lang} />
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{dict.h1}</h1>
        <p className="mt-3 max-w-2xl text-lg text-white/80">
          {dict.hero}
        </p>
      </PageHero>

      <section className="py-16">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div className="prose-content">
            <h2>{dict.whoTitle}</h2>
            <p>{dict.p1}</p>
            <p>{dict.p2}</p>
            <p>
              {dict.p3.pre}
              <Link href="/projects">{dict.p3.linkA}</Link>
              {dict.p3.mid}
              <Link href="/book-a-visit">{dict.p3.linkB}</Link>
              {dict.p3.post}
            </p>
          </div>
          <dl className="grid content-start gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {site.stats.map((s, i) => (
              <div key={s.label} className="flex flex-col rounded-none bg-soft p-6 ring-1 ring-line">
                <dt className="text-sm text-muted">{dict.stats[i] ?? s.label}</dt>
                <dd className="order-first font-display text-4xl font-bold text-brand-600">{s.value}</dd>
              </div>
            ))}
            <div className="flex items-center gap-3 rounded-none bg-brand-50 p-6 text-brand-800 ring-1 ring-brand-200 sm:col-span-3 lg:col-span-1 xl:col-span-3">
              <BadgeCheck className="size-8 shrink-0" aria-hidden="true" />
              <p className="font-semibold">{dict.licensed}</p>
            </div>
          </dl>
        </Container>
      </section>

      <section className="bg-soft py-16">
        <Container>
          <SectionHeading title={dict.driveTitle} />
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {dict.values.map((v, i) => {
              const Icon = valueIcons[i];
              return (
                <li key={v.title} className="rounded-none bg-white p-6 ring-1 ring-line">
                  <span className="font-display text-sm font-bold text-gold-600">0{i + 1}</span>
                  <Icon className="mt-3 size-7 text-brand-500" aria-hidden="true" />
                  <h3 className="mt-3 text-2xl font-bold">{v.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{v.text}</p>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {delivered.length ? (
        <section className="py-16">
          <Container>
            <SectionHeading title={dict.deliveredTitle} />
            <ul className="mt-8 flex flex-wrap gap-3">
              {delivered.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.slug}`}
                    className="inline-block rounded-none bg-soft px-5 py-2.5 font-semibold ring-1 ring-line hover:ring-brand-400"
                  >
                    {p.name}
                    {p.location ? <span className="font-normal text-muted"> · {localizedAreaName(lang, p.location.name)}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <CtaBand />
    </>
  );
}
