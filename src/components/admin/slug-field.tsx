"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Field, inputStyles } from "@/components/ui/form";
import { cn } from "@/lib/utils";

/**
 * Slug input with the public path prefix shown. On a published item, editing
 * the slug shows a warning: the old URL stops working and loses its ranking.
 */
export function SlugField({
  initial,
  isNew,
  isPublished,
  pathPrefix,
  errors,
}: {
  initial: string;
  isNew: boolean;
  isPublished: boolean;
  /** e.g. "/properties/" */
  pathPrefix: string;
  errors?: string[];
}) {
  const [value, setValue] = useState(initial);
  const changed = !isNew && value.trim() !== "" && value.trim() !== initial;

  return (
    <div>
      <Field
        id="slug"
        label="URL"
        hint={isNew ? "Leave blank to generate it from the title. Use a few descriptive words, e.g. 3-bedroom-apartment-sarbet." : "Leave blank to keep the current URL."}
        errors={errors}
      >
        {(p) => (
          <div className="flex rounded-xl shadow-xs">
            <span className="hidden items-center rounded-l-xl border border-r-0 border-line bg-soft px-3 text-sm text-muted sm:inline-flex">{pathPrefix}</span>
            <input
              {...p}
              value={value}
              maxLength={90}
              autoComplete="off"
              spellCheck={false}
              placeholder={isNew ? "generated-from-title" : initial}
              onChange={(e) => setValue(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              className={cn(inputStyles, "sm:rounded-l-none")}
            />
          </div>
        )}
      </Field>
      {changed && isPublished ? (
        <p role="alert" className="mt-2 flex gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-900 ring-1 ring-amber-200">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            This page is live. Changing its URL breaks links people have shared and Google will drop the old address, losing its search
            ranking. Only change it if you must.
          </span>
        </p>
      ) : null}
    </div>
  );
}
