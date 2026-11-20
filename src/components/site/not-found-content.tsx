import Link from "next/link";
import { Container } from "@/components/site/section";
import { buttonStyles } from "@/components/ui/button";

export function NotFoundContent() {
  return (
    <Container className="py-24 text-center">
      <p className="font-display text-7xl font-bold text-brand-500">404</p>
      <h1 className="mt-4 text-4xl font-bold">This page could not be found</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        The property may have been sold or the link may be out of date. Try one of these instead:
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/properties" className={buttonStyles()}>
          Browse properties
        </Link>
        <Link href="/projects" className={buttonStyles({ variant: "outline" })}>
          Our projects
        </Link>
        <Link href="/contact" className={buttonStyles({ variant: "outline" })}>
          Contact us
        </Link>
      </div>
    </Container>
  );
}
