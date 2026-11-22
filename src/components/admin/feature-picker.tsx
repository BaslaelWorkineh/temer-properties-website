"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { inputStyles } from "@/components/ui/form";

const COMMON = ["Lift", "Backup generator", "Water tank", "Covered parking", "Balcony", "Fitted kitchen", "24h security", "Gym", "Playground", "Fiber internet"];

/**
 * Tap the features that come with the home. Anything not in the list can be typed and added.
 * Saved as one feature per line in a hidden field named `name`, so the server action is unchanged.
 */
export function FeaturePicker({ name, initial, errors }: { name: string; initial: string[]; errors?: string[] }) {
  const [selected, setSelected] = useState<string[]>(initial);
  const [custom, setCustom] = useState("");
  const options = [...COMMON, ...selected.filter((s) => !COMMON.includes(s))];

  const toggle = (f: string) => setSelected((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));
  const addCustom = () => {
    const value = custom.trim();
    if (!value) return;
    setSelected((cur) => (cur.some((x) => x.toLowerCase() === value.toLowerCase()) ? cur : [...cur, value]));
    setCustom("");
  };

  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-ink">What comes with it?</legend>
      <input type="hidden" name={name} value={selected.join("\n")} />
      <div className="flex flex-wrap gap-2">
        {options.map((f) => {
          const on = selected.includes(f);
          return (
            <button
              key={f}
              type="button"
              onClick={() => toggle(f)}
              aria-pressed={on}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium ring-1 ${
                on ? "bg-brand-500 text-white ring-brand-500" : "bg-white text-ink ring-line hover:bg-soft"
              }`}
            >
              {f}
              {on && !COMMON.includes(f) ? <X className="size-3.5" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex max-w-md gap-2">
        <label htmlFor={`${name}-custom`} className="sr-only">
          Add another feature
        </label>
        <input
          id={`${name}-custom`}
          value={custom}
          maxLength={120}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Something else, e.g. Rooftop terrace"
          className={inputStyles}
        />
        <button type="button" onClick={addCustom} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-brand-700 ring-1 ring-line hover:bg-soft">
          <Plus className="size-4" aria-hidden="true" /> Add
        </button>
      </div>
      {errors?.[0] ? <p className="mt-1.5 text-sm text-red-700">{errors[0]}</p> : null}
    </fieldset>
  );
}
