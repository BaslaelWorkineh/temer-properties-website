"use client";

import { Save } from "lucide-react";
import { PendingButton } from "@/components/admin/pending-button";
import { FormMessage } from "@/components/ui/form";
import type { FormState } from "@/lib/validation";

/** Sticky footer with the form's status message and the save button. */
export function SaveBar<T>({
  state,
  pending,
  label,
  disabled,
  note,
}: {
  state: FormState<T>;
  pending: boolean;
  label: string;
  /** Blocks the button without the "saving" spinner (e.g. the listing is not complete enough to publish). */
  disabled?: boolean;
  /** Small status line above the form message (autosave status, what is missing). */
  note?: React.ReactNode;
}) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 border-t border-line bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-2xl lg:border lg:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1" aria-live="polite">
          {note ? <div className="mb-2 text-sm text-muted">{note}</div> : null}
          <FormMessage state={state} />
        </div>
        <PendingButton pending={pending} disabled={disabled} size="lg">
          <Save className="size-4" aria-hidden="true" />
          {label}
        </PendingButton>
      </div>
    </div>
  );
}
