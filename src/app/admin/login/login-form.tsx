"use client";

import { LockKeyhole } from "lucide-react";
import { loginAction } from "@/app/admin/login/actions";
import { PendingButton } from "@/components/admin/pending-button";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Field, FormMessage, inputStyles } from "@/components/ui/form";

export function LoginForm({ next }: { next: string }) {
  const { state, pending, onSubmit, errors } = useAdminForm(loginAction);

  return (
    <form onSubmit={onSubmit} className="grid gap-5" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormMessage state={state} />
      <Field id="email" label="Email" errors={errors.email}>
        {(p) => <input {...p} type="email" autoComplete="username" required autoFocus className={inputStyles} />}
      </Field>
      <Field id="password" label="Password" errors={errors.password}>
        {(p) => <input {...p} type="password" autoComplete="current-password" required className={inputStyles} />}
      </Field>
      <PendingButton pending={pending} pendingText="Signing in…" size="lg" className="w-full">
        <LockKeyhole className="size-4" aria-hidden="true" />
        Sign in
      </PendingButton>
    </form>
  );
}
