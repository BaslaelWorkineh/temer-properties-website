"use client";

import { saveLocationAction } from "@/app/admin/(panel)/locations/actions";
import { AmharicFields } from "@/components/admin/amharic-fields";
import { FaqEditor } from "@/components/admin/faq-editor";
import { Checkbox } from "@/components/admin/form-controls";
import { ImageManager } from "@/components/admin/image-manager";
import { SaveBar } from "@/components/admin/save-bar";
import { SeoFields } from "@/components/admin/seo-fields";
import { SlugField } from "@/components/admin/slug-field";
import { FormSection } from "@/components/admin/ui";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Field, inputStyles } from "@/components/ui/form";
import type { Location } from "@/db/schema";

export function LocationForm({ location, siteUrl }: { location: Location | null; siteUrl: string }) {
  const { state, pending, onSubmit, errors } = useAdminForm(saveLocationAction);
  const isNew = !location;

  return (
    <form onSubmit={onSubmit} className="grid gap-6" noValidate>
      {location ? <input type="hidden" name="id" value={location.id} /> : null}

      <FormSection title="Basics" description="A neighbourhood or town. Its page lists every property and project there.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="name" label="Name" required errors={errors.name} hint='e.g. "Sarbet" or "Haile Garment".'>
            {(p) => <input {...p} defaultValue={location?.name} maxLength={100} className={inputStyles} />}
          </Field>
          <Field id="city" label="City" errors={errors.city}>
            {(p) => <input {...p} defaultValue={location?.city ?? "Addis Ababa"} maxLength={100} className={inputStyles} />}
          </Field>
        </div>
        <SlugField initial={location?.slug ?? ""} isNew={isNew} isPublished={location?.isPublished ?? false} pathPrefix="/locations/" errors={errors.slug} />
      </FormSection>

      <FormSection title="Area guide" description="Original, local detail is what makes an area page rank: roads, landmarks, schools, transport, what it is like to live there.">
        <Field id="summary" required label="Summary" errors={errors.summary} hint="1–2 sentences (max 300). Also the fallback search description.">
          {(p) => <textarea {...p} rows={2} maxLength={300} defaultValue={location?.summary ?? ""} className={inputStyles} />}
        </Field>
        <Field id="description" required label="Area guide" errors={errors.description} hint="Markdown supported: ## Heading, **bold**, - bullet lists.">
          {(p) => <textarea {...p} rows={12} defaultValue={location?.description ?? ""} className={`${inputStyles} font-mono text-sm`} />}
        </Field>
        <Field id="highlights" label="Highlights" errors={errors.highlights} hint="One per line, e.g. 10 minutes to Bole International Airport.">
          {(p) => <textarea {...p} rows={4} defaultValue={location?.highlights.join("\n") ?? ""} className={inputStyles} />}
        </Field>
      </FormSection>

      <FormSection title="Photo">
        <ImageManager name="image" single initial={location?.image ?? null} defaultAlt={location ? `${location.name}, ${location.city}` : ""} errors={errors.image} />
      </FormSection>

      <FormSection title="Map coordinates" description="Right-click the area on Google Maps to copy its coordinates.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="latitude" label="Latitude" errors={errors.latitude}>
            {(p) => <input {...p} inputMode="decimal" defaultValue={location?.latitude ?? ""} placeholder="9.0108" className={inputStyles} />}
          </Field>
          <Field id="longitude" label="Longitude" errors={errors.longitude}>
            {(p) => <input {...p} inputMode="decimal" defaultValue={location?.longitude ?? ""} placeholder="38.7613" className={inputStyles} />}
          </Field>
        </div>
      </FormSection>

      <FormSection title="Frequently asked questions">
        <FaqEditor name="faqs" initial={location?.faqs ?? []} errors={errors.faqs} />
      </FormSection>

      <FormSection title="Amharic (አማርኛ)" description="Shown on the Amharic pages. Empty fields show the English text.">
        <AmharicFields
          initial={location?.translations?.am}
          fields={[
            { name: "name", label: "Area name", kind: "text" },
            { name: "summary", label: "Summary", kind: "area" },
            { name: "description", label: "Area guide", kind: "markdown" },
            { name: "highlights", label: "Highlights", kind: "lines", hint: "One per line." },
            { name: "faqs", label: "Frequently asked questions", kind: "faqs" },
          ]}
        />
      </FormSection>

      <FormSection title="Search appearance">
        <SeoFields
          seoTitle={location?.seoTitle}
          seoDescription={location?.seoDescription}
          fallbackTitle={location ? `Property for sale in ${location.name}, ${location.city}` : "New location"}
          fallbackDescription={location?.summary}
          url={`${siteUrl}/locations/${location?.slug ?? "new-location"}`}
          errors={errors}
        />
      </FormSection>

      <FormSection title="Publishing">
        <Checkbox name="isPublished" label="Published" hint="Visible on the website. Areas without any listings or projects are hidden from search engines automatically." defaultChecked={location?.isPublished ?? true} />
        <Field id="sortOrder" label="Sort order" errors={errors.sortOrder} hint="Lower numbers appear first." className="max-w-48">
          {(p) => <input {...p} type="number" defaultValue={location?.sortOrder ?? 0} className={inputStyles} />}
        </Field>
      </FormSection>

      <SaveBar state={state} pending={pending} label={isNew ? "Create location" : "Save changes"} />
    </form>
  );
}
