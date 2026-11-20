"use client";

import { buttonStyles, type ButtonSize, type ButtonVariant } from "@/components/ui/button";

/** Submit button driven by an explicit `pending` flag (see useAdminForm). */
export function PendingButton({
  pending,
  children,
  pendingText = "Saving…",
  variant = "primary",
  size = "md",
  className,
}: {
  pending: boolean;
  children: React.ReactNode;
  pendingText?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return (
    <button type="submit" disabled={pending} aria-disabled={pending} className={buttonStyles({ variant, size, className })}>
      {pending ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
