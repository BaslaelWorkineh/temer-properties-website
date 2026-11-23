"use client";

import { LogOut } from "lucide-react";
import { startTransition, useEffect, useState, type FormEvent } from "react";
import { logoutAction } from "@/app/admin/(panel)/actions";

/**
 * Signs out, then replaces the page with a full load of the login page. A soft (router) navigation would keep the
 * admin pages in the client router cache, where the Back button could show them again after sign-out.
 */
export function LogoutButton() {
  const [pending, setPending] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    startTransition(async () => {
      try {
        await logoutAction();
      } finally {
        window.location.replace("/admin/login");
      }
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex size-9 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50"
        title="Sign out"
      >
        <LogOut className="size-4.5" aria-hidden="true" />
        <span className="sr-only">Sign out</span>
      </button>
    </form>
  );
}

/**
 * If the browser restores an admin page from its back/forward cache (e.g. Back after signing out), reload it so the
 * server checks the session again and sends a signed-out visitor to the login page.
 */
export function SessionLock() {
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);
  return null;
}
