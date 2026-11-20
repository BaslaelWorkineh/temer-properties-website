import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputStyles =
  "block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[0.95rem] text-ink shadow-xs placeholder:text-muted/70 " +
  "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-soft disabled:text-muted " +
  "aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-500/15";

export function Label({ htmlFor, children, required }: { htmlFor: string; children: ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
      {children}
      {required ? (
        <span className="ml-0.5 text-red-600" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}

export function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-red-700">
      {errors[0]}
    </p>
  );
}

/**
 * Label + control + hint + error, with the ARIA wiring done for you.
 * Pass the control as a render function to receive the computed props.
 */
export function Field({
  id,
  name,
  label,
  required,
  hint,
  errors,
  className,
  children,
}: {
  id: string;
  /** Form field name; defaults to `id`. Pass a separate value when the id must be unique per page. */
  name?: string;
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  errors?: string[];
  className?: string;
  children: (props: { id: string; name: string; "aria-invalid"?: boolean; "aria-describedby"?: string; required?: boolean }) => ReactNode;
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [errors?.length ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {children({ id, name: name ?? id, "aria-invalid": errors?.length ? true : undefined, "aria-describedby": describedBy, required })}
      {hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      <FieldError id={errorId} errors={errors} />
    </div>
  );
}

export function FormMessage({ state }: { state: { status: string; message?: string } }) {
  if (state.status === "idle" || !state.message) return null;
  const isError = state.status === "error";
  return (
    <p
      role={isError ? "alert" : "status"}
      className={cn(
        "rounded-xl px-4 py-3 text-sm",
        isError ? "bg-red-50 text-red-800 ring-1 ring-red-200" : "bg-brand-50 text-brand-800 ring-1 ring-brand-200",
      )}
    >
      {state.message}
    </p>
  );
}
