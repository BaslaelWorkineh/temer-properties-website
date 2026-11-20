import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "gold" | "danger" | "light";
export type ButtonSize = "sm" | "md" | "lg";
type Variant = ButtonVariant;
type Size = ButtonSize;

const variants: Record<Variant, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-700 shadow-sm",
  secondary: "bg-brand-950 text-white hover:bg-brand-800 shadow-sm",
  outline: "border border-line bg-white text-ink hover:border-brand-500 hover:text-brand-700",
  ghost: "text-ink hover:bg-soft",
  gold: "bg-gold-500 text-brand-950 hover:bg-gold-400 shadow-sm",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  light: "bg-white/95 text-brand-950 hover:bg-white shadow-sm",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

/** Class names for buttons and button-styled links. */
export function buttonStyles({ variant = "primary", size = "md", className }: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors",
    "disabled:pointer-events-none disabled:opacity-60",
    variants[variant],
    sizes[size],
    className,
  );
}
