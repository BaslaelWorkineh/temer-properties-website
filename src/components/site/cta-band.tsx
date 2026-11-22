import { CalendarCheck2, Phone } from "lucide-react";
import Link from "@/components/site/link";
import { WhatsAppIcon } from "@/components/site/brand-icons";
import { Container } from "@/components/site/section";
import { buttonStyles } from "@/components/ui/button";
import { site, whatsappLink } from "@/lib/config/site";

export function CtaBand({
  title = "See it for yourself: book a free site visit",
  text = "Walk through finished units and active construction sites with our sales team, in person or on a live video call from abroad.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-brand-500 px-6 py-12 text-white sm:px-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(40rem_20rem_at_100%_0%,#c9a24a,transparent)]"
            aria-hidden="true"
          />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
              <p className="mt-3 max-w-2xl text-white/85 sm:text-lg">{text}</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/book-a-visit" className={buttonStyles({ variant: "light", size: "lg" })}>
                <CalendarCheck2 className="size-5" aria-hidden="true" /> Book a visit
              </Link>
              <a href={`tel:${site.contact.phone}`} className={buttonStyles({ variant: "secondary", size: "lg" })}>
                <Phone className="size-4" aria-hidden="true" /> {site.contact.phoneDisplay}
              </a>
              <a
                href={whatsappLink("Hello Temer Properties, I would like to book a site visit.")}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles({ variant: "secondary", size: "lg" })}
              >
                <WhatsAppIcon className="size-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
