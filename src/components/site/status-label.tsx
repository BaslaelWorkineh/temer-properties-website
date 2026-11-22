import type { ProjectStatus } from "@/lib/config/property-types";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

const fills: Record<ProjectStatus, string> = {
  selling: "bg-[#1f9d63]",
  under_construction: "bg-[#3b6fe0]",
  pre_launch: "bg-[#0f8fc4]",
  delivered: "bg-[#5b6780]",
};

/** Flat, solid label: "For sale", "In progress", "Pre-launch" or "Delivered". Same shape as every other label on a photo. */
export function StatusLabel({ status, className, lang = "en" }: { status: ProjectStatus; className?: string; lang?: Locale }) {
  return (
    <span className={cn("inline-block px-2.5 py-1 text-xs font-semibold leading-tight text-white", fills[status], className)}>
      {getDictionary(lang).projectStatus[status]}
    </span>
  );
}

/** Translucent white label for the property type on a photo (the brand mark may sit behind it). */
export function TypeLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-block bg-white/50 px-2.5 py-1 text-xs font-bold leading-tight text-brand-950", className)}>{children}</span>
  );
}
