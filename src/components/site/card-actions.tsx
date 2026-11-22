"use client";

import { ArrowRight, MessageCircle, X } from "lucide-react";
import { useLang } from "@/components/site/lang";
import Link from "@/components/site/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useState, type ReactNode } from "react";

/**
 * Bottom row of a photo card: a wide white "View details" button (the whole card links through it) and a
 * small chat button that opens the contact icons (passed as children) under the row.
 */
export function CardActions({ href, label, children }: { href: string; label?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const dict = getDictionary(useLang());
  label ??= dict.common.viewDetails;
  return (
    <div className="mt-4">
      <div className="flex gap-2">
        <Link
          href={href}
          className="flex h-11 flex-1 items-center justify-center gap-2 bg-white text-[0.8rem] font-bold uppercase tracking-wide text-brand-950 transition hover:bg-gold-400 after:absolute after:inset-0 after:content-['']"
        >
          {label} <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="relative z-10 grid size-11 shrink-0 place-items-center border border-white/40 bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30"
        >
          {open ? <X className="size-5" aria-hidden="true" /> : <MessageCircle className="size-5" aria-hidden="true" />}
          <span className="sr-only">{open ? dict.common.hideContact : dict.common.showContact}</span>
        </button>
      </div>
      {open ? <div className="relative z-10 mt-2">{children}</div> : null}
    </div>
  );
}
