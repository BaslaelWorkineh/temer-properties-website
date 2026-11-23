"use client";

import { Phone, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { TelegramIcon, WhatsAppIcon } from "@/components/site/brand-icons";
import { cn } from "@/lib/utils";

type Action = { href: string; label: string; detail?: string; icon: ReactNode; iconClass: string; external?: boolean };

/**
 * Desktop floating contact button. Closed, it is the round gold phone button; a click expands it upward into
 * three labelled pills (phone number, WhatsApp, Telegram) and turns it into a close button. Escape or a click
 * anywhere else closes it. The links stay in the HTML while closed (`inert` only takes them out of the tab
 * order), and nothing moves for people who prefer reduced motion.
 */
export function FloatingContact({
  phone,
  phoneDisplay,
  whatsappHref,
  telegramHref,
  labels,
}: {
  phone: string;
  phoneDisplay: string;
  whatsappHref: string;
  telegramHref: string;
  labels: { call: string; whatsapp: string; telegram: string; open: string; close: string };
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const actions: Action[] = [
    { href: `tel:${phone}`, label: labels.call, detail: phoneDisplay, icon: <Phone className="size-5" aria-hidden="true" />, iconClass: "bg-brand-500 text-white" },
    { href: whatsappHref, label: labels.whatsapp, icon: <WhatsAppIcon className="size-5" />, iconClass: "bg-[#25D366] text-white", external: true },
    { href: telegramHref, label: labels.telegram, icon: <TelegramIcon className="size-5" />, iconClass: "bg-[#229ED9] text-white", external: true },
  ];

  return (
    <div ref={root} className="fixed bottom-6 right-6 z-30 hidden flex-col items-end gap-3 lg:flex">
      <ul id={listId} inert={!open} className="flex flex-col items-end gap-2.5" aria-label={labels.open}>
        {actions.map((a, i) => (
          <li
            key={a.label}
            // Staggered: nearest to the button first when opening, reversed when closing.
            style={{ transitionDelay: `${(open ? actions.length - 1 - i : i) * 45}ms` }}
            className={cn(
              "transition duration-200 ease-out motion-reduce:transition-none",
              open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
            )}
          >
            <a
              href={a.href}
              {...(a.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-full bg-white py-1.5 pl-5 pr-1.5 text-ink shadow-lg ring-1 ring-line transition hover:-translate-x-0.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              <span className="flex flex-col items-end leading-tight">
                <span className="text-sm font-semibold">{a.label}</span>
                {a.detail ? <span className="text-xs font-medium text-muted">{a.detail}</span> : null}
              </span>
              <span className={cn("grid size-10 place-items-center rounded-full", a.iconClass)}>{a.icon}</span>
            </a>
          </li>
        ))}
      </ul>

      <button
        ref={toggle}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={listId}
        aria-label={open ? labels.close : labels.open}
        className={cn(
          "grid size-14 place-items-center rounded-full shadow-lg transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
          open ? "bg-brand-950 text-white" : "bg-gold-500 text-brand-700 hover:bg-gold-400",
        )}
      >
        <span className={cn("grid transition-transform duration-200 motion-reduce:transition-none", open && "rotate-90")}>
          {open ? (
            <X className="size-6" aria-hidden="true" />
          ) : (
            // Lucide has no filled phone; filling the outline gives a solid glyph.
            <Phone className="size-6" fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
          )}
        </span>
      </button>
    </div>
  );
}
