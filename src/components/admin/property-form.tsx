"use client";

import { savePropertyAction } from "@/app/admin/(panel)/properties/actions";
import { Checkbox } from "@/components/admin/form-controls";
import { ImageManager } from "@/components/admin/image-manager";
import { SaveBar } from "@/components/admin/save-bar";
import { SeoFields } from "@/components/admin/seo-fields";
import { SlugField } from "@/components/admin/slug-field";
import { FormSection } from "@/components/admin/ui";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Field, inputStyles } from "@/components/ui/form";
import type { Property } from "@/db/schema";
import { PROPERTY_STATUSES, PROPERTY_TYPES, propertyStatusLabels, propertyTypes } from "@/lib/config/property-types";

type Option = { id: number; name: string };

export function PropertyForm({
  property,
  locations,
  projects,
  siteUrl,
}: {
  property: Property | null;
  locations: Option[];
  projects: Option[];
  siteUrl: string;
}) {
  const { state, pending, onSubmit, errors } = useAdminForm(savePropertyAction);
  const isNew = !property;

  return (
    <form onSubmit={onSubmit} className="grid gap-6" noValidate>
      {property ? <input type="hidden" name="id" value={property.id} /> : null}

      <FormSection title="Basics" description="What it is, where it is and what it costs.">
        <Field
          id="title"
          label="Title"
          required
          errors={errors.title}
          hint='Say what it is and where, e.g. "3-Bedroom Apartment at Sarbet City Plus". This becomes the page heading.'
        >
          {(p) => <input {...p} defaultValue={property?.title} maxLength={140} className={inputStyles} />}
        </Field>
        <SlugField
          initial={property?.slug ?? ""}
          isNew={isNew}
          isPublished={property?.isPublished ?? false}
          pathPrefix="/properties/"
          errors={errors.slug}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="type" label="Property type" required errors={errors.type}>
            {(p) => (
              <select {...p} defaultValue={property?.type ?? "apartment"} className={inputStyles}>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {propertyTypes[t].label}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field id="status" label="Sales status" required errors={errors.status}>
            {(p) => (
              <select {...p} defaultValue={property?.status ?? "available"} className={inputStyles}>
                {PROPERTY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {propertyStatusLabels[s]}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field id="locationId" label="Location" errors={errors.locationId} hint="Links the listing to its area page.">
            {(p) => (
              <select {...p} defaultValue={property?.locationId ?? ""} className={inputStyles}>
                <option value="">— Not set —</option>
                {locations.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field id="projectId" label="Project" errors={errors.projectId}>
            {(p) => (
              <select {...p} defaultValue={property?.projectId ?? ""} className={inputStyles}>
                <option value="">— None —</option>
                {projects.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field id="price" label="Price (ETB)" errors={errors.price} hint="Full price in whole birr, before any discount. Leave blank to show “Price on request”.">
            {(p) => <input {...p} defaultValue={property?.price ?? ""} inputMode="numeric" placeholder="e.g. 12,500,000" className={inputStyles} />}
          </Field>
          <Field id="discountPercent" label="Discount (%)" errors={errors.discountPercent} hint="Optional. Shows the old price crossed out, the new price and a red badge on the card. Leave blank for no discount.">
            {(p) => <input {...p} type="number" min={1} max={90} defaultValue={property?.discountPercent ?? ""} placeholder="e.g. 10" className={inputStyles} />}
          </Field>
          <Field id="promo" label="Promotion" errors={errors.promo} hint="Optional short offer shown as a badge.">
            {(p) => <input {...p} defaultValue={property?.promo ?? ""} maxLength={120} placeholder="e.g. 10% off for full payment" className={inputStyles} />}
          </Field>
        </div>
      </FormSection>

      <FormSection title="Details" description="Facts buyers filter and compare by.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field id="bedrooms" label="Bedrooms" errors={errors.bedrooms}>
            {(p) => <input {...p} type="number" min={0} max={50} defaultValue={property?.bedrooms ?? ""} className={inputStyles} />}
          </Field>
          <Field id="bathrooms" label="Toilets / bathrooms" errors={errors.bathrooms}>
            {(p) => <input {...p} type="number" min={0} max={50} defaultValue={property?.bathrooms ?? ""} className={inputStyles} />}
          </Field>
          <Field id="areaSqm" label="Area (m²)" errors={errors.areaSqm}>
            {(p) => <input {...p} type="number" min={1} step="0.1" defaultValue={property?.areaSqm ?? ""} className={inputStyles} />}
          </Field>
          <Field id="floor" label="Floor" errors={errors.floor} hint="0 = ground floor.">
            {(p) => <input {...p} type="number" min={-5} max={200} defaultValue={property?.floor ?? ""} className={inputStyles} />}
          </Field>
          <Field id="completion" label="Completion / handover" errors={errors.completion} className="sm:col-span-2">
            {(p) => <input {...p} defaultValue={property?.completion ?? ""} maxLength={60} placeholder="e.g. Ready to move in, or December 2027" className={inputStyles} />}
          </Field>
        </div>
      </FormSection>

      <FormSection title="Description" description="Unique, specific text ranks better than copy reused across listings.">
        <Field id="summary" label="Summary" errors={errors.summary} hint="1–2 sentences for listing cards and the search description fallback (max 300).">
          {(p) => <textarea {...p} rows={2} maxLength={300} defaultValue={property?.summary ?? ""} placeholder="e.g. Spacious 3-bedroom apartment in Sarbet with 2 toilets, a balcony and flexible payment plan." className={inputStyles} />}
        </Field>
        <Field
          id="description"
          label="Full description"
          errors={errors.description}
          hint="Markdown supported: ## Heading, **bold**, - bullet lists. Describe layout, views, finishes, nearby schools and transport."
        >
          {(p) => <textarea {...p} rows={12} defaultValue={property?.description ?? ""} placeholder={"## About this home\nBright 3-bedroom apartment on the 6th floor with a balcony and city view.\n\n## What's included\n- Master bedroom with en-suite\n- Fitted kitchen\n- Lift, parking and backup generator\n\n## Nearby\nSchools, supermarkets and the main road within 5 minutes."} className={`${inputStyles} font-mono text-sm`} />}
        </Field>
        <Field id="features" label="Features & amenities" errors={errors.features} hint="One per line, e.g. Lift, Backup generator, Parking, Balcony.">
          {(p) => <textarea {...p} rows={5} defaultValue={property?.features.join("\n") ?? ""} className={inputStyles} />}
        </Field>
        <Field id="paymentPlan" label="Payment plan" errors={errors.paymentPlan} hint="e.g. 30% down payment, balance in instalments until handover.">
          {(p) => <textarea {...p} rows={3} defaultValue={property?.paymentPlan ?? ""} className={inputStyles} />}
        </Field>
      </FormSection>

      <FormSection title="Photos & video" description="Landscape photos at least 1600 px wide look best. The first photo is used for cards and link previews.">
        <ImageManager name="images" initial={property?.images ?? []} defaultAlt={property?.title ?? ""} errors={errors.images} />
        <Field id="videoUrl" label="Video link" errors={errors.videoUrl} hint="Optional YouTube or Facebook video URL.">
          {(p) => <input {...p} type="url" defaultValue={property?.videoUrl ?? ""} placeholder="https://www.youtube.com/watch?v=…" className={inputStyles} />}
        </Field>
      </FormSection>

      <FormSection title="Search appearance" description="How this listing can appear on Google.">
        <SeoFields
          seoTitle={property?.seoTitle}
          seoDescription={property?.seoDescription}
          fallbackTitle={property?.title ?? "New property"}
          fallbackDescription={property?.summary}
          url={`${siteUrl}/properties/${property?.slug ?? "new-property"}`}
          errors={errors}
        />
      </FormSection>

      <FormSection title="Publishing">
        <div className="grid gap-3 sm:grid-cols-2">
          <Checkbox name="isPublished" label="Published" hint="Visible on the website and in the sitemap." defaultChecked={property?.isPublished ?? true} />
          <Checkbox name="isFeatured" label="Featured" hint="Shown first on the home page." defaultChecked={property?.isFeatured ?? false} />
        </div>
        <Field id="sortOrder" label="Sort order" errors={errors.sortOrder} hint="Lower numbers appear first. Leave 0 to sort by date." className="max-w-48">
          {(p) => <input {...p} type="number" defaultValue={property?.sortOrder ?? 0} className={inputStyles} />}
        </Field>
      </FormSection>

      <SaveBar state={state} pending={pending} label={isNew ? "Create property" : "Save changes"} />
    </form>
  );
}
