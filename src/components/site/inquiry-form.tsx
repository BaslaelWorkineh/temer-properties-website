"use client";

import { CheckCircle2, Send } from "lucide-react";
import { usePathname } from "next/navigation";
import { startTransition, useActionState, useId } from "react";
import { createInquiry } from "@/actions/public";
import { useLang } from "@/components/site/lang";
import { Honeypot, PhoneInput } from "@/components/site/phone-input";
import { buttonStyles } from "@/components/ui/button";
import { Field, FormMessage, inputStyles } from "@/components/ui/form";
import { INQUIRY_INTERESTS, type InquiryInterest } from "@/lib/config/booking";
import { getFormsDict } from "@/lib/i18n/dict/forms";
import { cn } from "@/lib/utils";
import type { FormState } from "@/lib/validation";

export function InquiryForm({
  propertyId,
  projectId,
  defaultInterest = "apartments",
  defaultMessage,
  className,
}: {
  propertyId?: number;
  projectId?: number;
  defaultInterest?: InquiryInterest;
  defaultMessage?: string;
  className?: string;
}) {
  const uid = useId();
  const pathname = usePathname();
  const lang = useLang();
  const t = getFormsDict(lang);
  const [state, formAction, pending] = useActionState(createInquiry, { status: "idle" } as FormState);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  if (state.status === "success") {
    return (
      <div role="status" className={cn("rounded-none bg-brand-50 p-6 ring-1 ring-brand-200", className)}>
        <CheckCircle2 className="size-10 text-brand-600" aria-hidden="true" />
        <h3 className="mt-3 text-2xl font-bold text-ink">{t.inquiry.sentTitle}</h3>
        <p className="mt-2 text-ink/80">{state.message}</p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className={cn("relative space-y-5", className)}
      noValidate
    >
      {propertyId ? <input type="hidden" name="propertyId" value={propertyId} /> : null}
      {projectId ? <input type="hidden" name="projectId" value={projectId} /> : null}
      <input type="hidden" name="source" value={pathname} />
      <input type="hidden" name="lang" value={lang} />
      <Honeypot idPrefix={uid} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${uid}-name`} name="fullName" label={t.fields.fullName} required errors={errors.fullName}>
          {(props) => <input {...props} autoComplete="name" className={inputStyles} />}
        </Field>
        <PhoneInput idPrefix={uid} errors={errors.phone} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${uid}-email`} name="email" label={t.fields.emailOptional} errors={errors.email}>
          {(props) => <input {...props} type="email" autoComplete="email" className={inputStyles} />}
        </Field>
        <Field id={`${uid}-interest`} name="interest" label={t.inquiry.interest} errors={errors.interest}>
          {(props) => (
            <select {...props} defaultValue={defaultInterest} className={inputStyles}>
              {INQUIRY_INTERESTS.map((i) => (
                <option key={i} value={i}>
                  {t.interests[i]}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <Field id={`${uid}-message`} name="message" label={t.fields.message} errors={errors.message} hint={t.inquiry.hint}>
        {(props) => <textarea {...props} rows={5} maxLength={1000} defaultValue={defaultMessage} className={inputStyles} />}
      </Field>

      <Field id={`${uid}-company`} name="company" label={t.fields.company} errors={errors.company}>
        {(props) => <input {...props} autoComplete="organization" className={inputStyles} />}
      </Field>

      <FormMessage state={state.status === "error" ? state : { status: "idle" }} />

      <button type="submit" disabled={pending} className={buttonStyles({ size: "lg", className: "w-full sm:w-auto" })}>
        {pending ? (
          <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}
        {pending ? t.inquiry.sending : t.inquiry.submit}
      </button>
    </form>
  );
}
