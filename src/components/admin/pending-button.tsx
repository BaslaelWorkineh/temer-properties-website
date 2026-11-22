"use client";

import { cn } from "@/lib/utils";
import { buttonStyles, type ButtonSize, type ButtonVariant } from "@/components/ui/button";

/** Submit button driven by an explicit `pending` flag (see useAdminForm). */
export function PendingButton({
  pending,
  children,
  pendingText = "Saving…",
  disabled,
  variant = "primary",
  size = "md",
  className,
}: {
  pending: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  pendingText?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return (
    <button type="submit" disabled={pending || disabled} aria-disabled={pending || disabled} className={cn(buttonStyles({ variant, size, className }), disabled && !pending && "cursor-not-allowed opacity-50")}>
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
