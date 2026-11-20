import { cn } from "@/lib/utils";

type Tone = "green" | "gold" | "gray" | "red" | "blue" | "dark";

const tones: Record<Tone, string> = {
  green: "bg-brand-50 text-brand-800 ring-brand-200",
  gold: "bg-gold-100 text-[#6b5016] ring-gold-300",
  gray: "bg-soft text-muted ring-line",
  red: "bg-red-50 text-red-800 ring-red-200",
  blue: "bg-sky-50 text-sky-800 ring-sky-200",
  dark: "bg-brand-950/85 text-white ring-white/10 backdrop-blur",
};

export function Badge({ tone = "gray", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", tones[tone], className)}>
      {children}
    </span>
  );
}

export const propertyStatusTone = { available: "green", reserved: "gold", sold: "red" } as const;
export const projectStatusTone = { pre_launch: "blue", under_construction: "gold", selling: "green", delivered: "gray" } as const;
export const bookingStatusTone = { pending: "gold", confirmed: "green", completed: "gray", cancelled: "red", no_show: "red" } as const;
export const inquiryStatusTone = { new: "gold", contacted: "blue", closed: "gray" } as const;
