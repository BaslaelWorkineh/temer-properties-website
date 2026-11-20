"use client";

import { saveProjectAction } from "@/app/admin/(panel)/projects/actions";
import { FaqEditor } from "@/components/admin/faq-editor";
import { Checkbox } from "@/components/admin/form-controls";
import { ImageManager } from "@/components/admin/image-manager";
import { SaveBar } from "@/components/admin/save-bar";
import { SeoFields } from "@/components/admin/seo-fields";
import { SlugField } from "@/components/admin/slug-field";
import { FormSection } from "@/components/admin/ui";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Field, inputStyles } from "@/components/ui/form";
import type { Project } from "@/db/schema";
import { PROJECT_STATUSES, projectStatusLabels } from "@/lib/config/property-types";

type Option = { id: number; name: string };

export function ProjectForm({ project, locations, siteUrl }: { project: Project | null; locations: Option[]; siteUrl: string }) {
  const { state, pending, onSubmit, errors } = useAdminForm(saveProjectAction);
  const isNew = !project;

  return (
    <form onSubmit={onSubmit} className="grid gap-6" noValidate>
      {project ? <input type="hidden" name="id" value={project.id} /> : null}

      <FormSection title="Basics" description="A development or building. Units for sale are added as properties and linked to it.">
        <Field id="name" label="Project name" required errors={errors.name} hint='e.g. "Sarbet City Plus".'>
          {(p) => <input {...p} defaultValue={project?.name} maxLength={140} className={inputStyles} />}
        </Field>
        <SlugField initial={project?.slug ?? ""} isNew={isNew} isPublished={project?.isPublished ?? false} pathPrefix="/projects/" errors={errors.slug} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="status" label="Status" required errors={errors.status}>
            {(p) => (
              <select {...p} defaultValue={project?.status ?? "under_construction"} className={inputStyles}>
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {projectStatusLabels[s]}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field id="locationId" label="Location" errors={errors.locationId}>
            {(p) => (
              <select {...p} defaultValue={project?.locationId ?? ""} className={inputStyles}>
                <option value="">— Not set —</option>
                {locations.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field id="category" label="Category" errors={errors.category} hint="Type of property shown on the card, e.g. Apartments & shops, Villas, Commercial. Optional.">
            {(p) => <input {...p} defaultValue={project?.category ?? ""} maxLength={100} className={inputStyles} />}
          </Field>
          <Field id="completion" label="Completion" errors={errors.completion} hint="e.g. Q4 2027, or Delivered 2015 E.C.">
            {(p) => <input {...p} defaultValue={project?.completion ?? ""} maxLength={60} className={inputStyles} />}
          </Field>
          <Field id="totalUnits" label="Total units" errors={errors.totalUnits}>
            {(p) => <input {...p} type="number" min={0} defaultValue={project?.totalUnits ?? ""} className={inputStyles} />}
          </Field>
          <Field id="floors" label="Floors" errors={errors.floors} hint="e.g. 12 for G+11.">
            {(p) => <input {...p} type="number" min={0} defaultValue={project?.floors ?? ""} className={inputStyles} />}
          </Field>
        </div>
      </FormSection>

      <FormSection title="Description">
        <Field id="summary" label="Summary" errors={errors.summary} hint="1–2 sentences for cards and the search description fallback (max 300).">
          {(p) => <textarea {...p} rows={2} maxLength={300} defaultValue={project?.summary ?? ""} placeholder="e.g. Modern apartments and shops in the heart of Sarbet, now selling with flexible payment." className={inputStyles} />}
        </Field>
        <Field id="description" label="Full description" errors={errors.description} hint="Markdown supported. Cover the location, building, finishes, amenities and progress.">
          {(p) => <textarea {...p} rows={12} defaultValue={project?.description ?? ""} placeholder={"## About the project\nWhat is being built, who it is for and why the location is special.\n\n## Unit types\n- 1, 2 and 3-bedroom apartments\n- Ground-floor shops\n\n## Progress\nCurrent construction stage and expected handover."} className={`${inputStyles} font-mono text-sm`} />}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="unitTypes" label="Unit types" errors={errors.unitTypes} hint="One per line, e.g. 2-bedroom apartments.">
            {(p) => <textarea {...p} rows={4} defaultValue={project?.unitTypes.join("\n") ?? ""} className={inputStyles} />}
          </Field>
          <Field id="amenities" label="Amenities" errors={errors.amenities} hint="One per line, e.g. Lifts, Parking, Generator.">
            {(p) => <textarea {...p} rows={4} defaultValue={project?.amenities.join("\n") ?? ""} className={inputStyles} />}
          </Field>
        </div>
        <Field id="paymentPlan" label="Payment plan" errors={errors.paymentPlan}>
          {(p) => <textarea {...p} rows={3} defaultValue={project?.paymentPlan ?? ""} className={inputStyles} />}
        </Field>
      </FormSection>

      <FormSection title="Location on the map" description="Exact coordinates help Google Maps and the area pages. Right-click the site on Google Maps to copy them.">
        <Field id="address" label="Address" errors={errors.address}>
          {(p) => <input {...p} defaultValue={project?.address ?? ""} maxLength={200} className={inputStyles} />}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="latitude" label="Latitude" errors={errors.latitude}>
            {(p) => <input {...p} inputMode="decimal" defaultValue={project?.latitude ?? ""} placeholder="9.0108" className={inputStyles} />}
          </Field>
          <Field id="longitude" label="Longitude" errors={errors.longitude}>
            {(p) => <input {...p} inputMode="decimal" defaultValue={project?.longitude ?? ""} placeholder="38.7613" className={inputStyles} />}
          </Field>
        </div>
      </FormSection>

      <FormSection title="Photos & video">
        <ImageManager name="images" initial={project?.images ?? []} defaultAlt={project?.name ?? ""} errors={errors.images} />
        <Field id="videoUrl" label="Video link" errors={errors.videoUrl}>
          {(p) => <input {...p} type="url" defaultValue={project?.videoUrl ?? ""} placeholder="https://www.youtube.com/watch?v=…" className={inputStyles} />}
        </Field>
      </FormSection>

      <FormSection title="Frequently asked questions">
        <FaqEditor name="faqs" initial={project?.faqs ?? []} errors={errors.faqs} />
      </FormSection>

      <FormSection title="Search appearance">
        <SeoFields
          seoTitle={project?.seoTitle}
          seoDescription={project?.seoDescription}
          fallbackTitle={project?.name ?? "New project"}
          fallbackDescription={project?.summary}
          url={`${siteUrl}/projects/${project?.slug ?? "new-project"}`}
          errors={errors}
        />
      </FormSection>

      <FormSection title="Publishing">
        <div className="grid gap-3 sm:grid-cols-2">
          <Checkbox name="isPublished" label="Published" hint="Visible on the website and in the sitemap." defaultChecked={project?.isPublished ?? true} />
          <Checkbox name="isFeatured" label="Featured" hint="Highlighted on the home page." defaultChecked={project?.isFeatured ?? false} />
        </div>
        <Field id="sortOrder" label="Sort order" errors={errors.sortOrder} hint="Lower numbers appear first." className="max-w-48">
          {(p) => <input {...p} type="number" defaultValue={project?.sortOrder ?? 0} className={inputStyles} />}
        </Field>
      </FormSection>

      <SaveBar state={state} pending={pending} label={isNew ? "Create project" : "Save changes"} />
    </form>
  );
}
