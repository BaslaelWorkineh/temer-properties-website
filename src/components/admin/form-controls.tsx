"use client";

import { Trash2 } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";

/** Checkbox with label + hint; unchecked boxes are simply absent from FormData. */
export function Checkbox({ name, label, hint, defaultChecked }: { name: string; label: string; hint?: string; defaultChecked?: boolean }) {
  return (
    <label htmlFor={name} className="flex cursor-pointer items-start gap-3 rounded-xl p-3 ring-1 ring-line hover:bg-soft/60">
      <input id={name} name={name} type="checkbox" defaultChecked={defaultChecked} className="mt-0.5 size-4.5 shrink-0 accent-brand-500" />
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-muted">{hint}</span> : null}
      </span>
    </label>
  );
}

/** Posts `id` to a delete Server Action after a confirm() prompt. */
export function DeleteButton({
  action,
  id,
  confirmMessage,
  label = "Delete",
}: {
  action: (formData: FormData) => Promise<void>;
  id: number;
  confirmMessage: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <SubmitButton variant="outline" size="sm" pendingText="Deleting…" className="text-red-700 hover:border-red-300 hover:text-red-800">
        <Trash2 className="size-4" aria-hidden="true" />
        {label}
      </SubmitButton>
    </form>
  );
}
