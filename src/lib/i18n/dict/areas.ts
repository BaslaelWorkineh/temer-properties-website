import type { PropertyType } from "@/lib/config/property-types";
import { propertyTypes } from "@/lib/config/property-types";
import type { Locale } from "@/lib/i18n/config";
import { localizedAreaName } from "@/lib/i18n/dictionaries";
import { pluralize } from "@/lib/utils";

/**
 * Text for the projects, areas (locations) and property-type hub pages, plus the carousel / placeholder strings.
 * Database content (project names, summaries, descriptions, FAQs, area descriptions) is not translated here.
 * The Amharic text is a first draft: have a native speaker review it before launch.
 */

const amharicCities: Record<string, string> = { "addis ababa": "አዲስ አበባ" };

/** "Addis Ababa" -> "አዲስ አበባ" in Amharic; other city names show as written. */
export function cityName(lang: Locale, city: string): string {
  return lang === "am" ? (amharicCities[city.trim().toLowerCase()] ?? city) : city;
}

/**
 * Amharic "in <area>" ("በሳርቤት"). The prefix is attached only to an Amharic spelling; an area without a known
 * Amharic spelling (a newly added one) keeps its Latin name, so it is written after a space ("በ Summit").
 */
export function inArea(name: string): string {
  const a = localizedAreaName("am", name);
  return a !== name ? `በ${a}` : `በ ${name}`;
}

/** Amharic "of <area>" ("የሳርቤት"), same rule as inArea. */
export function ofArea(name: string): string {
  const a = localizedAreaName("am", name);
  return a !== name ? `የ${a}` : `የ ${name}`;
}

export type AreasDict = {
  addisAbaba: string;
  common: {
    placeholderProject: string;
    carouselScroll: (label: string) => string;
    slideOf: (index: number, total: number) => string;
    chooseProject: string;
    goToProject: (n: number) => string;
    unitsDelivered: (n: number) => string;
    completedProject: string;
    unitsListed: (n: number) => string;
    askAvailability: string;
    listings: (n: number) => string;
    projectsCount: (n: number) => string;
    seeAllProjects: string;
    registerInterest: string;
    tellUsWhatYouNeed: string;
  };
  projects: {
    title: string;
    description: string;
    breadcrumb: string;
    h1: string;
    lead: string;
    currentTitle: string;
    currentDesc: string;
    deliveredTitle: string;
    deliveredDesc: string;
    listName: string;
    ctaTitle: string;
    ctaText: string;
  };
  locations: {
    title: string;
    description: string;
    breadcrumb: string;
    h1: string;
    lead: string;
    listName: string;
    ctaTitle: string;
    ctaText: string;
  };
  projectDetail: {
    notFound: string;
    projectsCrumb: string;
    status: string;
    units: string;
    floors: string;
    delivered: string;
    completion: string;
    unitTypes: string;
    about: (name: string) => string;
    amenities: string;
    paymentPlan: string;
    openMaps: string;
    watchVideo: string;
    asideDelivered: string;
    asideActive: string;
    orBook: string;
    askAbout: string;
    askLead: string;
    visit: (name: string) => string;
    visitLead: string;
    unitsForSale: (name: string) => string;
    allHandedOver: string;
    notListed: string;
    questionsAbout: (name: string) => string;
  };
  locationDetail: {
    notFound: string;
    locationsCrumb: string;
    h1: (name: string) => string;
    counts: (properties: number, projects: number) => string;
    typesNav: (name: string) => string;
    typeLink: (plural: string, name: string, count: number) => string;
    listingsIn: (name: string) => string;
    seeAll: (total: number) => string;
    projectsIn: (name: string) => string;
    noListings: (name: string) => string;
    tellUs: string;
    noListingsTail: string;
    living: (name: string) => string;
    glance: (name: string) => string;
    faq: (name: string) => string;
    otherAreas: string;
    propertyIn: (name: string) => string;
    ctaTitle: (name: string) => string;
  };
  forSale: {
    notFound: string;
    propertiesCrumb: string;
    typeIntro: (type: PropertyType) => string;
    forSaleLabel: (plural: string) => string;
    hubTitle: (plural: string) => string;
    hubDescription: (count: number, label: string, intro: string) => string;
    hubH1: (plural: string) => string;
    available: (n: number) => string;
    byArea: (plural: string) => string;
    emptyTitle: (plural: string) => string;
    emptyText: string;
    otherTypes: string;
    locTitle: (plural: string, name: string, city: string) => string;
    locDescription: (total: number, label: string, name: string, city: string, summary: string) => string;
    locH1: (plural: string, name: string) => string;
    locLead: (total: number, label: string, name: string, city: string, min: number | null, max: number | null, summary: string) => string;
    widerPrefix: string;
    widerLink1: (plural: string) => string;
    widerMid: string;
    widerLink2: (name: string) => string;
    widerSuffix: string;
  };
};

