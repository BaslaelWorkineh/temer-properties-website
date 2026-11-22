"use client";

import { createContext, useContext } from "react";
import { defaultLocale, type Locale } from "@/lib/i18n/config";

const LangContext = createContext<Locale>(defaultLocale);

/** Makes the current page language available to client components (links, nav, forms). */
export function LangProvider({ lang, children }: { lang: Locale; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang(): Locale {
  return useContext(LangContext);
}
