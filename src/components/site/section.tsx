import { cn } from "@/lib/utils";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function SectionHeading({
  title,
  description,
  action,
  as: Tag = "h2",
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-3xl">
        <Tag className="text-3xl font-bold text-ink sm:text-4xl">{title}</Tag>
        {description ? <div className="mt-3 text-base leading-relaxed text-muted sm:text-lg">{description}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Dark hero band used at the top of inner pages. */
export function PageHero({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("relative overflow-hidden bg-brand-950 text-white", className)}>
      <div
        className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(60rem_30rem_at_90%_-10%,#3a7d44,transparent),radial-gradient(40rem_20rem_at_0%_120%,#c9a24a33,transparent)]"
        aria-hidden="true"
      />
      <Container className="relative py-12 sm:py-16">{children}</Container>
    </section>
  );
}
