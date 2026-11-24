"use client";

import { useRouter } from "next/navigation";
import { Fragment, type ReactNode } from "react";

/**
 * Cache Components keeps recently visited pages alive (React <Activity>) and shows them again with their old state.
 * Wrong for admin forms: clicking "New property" would reopen the previous listing, and its autosave would keep
 * writing to that listing. bfcacheId changes on every link click or router push/replace (fresh form, fresh server
 * data) but not on browser back/forward, so unsaved typing still comes back there.
 * Must render inside the page (it reads the page segment's id), not in a layout.
 */
export function FreshOnNavigate({ children }: { children: ReactNode }) {
  const { bfcacheId } = useRouter();
  return <Fragment key={bfcacheId}>{children}</Fragment>;
}
