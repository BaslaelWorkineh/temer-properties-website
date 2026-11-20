"use client";

import { CalendarCheck2, CheckCircle2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { startTransition, useActionState, useEffect, useId, useState, useSyncExternalStore } from "react";
import { createBooking, type BookingResult } from "@/actions/public";
import { WhatsAppIcon } from "@/components/site/brand-icons";
import { Honeypot, PhoneInput } from "@/components/site/phone-input";
import { buttonStyles } from "@/components/ui/button";
import { Field, FieldError, FormMessage, inputStyles } from "@/components/ui/form";
import { VISIT_TYPES, bookingConfig, visitTypeLabels, type VisitType } from "@/lib/config/booking";
import { addDays, addisToday, formatSlot, formatVisitDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { FormState } from "@/lib/validation";

type Slot = { time: string; label: string; remaining: number; available: boolean };
type Availability = { date: string; open: boolean; message?: string; slots: Slot[] };

const allSlots: Slot[] = bookingConfig.slots.map((time) => ({
  time,
  label: formatSlot(time),
  remaining: bookingConfig.capacityPerSlot,
  available: true,
}));

const noopSubscribe = () => () => {};

/**
 * Site-visit booking. Works without JavaScript (plain form post to the Server
 * Action); with JavaScript it shows live slot availability for the chosen day.
 */
export function BookingForm({
  propertyId,
  projectId,
  projectOptions,
  defaultProjectId,
  subject,
  whatsapp,
  className,
}: {
  propertyId?: number;
  projectId?: number;
  /** Shown as a "Which project?" select when the form isn't tied to one listing. */
  projectOptions?: Array<{ id: number; name: string }>;
  defaultProjectId?: number;
  /** e.g. the property title, used in the confirmation WhatsApp message. */
  subject?: string;
  whatsapp: string;
  className?: string;
}) {
  const uid = useId();
  const pathname = usePathname();
  const [state, formAction, pending] = useActionState(createBooking, { status: "idle" } as FormState<BookingResult>);

  // Today in Addis Ababa, read only in the browser (no Date access during prerendering).
  const today = useSyncExternalStore(noopSubscribe, () => addisToday(), () => null);
  const [visitType, setVisitType] = useState<VisitType>("in_person");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!date) return;
    const controller = new AbortController();
    fetch(`/api/availability?date=${encodeURIComponent(date)}`, { signal: controller.signal })
      .then((res) => res.json() as Promise<Availability>)
      .then((data) => setAvailability(data))
      .catch((err: Error) => {
        if (err.name !== "AbortError") setLoadFailed(true);
      });
    return () => controller.abort();
  }, [date]);

  const current = availability?.date === date ? availability : null;
  const loading = Boolean(date) && !current && !loadFailed;
  const slots = current?.open ? current.slots : allSlots;
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  if (state.status === "success" && state.data) {
    const d = state.data;
    const waText = `Hello Temer Properties, I booked a site visit${subject ? ` for ${subject}` : ""} (reference ${d.reference}) on ${formatVisitDate(d.visitDate)} at ${formatSlot(d.timeSlot)}.`;
    return (
      <div role="status" className={cn("rounded-none bg-brand-50 p-6 ring-1 ring-brand-200", className)}>
        <CheckCircle2 className="size-10 text-brand-600" aria-hidden="true" />
        <h3 className="mt-3 text-2xl font-bold text-ink">Visit request received</h3>
        <p className="mt-2 leading-relaxed text-ink/80">
          Thank you! Your reference is <strong className="font-semibold text-ink">{d.reference}</strong>. Our team will call you to
          confirm your {visitTypeLabels[d.visitType as VisitType].toLowerCase()} on{" "}
          <strong className="font-semibold text-ink">{formatVisitDate(d.visitDate)}</strong> at{" "}
          <strong className="font-semibold text-ink">{formatSlot(d.timeSlot)}</strong>.
        </p>
        <a
          href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(waText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonStyles({ variant: "outline", className: "mt-5" })}
        >
          <WhatsAppIcon className="size-4 text-[#25D366]" /> Message us on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        // Submit via a transition so React keeps the typed values if validation fails.
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

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-ink">How would you like to visit?</legend>
        <div className="grid grid-cols-2 gap-2">
          {VISIT_TYPES.map((type) => (
            <label
              key={type}
              className={cn(
                "flex cursor-pointer items-center justify-center rounded-none border px-3 py-2.5 text-center text-sm font-medium transition",
                visitType === type ? "border-brand-500 bg-brand-50 text-brand-800" : "border-line text-ink hover:border-brand-300",
              )}
            >
              <input
                type="radio"
                name="visitType"
                value={type}
                checked={visitType === type}
                onChange={() => setVisitType(type)}
                className="sr-only"
              />
              {type === "in_person" ? "In person" : "Video call"}
            </label>
          ))}
        </div>
      </fieldset>

      {projectOptions?.length ? (
        <Field id={`${uid}-project`} name="projectId" label="Which project?" errors={errors.projectId}>
          {(props) => (
            <select {...props} defaultValue={defaultProjectId ?? ""} className={inputStyles}>
              <option value="">Not sure yet, advise me</option>
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </Field>
      ) : null}

      <Field id={`${uid}-date`} name="visitDate" label="Preferred date" required errors={errors.visitDate}>
        {(props) => (
          <input
            {...props}
            type="date"
            min={today ? addDays(today, bookingConfig.minDaysAhead) : undefined}
            max={today ? addDays(today, bookingConfig.maxDaysAhead) : undefined}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setTimeSlot("");
              setLoadFailed(false);
            }}
            className={inputStyles}
          />
        )}
      </Field>

      <fieldset aria-describedby={errors.timeSlot ? `${uid}-slot-error` : undefined}>
        <legend className="mb-1.5 text-sm font-medium text-ink">
          Preferred time <span className="text-red-600">*</span>
          {loading ? <span className="ml-2 text-xs font-normal text-muted">Checking availability…</span> : null}
        </legend>
        {current && !current.open ? (
          <p className="rounded-none bg-gold-100 px-3 py-2 text-sm text-[#6b5016]">{current.message}</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => (
              <label
                key={slot.time}
                className={cn(
                  "flex cursor-pointer flex-col items-center rounded-none border px-2 py-2 text-sm font-medium transition",
                  !slot.available && "cursor-not-allowed border-line bg-soft text-muted line-through",
                  slot.available && timeSlot === slot.time && "border-brand-500 bg-brand-50 text-brand-800",
                  slot.available && timeSlot !== slot.time && "border-line text-ink hover:border-brand-300",
                )}
              >
                <input
                  type="radio"
                  name="timeSlot"
                  value={slot.time}
                  disabled={!slot.available}
                  checked={timeSlot === slot.time}
                  onChange={() => setTimeSlot(slot.time)}
                  className="sr-only"
                />
                {slot.label}
                {current?.open && slot.available && slot.remaining === 1 ? (
                  <span className="text-[0.65rem] font-semibold text-gold-600 no-underline">1 spot left</span>
                ) : null}
              </label>
            ))}
          </div>
        )}
        <FieldError id={`${uid}-slot-error`} errors={errors.timeSlot} />
      </fieldset>

      <Field id={`${uid}-name`} name="fullName" label="Full name" required errors={errors.fullName}>
        {(props) => <input {...props} autoComplete="name" className={inputStyles} />}
      </Field>

      <PhoneInput idPrefix={uid} errors={errors.phone} />

      <div className="grid gap-5 sm:grid-cols-[1fr_7rem]">
        <Field id={`${uid}-email`} name="email" label="Email (optional)" errors={errors.email}>
          {(props) => <input {...props} type="email" autoComplete="email" className={inputStyles} />}
        </Field>
        <Field id={`${uid}-party`} name="partySize" label="People" errors={errors.partySize}>
          {(props) => (
            <select {...props} defaultValue="1" className={inputStyles}>
              {Array.from({ length: bookingConfig.maxPartySize }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <Field id={`${uid}-message`} name="message" label="Anything we should know? (optional)" errors={errors.message}>
        {(props) => (
          <textarea
            {...props}
            rows={3}
            maxLength={1000}
            placeholder="e.g. I'm interested in a 3-bedroom unit and payment plans"
            className={inputStyles}
          />
        )}
      </Field>

      <FormMessage state={state.status === "error" ? state : { status: "idle" }} />

      <button type="submit" disabled={pending} className={buttonStyles({ size: "lg", className: "w-full" })}>
        {pending ? (
          <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
        ) : (
          <CalendarCheck2 className="size-5" aria-hidden="true" />
        )}
        {pending ? "Sending…" : "Request site visit"}
      </button>
      <p className="text-center text-xs text-muted">Free, no obligation. We confirm every visit by phone.</p>
    </form>
  );
}
