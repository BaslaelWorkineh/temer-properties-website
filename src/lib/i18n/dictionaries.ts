import type { PropertyStatus, PropertyType, ProjectStatus } from "@/lib/config/property-types";
import type { Locale } from "@/lib/i18n/config";

/**
 * Interface text for the pages that are translated. Business data (name, phone, address) stays in
 * src/lib/config/site.ts, and listing/project/guide content comes from the database (English for now).
 * The Amharic text is a first draft: have a native speaker review it before launch.
 */
export type Dictionary = {
  /** Big hero wordmark: the brand name split over two lines, at the start of the home page's H1 (CSS sets the capitals). */
  brand: { name: string; sub: string; full: string };
  /** Office address as printed on the site (the map link and phone stay in site.ts). */
  office: { street: string; locality: string };
  nav: { home: string; properties: string; projects: string; locations: string; about: string; guides: string; contact: string };
  common: {
    bookVisit: string;
    bookSiteVisit: string;
    bookFreeVisit: string;
    skip: string;
    callUs: (phone: string) => string;
    call: string;
    whatsapp: string;
    /** WhatsApp button on project cards. */
    askUs: string;
    whatsappUs: string;
    openMenu: string;
    closeMenu: string;
    language: string;
    switchTo: string;
    quickContact: string;
    contactOptions: string;
    closeContactOptions: string;
    viewDetails: string;
    viewProject: string;
    showContact: string;
    hideContact: string;
    priceOnRequest: string;
    studio: string;
    bed: string;
    toilets: (n: number) => string;
    allProperties: string;
    allProjects: string;
    allAreas: string;
    allGuides: string;
    allQuestions: string;
    photos: string;
  };
  types: Record<PropertyType, { label: string; plural: string }>;
  propertyStatus: Record<PropertyStatus, string>;
  projectStatus: Record<ProjectStatus, string>;
  stats: { customers: string; projects: string; units: string };
  footer: {
    description: string;
    buy: string;
    forSale: (plural: string) => string;
    ourProjects: string;
    areas: string;
    propertyIn: (area: string) => string;
    visitOrCall: string;
    hours: string;
    aboutUs: string;
    faq: string;
    buyerGuides: string;
    contact: string;
    privacy: string;
    terms: string;
    staffLogin: string;
    rights: (year: number) => string;
    address: string;
  };
  search: {
    type: string;
    area: string;
    bedrooms: string;
    maxPrice: string;
    search: string;
    allTypes: string;
    allAreas: string;
    any: string;
    anyPrice: string;
    nBedrooms: (n: number) => string;
    upTo: (millions: number) => string;
  };
  home: {
    title: string;
    description: string;
    h1: string;
    lead: (name: string) => string;
    browse: string;
    latestTitle: string;
    latestCount: (n: number) => string;
    /** The gold bar's button to the full /properties list. */
    viewAvailable: string;
    /** The featured project beside the latest listings, grouped by unit type. */
    showcase: {
      /** Before the featured project's name in the green bar: "For sale in Temer Legacy". */
      forSaleIn: string;
      typology: (bedrooms: number) => string;
      /** Row for commercial shops. */
      shops: string;
      /** Row for other listings without a bedroom count (offices). */
      other: string;
      from: string;
      total: string;
      /** "20% advance": the advance a listing's payment plan starts with. */
      advance: (percent: number) => string;
      /** The home page block with every shop offer: its title and "4 sites, from ETB 2.5M". */
      shopsTitle: string;
      shopsIntro: (sites: number, from: string | null) => string;
      /** Above a shop's price, which is where its prices start. */
      startingPrice: string;
      /** The link from a project on the home page to its page. */
      viewProject: string;
    };
    projectsTitle: string;
    projectsDesc: string;
    projectsCount: (n: number) => string;
    viewAllProjects: string;
    projectsPrevious: string;
    projectsNext: string;
    areaTitle: string;
    areaDesc: string;
    alsoIn: string;
    buyingTitle: string;
    buyingDesc: string;
    step: (n: number) => string;
    steps: Array<{ title: string; text: string; cta: string }>;
    faqTitle: string;
    faqDesc: string;
    deliveredTitle: string;
    deliveredDesc: string;
    adviceTitle: string;
    comeAndSee: string;
    visitTitle: string;
    visitText: string;
    visitOffice: string;
    addressLabel: string;
    hoursLabel: string;
    phoneLabel: string;
    directions: string;
    propertiesWord: (n: number) => string;
    projectCount: (n: number) => string;
    propertyCount: (n: number) => string;
  };
};

