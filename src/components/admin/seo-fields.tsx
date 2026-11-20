"use client";

import { useState } from "react";
import { Field, inputStyles } from "@/components/ui/form";
import { cn } from "@/lib/utils";

function Counter({ length, ideal, max }: { length: number; ideal: number; max: number }) {
  const tone = length === 0 ? "text-muted" : length <= ideal ? "text-brand-700" : length <= max ? "text-amber-700" : "text-red-700";
  return (
    <span className={cn("text-xs tabular-nums", tone)}>
      {length}/{ideal}
    </span>
  );
}

/**
 * Optional title/description overrides with live length counters and a
 * Google-style result preview. Leaving them blank uses the automatic values.
 */
export function SeoFields({
  seoTitle,
  seoDescription,
  fallbackTitle,
  fallbackDescription,
  url,
  errors,
}: {
  seoTitle?: string | null;
  seoDescription?: string | null;
  fallbackTitle: string;
  fallbackDescription?: string | null;
  /** Full public URL shown in the preview. */
  url: string;
  errors: Record<string, string[] | undefined>;
}) {
  const [title, setTitle] = useState(seoTitle ?? "");
  const [description, setDescription] = useState(seoDescription ?? "");

  const shownTitle = `${title || fallbackTitle || "Page title"} | Temer Properties`;
  const shownDescription = description || fallbackDescription || "Google will pick text from the page when no description is set.";
  const crumbs = url.replace(/^https?:\/\//, "").replace(/\/$/, "").split("/");

  return (
    <div className="grid gap-5">
      <Field
        id="seoTitle"
        label={
          <span className="flex w-full items-center justify-between gap-2">
            <span>Search title</span>
            <Counter length={title.length} ideal={60} max={70} />
          </span>
        }
        hint="Optional. Leave blank to use the automatic title. Aim for 50–60 characters and lead with what people search for."
        errors={errors.seoTitle}
      >
        {(p) => <input {...p} value={title} maxLength={70} onChange={(e) => setTitle(e.target.value)} className={inputStyles} />}
      </Field>

      <Field
        id="seoDescription"
        label={
          <span className="flex w-full items-center justify-between gap-2">
            <span>Search description</span>
            <Counter length={description.length} ideal={160} max={170} />
          </span>
        }
        hint="Optional. 120–160 characters that make someone click: price, size, area, a reason to visit."
        errors={errors.seoDescription}
      >
        {(p) => (
          <textarea {...p} value={description} maxLength={170} rows={3} onChange={(e) => setDescription(e.target.value)} className={inputStyles} />
        )}
      </Field>

      <div aria-label="Google search preview" className="rounded-xl bg-white p-4 ring-1 ring-line">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Search preview</p>
        <p className="truncate text-xs text-[#4d5156]">{crumbs.join(" › ")}</p>
        <p className="mt-0.5 line-clamp-1 text-lg leading-snug text-[#1a0dab]">{shownTitle}</p>
        <p className="mt-0.5 line-clamp-2 text-sm text-[#4d5156]">{shownDescription}</p>
      </div>
    </div>
  );
}
