"use client";

import { FaqEditor } from "@/components/admin/faq-editor";
import { Field, inputStyles } from "@/components/ui/form";
import type { FaqItem } from "@/db/schema";

export type AmField = {
  name: string;
  label: string;
  /** text = one line, area = short paragraph, markdown = long text (headings, lists), lines = one item per line, faqs = question/answer pairs. */
  kind: "text" | "area" | "markdown" | "lines" | "faqs";
  hint?: string;
};

/**
 * The Amharic (አማርኛ) version of a record's text. Inputs are named `am_<field>` and saved by `readAm()` on the server
 * into the record's `translations` column. A field left empty shows the English text on the Amharic page.
 */
export function AmharicFields({ fields, initial }: { fields: AmField[]; initial?: Record<string, unknown> | null }) {
  const value = (name: string) => initial?.[name];
  return (
    <details className="rounded-xl ring-1 ring-line" open={Boolean(initial && Object.keys(initial).length)}>
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
        Amharic version (አማርኛ)
        <span className="ml-2 font-normal text-muted">Optional. Empty fields show the English text.</span>
      </summary>
      <div lang="am" className="grid gap-5 border-t border-line p-4">
        {fields.map((f) => {
          const id = `am_${f.name}`;
          if (f.kind === "faqs") {
            return (
              <div key={f.name}>
                <p className="mb-1.5 text-sm font-medium text-ink">{f.label}</p>
                <FaqEditor name={id} initial={(value(f.name) as FaqItem[] | undefined) ?? []} />
              </div>
            );
          }
          const current = value(f.name);
          const text = Array.isArray(current) ? (current as string[]).join("\n") : typeof current === "string" ? current : "";
          return (
            <Field key={f.name} id={id} label={f.label} hint={f.hint}>
              {(p) =>
                f.kind === "text" ? (
                  <input {...p} defaultValue={text} className={inputStyles} />
                ) : (
                  <textarea
                    {...p}
                    rows={f.kind === "markdown" ? 9 : f.kind === "lines" ? 4 : 3}
                    defaultValue={text}
                    className={f.kind === "markdown" ? `${inputStyles} font-mono text-sm` : inputStyles}
                  />
                )
              }
            </Field>
          );
        })}
      </div>
    </details>
  );
}
