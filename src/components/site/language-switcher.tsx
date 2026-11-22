"use client";

import { Languages } from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/components/site/lang";
import { localePath, stripLocale, type Locale } from "@/lib/i18n/config";

const names: Record<Locale, { label: string; hrefLang: string }> = {
  en: { label: "English", hrefLang: "en" },
  am: { label: "አማርኛ", hrefLang: "am" },
};

/**
 * Header button that opens the same page in the other language. It is a real link (works without JavaScript and is
 * crawlable). Pages that are not translated yet open in Amharic with a translated header and footer.
 */
export function LanguageSwitcher({ switchLabel, className }: { switchLabel: string; className?: string }) {
  const lang = useLang();
  const pathname = usePathname();
  const other: Locale = lang === "en" ? "am" : "en";
  const href = localePath(other, stripLocale(pathname));
  return (
    <NextLink
      href={href}
      hrefLang={names[other].hrefLang}
      lang={names[other].hrefLang}
      prefetch={false}
      title={switchLabel}
      className={`inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[0.95rem] font-bold text-brand-800 ring-1 ring-line transition hover:bg-brand-50 hover:text-brand-600 ${className ?? ""}`}
    >
      <Languages className="size-4" aria-hidden="true" />
      <span>{names[other].label}</span>
      <span className="sr-only"> ({switchLabel})</span>
    </NextLink>
  );
}
