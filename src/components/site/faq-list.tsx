import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/db/schema";

/**
 * Native <details> accordion: zero JavaScript, and the answers stay in the
 * HTML so crawlers and AI answer engines can read them.
 */
export function FaqList({ faqs, headingLevel = 3, openFirst = false }: { faqs: FaqItem[]; headingLevel?: 2 | 3; openFirst?: boolean }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="divide-y divide-line overflow-hidden rounded-none border border-line bg-white">
      {faqs.map((faq, i) => (
        <details key={faq.question} className="group" open={openFirst && i === 0 ? true : undefined}>
          <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 hover:bg-soft [&::-webkit-details-marker]:hidden">
            <ChevronDown className="size-5 shrink-0 -rotate-90 text-brand-600 transition group-open:rotate-0" aria-hidden="true" />
            <Heading className="font-sans text-base font-semibold text-ink">{faq.question}</Heading>
          </summary>
          <div className="px-5 pb-5 pl-[3.25rem] text-[0.95rem] leading-relaxed text-ink/80">{faq.answer}</div>
        </details>
      ))}
    </div>
  );
}
