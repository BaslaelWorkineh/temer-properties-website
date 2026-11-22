"use client";

import { useLang } from "@/components/site/lang";
import { FieldError, Label, inputStyles } from "@/components/ui/form";
import { getFormsDict } from "@/lib/i18n/dict/forms";
import { cn } from "@/lib/utils";

/** Many buyers are diaspora Ethiopians, so the country code is selectable. */
const COUNTRY_CODES = ["+251", "+1", "+44", "+971", "+966", "+49", "+46", "+31", "+61", "+254", "+249", "+27"];

export function PhoneInput({ idPrefix, errors }: { idPrefix: string; errors?: string[] }) {
  const lang = useLang();
  const t = getFormsDict(lang).phone;
  const id = `${idPrefix}-phone`;
  return (
    <div>
      <Label htmlFor={id} required>
        {t.label}
      </Label>
      <div className="flex gap-2">
        <select
          name="countryCode"
          aria-label={t.countryCode}
          defaultValue="+251"
          className={cn(inputStyles, "shrink-0 px-2.5", lang === "am" ? "w-[9.5rem]" : "w-[7.25rem]")}
        >
          {COUNTRY_CODES.map((code) => (
            <option key={code} value={code}>
              {t.countries[code]}
            </option>
          ))}
        </select>
        <input
          id={id}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required
          placeholder={t.placeholder}
          aria-invalid={errors?.length ? true : undefined}
          aria-describedby={errors?.length ? `${id}-error` : undefined}
          className={inputStyles}
        />
      </div>
      <FieldError id={`${id}-error`} errors={errors} />
    </div>
  );
}

/** Off-screen field that only bots fill in. */
export function Honeypot({ idPrefix }: { idPrefix: string }) {
  const t = getFormsDict(useLang()).phone;
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
      <label htmlFor={`${idPrefix}-website`}>{t.honeypot}</label>
      <input id={`${idPrefix}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
