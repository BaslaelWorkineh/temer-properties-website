"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLang } from "@/components/site/lang";
import { localePath, locales } from "@/lib/i18n/config";

/**
 * Drop-in replacement for next/link on public pages: internal paths ("/properties") keep the visitor in their
 * language ("/am/properties"). Hash links, external URLs and paths that already carry a language are untouched.
 */
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const lang = useLang();
  let target = href;
  if (typeof href === "string" && href.startsWith("/") && !href.startsWith("//")) {
    const hasPrefix = locales.some((l) => href === `/${l}` || href.startsWith(`/${l}/`) || href.startsWith(`/${l}?`));
    if (!hasPrefix) target = localePath(lang, href);
  }
  return <NextLink href={target} {...props} />;
}
