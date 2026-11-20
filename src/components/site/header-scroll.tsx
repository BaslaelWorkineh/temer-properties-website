"use client";

import { useEffect, useState } from "react";

/**
 * The sticky <header>, plus a `data-scrolled` flag once the page leaves the top. Children style off it
 * with `group-data-[scrolled]:` (the logo ribbon rolls up into the bar). Server-rendered children
 * pass straight through; only this wrapper is client code.
 */
export function HeaderScroll({ className, children }: { className?: string; children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header data-scrolled={scrolled ? "" : undefined} className={className}>
      {children}
    </header>
  );
}
