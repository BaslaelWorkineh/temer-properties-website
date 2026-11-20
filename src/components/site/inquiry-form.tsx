"use client";

import { CheckCircle2, Send } from "lucide-react";
import { usePathname } from "next/navigation";
import { startTransition, useActionState, useId } from "react";
import { createInquiry } from "@/actions/public";
import { Honeypot, PhoneInput } from "@/components/site/phone-input";
import { buttonStyles } from "@/components/ui/button";
import { Field, FormMessage, inputStyles } from "@/components/ui/form";
import { INQUIRY_INTERESTS, inquiryInterestLabels, type InquiryInterest } from "@/lib/config/booking";
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
  const [state, formAction, pending] = useActionState(createInquiry, { status: "idle" } as FormState);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  if (state.status === "success") {
    return (
      <div role="status" className={cn("rounded-none bg-brand-50 p-6 ring-1 ring-brand-200", className)}>
        <CheckCircle2 className="size-10 text-brand-600" aria-hidden="true" />
        <h3 className="mt-3 text-2xl font-bold text-ink">Message sent</h3>
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
      <Honeypot idPrefix={uid} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${uid}-name`} name="fullName" label="Full name" required errors={errors.fullName}>
          {(props) => <input {...props} autoComplete="name" className={inputStyles} />}
        </Field>
        <PhoneInput idPrefix={uid} errors={errors.phone} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${uid}-email`} name="email" label="Email (optional)" errors={errors.email}>
          {(props) => <input {...props} type="email" autoComplete="email" className={inputStyles} />}
        </Field>
        <Field id={`${uid}-interest`} name="interest" label="I am interested in" errors={errors.interest}>
          {(props) => (
            <select {...props} defaultValue={defaultInterest} className={inputStyles}>
              {INQUIRY_INTERESTS.map((i) => (
                <option key={i} value={i}>
                  {inquiryInterestLabels[i]}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <Field id={`${uid}-message`} name="message" label="Message" errors={errors.message} hint="Up to 1,000 characters.">
        {(props) => <textarea {...props} rows={5} maxLength={1000} defaultValue={defaultMessage} className={inputStyles} />}
      </Field>

      <Field id={`${uid}-company`} name="company" label="Company (optional)" errors={errors.company}>
        {(props) => <input {...props} autoComplete="organization" className={inputStyles} />}
      </Field>

      <FormMessage state={state.status === "error" ? state : { status: "idle" }} />

      <button type="submit" disabled={pending} className={buttonStyles({ size: "lg", className: "w-full sm:w-auto" })}>
        {pending ? (
          <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}
        {pending ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
