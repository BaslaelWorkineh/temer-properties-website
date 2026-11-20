import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/db/schema";

/**
 * Native <details> accordion: zero JavaScript, and the answers stay in the
 * HTML so crawlers and AI answer engines can read them.
 */
export function FaqList({ faqs, headingLevel = 3 }: { faqs: FaqItem[]; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
      {faqs.map((faq) => (
        <details key={faq.question} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 hover:bg-soft [&::-webkit-details-marker]:hidden">
            <Heading className="font-sans text-base font-semibold text-ink">{faq.question}</Heading>
            <ChevronDown className="size-5 shrink-0 text-brand-600 transition group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="px-5 pb-5 text-[0.95rem] leading-relaxed text-ink/80">{faq.answer}</div>
        </details>
      ))}
    </div>
  );
}
