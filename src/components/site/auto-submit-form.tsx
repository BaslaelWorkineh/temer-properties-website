"use client";

import Form from "next/form";
import type { ComponentProps } from "react";
import { useLang } from "@/components/site/lang";
import { localePath, locales } from "@/lib/i18n/config";

/**
 * GET search form that applies a filter as soon as a dropdown changes (no need to press Search).
 * The Search button still works, and without JavaScript the form submits the usual way.
 */
export function AutoSubmitForm({ onChange, action, ...props }: ComponentProps<typeof Form>) {
  const lang = useLang();
  // Public search forms stay in the visitor's language (/properties -> /am/properties). Admin has no language.
  const localized =
    typeof action === "string" && action.startsWith("/") && !locales.some((l) => action === `/${l}` || action.startsWith(`/${l}/`))
      ? localePath(lang, action)
      : action;
  return (
    <Form
      {...props}
      action={localized}
      onChange={(e) => {
        onChange?.(e);
        if (e.target instanceof HTMLSelectElement) e.currentTarget.requestSubmit();
      }}
    />
  );
}
