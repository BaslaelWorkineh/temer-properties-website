import type { FaqItem } from "@/db/schema";

/**
 * General buyer FAQs (the /faq page renders these with FAQPage structured
 * data). Answers are written to be accurate for any project: keep them
 * specific, and confirm every commitment (warranties, discounts, terms) with
 * the sales team before adding it.
 */
export const generalFaqs: Array<FaqItem & { group: "Buying" | "Payments" | "Visits" | "Diaspora" }> = [
  {
    group: "Buying",
    question: "What types of property does Temer Properties sell?",
    answer:
      "We develop and sell one-, two- and three-bedroom apartments, modern family homes and commercial shop units in mixed-use buildings across Addis Ababa, including Sarbet, Megenagna, Ayat, Haile Garment, Piassa and Bulgaria, plus Gelan.",
  },
  {
    group: "Buying",
    question: "Do you sell directly, or through brokers?",
    answer:
      "You buy directly from Temer Properties, the developer. Our in-house sales team handles enquiries, site visits, reservations and contracts, so you always deal with the company that builds and delivers your home.",
  },
  {
    group: "Buying",
    question: "How do I reserve a unit?",
    answer:
      "Choose a unit, visit the site or join a video walkthrough, then sign a reservation with the agreed down payment. Our sales team explains the contract, payment schedule and handover timeline before you commit.",
  },
  {
    group: "Payments",
    question: "Do you offer payment plans?",
    answer:
      "Yes. Most projects can be bought with a down payment followed by instalments linked to construction progress, and some projects offer a discount for full payment. Terms differ by project and unit, so ask for the current payment plan of the unit you like.",
  },
  {
    group: "Payments",
    question: "Are prices on the website final?",
    answer:
      "Listed prices are in Ethiopian Birr and reflect the current asking price for that unit. Prices and availability can change, and some units are listed as price on request. Always confirm the price and payment terms in writing with our sales team.",
  },
  {
    group: "Visits",
    question: "Can I visit a site before buying?",
    answer:
      "Yes, and we encourage it. Book a free site visit online or by phone. Visits run Monday to Saturday, and a sales advisor walks you through finished units, active construction and the surrounding neighbourhood.",
  },
  {
    group: "Visits",
    question: "How do I book a site visit online?",
    answer:
      "Open any property or project page, or go to Book a visit, choose in person or video call, pick a date and time, and leave your name and phone number. You get a booking reference immediately and our team calls you to confirm.",
  },
  {
    group: "Diaspora",
    question: "Can I buy a property while living abroad?",
    answer:
      "Yes. Many of our buyers are Ethiopians living abroad. We offer live video-call walkthroughs, share photos and progress updates, and explain the documents required and how payments from abroad work.",
  },
  {
    group: "Diaspora",
    question: "Can someone in Ethiopia handle the purchase for me?",
    answer:
      "Yes. Buyers abroad often authorise a family member through a legally registered power of attorney. Ask our team which documents are needed for your situation; we recommend getting independent legal advice for any purchase.",
  },
];
