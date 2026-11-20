import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { Markdown } from "@/components/site/markdown";
import { Container } from "@/components/site/section";
import { getPostBySlug, getPublishedPosts } from "@/lib/data/posts";
import { formatDate } from "@/lib/format";
import { articleJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { stripMarkdown, truncate } from "@/lib/utils";

export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Guide not found", robots: { index: false, follow: true } };
  return buildMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || stripMarkdown(post.content),
    path: `/blog/${post.slug}`,
    images: [post.coverImage],
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  });
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const more = (await getPublishedPosts(4)).filter((p) => p.slug !== post.slug).slice(0, 3);

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
            { name: "Guides", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]}
        />
        <article className="mx-auto mt-8 max-w-3xl">
          <header>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">{post.title}</h1>
            {post.excerpt ? <p className="mt-4 text-xl leading-relaxed text-muted">{post.excerpt}</p> : null}
            <p className="mt-5 text-sm text-muted">
              By {post.authorName}
              {post.publishedAt ? (
                <>
                  {" · "}
                  <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
                </>
              ) : null}
              {post.publishedAt && post.updatedAt.getTime() - post.publishedAt.getTime() > 86_400_000 ? (
                <>
                  {" · Updated "}
                  <time dateTime={post.updatedAt.toISOString()}>{formatDate(post.updatedAt)}</time>
                </>
              ) : null}
            </p>
          </header>
          {post.coverImage ? (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-soft">
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
            <h2 className="text-2xl font-bold">More guides</h2>
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
