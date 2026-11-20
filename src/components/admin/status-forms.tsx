"use client";

import { updateBookingAction } from "@/app/admin/(panel)/bookings/actions";
import { updateInquiryAction } from "@/app/admin/(panel)/inquiries/actions";
import { PendingButton } from "@/components/admin/pending-button";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Field, FormMessage, inputStyles } from "@/components/ui/form";
import { BOOKING_STATUSES, INQUIRY_STATUSES, bookingStatusLabels, inquiryStatusLabels, type BookingStatus, type InquiryStatus } from "@/lib/config/booking";

export function BookingUpdateForm({ id, status, adminNotes }: { id: number; status: BookingStatus; adminNotes: string | null }) {
  const { state, pending, onSubmit, errors } = useAdminForm(updateBookingAction);
  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <input type="hidden" name="id" value={id} />
      <Field id="status" label="Status" errors={errors.status}>
        {(p) => (
          // Keyed by status so one-click buttons elsewhere on the page re-sync this select.
          <select key={status} {...p} defaultValue={status} className={inputStyles}>
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {bookingStatusLabels[s]}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field id="adminNotes" label="Internal notes" errors={errors.adminNotes} hint="Only visible to staff, e.g. who is meeting the customer.">
        {(p) => <textarea {...p} rows={4} maxLength={2000} defaultValue={adminNotes ?? ""} className={inputStyles} />}
      </Field>
      <FormMessage state={state} />
      <div>
        <PendingButton pending={pending}>Save</PendingButton>
      </div>
    </form>
  );
}

export function InquiryUpdateForm({ id, status, adminNotes }: { id: number; status: InquiryStatus; adminNotes: string | null }) {
  const { state, pending, onSubmit, errors } = useAdminForm(updateInquiryAction);
  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <input type="hidden" name="id" value={id} />
      <Field id="status" label="Status" errors={errors.status}>
        {(p) => (
          <select {...p} defaultValue={status} className={inputStyles}>
            {INQUIRY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {inquiryStatusLabels[s]}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field id="adminNotes" label="Internal notes" errors={errors.adminNotes} hint="Only visible to staff.">
        {(p) => <textarea {...p} rows={4} maxLength={2000} defaultValue={adminNotes ?? ""} className={inputStyles} />}
      </Field>
      <FormMessage state={state} />
      <div>
        <PendingButton pending={pending}>Save</PendingButton>
      </div>
    </form>
  );
}