const en: Dictionary = {
  brand: { name: "Temer", sub: "Properties", full: "Temer Properties" },
  office: { street: "Woldemaryam Building, Sarbet to Kera Road", locality: "Addis Ababa" },
  nav: { home: "Home", properties: "Properties", projects: "Projects", locations: "Locations", about: "About", guides: "Buying guides", contact: "Contact" },
  common: {
    bookVisit: "Book a visit",
    bookSiteVisit: "Book a site visit",
    bookFreeVisit: "Book a free site visit",
    skip: "Skip to content",
    callUs: (phone) => `Call us on ${phone}`,
    call: "Call",
    whatsapp: "WhatsApp",
    askUs: "Ask us",
    whatsappUs: "WhatsApp us",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",
    switchTo: "Switch to Amharic",
    quickContact: "Quick contact",
    contactOptions: "Contact us: call or WhatsApp",
    closeContactOptions: "Close contact options",
    viewDetails: "View details",
    viewProject: "View project",
    showContact: "Show contact options",
    hideContact: "Hide contact options",
    priceOnRequest: "Price on request",
    studio: "Studio",
    bed: "bed",
    toilets: (n) => `${n} ${n === 1 ? "toilet" : "toilets"}`,
    allProperties: "All properties",
    allProjects: "All projects",
    allAreas: "All areas",
    allGuides: "All guides",
    allQuestions: "All questions",
    photos: "photos",
  },
  types: {
    apartment: { label: "Apartment", plural: "Apartments" },
    villa: { label: "Villa", plural: "Villas & Homes" },
    townhouse: { label: "Townhouse", plural: "Townhouses" },
    shop: { label: "Commercial Shop", plural: "Commercial Shops" },
    office: { label: "Office", plural: "Offices" },
  },
  propertyStatus: { available: "Available", reserved: "Reserved", sold: "Sold" },
  projectStatus: { pre_launch: "Pre-launch", under_construction: "In progress", selling: "For sale", delivered: "Delivered" },
  stats: { customers: "Happy customers", projects: "Major projects completed", units: "Units delivered" },
  footer: {
    description:
      "Temer Properties helps you buy apartments, modern homes and commercial shops in Addis Ababa, with clear prices, flexible payment plans and online site-visit booking.",
    buy: "Buy",
    forSale: (plural) => `${plural} for sale`,
    ourProjects: "Projects",
    areas: "Areas",
    propertyIn: (area) => `Property in ${area}`,
    visitOrCall: "Visit or call us",
    hours: "Monday – Saturday, 6:00 AM – 8:00 PM",
    aboutUs: "About us",
    faq: "FAQ",
    buyerGuides: "Buyer guides",
    contact: "Contact",
    privacy: "Privacy policy",
    terms: "Terms of use",
    staffLogin: "Staff login",
    rights: (year) => `© ${year} Temer Properties. All rights reserved.`,
    address: "Ethiopia",
  },
  search: {
    type: "Property type",
    area: "Area",
    bedrooms: "Bedrooms",
    maxPrice: "Max price",
    search: "Search",
    allTypes: "All types",
    allAreas: "All areas",
    any: "Any",
    anyPrice: "Any price",
    nBedrooms: (n) => `${n}+ bedrooms`,
    upTo: (m) => `Up to ETB ${m}M`,
  },
  home: {
    title: "Temer Properties | Apartments, Homes & Shops for Sale in Addis Ababa",
    description:
      "Buy new apartments, homes and commercial shops in Addis Ababa directly from Temer Properties. Compare prices, sizes and payment plans in Sarbet, Megenagna, Ayat and more, then book a free site visit online.",
    h1: "Apartments, homes & shops for sale in Addis Ababa",
    lead: (name) => `Buy directly from ${name}. Compare real prices, sizes and payment plans, then book a free site visit.`,
    browse: "Browse properties",
    latestTitle: "Check out our latest properties for sale",
    latestCount: (n) => `${n} ${n === 1 ? "property" : "properties"} available`,
    viewAvailable: "View available properties",
    showcase: {
      forSaleIn: "For sale in",
      typology: (b) => (b === 0 ? "Studio" : `${b} Bedroom`),
      shops: "Shops",
      other: "Other units",
      from: "from",
      total: "Total price",
      advance: (p) => `${p}% advance`,
      shopsTitle: "Commercial shops for sale",
      shopsIntro: (n, from) => `${n} ${n === 1 ? "site" : "sites"}${from ? `, from ${from}` : ""}`,
      startingPrice: "Starting price",
      viewProject: "View project",
    },
    projectsTitle: "Projects",
    projectsDesc: "Now selling, under construction and delivered.",
    projectsCount: (n) => `${n} ${n === 1 ? "project" : "projects"}`,
    viewAllProjects: "View all projects",
    projectsPrevious: "Previous projects",
    projectsNext: "More projects",
    areaTitle: "Property by area",
    areaDesc: "Homes and shops in every part of Addis Ababa.",
    alsoIn: "Also in:",
    buyingTitle: "Buying with Temer Properties",
    buyingDesc: "A clear, four-step process from your first visit to getting your keys.",
    step: (n) => `Step ${n}`,
    steps: [
      { title: "Choose", text: "Compare apartments, homes and shops by area, size, price and payment plan.", cta: "Browse properties" },
      { title: "Visit", text: "Book a free site visit or a live video walkthrough at a time that suits you.", cta: "Book a visit" },
      { title: "Reserve", text: "Agree the payment plan and reserve your unit with a down payment.", cta: "Talk to sales" },
      { title: "Move in", text: "Follow construction progress and receive your keys at handover.", cta: "See the projects" },
    ],
    faqTitle: "Common questions",
    faqDesc: "Quick answers about payments, site visits and buying from abroad.",
    deliveredTitle: "Projects we have delivered",
    deliveredDesc: "Completed buildings handed over to their owners.",
    adviceTitle: "Advice for property buyers",
    comeAndSee: "Come and see it",
    visitTitle: "See it for yourself: book a free site visit",
    visitText:
      "Walk through finished units and active construction sites with our sales team, in person or on a live video call from abroad.",
    visitOffice: "Visit our office",
    addressLabel: "Address",
    hoursLabel: "Opening hours",
    phoneLabel: "Phone",
    directions: "Get directions",
    propertiesWord: (n) => (n === 1 ? "property" : "properties"),
    projectCount: (n) => `${n} ${n === 1 ? "project" : "projects"}`,
    propertyCount: (n) => `${n} ${n === 1 ? "property" : "properties"}`,
  },
};

