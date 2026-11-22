import type { Locale } from "@/lib/i18n/config";

/**
 * Text for the property pages: /properties, /properties/[slug] and their components (filters, gallery, contact
 * panel, cards). Listing content (titles, descriptions, features, payment plans) comes from the database and is not
 * translated here. The Amharic text is a first draft for a native speaker to review.
 */
export type PropertiesDict = {
  list: {
    title: string;
    description: string;
    breadcrumb: string;
    h1: string;
    intro: string;
    found: (n: number) => string;
    pageOf: (page: number, count: number) => string;
    clear: string;
    noMatchTitle: string;
    noMatchText: string;
    showAll: string;
    askSales: string;
    browseType: string;
    forSale: (plural: string) => string;
    browseArea: string;
  };
  filters: {
    type: string;
    allTypes: string;
    area: string;
    allAreas: string;
    bedrooms: string;
    anyBedrooms: string;
    nBedrooms: (n: number) => string;
    maxPrice: string;
    anyPrice: string;
    upTo: (millions: number) => string;
    sortBy: string;
    search: string;
    sorts: Record<"recommended" | "newest" | "price-asc" | "price-desc" | "size-desc", string>;
  };
  card: { bedrooms: string; bathrooms: string; area: string; photos: string };
  detail: {
    breadcrumb: string;
    facts: { type: string; bedrooms: string; toilets: string; area: string; floor: string; handover: string };
    studio: string;
    groundFloor: string;
    basement: (n: number) => string;
    floorN: (n: number) => string;
    sold: string;
    soldLink: string;
    keyFacts: string;
    description: string;
    features: string;
    paymentPlan: string;
    confirmTerms: string;
    video: string;
    partOfProject: string;
    seeProject: string;
    location: string;
    locationLine: (type: string, area: string, city: string) => string;
    areaGuide: (area: string) => string;
    orBrowse: string;
    allForSale: (plural: string) => string;
    openMaps: string;
    updated: string;
    reference: (id: number) => string;
    asideLabel: string;
    orBook: string;
    similarTitle: string;
    interestedSimilar: string;
    bookVisit: string;
    bookHint: string;
    similarHeading: string;
    addis: string;
    priceOnRequest: string;
  };
  gallery: {
    openPhoto: (i: number, n: number) => string;
    viewAll: (n: number) => string;
    close: string;
    previous: string;
    next: string;
    photosOf: (title: string) => string;
    photoN: (title: string, i: number) => string;
  };
  contact: {
    about: (subject: string) => string;
    call: string;
    whatsappUs: string;
    telegram: string;
    email: string;
    message: (subject: string) => string;
  };
};

const en: PropertiesDict = {
  list: {
    title: "Properties for Sale in Addis Ababa",
    description:
      "Browse apartments, homes and commercial shops for sale in Addis Ababa. Filter by area, type, bedrooms and price, compare payment plans, and book a free site visit.",
    breadcrumb: "Properties",
    h1: "Properties for sale in Addis Ababa",
    intro:
      "Every listing below is sold directly by Temer Properties: real prices in Ethiopian Birr, real floor areas and the payment options for each unit.",
    found: (n) => `${n} ${n === 1 ? "property" : "properties"} found`,
    pageOf: (page, count) => ` · page ${page} of ${count}`,
    clear: "Clear filters",
    noMatchTitle: "No properties match these filters",
    noMatchText:
      "Try a different area or price range, or tell us what you need. New units are released regularly and not every unit is listed online.",
    showAll: "Show all properties",
    askSales: "Ask our sales team",
    browseType: "Browse by property type",
    forSale: (plural) => `${plural} for sale`,
    browseArea: "Browse by area",
  },
  filters: {
    type: "Property type",
    allTypes: "All property types",
    area: "Area",
    allAreas: "All areas",
    bedrooms: "Bedrooms",
    anyBedrooms: "Any bedrooms",
    nBedrooms: (n) => `${n}+ bedrooms`,
    maxPrice: "Maximum price",
    anyPrice: "Any price",
    upTo: (m) => `Up to ETB ${m}M`,
    sortBy: "Sort by",
    search: "Search",
    sorts: {
      recommended: "Recommended",
      newest: "Newest",
      "price-asc": "Price: low to high",
      "price-desc": "Price: high to low",
      "size-desc": "Largest first",
    },
  },
  card: { bedrooms: "Bedrooms", bathrooms: "Bathrooms", area: "Area", photos: "photos" },
  detail: {
    breadcrumb: "Properties",
    facts: { type: "Type", bedrooms: "Bedrooms", toilets: "Toilets", area: "Area", floor: "Floor", handover: "Handover" },
    studio: "Studio",
    groundFloor: "Ground floor",
    basement: (n) => `Basement ${n}`,
    floorN: (n) => {
      const mod100 = n % 100;
      const suffix = mod100 >= 11 && mod100 <= 13 ? "th" : (({ 1: "st", 2: "nd", 3: "rd" }) as Record<number, string>)[n % 10] ?? "th";
      return `${n}${suffix} floor`;
    },
    sold: "This property has been sold. See similar available properties below, or",
    soldLink: "tell us what you are looking for",
    keyFacts: "Key facts",
    description: "Description",
    features: "Features",
    paymentPlan: "Payment plan",
    confirmTerms: "Confirm current terms with our sales team before reserving.",
    video: "Watch the video tour",
    partOfProject: "Part of the project",
    seeProject: "See the project and other units",
    location: "Location",
    locationLine: (type, area, city) => `This ${type} is in ${area}, ${city}.`,
    areaGuide: (area) => `Read our ${area} area guide`,
    orBrowse: "or browse",
    allForSale: (plural) => `all ${plural} for sale`,
    openMaps: "Open in Google Maps",
    updated: "Listing updated",
    reference: (id) => `Reference #${id}.`,
    asideLabel: "Contact and book a site visit",
    orBook: "Or book a free site visit and a sales person will show you around.",
    similarTitle: "Interested in similar units?",
    interestedSimilar: "Interested in similar units?",
    bookVisit: "Book a site visit",
    bookHint: "Pick a time; we'll call to confirm. Free, no obligation.",
    similarHeading: "Similar properties",
    addis: "Addis Ababa",
    priceOnRequest: "Price on request",
  },
  gallery: {
    openPhoto: (i, n) => `Open photo ${i} of ${n}`,
    viewAll: (n) => `View all ${n} photos`,
    close: "Close",
    previous: "Previous photo",
    next: "Next photo",
    photosOf: (title) => `${title}: photos`,
    photoN: (title, i) => `${title}, photo ${i}`,
  },
  contact: {
    about: (subject) => `Contact us about ${subject}`,
    call: "Call",
    whatsappUs: "WhatsApp us",
    telegram: "Telegram",
    email: "Email",
    message: (subject) => `Hello Temer Properties, I'm interested in: ${subject}`,
  },
};

