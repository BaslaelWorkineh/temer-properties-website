"use client";

import { useLang } from "@/components/site/lang";
import Link from "@/components/site/link";
import { Container } from "@/components/site/section";
import { buttonStyles } from "@/components/ui/button";
import { getPagesDict } from "@/lib/i18n/dict/pages";

/** 404 body. Reads the page language from context; the global (unmatched URL) 404 has none and stays English. */
export function NotFoundContent() {
  const dict = getPagesDict(useLang()).notFound;
  return (
    <Container className="py-24 text-center">
      <p className="font-display text-7xl font-bold text-brand-500">404</p>
      <h1 className="mt-4 text-4xl font-bold">{dict.title}</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">{dict.text}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/properties" className={buttonStyles()}>
          {dict.browse}
        </Link>
        <Link href="/projects" className={buttonStyles({ variant: "outline" })}>
          {dict.projects}
        </Link>
        <Link href="/contact" className={buttonStyles({ variant: "outline" })}>
          {dict.contact}
        </Link>
      </div>
    </Container>
  );
}
