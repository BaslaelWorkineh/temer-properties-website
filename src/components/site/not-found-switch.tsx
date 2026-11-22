"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LangProvider } from "@/components/site/lang";

/**
 * The global 404 page has no route params, so the language comes from the address: /am/... shows the Amharic
 * version, everything else the English one. Both are rendered on the server; only one is kept in the page.
 */
export function NotFoundSwitch({ en, am }: { en: ReactNode; am: ReactNode }) {
  const pathname = usePathname();
  const amharic = pathname === "/am" || pathname.startsWith("/am/");
  return <LangProvider lang={amharic ? "am" : "en"}>{amharic ? am : en}</LangProvider>;
}
