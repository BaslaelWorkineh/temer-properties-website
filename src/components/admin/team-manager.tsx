"use client";

import { Copy, Plus, UserMinus } from "lucide-react";
import { startTransition, useActionState, useState, type FormEvent } from "react";
import { addTeamMemberAction, removeTeamMemberAction, resetTeamPasswordAction } from "@/app/admin/(panel)/team/actions";
import { PendingButton } from "@/components/admin/pending-button";
import { Notice, TableCard, td, th } from "@/components/admin/ui";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Field, FormMessage, inputStyles } from "@/components/ui/form";

type Member = { id: number; name: string; email: string; role: "admin" | "editor"; lastLogin: string };

const roleHint = {
  editor: "Can add and edit homes, projects, areas and guides, and see bookings and enquiries. Can't delete or manage the team.",
  admin: "Can do everything, including adding and removing people.",
};

/** Shown once after adding someone or resetting a password: the owner passes it on (e.g. via WhatsApp). */
function Credentials({ name, email, password }: { name: string; email: string; password: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Temer Properties admin\nEmail: ${email}\nPassword: ${password}`;
  return (
    <Notice>
      <p className="font-semibold">Send this to {name} yourself. It is shown only once.</p>
      <p className="mt-2 font-mono text-sm">
        Email: {email}
        <br />
        Password: {password}
      </p>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(text).then(() => setCopied(true), () => undefined)}
        className={buttonStyles({ variant: "outline", size: "sm", className: "mt-3" })}
      >
        <Copy className="size-4" aria-hidden="true" /> {copied ? "Copied" : "Copy"}
      </button>
    </Notice>
  );
}

function AddForm({ onDone }: { onDone: () => void }) {
  const { state, pending, onSubmit, errors } = useAdminForm(addTeamMemberAction);
  const [role, setRole] = useState<"editor" | "admin">("editor");

  if (state.status === "success" && state.data) {
    return (
      <div className="grid gap-3 rounded-2xl bg-white p-5 ring-1 ring-line">
        <Credentials {...state.data} />
        <div>
          <button type="button" onClick={onDone} className={buttonStyles({ size: "sm" })}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 rounded-2xl bg-white p-5 ring-1 ring-line">
      <h2 className="text-lg font-semibold">Add a team member</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Name" required errors={errors.name}>
          {(p) => <input {...p} autoComplete="off" className={inputStyles} />}
        </Field>
        <Field id="email" label="Email" required errors={errors.email} hint="They log in with this email.">
          {(p) => <input {...p} type="email" autoComplete="off" className={inputStyles} />}
        </Field>
      </div>
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">What can they do?</legend>
        <div className="flex flex-wrap gap-2">
          {(["editor", "admin"] as const).map((r) => (
            <label
              key={r}
              className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-medium ring-1 ${role === r ? "bg-brand-500 text-white ring-brand-500" : "bg-white ring-line"}`}
            >
              <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="sr-only" />
              {r === "editor" ? "Editor" : "Admin"}
            </label>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-muted">{roleHint[role]}</p>
      </fieldset>
      <p className="text-xs text-muted">A starting password is made for them and shown after you click Add person.</p>
      <FormMessage state={state} />
      <div className="flex flex-wrap gap-3">
        <PendingButton pending={pending} pendingText="Adding…">
          <Plus className="size-4" aria-hidden="true" /> Add person
        </PendingButton>
        <button type="button" onClick={onDone} className={buttonStyles({ variant: "outline" })}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export function TeamManager({ members, meId }: { members: Member[]; meId: number }) {
  const [adding, setAdding] = useState(false);
  const [reset, resetDispatch, resetPending] = useActionState(resetTeamPasswordAction, { status: "idle" } as Awaited<ReturnType<typeof resetTeamPasswordAction>>);
  const [removed, removeDispatch, removePending] = useActionState(removeTeamMemberAction, { status: "idle" } as Awaited<ReturnType<typeof removeTeamMemberAction>>);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  function submit(dispatch: (fd: FormData) => void) {
    return (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const fd = new FormData(event.currentTarget);
      startTransition(() => dispatch(fd));
    };
  }

  return (
    <div className="grid gap-5">
      <div>
        {adding ? null : (
          <button type="button" onClick={() => setAdding(true)} className={buttonStyles()}>
            <Plus className="size-4" aria-hidden="true" /> Add team member
          </button>
        )}
      </div>
      {adding ? <AddForm onDone={() => setAdding(false)} /> : null}

      {reset.status === "success" && reset.data ? <Credentials {...reset.data} /> : null}
      {reset.status === "error" ? <FormMessage state={reset} /> : null}
      {removed.status !== "idle" ? (
        <div aria-live="polite">{removed.status === "success" ? <Notice>{removed.message}</Notice> : <FormMessage state={removed} />}</div>
      ) : null}

      <TableCard>
        <table className="min-w-full divide-y divide-line">
          <thead className="bg-soft/60">
            <tr>
              <th scope="col" className={th}>Name</th>
              <th scope="col" className={th}>Email</th>
              <th scope="col" className={th}>Role</th>
              <th scope="col" className={th}>Last login</th>
              <th scope="col" className={th}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {members.map((m) => (
              <tr key={m.id}>
                <td className={`${td} font-semibold`}>
                  {m.name}
                  {m.id === meId ? " (you)" : ""}
                </td>
                <td className={td}>{m.email}</td>
                <td className={td}>{m.role === "admin" ? <Badge tone="green">Admin</Badge> : <Badge>Editor</Badge>}</td>
                <td className={`${td} whitespace-nowrap text-muted`}>{m.lastLogin}</td>
                <td className={`${td} whitespace-nowrap text-right`}>
                  {m.id === meId ? null : (
                    <div className="flex justify-end gap-2">
                      <form onSubmit={submit(resetDispatch)}>
                        <input type="hidden" name="id" value={m.id} />
                        <button type="submit" disabled={resetPending} className={buttonStyles({ variant: "outline", size: "sm" })}>
                          Reset password
                        </button>
                      </form>
                      <form
                        onSubmit={(e) => {
                          if (confirmId !== m.id) {
                            e.preventDefault();
                            setConfirmId(m.id);
                            return;
                          }
                          setConfirmId(null);
                          submit(removeDispatch)(e);
                        }}
                      >
                        <input type="hidden" name="id" value={m.id} />
                        <button
                          type="submit"
                          disabled={removePending}
                          className={buttonStyles({ variant: "outline", size: "sm", className: "text-red-700 hover:border-red-300 hover:text-red-800" })}
                        >
                          <UserMinus className="size-4" aria-hidden="true" /> {confirmId === m.id ? "Click again to remove" : "Remove"}
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
      <p className="text-xs text-muted">You can&apos;t remove or demote the last admin, so you can never lock yourself out.</p>
    </div>
  );
}
