"use client";

import { useEffect, useRef } from "react";
import { updateEmailAction, updatePasswordAction } from "@/app/admin/(panel)/account/actions";
import { PendingButton } from "@/components/admin/pending-button";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Field, FormMessage, inputStyles } from "@/components/ui/form";

const card = "grid gap-5 rounded-2xl bg-white p-5 shadow-xs ring-1 ring-line sm:p-6";

/** Clears the password fields after a successful save (useAdminForm keeps typed values on purpose). */
function useResetOnSuccess(status: string) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (status === "success") ref.current?.querySelectorAll<HTMLInputElement>('input[type="password"]').forEach((i) => (i.value = ""));
  }, [status]);
  return ref;
}

function EmailForm({ email }: { email: string }) {
  const { state, pending, onSubmit, errors } = useAdminForm(updateEmailAction);
  const ref = useResetOnSuccess(state.status);
  return (
    <form ref={ref} onSubmit={onSubmit} noValidate className={card}>
      <div>
        <h2 className="text-lg font-semibold">Email</h2>
        <p className="mt-1 text-sm text-muted">
          You log in with <span className="font-medium text-ink">{email}</span>.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="email" label="New email" required errors={errors.email}>
          {(p) => <input {...p} type="email" autoComplete="email" className={inputStyles} />}
        </Field>
        <Field id="email-current" name="currentPassword" label="Current password" required errors={errors.currentPassword}>
          {(p) => <input {...p} type="password" autoComplete="current-password" className={inputStyles} />}
        </Field>
      </div>
      <FormMessage state={state} />
      <div>
        <PendingButton pending={pending}>Change email</PendingButton>
      </div>
    </form>
  );
}

function PasswordForm() {
  const { state, pending, onSubmit, errors } = useAdminForm(updatePasswordAction);
  const ref = useResetOnSuccess(state.status);
  return (
    <form ref={ref} onSubmit={onSubmit} noValidate className={card}>
      <div>
        <h2 className="text-lg font-semibold">Password</h2>
        <p className="mt-1 text-sm text-muted">At least 10 characters. Changing it signs you out on every other device.</p>
      </div>
      <Field id="password-current" name="currentPassword" label="Current password" required errors={errors.currentPassword} className="sm:max-w-sm">
        {(p) => <input {...p} type="password" autoComplete="current-password" className={inputStyles} />}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="newPassword" label="New password" required errors={errors.newPassword}>
          {(p) => <input {...p} type="password" autoComplete="new-password" minLength={10} className={inputStyles} />}
        </Field>
        <Field id="confirmPassword" label="Repeat new password" required errors={errors.confirmPassword}>
          {(p) => <input {...p} type="password" autoComplete="new-password" className={inputStyles} />}
        </Field>
      </div>
      <FormMessage state={state} />
      <div>
        <PendingButton pending={pending}>Change password</PendingButton>
      </div>
    </form>
  );
}

export function AccountForms({ email }: { email: string }) {
  return (
    <div className="grid max-w-3xl gap-6">
      <EmailForm email={email} />
      <PasswordForm />
    </div>
  );
}
