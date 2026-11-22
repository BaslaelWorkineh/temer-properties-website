"use client";

import { AmharicFields } from "@/components/admin/amharic-fields";
import { savePostAction } from "@/app/admin/(panel)/posts/actions";
import { Checkbox } from "@/components/admin/form-controls";
import { ImageManager } from "@/components/admin/image-manager";
import { SaveBar } from "@/components/admin/save-bar";
import { SeoFields } from "@/components/admin/seo-fields";
import { SlugField } from "@/components/admin/slug-field";
import { FormSection } from "@/components/admin/ui";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Field, inputStyles } from "@/components/ui/form";
import type { Post } from "@/db/schema";

export function PostForm({ post, siteUrl }: { post: Post | null; siteUrl: string }) {
  const { state, pending, onSubmit, errors } = useAdminForm(savePostAction);
  const isNew = !post;

  return (
    <form onSubmit={onSubmit} className="grid gap-6" noValidate>
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <FormSection title="Article" description="Helpful guides answer the questions buyers search for (prices, payment plans, buying from abroad) and bring visitors who aren't searching for a listing yet.">
        <Field id="title" label="Title" required errors={errors.title} hint='Phrase it like a search, e.g. "How to Buy an Apartment in Addis Ababa from Abroad".'>
          {(p) => <input {...p} defaultValue={post?.title} maxLength={160} className={inputStyles} />}
        </Field>
        <SlugField initial={post?.slug ?? ""} isNew={isNew} isPublished={post?.isPublished ?? false} pathPrefix="/blog/" errors={errors.slug} />
        <Field id="excerpt" label="Excerpt" errors={errors.excerpt} hint="1–2 sentence teaser for the guides page and link previews (max 300).">
          {(p) => <textarea {...p} rows={2} maxLength={300} defaultValue={post?.excerpt ?? ""} className={inputStyles} />}
        </Field>
        <Field
          id="content"
          label="Content"
          required
          errors={errors.content}
          hint="Markdown: ## for section headings, ### for sub-headings, **bold**, - lists, [link text](/properties). Link to relevant listings and area pages."
        >
          {(p) => <textarea {...p} rows={24} defaultValue={post?.content ?? ""} className={`${inputStyles} font-mono text-sm leading-relaxed`} />}
        </Field>
        <Field id="authorName" label="Author" errors={errors.authorName} className="max-w-sm">
          {(p) => <input {...p} defaultValue={post?.authorName ?? "Temer Properties"} maxLength={100} className={inputStyles} />}
        </Field>
      </FormSection>

      <FormSection title="Cover image">
        <ImageManager name="coverImage" single initial={post?.coverImage ?? null} defaultAlt={post?.title ?? ""} errors={errors.coverImage} />
      </FormSection>

      <FormSection title="Amharic (አማርኛ)" description="Shown on the Amharic pages. Empty fields show the English text.">
        <AmharicFields
          initial={post?.translations?.am}
          fields={[
            { name: "title", label: "Title", kind: "text" },
            { name: "excerpt", label: "Excerpt", kind: "area" },
            { name: "content", label: "Content", kind: "markdown" },
          ]}
        />
      </FormSection>

      <FormSection title="Search appearance">
        <SeoFields
          seoTitle={post?.seoTitle}
          seoDescription={post?.seoDescription}
          fallbackTitle={post?.title ?? "New guide"}
          fallbackDescription={post?.excerpt}
          url={`${siteUrl}/blog/${post?.slug ?? "new-guide"}`}
          errors={errors}
        />
      </FormSection>

      <FormSection title="Publishing">
        <Checkbox name="isPublished" label="Published" hint="Drafts are only visible here." defaultChecked={post?.isPublished ?? false} />
      </FormSection>

      <SaveBar state={state} pending={pending} label={isNew ? "Create guide" : "Save changes"} />
    </form>
  );
}
