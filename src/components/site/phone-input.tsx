import { FieldError, Label, inputStyles } from "@/components/ui/form";
import { cn } from "@/lib/utils";

/** Many buyers are diaspora Ethiopians, so the country code is selectable. */
const COUNTRY_CODES = [
  { code: "+251", label: "ET +251" },
  { code: "+1", label: "US/CA +1" },
  { code: "+44", label: "UK +44" },
  { code: "+971", label: "UAE +971" },
  { code: "+966", label: "KSA +966" },
  { code: "+49", label: "DE +49" },
  { code: "+46", label: "SE +46" },
  { code: "+31", label: "NL +31" },
  { code: "+61", label: "AU +61" },
  { code: "+254", label: "KE +254" },
  { code: "+249", label: "SD +249" },
  { code: "+27", label: "ZA +27" },
];

export function PhoneInput({ idPrefix, errors }: { idPrefix: string; errors?: string[] }) {
  const id = `${idPrefix}-phone`;
  return (
    <div>
      <Label htmlFor={id} required>
        Phone number
      </Label>
      <div className="flex gap-2">
        <select name="countryCode" aria-label="Country code" defaultValue="+251" className={cn(inputStyles, "w-[7.25rem] shrink-0 px-2.5")}>
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
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
          placeholder="0911 234 567"
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
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
      <label htmlFor={`${idPrefix}-website`}>Leave this field empty</label>
      <input id={`${idPrefix}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