const am: PropertiesDict = {
  list: {
    title: "በአዲስ አበባ ለሽያጭ የቀረቡ ንብረቶች",
    description:
      "በአዲስ አበባ ለሽያጭ የቀረቡ አፓርታማዎችን፣ ቤቶችንና የንግድ ሱቆችን ይመልከቱ። በአካባቢ፣ በዓይነት፣ በመኝታ ክፍል ብዛትና በዋጋ ያጣሩ፣ የክፍያ ዕቅዶችን ያወዳድሩ፣ ነፃ የቦታ ጉብኝትም ይያዙ።",
    breadcrumb: "ንብረቶች",
    h1: "በአዲስ አበባ ለሽያጭ የቀረቡ ንብረቶች",
    intro:
      "ከዚህ በታች ያሉት ሁሉም ንብረቶች በቀጥታ በቴምር ፕሮፐርቲስ የሚሸጡ ናቸው፦ በኢትዮጵያ ብር ትክክለኛ ዋጋ፣ ትክክለኛ የወለል ስፋትና ለእያንዳንዱ ክፍል የሚሆኑ የክፍያ አማራጮች።",
    found: (n) => `${n} ንብረቶች ተገኝተዋል`,
    pageOf: (page, count) => ` · ገጽ ${page} ከ${count}`,
    clear: "ማጣሪያዎችን አጽዳ",
    noMatchTitle: "ከእነዚህ ማጣሪያዎች ጋር የሚመሳሰል ንብረት የለም",
    noMatchText:
      "ሌላ አካባቢ ወይም የዋጋ ክልል ይሞክሩ፣ ወይም የሚፈልጉትን ይንገሩን። አዳዲስ ክፍሎች በየጊዜው ይለቀቃሉ፣ ሁሉም ክፍሎች ግን በኢንተርኔት አይዘረዘሩም።",
    showAll: "ሁሉንም ንብረቶች አሳይ",
    askSales: "የሽያጭ ቡድናችንን ይጠይቁ",
    browseType: "በንብረት ዓይነት ይመልከቱ",
    forSale: (plural) => `ለሽያጭ የቀረቡ ${plural}`,
    browseArea: "በአካባቢ ይመልከቱ",
  },
  filters: {
    type: "የንብረት ዓይነት",
    allTypes: "ሁሉም የንብረት ዓይነቶች",
    area: "አካባቢ",
    allAreas: "ሁሉም አካባቢዎች",
    bedrooms: "መኝታ ክፍሎች",
    anyBedrooms: "ማንኛውም የመኝታ ክፍል ብዛት",
    nBedrooms: (n) => `${n}+ መኝታ ክፍሎች`,
    maxPrice: "ከፍተኛ ዋጋ",
    anyPrice: "ማንኛውም ዋጋ",
    upTo: (m) => `እስከ ${m} ሚሊዮን ብር`,
    sortBy: "ደርድር በ",
    search: "ፈልግ",
    sorts: {
      recommended: "የሚመከሩ",
      newest: "አዲስ የገቡ",
      "price-asc": "ዋጋ፦ ከዝቅተኛ ወደ ከፍተኛ",
      "price-desc": "ዋጋ፦ ከከፍተኛ ወደ ዝቅተኛ",
      "size-desc": "ትልቁ መጀመሪያ",
    },
  },
  card: { bedrooms: "መኝታ ክፍሎች", bathrooms: "መጸዳጃ ቤቶች", area: "ስፋት", photos: "ፎቶዎች" },
  detail: {
    breadcrumb: "ንብረቶች",
    facts: { type: "ዓይነት", bedrooms: "መኝታ ክፍሎች", toilets: "መጸዳጃ ቤቶች", area: "ስፋት", floor: "ወለል", handover: "ርክክብ" },
    studio: "ስቱዲዮ",
    groundFloor: "ምድር ወለል",
    basement: (n) => `ምድር ቤት ${n}`,
    floorN: (n) => `${n}ኛ ፎቅ`,
    sold: "ይህ ንብረት ተሽጧል። ከዚህ በታች ተመሳሳይ የሚገኙ ንብረቶችን ይመልከቱ፣ ወይም",
    soldLink: "የሚፈልጉትን ይንገሩን",
    keyFacts: "ዋና ዋና መረጃዎች",
    description: "መግለጫ",
    features: "ገጽታዎች",
    paymentPlan: "የክፍያ ዕቅድ",
    confirmTerms: "ከመያዝዎ በፊት አሁን ያሉትን ውሎች ከሽያጭ ቡድናችን ጋር ያረጋግጡ።",
    video: "የቪዲዮ ጉብኝቱን ይመልከቱ",
    partOfProject: "የፕሮጀክቱ አካል",
    seeProject: "ፕሮጀክቱንና ሌሎች ክፍሎችን ይመልከቱ",
    location: "አካባቢ",
    locationLine: (type, area, city) => `ይህ ${type} የሚገኘው በ${area}፣ ${city} ነው።`,
    areaGuide: (area) => `የ${area} አካባቢ መመሪያችንን ያንብቡ`,
    orBrowse: "ወይም ይመልከቱ",
    allForSale: (plural) => `ለሽያጭ የቀረቡ ሁሉንም ${plural}`,
    openMaps: "በጉግል ካርታ ክፈት",
    updated: "ዝርዝሩ የተዘመነው",
    reference: (id) => `ማጣቀሻ ቁጥር #${id}።`,
    asideLabel: "ያግኙን እና የቦታ ጉብኝት ይያዙ",
    orBook: "ወይም ነፃ የቦታ ጉብኝት ይያዙ፣ የሽያጭ ባለሙያ ያስጎበኝዎታል።",
    similarTitle: "ተመሳሳይ ክፍሎች ይፈልጋሉ?",
    interestedSimilar: "ተመሳሳይ ክፍሎች ይፈልጋሉ?",
    bookVisit: "የቦታ ጉብኝት ይያዙ",
    bookHint: "ሰዓት ይምረጡ፤ ለማረጋገጥ እንደውልልዎታለን። ነፃ ነው፣ ምንም ግዴታ የለውም።",
    similarHeading: "ተመሳሳይ ንብረቶች",
    addis: "አዲስ አበባ",
    priceOnRequest: "ዋጋ በጥያቄ",
  },
  gallery: {
    openPhoto: (i, n) => `ፎቶ ${i} ከ${n} ክፈት`,
    viewAll: (n) => `ሁሉንም ${n} ፎቶዎች ይመልከቱ`,
    close: "ዝጋ",
    previous: "ቀዳሚ ፎቶ",
    next: "ቀጣይ ፎቶ",
    photosOf: (title) => `${title}፦ ፎቶዎች`,
    photoN: (title, i) => `${title}፣ ፎቶ ${i}`,
  },
  contact: {
    about: (subject) => `ስለ ${subject} ያግኙን`,
    call: "ይደውሉ",
    whatsappUs: "በዋትስአፕ ያግኙን",
    telegram: "ቴሌግራም",
    email: "ኢሜይል",
    message: (subject) => `ሰላም ቴምር ፕሮፐርቲስ፣ ይህን ንብረት ለመግዛት ፍላጎት አለኝ፦ ${subject}`,
  },
};

const dicts: Record<Locale, PropertiesDict> = { en, am };

export function getPropertiesDict(lang: Locale): PropertiesDict {
  return dicts[lang];
}
