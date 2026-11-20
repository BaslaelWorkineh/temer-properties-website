"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import type { FieldErrors, FormState } from "@/lib/validation";

/**
 * useActionState wired through onSubmit instead of the form `action` prop.
 * React 19 auto-resets uncontrolled fields after every form-action submission,
 * which would wipe the admin's input whenever validation fails. Dispatching
 * manually inside a transition keeps the typed values on screen.
 */
export function useAdminForm<T = undefined>(action: (state: FormState<T>, formData: FormData) => Promise<FormState<T>>) {
  const [state, dispatch, pending] = useActionState(action, { status: "idle" } as FormState<T>);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  const errors: FieldErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  return { state, pending, onSubmit, errors };
}
