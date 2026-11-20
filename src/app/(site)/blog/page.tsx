import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ImagePlaceholder } from "@/components/site/image-placeholder";
import { JsonLd } from "@/components/site/json-ld";
import { Container, PageHero } from "@/components/site/section";
import { getPublishedPosts } from "@/lib/data/posts";
import { formatDate } from "@/lib/format";
import { itemListJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Property Buyer Guides for Addis Ababa",
  description:
    "Practical guides to buying an apartment or shop in Addis Ababa: payment plans, documents, buying from abroad, choosing a neighbourhood and what to check on a site visit.",
  path: "/blog",
});

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  return (
    <>
      <JsonLd data={itemListJsonLd(posts.map((p) => ({ path: `/blog/${p.slug}`, name: p.title })), "Buyer guides")} />
      <PageHero>
        <Breadcrumbs items={[{ name: "Guides", path: "/blog" }]} inverted />
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Buyer guides</h1>
        <p className="mt-3 max-w-2xl text-lg text-white/80">
          Straight answers to the questions buyers ask us most, from payment plans to buying from abroad.
        </p>
      </PageHero>
      <Container className="py-14">
        {posts.length ? (
          <ul className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-none ring-1 ring-line transition hover:shadow-xl">
                  <div className="relative aspect-[16/9] bg-soft">
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage.url}
                        alt={post.coverImage.alt || post.title}
                        fill
                        sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <ImagePlaceholder label="Guide" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    {post.publishedAt ? (
                      <time dateTime={post.publishedAt.toISOString()} className="text-sm text-muted">
                        {formatDate(post.publishedAt)}
                      </time>
                    ) : null}
                    <h2 className="mt-2 text-2xl font-bold leading-snug">
                      <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:content-['']">
                        {post.title}
                      </Link>
                    </h2>
                    {post.excerpt ? <p className="mt-2 leading-relaxed text-muted">{post.excerpt}</p> : null}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">Guides are coming soon.</p>
        )}
      </Container>
    </>
  );
}
