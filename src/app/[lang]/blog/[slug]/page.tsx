import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/site/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { Markdown } from "@/components/site/markdown";
import { Container } from "@/components/site/section";
import { getPostBySlug, getPublishedPosts } from "@/lib/data/posts";
import { site } from "@/lib/config/site";
import { hasLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatPostDate, getPagesDict } from "@/lib/i18n/dict/pages";
import { articleJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { stripMarkdown, truncate } from "@/lib/utils";

export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const { slug, lang: rawLang } = await params;
  const lang: Locale = hasLocale(rawLang) ? rawLang : "en";
  const post = await getPostBySlug(slug, lang);
  if (!post) return { title: "Guide not found", robots: { index: false, follow: true } };
  // With a complete Amharic translation the guide exists in both languages (self-canonical + hreflang).
  // Without one, /am/... points its canonical at the English page.
  if (post.translated && lang === "am") {
    return buildMetadata({
      title: post.title,
      description: post.excerpt || stripMarkdown(post.content),
      path: `/blog/${post.slug}`,
      images: [post.coverImage],
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      lang: "am",
      translations: locales,
    });
  }
  return buildMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || stripMarkdown(post.content),
    path: `/blog/${post.slug}`,
    images: [post.coverImage],
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    ...(post.translated ? { lang: "en" as const, translations: locales } : {}),
  });
}

export default async function PostPage({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const { slug, lang: rawLang } = await params;
  const lang: Locale = hasLocale(rawLang) ? rawLang : "en";
  const dict = getPagesDict(lang).blog;
  const post = await getPostBySlug(slug, lang);
  if (!post) notFound();
  const more = (await getPublishedPosts(4, lang)).filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={articleJsonLd({
          ...post,
          image: post.coverImage,
          description: post.excerpt || truncate(stripMarkdown(post.content), 200),
        })}
      />
      <Container className="pt-6 pb-10">
        <Breadcrumbs
          items={[
            { name: dict.breadcrumb, path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]}
          lang={lang}
        />
        <article className="mx-auto mt-8 max-w-3xl">
          <header>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">{post.title}</h1>
            {post.excerpt ? <p className="mt-4 text-xl leading-relaxed text-muted">{post.excerpt}</p> : null}
            <p className="mt-5 text-sm text-muted">
              {dict.by(lang === "am" && post.authorName === site.name ? getDictionary(lang).brand.full : post.authorName)}
              {post.publishedAt ? (
                <>
                  {" · "}
                  <time dateTime={post.publishedAt.toISOString()}>{formatPostDate(post.publishedAt, lang)}</time>
                </>
              ) : null}
              {post.publishedAt && post.updatedAt.getTime() - post.publishedAt.getTime() > 86_400_000 ? (
                <>
                  {dict.updated}
                  <time dateTime={post.updatedAt.toISOString()}>{formatPostDate(post.updatedAt, lang)}</time>
                </>
              ) : null}
            </p>
          </header>
          {post.coverImage ? (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-none bg-soft">
              <Image
                src={post.coverImage.url}
                alt={post.coverImage.alt || post.title}
                fill
                sizes="(min-width: 768px) 768px, 100vw"
                loading="eager"
                fetchPriority="high"
                className="object-cover"
              />
            </div>
          ) : null}
          <Markdown content={post.content} className="mt-10" />
        </article>

        {more.length ? (
          <aside className="mx-auto mt-16 max-w-3xl border-t border-line pt-10">
            <h2 className="text-2xl font-bold">{dict.moreGuides}</h2>
            <ul className="mt-4 space-y-3">
              {more.map((p) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`} className="font-semibold text-brand-700 hover:underline">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </Container>
      <CtaBand />
    </>
  );
}
