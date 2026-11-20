import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shown when a record has no photos yet. Purely decorative. */
export function ImagePlaceholder({ label, className }: { label?: string; className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-100 via-brand-50 to-gold-100 text-brand-700/70",
        className,
      )}
      aria-hidden="true"
    >
      <Building2 className="size-10" />
      {label ? <span className="text-xs font-semibold uppercase tracking-widest">{label}</span> : null}
    </div>
  );
}
