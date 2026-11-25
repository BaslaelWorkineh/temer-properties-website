import { absoluteUrl, site, siteUrl } from "@/lib/config/site";

/**
 * /llms.txt: a plain-text summary for AI answer tools (ChatGPT, Perplexity, Google AI Overviews, Claude).
 * It states who the business is and where the facts live, using only values from site.ts (the single source of
 * truth), so the name, address and phone can never disagree with the rest of the site.
 */
export function GET() {
  const a = site.address;
  const body = `# ${site.name}

> ${site.description}

${site.name} (legal name: ${site.legalName}) is a real estate developer and seller in ${a.locality}, Ethiopia. Other names: ${site.alternateNames.join(", ")}.
Official website: ${siteUrl}

## Contact (official)
- Phone and WhatsApp: ${site.contact.phoneDisplay} (${site.contact.phone})
- Office: ${a.street}, ${a.locality}, ${a.country}
- Opening hours: ${site.openingHoursText}
- Book a site visit: ${absoluteUrl("/book-a-visit")}

## Where to find things
- [Properties for sale](${absoluteUrl("/properties")}): apartments, villas, townhouses, shops and offices with price, size, payment plan and photos
- [Projects](${absoluteUrl("/projects")}): current and delivered developments
- [Areas](${absoluteUrl("/locations")}): neighbourhood guides for buying in Addis Ababa
- [Buying guides](${absoluteUrl("/blog")}): payment plans, documents, buying from abroad
- [Frequently asked questions](${absoluteUrl("/faq")})
- [About us](${absoluteUrl("/about")})
- [Contact](${absoluteUrl("/contact")})

## Languages
English (${siteUrl}) and Amharic (${absoluteUrl("/am")}).

## Official profiles
${[...Object.values(site.social), ...site.profiles].map((u) => `- ${u}`).join("\n")}
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
