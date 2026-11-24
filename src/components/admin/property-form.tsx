"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { autosavePropertyDraftAction, savePropertyAction } from "@/app/admin/(panel)/properties/actions";
import { AmharicFields } from "@/components/admin/amharic-fields";
import { FeaturePicker } from "@/components/admin/feature-picker";
import { Checkbox } from "@/components/admin/form-controls";
import { ImageManager } from "@/components/admin/image-manager";
import { SaveBar } from "@/components/admin/save-bar";
import { SeoFields } from "@/components/admin/seo-fields";
import { SlugField } from "@/components/admin/slug-field";
import { FormSection } from "@/components/admin/ui";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { buttonStyles } from "@/components/ui/button";
import { Field, inputStyles } from "@/components/ui/form";
import type { Property } from "@/db/schema";
import { PROPERTY_STATUSES, PROPERTY_TYPES, propertyStatusLabels, propertyTypes } from "@/lib/config/property-types";
import { publishBlockers, type PublishBlocker } from "@/lib/property-readiness";

type Option = { id: number; name: string };

type Preview = { title: string; price: number; discount: number; bedrooms: string; bathrooms: string; area: string; place: string };

const etb = (n: number) => `ETB ${n.toLocaleString("en-US")}`;

/** What the buyer sees for this price and discount, in words, so the salesperson can check it at a glance. */
function priceSentence(p: Preview) {
  if (!p.price) return "Buyers will see “Price on request”.";
  if (p.discount > 0 && p.discount <= 90) {
    return `Buyers will see ${etb(Math.round(p.price * (1 - p.discount / 100)))} with ${etb(p.price)} crossed out and a red -${p.discount}% badge.`;
  }
  return `Buyers will see ${etb(p.price)}.`;
}

/** The four steps, and which server-side field errors belong to which step (so an error is never hidden). */
const STEPS = [
  { title: "Basics", fields: ["title", "type", "status", "locationId", "newLocationName", "projectId"] },
  { title: "Price", fields: ["price", "discountPercent", "promo", "paymentPlan"] },
  { title: "Details", fields: ["bedrooms", "bathrooms", "areaSqm", "floor", "completion", "features", "summary", "description"] },
  { title: "Photos", fields: ["images", "videoUrl", "slug", "seoTitle", "seoDescription", "sortOrder", "isPublished", "isFeatured"] },
];