const etb = (n: number) => `ETB ${n.toLocaleString("en-US")}`;
const birr = (n: number) => `${n.toLocaleString("en-US")} ብር`;

const en: AreasDict = {
  addisAbaba: "Addis Ababa",
  common: {
    placeholderProject: "Project",
    carouselScroll: (label) => `${label}, scroll sideways`,
    slideOf: (i, n) => `${i} of ${n}`,
    chooseProject: "Choose a project",
    goToProject: (n) => `Go to project ${n}`,
    unitsDelivered: (n) => `${n} units delivered`,
    completedProject: "Completed project",
    unitsListed: (n) => `${pluralize(n, "unit")} listed`,
    askAvailability: "Ask for availability",
    listings: (n) => pluralize(n, "listing"),
    projectsCount: (n) => pluralize(n, "project"),
    seeAllProjects: "See the projects",
    registerInterest: "Register your interest",
    tellUsWhatYouNeed: "Tell us what you need",
  },
  projects: {
    title: "Real Estate Projects in Addis Ababa",
    description:
      "Explore Temer Properties' current and completed real estate projects in Addis Ababa: apartment buildings and mixed-use developments with shops in Sarbet, Megenagna, Ayat, Haile Garment, Piassa and more.",
    breadcrumb: "Projects",
    h1: "Projects in Addis Ababa",
    lead: "Apartment buildings and mixed-use developments, from pre-launch to handed-over. Each project page lists available units, unit types, progress and how to book a visit.",
    currentTitle: "Current projects",
    currentDesc: "Selling now, under construction or launching soon.",
    deliveredTitle: "Delivered projects",
    deliveredDesc: "Completed buildings handed over to their owners.",
    listName: "Temer Properties projects",
    ctaTitle: "See it for yourself: book a free site visit",
    ctaText:
      "Walk through finished units and active construction sites with our sales team, in person or on a live video call from abroad.",
  },
  locations: {
    title: "Neighbourhoods: Where to Buy Property in Addis Ababa",
    description:
      "Area guides for buying property in Addis Ababa: Sarbet, Megenagna, Ayat, Haile Garment, Piassa, Bulgaria and more. See what each neighbourhood offers and the apartments and shops for sale there.",
    breadcrumb: "Locations",
    h1: "Where to buy property in Addis Ababa",
    lead: "Every neighbourhood has its own character, commute and price level. Explore the areas we sell in, with local guides and the homes and shops for sale in each.",
    listName: "Areas",
    ctaTitle: "See it for yourself: book a free site visit",
    ctaText:
      "Walk through finished units and active construction sites with our sales team, in person or on a live video call from abroad.",
  },
  projectDetail: {
    notFound: "Project not found",
    projectsCrumb: "Projects",
    status: "Status",
    units: "Units",
    floors: "Floors",
    delivered: "Delivered",
    completion: "Completion",
    unitTypes: "Unit types",
    about: (name) => `About ${name}`,
    amenities: "Amenities",
    paymentPlan: "Payment plan",
    openMaps: "Open in Google Maps",
    watchVideo: "Watch the video",
    asideDelivered: "Contact us",
    asideActive: "Contact and book a site visit",
    orBook: "Or book a free site visit and a sales person will show you around.",
    askAbout: "Ask about this project",
    askLead: "Resale or similar units elsewhere? We'll advise.",
    visit: (name) => `Visit ${name}`,
    visitLead: "In person or by video call. We'll call to confirm.",
    unitsForSale: (name) => `Units for sale at ${name}`,
    allHandedOver: "All units in this project have been handed over.",
    notListed: "Individual units are not listed online yet. Contact our sales team for current availability, floor plans and prices.",
    questionsAbout: (name) => `Questions about ${name}`,
  },
  locationDetail: {
    notFound: "Area not found",
    locationsCrumb: "Locations",
    h1: (name) => `Property for sale in ${name}`,
    counts: (p, j) => `${pluralize(p, "listing")} · ${pluralize(j, "project")}`,
    typesNav: (name) => `Property types in ${name}`,
    typeLink: (plural, name, count) => `${plural} in ${name} (${count})`,
    listingsIn: (name) => `Listings in ${name}`,
    seeAll: (total) => `See all ${total}`,
    projectsIn: (name) => `Projects in ${name}`,
    noListings: (name) => `We don't have listings in ${name} right now.`,
    tellUs: "Tell us what you need",
    noListingsTail: "and we'll let you know when units are released.",
    living: (name) => `Living in ${name}`,
    glance: (name) => `${name} at a glance`,
    faq: (name) => `Buying in ${name}: questions`,
    otherAreas: "Other areas",
    propertyIn: (name) => `Property in ${name}`,
    ctaTitle: (name) => `Visit our ${name} sites`,
  },
  forSale: {
    notFound: "Not found",
    propertiesCrumb: "Properties",
    typeIntro: (type) => propertyTypes[type].intro,
    forSaleLabel: (plural) => `${plural} for sale`,
    hubTitle: (plural) => `${plural} for Sale in Addis Ababa`,
    hubDescription: (count, label, intro) => `${count ? `${pluralize(count, label.toLowerCase())} for sale now. ` : ""}${intro}`,
    hubH1: (plural) => `${plural} for sale in Addis Ababa`,
    available: (n) => `${pluralize(n, "listing")} available`,
    byArea: (plural) => `${plural} by area`,
    emptyTitle: (plural) => `No ${plural.toLowerCase()} listed right now`,
    emptyText: "New units are released regularly. Tell us what you are looking for and our sales team will contact you first.",
    otherTypes: "Other property types",
    locTitle: (plural, name, city) => `${plural} for Sale in ${name}, ${city}`,
    locDescription: (total, label, name, city, summary) =>
      `${pluralize(total, label.toLowerCase())} for sale in ${name}, ${city}, offered by Temer Properties. ${summary} Compare prices and sizes, then book a free site visit.`,
    locH1: (plural, name) => `${plural} for sale in ${name}`,
    locLead: (total, label, name, city, min, max, summary) =>
      `${pluralize(total, label.toLowerCase())} for sale in ${name}, ${city}${
        min != null && max != null ? `, from ${etb(min)} to ${etb(max)}` : ""
      }. ${summary}`,
    widerPrefix: "Looking more widely? See ",
    widerLink1: (plural) => `all ${plural.toLowerCase()} for sale in Addis Ababa`,
    widerMid: " or ",
    widerLink2: (name) => `everything we offer in ${name}`,
    widerSuffix: ".",
  },
};