const am: Dictionary = {
  brand: { name: "ቴምር", sub: "ፕሮፐርቲስ", full: "ቴምር ፕሮፐርቲስ" },
  office: { street: "ወልደማርያም ሕንፃ፣ ከሳርቤት ወደ ቄራ በሚወስደው መንገድ", locality: "አዲስ አበባ" },
  nav: { home: "መነሻ", properties: "ንብረቶች", projects: "ፕሮጀክቶች", locations: "አካባቢዎች", about: "ስለ እኛ", guides: "የግዢ መመሪያዎች", contact: "አግኙን" },
  common: {
    bookVisit: "ጉብኝት ይያዙ",
    bookSiteVisit: "የቦታ ጉብኝት ይያዙ",
    bookFreeVisit: "ነፃ የቦታ ጉብኝት ይያዙ",
    skip: "ወደ ዋናው ይዘት ዝለል",
    callUs: (phone) => `ይደውሉልን፦ ${phone}`,
    call: "ይደውሉ",
    whatsapp: "ዋትስአፕ",
    askUs: "ይጠይቁን",
    whatsappUs: "በዋትስአፕ ያግኙን",
    openMenu: "ምናሌ ክፈት",
    closeMenu: "ምናሌ ዝጋ",
    language: "ቋንቋ",
    switchTo: "ወደ እንግሊዝኛ ቀይር",
    quickContact: "ፈጣን ግንኙነት",
    contactOptions: "ያግኙን፦ ስልክ ወይም ዋትስአፕ",
    closeContactOptions: "የመገናኛ አማራጮችን ዝጋ",
    viewDetails: "ዝርዝር ይመልከቱ",
    viewProject: "ፕሮጀክቱን ይመልከቱ",
    showContact: "የመገናኛ አማራጮችን አሳይ",
    hideContact: "የመገናኛ አማራጮችን ደብቅ",
    priceOnRequest: "ዋጋ በጥያቄ",
    studio: "ስቱዲዮ",
    bed: "መኝታ",
    toilets: (n) => `${n} መጸዳጃ ቤት`,
    allProperties: "ሁሉም ንብረቶች",
    allProjects: "ሁሉም ፕሮጀክቶች",
    allAreas: "ሁሉም አካባቢዎች",
    allGuides: "ሁሉም መመሪያዎች",
    allQuestions: "ሁሉም ጥያቄዎች",
    photos: "ፎቶዎች",
  },
  types: {
    apartment: { label: "አፓርታማ", plural: "አፓርታማዎች" },
    villa: { label: "ቪላ", plural: "ቪላዎችና ቤቶች" },
    townhouse: { label: "ታውን ሃውስ", plural: "ታውን ሃውሶች" },
    shop: { label: "የንግድ ሱቅ", plural: "የንግድ ሱቆች" },
    office: { label: "ቢሮ", plural: "ቢሮዎች" },
  },
  propertyStatus: { available: "ይገኛል", reserved: "ተይዟል", sold: "ተሽጧል" },
  projectStatus: { pre_launch: "ከመጀመሪያ በፊት", under_construction: "በግንባታ ላይ", selling: "ለሽያጭ", delivered: "ተረክቧል" },
  stats: { customers: "ደስተኛ ደንበኞች", projects: "የተጠናቀቁ ዋና ፕሮጀክቶች", units: "የተረከቡ ክፍሎች" },
  footer: {
    description:
      "ቴምር ፕሮፐርቲስ በአዲስ አበባ አፓርታማዎችን፣ ዘመናዊ ቤቶችንና የንግድ ሱቆችን በግልጽ ዋጋና በተመቻቸ የክፍያ ዕቅድ እንዲገዙ ይረዳዎታል፤ የቦታ ጉብኝትም በኢንተርኔት ይያዙ።",
    buy: "ግዙ",
    forSale: (plural) => `ለሽያጭ የቀረቡ ${plural}`,
    ourProjects: "ፕሮጀክቶች",
    areas: "አካባቢዎች",
    propertyIn: (area) => `በ${area} ያሉ ንብረቶች`,
    visitOrCall: "ይጎብኙን ወይም ይደውሉልን",
    hours: "ሰኞ – ቅዳሜ፣ ከጠዋቱ 6:00 እስከ ምሽቱ 8:00",
    aboutUs: "ስለ እኛ",
    faq: "ተደጋጋሚ ጥያቄዎች",
    buyerGuides: "የገዢ መመሪያዎች",
    contact: "አግኙን",
    privacy: "የግላዊነት መመሪያ",
    terms: "የአጠቃቀም ደንቦች",
    staffLogin: "የሠራተኞች መግቢያ",
    rights: (year) => `© ${year} ቴምር ፕሮፐርቲስ። መብቱ በሕግ የተጠበቀ ነው።`,
    address: "ኢትዮጵያ",
  },
  search: {
    type: "የንብረት ዓይነት",
    area: "አካባቢ",
    bedrooms: "መኝታ ክፍሎች",
    maxPrice: "ከፍተኛ ዋጋ",
    search: "ፈልግ",
    allTypes: "ሁሉም ዓይነቶች",
    allAreas: "ሁሉም አካባቢዎች",
    any: "ማንኛውም",
    anyPrice: "ማንኛውም ዋጋ",
    nBedrooms: (n) => `${n}+ መኝታ ክፍሎች`,
    upTo: (m) => `እስከ ${m} ሚሊዮን ብር`,
  },
  home: {
    title: "ቴምር ፕሮፐርቲስ | በአዲስ አበባ ለሽያጭ የቀረቡ አፓርታማዎች፣ ቤቶችና ሱቆች",
    description:
      "በአዲስ አበባ አዳዲስ አፓርታማዎችን፣ ቤቶችንና የንግድ ሱቆችን ከቴምር ፕሮፐርቲስ ይግዙ። በሳርቤት፣ በመገናኛ፣ በአያት እና በሌሎችም አካባቢዎች ያሉ ዋጋዎችን፣ ስፋቶችንና የክፍያ ዕቅዶችን ያወዳድሩ፣ ከዚያም ነፃ የቦታ ጉብኝት በኢንተርኔት ይያዙ።",
    h1: "በአዲስ አበባ ለሽያጭ የቀረቡ አፓርታማዎች፣ ቤቶችና ሱቆች",
    lead: () => `ከቴምር ፕሮፐርቲስ ይግዙ። ትክክለኛ ዋጋ፣ ስፋትና የክፍያ ዕቅድ ያወዳድሩ፣ ከዚያም ነፃ የቦታ ጉብኝት ይያዙ።`,
    browse: "ንብረቶችን ይመልከቱ",
    latestTitle: "ለሽያጭ የቀረቡ አዳዲስ ንብረቶቻችንን ይመልከቱ",
    latestCount: (n) => `${n} ንብረቶች ይገኛሉ`,
    viewAvailable: "የሚገኙ ንብረቶችን ይመልከቱ",
    showcase: {
      forSaleIn: "ለሽያጭ የቀረበ፦",
      typology: (b) => (b === 0 ? "ስቱዲዮ" : `ባለ ${b} መኝታ`),
      shops: "ሱቆች",
      other: "ሌሎች ቤቶች",
      from: "ከ",
      total: "ጠቅላላ ዋጋ",
      advance: (p) => `${p}% ቅድመ ክፍያ`,
      shopsTitle: "ለሽያጭ የቀረቡ የንግድ ሱቆች",
      shopsIntro: (n, from) => `በ${n} ሳይቶች${from ? `፣ ከ${from} ጀምሮ` : ""}`,
      startingPrice: "መነሻ ዋጋ",
      viewProject: "ፕሮጀክቱን ይመልከቱ",
    },
    projectsTitle: "ፕሮጀክቶች",
    projectsDesc: "አሁን በሽያጭ ላይ ያሉ፣ በግንባታ ላይ ያሉና የተረከቡ።",
    projectsCount: (n) => `${n} ፕሮጀክቶች`,
    viewAllProjects: "ሁሉንም ፕሮጀክቶች ይመልከቱ",
    projectsPrevious: "ቀዳሚ ፕሮጀክቶች",
    projectsNext: "ተጨማሪ ፕሮጀክቶች",
    areaTitle: "ንብረት በአካባቢ",
    areaDesc: "በሁሉም የአዲስ አበባ ክፍሎች ያሉ ቤቶችና ሱቆች።",
    alsoIn: "እንዲሁም፦",
    buyingTitle: "ከቴምር ፕሮፐርቲስ ጋር መግዛት",
    buyingDesc: "ከመጀመሪያው ጉብኝት እስከ ቁልፍ ርክክብ ድረስ ግልጽ የአራት ደረጃ ሂደት።",
    step: (n) => `ደረጃ ${n}`,
    steps: [
      { title: "ይምረጡ", text: "አፓርታማዎችን፣ ቤቶችንና ሱቆችን በአካባቢ፣ በስፋት፣ በዋጋና በክፍያ ዕቅድ ያወዳድሩ።", cta: "ንብረቶችን ይመልከቱ" },
      { title: "ይጎብኙ", text: "ለእርስዎ በሚስማማ ሰዓት ነፃ የቦታ ጉብኝት ወይም የቀጥታ የቪዲዮ ጉብኝት ይያዙ።", cta: "ጉብኝት ይያዙ" },
      { title: "ይያዙ", text: "የክፍያ ዕቅዱን ተስማምተው በቅድመ ክፍያ ክፍልዎን ይያዙ።", cta: "ከሽያጭ ቡድን ጋር ይነጋገሩ" },
      { title: "ይግቡ", text: "የግንባታውን ሂደት ይከታተሉና በርክክብ ቀን ቁልፍዎን ይረከቡ።", cta: "ፕሮጀክቶቹን ይመልከቱ" },
    ],
    faqTitle: "ተደጋጋሚ ጥያቄዎች",
    faqDesc: "ስለ ክፍያ፣ ስለ የቦታ ጉብኝትና ከውጭ አገር ስለመግዛት ፈጣን መልሶች።",
    deliveredTitle: "ያስረከብናቸው ፕሮጀክቶች",
    deliveredDesc: "ለባለቤቶቻቸው የተላለፉ የተጠናቀቁ ሕንፃዎች።",
    adviceTitle: "ለንብረት ገዢዎች ምክር",
    comeAndSee: "መጥተው ይዩት",
    visitTitle: "በዓይንዎ ይመልከቱ፦ ነፃ የቦታ ጉብኝት ይያዙ",
    visitText:
      "ከሽያጭ ቡድናችን ጋር የተጠናቀቁ ክፍሎችንና እየተገነቡ ያሉ ቦታዎችን በአካል ወይም ከውጭ አገር በቀጥታ የቪዲዮ ጥሪ ይጎብኙ።",
    visitOffice: "ቢሮአችንን ይጎብኙ",
    addressLabel: "አድራሻ",
    hoursLabel: "የሥራ ሰዓት",
    phoneLabel: "ስልክ",
    directions: "አቅጣጫ ያግኙ",
    propertiesWord: () => "ንብረቶች",
    projectCount: (n) => `${n} ፕሮጀክቶች`,
    propertyCount: (n) => `${n} ንብረቶች`,
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, am };

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang];
}

/** Pages whose content is translated. Other /am pages are English with a translated header and footer. */
export const translatedPaths: readonly string[] = ["/"];

/** Amharic spellings of the area names we have pages for. Names not listed here (new areas) show as written. */
const amharicAreas: Record<string, string> = {
  sarbet: "ሳርቤት",
  megenagna: "መገናኛ",
  ayat: "አያት",
  "haile garment": "ሃይሌ ጋርመንት",
  piassa: "ፒያሳ",
  bulgaria: "ቡልጋሪያ",
  gelan: "ገላን",
  lebu: "ለቡ",
  "atena tera": "አጠና ተራ",
};

export function localizedAreaName(lang: Locale, name: string): string {
  return lang === "am" ? (amharicAreas[name.trim().toLowerCase()] ?? name) : name;
}