const DESCRIPTION_PLACEHOLDER =
  "## About this home\nBright 3-bedroom apartment on the 6th floor with a balcony and city view.\n\n## What is included\n- Master bedroom with en-suite\n- Fitted kitchen\n- Lift, parking and backup generator\n\n## Nearby\nSchools, supermarkets and the main road within 5 minutes.";

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
  const formRef = useRef<HTMLFormElement>(null);
  const [draftId, setDraftId] = useState<number | null>(property?.id ?? null);
  const [missing, setMissing] = useState<PublishBlocker[]>([]);
  const [wantsPublish, setWantsPublish] = useState(property?.isPublished ?? true);
  const [autosave, setAutosave] = useState<"idle" | "saving" | "saved">("idle");
  const [step, setStep] = useState(0);
  const [areaChoice, setAreaChoice] = useState(property?.locationId ? String(property.locationId) : "");
  const [typeChoice, setTypeChoice] = useState<string>(property?.type ?? "apartment");
  const [preview, setPreview] = useState<Preview>({ title: "", price: 0, discount: 0, bedrooms: "", bathrooms: "", area: "", place: "" });

  // Live listings are only saved with the button, so a half-edited price can never reach the site.
  const canAutosave = !property?.isPublished;
  // Only a listing that is not live yet must be complete to publish (live ones can still be edited).
  const needsComplete = wantsPublish && !property?.isPublished;

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    let last = "";
    let changedAt = 0;
    let dirty = false;
    let busy = false;

    const read = () => {
      const fd = new FormData(form);
      const snapshot = JSON.stringify([...fd.entries()].map(([k, v]) => [k, typeof v === "string" ? v : ""]));
      return { fd, snapshot };
    };

    async function save() {
      if (busy || !dirty) return;
      const { fd, snapshot } = read();
      if (String(fd.get("title") ?? "").trim().length < 3) return;
      busy = true;
      setAutosave("saving");
      const res = await autosavePropertyDraftAction(fd).catch(() => null);
      busy = false;
      if (res?.status === "success" && res.data) {
        if (snapshot === read().snapshot) dirty = false;
        setAutosave("saved");
        setDraftId((current) => {
          if (!current) window.history.replaceState(null, "", `/admin/properties/${res.data!.id}`);
          return res.data!.id;
        });
      } else {
        setAutosave("idle");
      }
    }

    const tick = window.setInterval(() => {
      const { fd, snapshot } = read();
      if (snapshot !== last) {
        if (last !== "") {
          dirty = true;
          changedAt = Date.now();
          setAutosave("idle");
        }
        last = snapshot;
        setWantsPublish(fd.get("isPublished") === "on");
        const area = String(fd.get("locationId") ?? "");
        const areaName = area === "__new__" ? String(fd.get("newLocationName") ?? "").trim() : (locations.find((o) => String(o.id) === area)?.name ?? "");
        const projectName = projects.find((o) => String(o.id) === String(fd.get("projectId") ?? ""))?.name ?? "";
        setPreview({
          title: String(fd.get("title") ?? ""),
          price: Number(String(fd.get("price") ?? "").replace(/[, ]/g, "")) || 0,
          discount: Number(fd.get("discountPercent") ?? 0) || 0,
          bedrooms: String(fd.get("bedrooms") ?? ""),
          bathrooms: String(fd.get("bathrooms") ?? ""),
          area: String(fd.get("areaSqm") ?? ""),
          place: [projectName, areaName].filter(Boolean).join(", "),
        });
        setMissing(
          publishBlockers({
            title: String(fd.get("title") ?? ""),
            locationId: area === "__new__" ? String(fd.get("newLocationName") ?? "").trim() : area,
            areaSqm: String(fd.get("areaSqm") ?? ""),
            summary: String(fd.get("summary") ?? ""),
            description: String(fd.get("description") ?? ""),
            imageCount: (() => {
              try {
                return (JSON.parse(String(fd.get("images") ?? "[]")) as unknown[]).length;
              } catch {
                return 0;
              }
            })(),
          }),
        );
      }
      if (canAutosave && dirty && Date.now() - changedAt > 1500) void save();
    }, 600);

    // Leaving the page or switching tabs: save right away.
    const flush = () => {
      if (canAutosave && dirty) void save();
    };
    const onHide = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => {
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- option lists never change while the form is open
  }, [canAutosave]);

  const blocked = needsComplete && missing.length > 0;

  // After a failed save, jump to the first step that has an error so nothing stays hidden.
  const errorStep = (() => {
    const keys = Object.keys(errors);
    if (!keys.length) return null;
    const idx = STEPS.findIndex((st) => st.fields.some((f) => keys.includes(f)));
    return idx >= 0 ? idx : null;
  })();
  const [shownErrorFor, setShownErrorFor] = useState<typeof state | null>(null);
  if (errorStep !== null && shownErrorFor !== state) {
    setShownErrorFor(state);
    setStep(errorStep);
  }

  const last = step === STEPS.length - 1;
  const goto = (n: number) => {
    setStep(Math.max(0, Math.min(STEPS.length - 1, n)));
    window.scrollTo({ top: 0 });
  };
  /** Opens the step that holds `field` and puts the cursor in it (used by the "To publish, add: …" links). */
  const fix = (field: PublishBlocker["field"]) => {
    const target = field === "locationId" && areaChoice === "__new__" ? "newLocationName" : field;
    setStep(Math.max(0, STEPS.findIndex((st) => st.fields.includes(field))));
    // Next frame: the step is visible by then, so the field can take focus.
    requestAnimationFrame(() => {
      const el = document.getElementById(target);
      el?.scrollIntoView({ block: "center" });
      el?.focus({ preventScroll: true });
    });
  };

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onKeyDown={(e) => {
        // Enter in a text box must not publish a half-filled listing.
        if (e.key === "Enter" && e.target instanceof HTMLInputElement && !last) e.preventDefault();
      }}
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start"
      noValidate
    >
      {draftId ? <input type="hidden" name="id" value={draftId} /> : null}

      <div className="grid min-w-0 gap-6">
      <ol className="grid grid-cols-4 gap-2" aria-label="Steps">
        {STEPS.map((st, i) => (
          <li key={st.title}>
            <button
              type="button"
              onClick={() => goto(i)}
              aria-current={i === step ? "step" : undefined}
              className={`w-full cursor-pointer border-t-4 pt-2 text-left text-sm font-semibold hover:text-brand-700 ${i <= step ? "border-brand-500" : "border-line"} ${
                i === step ? "text-brand-700" : i < step ? "text-ink" : "text-muted"
              }`}
            >
              {i + 1}. {st.title}
            </button>
          </li>
        ))}
      </ol>

      <div hidden={step !== 0} className="grid gap-6">
        <FormSection title="What are you selling?" description="Step 1 of 4">
          <Field
            id="title"
            label="Title"
            required
            errors={errors.title}
            hint='Say what it is and where, e.g. "3-Bedroom Apartment at Sarbet City Plus" (at least 10 characters to publish). This becomes the page heading.'
          >
            {(p) => <input {...p} defaultValue={property?.title} maxLength={140} className={inputStyles} />}
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <fieldset className="sm:col-span-2">
              <legend className="mb-1.5 text-sm font-medium">
                Property type <span className="text-red-600">*</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPES.map((t) => (
                  <label
                    key={t}
                    className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium ring-1 focus-within:ring-2 focus-within:ring-brand-500 ${
                      typeChoice === t ? "bg-brand-500 text-white ring-brand-500" : "bg-white text-ink ring-line hover:bg-soft"
                    }`}
                  >
                    <input type="radio" name="type" value={t} checked={typeChoice === t} onChange={() => setTypeChoice(t)} className="sr-only" />
                    {propertyTypes[t].label}
                  </label>
                ))}
              </div>
              {errors.type?.[0] ? <p className="mt-1.5 text-sm text-red-700">{errors.type[0]}</p> : null}
            </fieldset>
            <Field
              id="status"
              label="Is it still available?"
              required
              errors={errors.status}
              hint="Choose Sold when it is sold. The page stays online but leaves search results."
            >
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
            <div>
              <Field id="locationId" label="Area" required errors={errors.locationId} hint="Links the listing to its area page. Needed to publish.">
                {(p) => (
                  <select {...p} value={areaChoice} onChange={(e) => setAreaChoice(e.target.value)} className={inputStyles}>
                    <option value="">— Not set —</option>
                    {locations.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                    <option value="__new__">+ Add a new area…</option>
                  </select>
                )}
              </Field>
              {areaChoice === "__new__" ? (
                <Field
                  id="newLocationName"
                  label="New area name"
                  required
                  errors={errors.newLocationName}
                  className="mt-3"
                  hint="Type the name as people say it. It is saved, so it is in the list next time."
                >
                  {(p) => <input {...p} maxLength={100} placeholder="e.g. Summit, CMC, Bole Bulbula" className={inputStyles} />}
                </Field>
              ) : null}
            </div>
            <Field id="projectId" label="Building / project" errors={errors.projectId}>
              {(p) => (
                <select {...p} defaultValue={property?.projectId ?? ""} className={inputStyles}>
                  <option value="">— Not part of a project —</option>
                  {projects.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>
        </FormSection>
      </div>

      <div hidden={step !== 1} className="grid gap-6">
        <FormSection title="Price" description="Step 2 of 4">
          <Field
            id="price"
            label="Price (ETB)"
            errors={errors.price}
            hint="Full price in whole birr, before any discount. Leave blank to show “Price on request”."
          >
            {(p) => <input {...p} defaultValue={property?.price ?? ""} inputMode="numeric" placeholder="e.g. 12,500,000" className={inputStyles} />}
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="discountPercent"
              label="Discount (%)"
              errors={errors.discountPercent}
              hint="Optional. Shows the old price crossed out, the new price and a red badge. Leave blank for no discount."
            >
              {(p) => <input {...p} type="number" min={1} max={90} defaultValue={property?.discountPercent ?? ""} placeholder="e.g. 10" className={inputStyles} />}
            </Field>
            <Field id="promo" label="Special offer" errors={errors.promo} hint="Optional short offer shown as a badge.">
              {(p) => <input {...p} defaultValue={property?.promo ?? ""} maxLength={120} placeholder="e.g. 10% off for full payment" className={inputStyles} />}
            </Field>
          </div>
          <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800" aria-live="polite">
            {priceSentence(preview)}
          </p>
          <Field id="paymentPlan" label="How can the buyer pay?" errors={errors.paymentPlan} hint="e.g. 30% down payment, balance in instalments until handover.">
            {(p) => <textarea {...p} rows={3} defaultValue={property?.paymentPlan ?? ""} className={inputStyles} />}
          </Field>
        </FormSection>
      </div>

      <div hidden={step !== 2} className="grid gap-6">
        <FormSection title="The details" description="Step 3 of 4">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="bedrooms" label="Bedrooms" errors={errors.bedrooms} hint="0 = studio.">
              {(p) => <input {...p} type="number" min={0} max={50} defaultValue={property?.bedrooms ?? ""} className={inputStyles} />}
            </Field>
            <Field id="bathrooms" label="Toilets / bathrooms" errors={errors.bathrooms}>
              {(p) => <input {...p} type="number" min={0} max={50} defaultValue={property?.bathrooms ?? ""} className={inputStyles} />}
            </Field>
            <Field id="areaSqm" label="Size (m²)" required errors={errors.areaSqm} hint="Needed to publish.">
              {(p) => <input {...p} type="number" min={1} step="0.1" defaultValue={property?.areaSqm ?? ""} className={inputStyles} />}
            </Field>
            <Field id="floor" label="Floor" errors={errors.floor} hint="0 = ground floor.">
              {(p) => <input {...p} type="number" min={-5} max={200} defaultValue={property?.floor ?? ""} className={inputStyles} />}
            </Field>
          </div>
          <Field id="completion" label="When can they move in?" errors={errors.completion}>
            {(p) => <input {...p} defaultValue={property?.completion ?? ""} maxLength={60} placeholder="e.g. Ready to move in, or December 2027" className={inputStyles} />}
          </Field>
          <FeaturePicker name="features" initial={property?.features ?? []} errors={errors.features} />
          <Field
            id="summary"
            label="One-sentence summary"
            required
            errors={errors.summary}
            hint="1–2 sentences for listing cards and Google. Needed to publish: 30 to 300 characters."
          >
            {(p) => (
              <textarea
                {...p}
                rows={2}
                maxLength={300}
                defaultValue={property?.summary ?? ""}
                placeholder="e.g. Spacious 3-bedroom apartment in Sarbet with 2 toilets, a balcony and flexible payment plan."
                className={inputStyles}
              />
            )}
          </Field>
          <Field
            id="description"
            label="Describe the home"
            required
            errors={errors.description}
            hint="Needed to publish: at least 100 characters. Layout, views, finishes, nearby schools and transport. Markdown supported: ## Heading, **bold**, - bullet lists."
          >
            {(p) => <textarea {...p} rows={10} defaultValue={property?.description ?? ""} placeholder={DESCRIPTION_PLACEHOLDER} className={`${inputStyles} font-mono text-sm`} />}
          </Field>
          <AmharicFields
            initial={property?.translations?.am}
            fields={[
              { name: "title", label: "Title", kind: "text" },
              { name: "promo", label: "Special offer", kind: "text" },
              { name: "summary", label: "One-sentence summary", kind: "area" },
              { name: "description", label: "Describe the home", kind: "markdown" },
              { name: "features", label: "What comes with it?", kind: "lines", hint: "One per line." },
              { name: "paymentPlan", label: "How can the buyer pay?", kind: "area" },
              { name: "completion", label: "When can they move in?", kind: "text" },
            ]}
          />
        </FormSection>
      </div>

      <div hidden={step !== 3} className="grid gap-6">
        <FormSection
          title="Photos and publish"
          description="Step 4 of 4. The first photo is the cover on cards and link previews. Landscape photos at least 1600 px wide look best."
        >
          <div id="images">
            <p className="mb-1.5 text-sm font-medium text-ink">
              Photos
              <span className="ml-0.5 text-red-600" aria-hidden="true">
                *
              </span>
              <span className="ml-2 text-xs font-normal text-muted">At least 3 needed to publish.</span>
            </p>
            <ImageManager name="images" initial={property?.images ?? []} defaultAlt={property?.title ?? ""} errors={errors.images} />
          </div>
          <Field id="videoUrl" label="Video link" errors={errors.videoUrl} hint="Optional YouTube or Facebook video URL.">
            {(p) => <input {...p} type="url" defaultValue={property?.videoUrl ?? ""} placeholder="https://www.youtube.com/watch?v=…" className={inputStyles} />}
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Checkbox
              name="isPublished"
              label="Publish now"
              hint="Untick to keep it as a draft that only admins can see. A listing needs a title, area, size, summary, description and 3 photos to go live."
              defaultChecked={property?.isPublished ?? true}
            />
            <Checkbox name="isFeatured" label="Show on the home page" hint="Appears first in “Latest properties for sale”." defaultChecked={property?.isFeatured ?? false} />
          </div>
          <details className="rounded-xl ring-1 ring-line">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">Advanced: web address, Google text, sort order</summary>
            <div className="grid gap-5 border-t border-line p-4">
              <SlugField initial={property?.slug ?? ""} isNew={isNew} isPublished={property?.isPublished ?? false} pathPrefix="/properties/" errors={errors.slug} />
              <SeoFields
                seoTitle={property?.seoTitle}
                seoDescription={property?.seoDescription}
                fallbackTitle={property?.title ?? "New property"}
                fallbackDescription={property?.summary}
                url={`${siteUrl}/properties/${property?.slug ?? "new-property"}`}
                errors={errors}
              />
              <Field id="sortOrder" label="Sort order" errors={errors.sortOrder} hint="Lower numbers appear first. Leave 0 to sort by date." className="max-w-48">
                {(p) => <input {...p} type="number" defaultValue={property?.sortOrder ?? 0} className={inputStyles} />}
              </Field>
            </div>
          </details>
        </FormSection>
      </div>

      {last ? (
        <SaveBar
          state={state}
          pending={pending}
          disabled={blocked}
          label={property?.isPublished ? "Save changes" : wantsPublish ? "Publish listing" : "Save as draft"}
          secondary={
            <button type="button" onClick={() => goto(step - 1)} className={buttonStyles({ variant: "outline", size: "lg" })}>
              <ArrowLeft className="size-4" aria-hidden="true" /> Back
            </button>
          }
          note={
            blocked ? (
              <span className="text-amber-800">
                To publish, add:{" "}
                {missing.map((m, i) => (
                  <Fragment key={m.field}>
                    {i > 0 ? ", " : null}
                    <button
                      type="button"
                      onClick={() => fix(m.field)}
                      className="font-semibold underline underline-offset-2 hover:text-amber-950"
                    >
                      {m.label}
                    </button>
                  </Fragment>
                ))}
                . Or untick “Publish now” to keep it as a draft.
              </span>
            ) : canAutosave ? (
              <span>{autosave === "saving" ? "Saving draft…" : autosave === "saved" ? "Draft saved automatically." : "Your progress is saved as a draft automatically."}</span>
            ) : null
          }
        />
      ) : (
        <div className="sticky bottom-0 z-20 -mx-4 border-t border-line bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-2xl lg:border lg:px-6">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goto(step - 1)}
              className={buttonStyles({ variant: "outline", size: "lg" })}
              style={{ visibility: step === 0 ? "hidden" : "visible" }}
            >
              <ArrowLeft className="size-4" aria-hidden="true" /> Back
            </button>
            <span className="text-sm text-muted" aria-live="polite">
              {canAutosave ? (autosave === "saving" ? "Saving draft…" : autosave === "saved" ? "Draft saved automatically." : "Saved as a draft if you leave.") : null}
            </span>
            <button type="button" onClick={() => goto(step + 1)} className={buttonStyles({ size: "lg" })}>
              Next <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
      </div>

      <aside className="hidden lg:sticky lg:top-6 lg:block" aria-label="Preview">
        <p className="mb-2 text-xs font-semibold text-muted">How buyers will see it</p>
        <div className="relative flex aspect-[4/3] flex-col justify-end overflow-hidden bg-brand-950 p-4 text-white">
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#8fb5a0] via-[#6f9784] to-[#41604f] [mask-image:linear-gradient(to_bottom,#000_50%,rgb(0_0_0/0.4)_85%,rgb(0_0_0/0.2))]"
            aria-hidden="true"
          />
          {preview.discount > 0 && preview.price ? (
            <span className="absolute right-3 top-3 bg-red-600 px-2 py-0.5 text-xs font-bold">-{preview.discount}%</span>
          ) : null}
          <p className="relative text-xs opacity-90">{preview.place || "Project, Area"}</p>
          <p className="relative mt-0.5 text-lg font-semibold leading-snug">{preview.title || "Your title appears here"}</p>
          <p className="relative mt-1 font-display text-2xl font-bold">
            {preview.price
              ? etb(preview.discount > 0 && preview.discount <= 90 ? Math.round(preview.price * (1 - preview.discount / 100)) : preview.price)
              : "Price on request"}
            {preview.discount > 0 && preview.price ? <s className="ml-2 font-sans text-sm font-normal opacity-70">{etb(preview.price)}</s> : null}
          </p>
          <p className="relative mt-1 text-xs opacity-90">
            {[
              preview.bedrooms === "0" ? "Studio" : preview.bedrooms ? `${preview.bedrooms} bed` : "",
              preview.bathrooms ? `${preview.bathrooms} toilets` : "",
              preview.area ? `${preview.area} m²` : "",
            ]
              .filter(Boolean)
              .join("  ·  ")}
          </p>
        </div>
        <p className="mt-2 text-xs text-muted">This is the card on the home page. The photo is your first uploaded photo.</p>
      </aside>
    </form>
  );
}
