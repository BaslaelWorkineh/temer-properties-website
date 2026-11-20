import Link from "next/link";
import { cn } from "@/lib/utils";

/** Text wordmark. Replace the mark with the official logo file when available. */
export function Logo({ inverted = false, className }: { inverted?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("flex shrink-0 items-center gap-2.5", className)} aria-label="Temer Properties, home">
      <svg viewBox="0 0 40 40" className="size-10" aria-hidden="true">
        <rect width="40" height="40" rx="11" fill={inverted ? "#ffffff" : "#3a7d44"} />
        <path d="M9 17.5 20 9l11 8.5" fill="none" stroke={inverted ? "#3a7d44" : "#ffffff"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 16h14M20 16v15" fill="none" stroke={inverted ? "#3a7d44" : "#ffffff"} strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="30.5" cy="29.5" r="2.5" fill="#c9a24a" />
      </svg>
      <span className="font-display leading-none">
        <span className={cn("block text-[1.35rem] font-bold tracking-[0.08em]", inverted ? "text-white" : "text-brand-950")}>TEMER</span>
        <span className={cn("block text-[0.62rem] font-semibold tracking-[0.42em]", inverted ? "text-gold-300" : "text-gold-600")}>
          PROPERTIES
        </span>
      </span>
    </Link>
  );
}
