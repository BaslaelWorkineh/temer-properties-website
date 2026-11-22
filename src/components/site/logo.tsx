import Image from "next/image";
import Link from "@/components/site/link";
import logoColor from "@/assets/brand/logo-color.png";
import logoWhite from "@/assets/brand/logo-white.png";
import { site } from "@/lib/config/site";
import { cn } from "@/lib/utils";

/**
 * Official logo, cut out from brand/temer-properties-logo.jpg by scripts/generate-brand-assets.ts.
 * `inverted` is the white version for dark backgrounds. `height` is the rendered height in px.
 * Loads eagerly (header, above the fold); pass `loading="lazy"` below the fold.
 */
export function Logo({
  inverted = false,
  height = 56,
  loading = "eager",
  className,
}: {
  inverted?: boolean;
  height?: number;
  loading?: "eager" | "lazy";
  className?: string;
}) {
  const src = inverted ? logoWhite : logoColor;
  return (
    <Link href="/" className={cn("flex shrink-0 items-center", className)}>
      <Image
        src={src}
        alt={`${site.name} home`}
        height={height}
        width={Math.round((height * src.width) / src.height)}
        loading={loading}
      />
    </Link>
  );
}
