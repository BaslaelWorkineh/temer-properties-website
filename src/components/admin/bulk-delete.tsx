"use client";

import { Trash2 } from "lucide-react";
import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const box = "size-4.5 cursor-pointer accent-brand-500";

/** Header checkbox: selects or clears every row on this page. */
export function SelectAllCheckbox() {
  return <input type="checkbox" data-bulk-all aria-label="Select all on this page" className={box} />;
}

/** Row checkbox. The surrounding <BulkDelete> reads every checked one. */
export function RowCheckbox({ id, label }: { id: number; label: string }) {
  return <input type="checkbox" data-bulk-item value={id} aria-label={`Select ${label}`} className={box} />;
}

/**
 * Multi-select delete for an admin list. The table (rendered on the server) goes inside as children, with a
 * <SelectAllCheckbox> in the header and a <RowCheckbox> per row. Deleting posts every checked id to `action`, the same
 * Server Action the single Delete button on the edit page uses.
 */
export function BulkDelete({
  action,
  singular,
  plural,
  enabled = true,
  children,
}: {
  /** False for editors (they can't delete): renders the table without checkboxes or toolbar. */
  enabled?: boolean;
  action: (formData: FormData) => Promise<void>;
  singular: string;
  plural: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(0);
  const [pending, startTransition] = useTransition();

  if (!enabled) return <>{children}</>;

  const items = () => [...(ref.current?.querySelectorAll<HTMLInputElement>("input[data-bulk-item]") ?? [])];

  function sync() {
    const all = items();
    const n = all.filter((b) => b.checked).length;
    setSelected(n);
    const head = ref.current?.querySelector<HTMLInputElement>("input[data-bulk-all]");
    if (head) {
      head.checked = n > 0 && n === all.length;
      head.indeterminate = n > 0 && n < all.length;
    }
  }

  function onChange(event: ChangeEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.hasAttribute("data-bulk-all")) items().forEach((b) => (b.checked = target.checked));
    if (target.hasAttribute("data-bulk-all") || target.hasAttribute("data-bulk-item")) sync();
  }

  function clear() {
    items().forEach((b) => (b.checked = false));
    sync();
  }

  function remove() {
    const ids = items()
      .filter((b) => b.checked)
      .map((b) => b.value);
    if (!ids.length) return;
    const what = ids.length === 1 ? `this ${singular}` : `these ${ids.length} ${plural}`;
    if (!window.confirm(`Delete ${what}? This cannot be undone.`)) return;
    const formData = new FormData();
    ids.forEach((id) => formData.append("id", id));
    startTransition(() => action(formData));
  }

  return (
    <div ref={ref} onChange={onChange}>
      <div
        className={cn(
          "mb-3 flex min-h-12 flex-wrap items-center gap-3 rounded-2xl px-4 py-2 text-sm ring-1",
          selected ? "bg-red-50 ring-red-200" : "bg-white text-muted ring-line",
        )}
      >
        <span className="flex-1 font-medium" aria-live="polite">
          {selected ? `${selected} ${selected === 1 ? singular : plural} selected` : `Tick ${plural} to delete several at once.`}
        </span>
        {selected ? (
          <>
            <button type="button" onClick={clear} disabled={pending} className={buttonStyles({ variant: "outline", size: "sm" })}>
              Clear
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className={buttonStyles({ variant: "outline", size: "sm", className: "text-red-700 hover:border-red-300 hover:text-red-800" })}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {pending ? "Deleting…" : `Delete ${selected}`}
            </button>
          </>
        ) : null}
      </div>
      {children}
    </div>
  );
}