const amTypeIntro: Record<PropertyType, string> = {
  apartment:
    "በአዲስ አበባ ለሽያጭ የቀረቡ አዳዲስ ባለ አንድ፣ ባለ ሁለትና ባለ ሦስት መኝታ አፓርታማዎችን ይመልከቱ፤ ሁሉም በቴምር ፕሮፐርቲስ የሚቀርቡ ናቸው። እያንዳንዱ ዝርዝር ስፋቱን በካሬ ሜትር፣ ወለሉን፣ የሚገኝበትን ፕሮጀክትና የክፍያ አማራጮችን ስለሚያሳይ የቦታ ጉብኝት ከመያዝዎ በፊት በሳርቤት፣ በመገናኛ፣ በአያት፣ በሃይሌ ጋርመንትና በሌሎችም አካባቢዎች ያሉ ክፍሎችን ማወዳደር ይችላሉ።",
  villa:
    "በአዲስ አበባ ለሽያጭ የቀረቡ ዘመናዊ ቪላዎችንና የቤተሰብ ቤቶችን ያግኙ። እነዚህ ነጠላ ቤቶች የግል ክፍት ቦታ፣ ለሚያድግ ቤተሰብ ሰፊ ክፍልና ጸጥ ባለ የመኖሪያ መንደር ውስጥ የረጅም ጊዜ ዋጋ ለሚፈልጉ ገዢዎች ተስማሚ ናቸው።",
  townhouse:
    "ታውን ሃውስ የቤት ስፋትን ከሚተዳደር ግቢ ደኅንነትና የጋራ እንክብካቤ ጋር ያጣምራል። በአዲስ አበባ ለሽያጭ የቀረቡ ታውን ሃውሶችን ይመልከቱ፤ አቀማመጣቸውን፣ ስፋታቸውንና የክፍያ ዕቅዶቻቸውን ያወዳድሩ።",
  shop: "በአዲስ አበባ እንደ ፒያሳ፣ ሳርቤትና ቡልጋሪያ ባሉ ሥራ የሚበዛባቸው አካባቢዎች እንዲሁም በከተማዋ ደቡባዊ ጫፍ በምትገኘው ገላን የሚገኙ የንግድ ሱቆችን ይግዙ። ድብልቅ አገልግሎት ባላቸው ሕንፃዎች ውስጥ ያሉ ሱቆች ከላይ ባሉ ነዋሪዎችና ከቋሚ የመንገድ ላይ እንቅስቃሴ ስለሚጠቀሙ ለራሳቸው ለሚሠሩና ለባለሀብቶች ተመራጭ ናቸው።",
  office:
    "ኪራይ ከመክፈል ይልቅ የራሳቸውን ቢሮ መያዝ ለሚፈልጉ ኩባንያዎች በአዲስ አበባ ለሽያጭ የቀረበ የቢሮ ቦታ። ጉብኝት ከመያዝዎ በፊት የወለል ስፋቶችን፣ አካባቢዎችንና የመድረሻ መንገዶችን ያወዳድሩ።",
};

