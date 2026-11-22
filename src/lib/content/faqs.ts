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

/** Amharic version of generalFaqs: same order, same groups (first draft, to be reviewed by a native speaker). */
export const generalFaqsAm: Array<FaqItem & { group: "Buying" | "Payments" | "Visits" | "Diaspora" }> = [
  {
    group: "Buying",
    question: "ቴምር ፕሮፐርቲስ ምን ዓይነት ንብረቶችን ይሸጣል?",
    answer:
      "በአዲስ አበባ ማለትም በሳርቤት፣ በመገናኛ፣ በአያት፣ በሃይሌ ጋርመንት፣ በፒያሳና በቡልጋሪያ እንዲሁም በገላን ባሉ ባለብዙ አገልግሎት ሕንፃዎች ውስጥ ባለአንድ፣ ባለሁለትና ባለሦስት መኝታ አፓርታማዎችን፣ ዘመናዊ የቤተሰብ ቤቶችንና የንግድ ሱቆችን አልምተን እንሸጣለን።",
  },
  {
    group: "Buying",
    question: "በቀጥታ ነው የሚሸጡት ወይስ በደላሎች በኩል?",
    answer:
      "በቀጥታ ከገንቢው ከቴምር ፕሮፐርቲስ ይገዛሉ። የውስጥ የሽያጭ ቡድናችን ጥያቄዎችን፣ የቦታ ጉብኝቶችን፣ ቦታ ማስያዝንና ውሎችን ይይዛል፤ ስለዚህ ቤትዎን ከሚገነባውና ከሚያስረክበው ድርጅት ጋር ብቻ ይነጋገራሉ።",
  },
  {
    group: "Buying",
    question: "ክፍል እንዴት እይዛለሁ?",
    answer:
      "ክፍል ይምረጡ፣ ቦታውን ይጎብኙ ወይም በቪዲዮ ጉብኝት ይሳተፉ፣ ከዚያም በተስማማነው ቅድመ ክፍያ የቦታ ማስያዣ ስምምነት ይፈርሙ። ከመወሰንዎ በፊት የሽያጭ ቡድናችን ውሉን፣ የክፍያ መርሐ ግብሩንና የርክክብ ጊዜውን ያብራራልዎታል።",
  },
  {
    group: "Payments",
    question: "የክፍያ ዕቅድ አለ?",
    answer:
      "አዎ። አብዛኞቹ ፕሮጀክቶች በቅድመ ክፍያና ከግንባታ ሂደት ጋር በተያያዙ ክፍያዎች ሊገዙ ይችላሉ፤ አንዳንድ ፕሮጀክቶችም ሙሉ ክፍያ ለሚከፍሉ ቅናሽ ይሰጣሉ። ውሉ እንደ ፕሮጀክቱና እንደ ክፍሉ ይለያያል፤ ስለዚህ የሚፈልጉትን ክፍል ወቅታዊ የክፍያ ዕቅድ ይጠይቁ።",
  },
  {
    group: "Payments",
    question: "በድር ጣቢያው ላይ ያሉት ዋጋዎች የመጨረሻ ናቸው?",
    answer:
      "የተዘረዘሩት ዋጋዎች በኢትዮጵያ ብር ሲሆኑ የክፍሉን ወቅታዊ ጠያቂ ዋጋ ያሳያሉ። ዋጋና ተገኝነት ሊቀየር ይችላል፤ አንዳንድ ክፍሎችም «ዋጋ በጥያቄ» ተብለው ተዘርዝረዋል። ዋጋውንና የክፍያ ውሉን ሁልጊዜ ከሽያጭ ቡድናችን ጋር በጽሑፍ ያረጋግጡ።",
  },
  {
    group: "Visits",
    question: "ከመግዛቴ በፊት ቦታውን መጎብኘት እችላለሁ?",
    answer:
      "አዎ፤ እንዲያደርጉም እናበረታታለን። ነፃ የቦታ ጉብኝት በኢንተርኔት ወይም በስልክ ይያዙ። ጉብኝቶች ከሰኞ እስከ ቅዳሜ ይካሄዳሉ፤ የሽያጭ አማካሪ የተጠናቀቁ ክፍሎችን፣ እየተካሄደ ያለውን ግንባታና አካባቢውን ያስጎበኝዎታል።",
  },
  {
    group: "Visits",
    question: "የቦታ ጉብኝትን በኢንተርኔት እንዴት እይዛለሁ?",
    answer:
      "ማንኛውንም የንብረት ወይም የፕሮጀክት ገጽ ይክፈቱ ወይም ወደ «ጉብኝት ይያዙ» ይሂዱ፣ በአካል ወይም በቪዲዮ ጥሪ ይምረጡ፣ ቀንና ሰዓት ይምረጡ፣ ስምዎንና ስልክ ቁጥርዎን ይተዉ። የቦታ ማስያዣ ቁጥርዎን ወዲያውኑ ያገኛሉ፤ ቡድናችንም ለማረጋገጥ ይደውልልዎታል።",
  },
  {
    group: "Diaspora",
    question: "በውጭ አገር እየኖርኩ ንብረት መግዛት እችላለሁ?",
    answer:
      "አዎ። ከገዢዎቻችን ብዙዎቹ በውጭ አገር የሚኖሩ ኢትዮጵያውያን ናቸው። የቀጥታ የቪዲዮ ጥሪ ጉብኝት እናቀርባለን፣ ፎቶዎችንና የሂደት መረጃዎችን እናጋራለን፣ እንዲሁም የሚያስፈልጉ ሰነዶችንና ከውጭ አገር ክፍያ እንዴት እንደሚፈጸም እናብራራለን።",
  },
  {
    group: "Diaspora",
    question: "በኢትዮጵያ ያለ ሰው ግዢውን ሊያከናውንልኝ ይችላል?",
    answer:
      "አዎ። በውጭ አገር ያሉ ገዢዎች ብዙውን ጊዜ በሕጋዊ መንገድ በተመዘገበ የውክልና ሥልጣን ቤተሰባቸውን ያውክላሉ። ለእርስዎ ሁኔታ የትኞቹ ሰነዶች እንደሚያስፈልጉ ቡድናችንን ይጠይቁ፤ ለማንኛውም ግዢ ገለልተኛ የሕግ ምክር እንዲያገኙ እንመክራለን።",
  },
];

/** The general FAQs in the page language. Call as getGeneralFaqs(lang) wherever generalFaqs is used. */
export function getGeneralFaqs(lang: "en" | "am") {
  return lang === "am" ? generalFaqsAm : generalFaqs;
}