const am: AreasDict = {
  addisAbaba: "አዲስ አበባ",
  common: {
    placeholderProject: "ፕሮጀክት",
    carouselScroll: (label) => `${label}፣ ወደ ጎን ይሸብልሉ`,
    slideOf: (i, n) => `${i} ከ${n}`,
    chooseProject: "ፕሮጀክት ይምረጡ",
    goToProject: (n) => `ወደ ፕሮጀክት ${n} ሂድ`,
    unitsDelivered: (n) => `${n} ክፍሎች ተረክበዋል`,
    completedProject: "የተጠናቀቀ ፕሮጀክት",
    unitsListed: (n) => `${n} ክፍሎች ተዘርዝረዋል`,
    askAvailability: "ስለሚገኙ ክፍሎች ይጠይቁ",
    listings: (n) => `${n} ዝርዝሮች`,
    projectsCount: (n) => `${n} ፕሮጀክቶች`,
    seeAllProjects: "ፕሮጀክቶቹን ይመልከቱ",
    registerInterest: "ፍላጎትዎን ይመዝግቡ",
    tellUsWhatYouNeed: "የሚፈልጉትን ይንገሩን",
  },
  projects: {
    title: "በአዲስ አበባ የሪል እስቴት ፕሮጀክቶች",
    description:
      "የቴምር ፕሮፐርቲስን አሁን ያሉና የተጠናቀቁ የሪል እስቴት ፕሮጀክቶች በአዲስ አበባ ይመልከቱ፦ በሳርቤት፣ በመገናኛ፣ በአያት፣ በሃይሌ ጋርመንት፣ በፒያሳና በሌሎችም አካባቢዎች ያሉ የአፓርታማ ሕንፃዎችና ሱቆች ያሉባቸው ድብልቅ አገልግሎት ግንባታዎች።",
    breadcrumb: "ፕሮጀክቶች",
    h1: "በአዲስ አበባ ያሉ ፕሮጀክቶች",
    lead: "ከመጀመሪያ ዝግጅት ጀምሮ እስከ ርክክብ ድረስ ያሉ የአፓርታማ ሕንፃዎችና ድብልቅ አገልግሎት ግንባታዎች። እያንዳንዱ የፕሮጀክት ገጽ ያሉትን ክፍሎች፣ የክፍል ዓይነቶችን፣ የግንባታ ሂደትንና ጉብኝት እንዴት እንደሚያዝ ያሳያል።",
    currentTitle: "አሁን ያሉ ፕሮጀክቶች",
    currentDesc: "አሁን በሽያጭ ላይ ያሉ፣ በግንባታ ላይ ያሉ ወይም በቅርቡ የሚጀምሩ።",
    deliveredTitle: "የተረከቡ ፕሮጀክቶች",
    deliveredDesc: "ለባለቤቶቻቸው የተላለፉ የተጠናቀቁ ሕንፃዎች።",
    listName: "የቴምር ፕሮፐርቲስ ፕሮጀክቶች",
    ctaTitle: "በዓይንዎ ይመልከቱ፦ ነፃ የቦታ ጉብኝት ይያዙ",
    ctaText:
      "ከሽያጭ ቡድናችን ጋር የተጠናቀቁ ክፍሎችንና እየተገነቡ ያሉ ቦታዎችን በአካል ወይም ከውጭ አገር በቀጥታ የቪዲዮ ጥሪ ይጎብኙ።",
  },
  locations: {
    title: "መንደሮች፦ በአዲስ አበባ ንብረት የት መግዛት ይችላሉ",
    description:
      "በአዲስ አበባ ንብረት ለመግዛት የአካባቢ መመሪያዎች፦ ሳርቤት፣ መገናኛ፣ አያት፣ ሃይሌ ጋርመንት፣ ፒያሳ፣ ቡልጋሪያና ሌሎችም። እያንዳንዱ መንደር የሚያቀርበውንና እዚያ ለሽያጭ የቀረቡ አፓርታማዎችንና ሱቆችን ይመልከቱ።",
    breadcrumb: "አካባቢዎች",
    h1: "በአዲስ አበባ ንብረት የት መግዛት ይችላሉ",
    lead: "እያንዳንዱ መንደር የራሱ ባሕርይ፣ የመጓጓዣ ሁኔታና የዋጋ ደረጃ አለው። የምንሸጥባቸውን አካባቢዎች ከአካባቢ መመሪያዎችና በእያንዳንዳቸው ከሚገኙ ለሽያጭ የቀረቡ ቤቶችና ሱቆች ጋር ያስሱ።",
    listName: "አካባቢዎች",
    ctaTitle: "በዓይንዎ ይመልከቱ፦ ነፃ የቦታ ጉብኝት ይያዙ",
    ctaText:
      "ከሽያጭ ቡድናችን ጋር የተጠናቀቁ ክፍሎችንና እየተገነቡ ያሉ ቦታዎችን በአካል ወይም ከውጭ አገር በቀጥታ የቪዲዮ ጥሪ ይጎብኙ።",
  },
  projectDetail: {
    notFound: "ፕሮጀክቱ አልተገኘም",
    projectsCrumb: "ፕሮጀክቶች",
    status: "ሁኔታ",
    units: "ክፍሎች",
    floors: "ወለሎች",
    delivered: "የተረከበበት",
    completion: "የሚጠናቀቅበት",
    unitTypes: "የክፍል ዓይነቶች",
    about: (name) => `ስለ ${name}`,
    amenities: "አገልግሎቶች",
    paymentPlan: "የክፍያ ዕቅድ",
    openMaps: "በጉግል ካርታ ክፈት",
    watchVideo: "ቪዲዮውን ይመልከቱ",
    asideDelivered: "ያግኙን",
    asideActive: "ያግኙንና የቦታ ጉብኝት ይያዙ",
    orBook: "ወይም ነፃ የቦታ ጉብኝት ይያዙ፤ የሽያጭ ባለሙያ ያስጎበኝዎታል።",
    askAbout: "ስለዚህ ፕሮጀክት ይጠይቁ",
    askLead: "ድጋሚ ሽያጭ ወይም ሌላ ቦታ ተመሳሳይ ክፍሎች ይፈልጋሉ? እንመክርዎታለን።",
    visit: (name) => `ጉብኝት፦ ${name}`,
    visitLead: "በአካል ወይም በቪዲዮ ጥሪ። ለማረጋገጥ እንደውልልዎታለን።",
    unitsForSale: (name) => `ለሽያጭ የቀረቡ ክፍሎች፦ ${name}`,
    allHandedOver: "በዚህ ፕሮጀክት ያሉ ሁሉም ክፍሎች ተላልፈዋል።",
    notListed:
      "የነጠላ ክፍሎች ዝርዝር በኢንተርኔት ገና አልወጣም። አሁን ስላሉ ክፍሎች፣ ስለ ወለል ፕላኖችና ስለ ዋጋዎች የሽያጭ ቡድናችንን ያነጋግሩ።",
    questionsAbout: (name) => `ስለ ${name} የሚነሱ ጥያቄዎች`,
  },
  locationDetail: {
    notFound: "አካባቢው አልተገኘም",
    locationsCrumb: "አካባቢዎች",
    h1: (name) => `${inArea(name)} ለሽያጭ የቀረቡ ንብረቶች`,
    counts: (p, j) => `${p} ዝርዝሮች · ${j} ፕሮጀክቶች`,
    typesNav: (name) => `${inArea(name)} ያሉ የንብረት ዓይነቶች`,
    typeLink: (plural, name, count) => `${inArea(name)} ያሉ ${plural} (${count})`,
    listingsIn: (name) => `${inArea(name)} ያሉ ዝርዝሮች`,
    seeAll: (total) => `ሁሉንም ${total} ይመልከቱ`,
    projectsIn: (name) => `${inArea(name)} ያሉ ፕሮጀክቶች`,
    noListings: (name) => `በአሁኑ ጊዜ ${inArea(name)} ዝርዝር የለንም።`,
    tellUs: "የሚፈልጉትን ይንገሩን",
    noListingsTail: "ክፍሎች ሲለቀቁ እናሳውቅዎታለን።",
    living: (name) => `${inArea(name)} መኖር`,
    glance: (name) => `${name} በጨረፍታ`,
    faq: (name) => `${inArea(name)} መግዛት፦ ጥያቄዎች`,
    otherAreas: "ሌሎች አካባቢዎች",
    propertyIn: (name) => `${inArea(name)} ያሉ ንብረቶች`,
    ctaTitle: (name) => `${ofArea(name)} ቦታዎቻችንን ይጎብኙ`,
  },
  forSale: {
    notFound: "አልተገኘም",
    propertiesCrumb: "ንብረቶች",
    typeIntro: (type) => amTypeIntro[type],
    forSaleLabel: (plural) => `ለሽያጭ የቀረቡ ${plural}`,
    hubTitle: (plural) => `በአዲስ አበባ ለሽያጭ የቀረቡ ${plural}`,
    hubDescription: (count, label, intro) => `${count ? `${count} ${label} አሁን ለሽያጭ ቀርበዋል። ` : ""}${intro}`,
    hubH1: (plural) => `በአዲስ አበባ ለሽያጭ የቀረቡ ${plural}`,
    available: (n) => `${n} ዝርዝሮች ይገኛሉ`,
    byArea: (plural) => `${plural} በአካባቢ`,
    emptyTitle: (plural) => `በአሁኑ ጊዜ የተዘረዘሩ ${plural} የሉም`,
    emptyText: "አዳዲስ ክፍሎች በየጊዜው ይለቀቃሉ። የሚፈልጉትን ይንገሩን፤ የሽያጭ ቡድናችን በመጀመሪያ ያነጋግርዎታል።",
    otherTypes: "ሌሎች የንብረት ዓይነቶች",
    locTitle: (plural, name) => `${inArea(name)} ለሽያጭ የቀረቡ ${plural}`,
    locDescription: (total, label, name, city) =>
      `${total} ${label} ${inArea(name)}፣ ${cityName("am", city)} ለሽያጭ ቀርበዋል፤ በቴምር ፕሮፐርቲስ የሚቀርቡ። ዋጋዎችንና ስፋቶችን ያወዳድሩ፣ ከዚያም ነፃ የቦታ ጉብኝት ይያዙ።`,
    locH1: (plural, name) => `${inArea(name)} ለሽያጭ የቀረቡ ${plural}`,
    locLead: (total, label, name, city, min, max) =>
      `${total} ${label} ${inArea(name)}፣ ${cityName("am", city)} ለሽያጭ ቀርበዋል${
        min != null && max != null ? `፣ ከ${birr(min)} እስከ ${birr(max)}` : ""
      }።`,
    widerPrefix: "ሰፋ አድርገው ይፈልጋሉ? ",
    widerLink1: (plural) => `በአዲስ አበባ ለሽያጭ የቀረቡ ሁሉንም ${plural}`,
    widerMid: " ወይም ",
    widerLink2: (name) => `${inArea(name)} የምናቀርበውን ሁሉ`,
    widerSuffix: " ይመልከቱ።",
  },
};

const dicts: Record<Locale, AreasDict> = { en, am };

export function getAreasDict(lang: Locale): AreasDict {
  return dicts[lang];
}
