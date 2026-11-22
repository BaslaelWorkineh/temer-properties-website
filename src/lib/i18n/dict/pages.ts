import { ADDIS_TIME_ZONE } from "@/lib/dates";
import type { Locale } from "@/lib/i18n/config";

/**
 * Text for the static pages (about, contact, FAQ, privacy, terms), the blog UI, the 404 page and the call-to-action
 * band. Business data (phone, address, email) comes from src/lib/config/site.ts; blog titles, excerpts and bodies
 * come from the database and stay as written. The Amharic is a first draft for a native speaker to review.
 */
export type PagesDict = {
  brand: string;
  legalName: string;
  founded: string;
  hours: string;
  ethiopia: string;
  common: { home: string; contact: string; bookVisit: string; whatsapp: string; callPrefix: string };
  cta: { title: string; text: string; bookVisit: string; whatsapp: string; waMessage: string };
  notFound: { title: string; text: string; browse: string; projects: string; contact: string };
  about: {
    metaTitle: string;
    metaDescription: string;
    breadcrumb: string;
    h1: string;
    hero: string;
    whoTitle: string;
    p1: string;
    p2: string;
    p3: { pre: string; linkA: string; mid: string; linkB: string; post: string };
    stats: [string, string, string];
    licensed: string;
    driveTitle: string;
    values: Array<{ title: string; text: string }>;
    deliveredTitle: string;
  };
  contact: {
    metaTitle: string;
    metaDescription: (phone: string, street: string, hours: string) => string;
    breadcrumb: string;
    h1: string;
    intro: string;
    callSales: string;
    salesLine2: string;
    whatsapp: string;
    chat: string;
    telegram: string;
    messageUs: string;
    email: string;
    waMessage: string;
    office: string;
    directions: string;
    openingHours: string;
    sendTitle: string;
    sendText: string;
  };
  faq: {
    metaTitle: string;
    metaDescription: string;
    breadcrumb: string;
    h1: string;
    cantFind: string;
    askSales: string;
    groups: { Buying: string; Payments: string; Visits: string; Diaspora: string };
  };
  privacy: {
    metaTitle: string;
    metaDescription: (name: string) => string;
    breadcrumb: string;
    h1: string;
    intro: (legalName: string, name: string) => string;
    collectTitle: string;
    collect: string;
    useTitle: string;
    uses: string[];
    noSell: string;
    keepTitle: string;
    keep: string;
    choicesTitle: string;
    choices: { pre: string; mid: string; post: string };
    cookiesTitle: string;
    cookies: string;
  };
  terms: {
    metaTitle: string;
    metaDescription: (name: string) => string;
    breadcrumb: string;
    h1: string;
    listingTitle: string;
    listing: string;
    pricesTitle: string;
    prices: string;
    bookingsTitle: string;
    bookings: string;
    contactTitle: string;
    contact: { pre: string; post: string };
  };
  blog: {
    metaTitle: string;
    metaDescription: string;
    breadcrumb: string;
    h1: string;
    intro: string;
    comingSoon: string;
    guideLabel: string;
    by: (author: string) => string;
    updated: string;
    moreGuides: string;
  };
};

const en: PagesDict = {
  brand: "Temer Properties",
  legalName: "Eyerus Temer Properties",
  founded: "2010 E.C.",
  hours: "Monday – Saturday, 6:00 AM – 8:00 PM",
  ethiopia: "Ethiopia",
  common: { home: "Home", contact: "Contact", bookVisit: "Book a visit", whatsapp: "WhatsApp", callPrefix: "Call" },
  cta: {
    title: "See it for yourself: book a free site visit",
    text: "Walk through finished units and active construction sites with our sales team, in person or on a live video call from abroad.",
    bookVisit: "Book a visit",
    whatsapp: "WhatsApp",
    waMessage: "Hello Temer Properties, I would like to book a site visit.",
  },
  notFound: {
    title: "This page could not be found",
    text: "The property may have been sold or the link may be out of date. Try one of these instead:",
    browse: "Browse properties",
    projects: "Our projects",
    contact: "Contact us",
  },
  about: {
    metaTitle: "About Temer Properties: Real Estate Developer in Addis Ababa",
    metaDescription:
      "Founded in 2010 E.C., Temer Properties is a licensed real estate developer in Addis Ababa with 10+ completed projects and 400+ homes delivered. Our mission, values and track record.",
    breadcrumb: "About",
    h1: "About Temer Properties",
    hero: "A licensed and verified real estate developer building apartments, homes and shops across Addis Ababa since",
    whoTitle: "Who we are",
    p1: "Founded in {founded}, Temer Properties develops residential and mixed-use buildings in some of Addis Ababa's fastest-growing neighbourhoods, including Sarbet, Megenagna, Ayat, Haile Garment, Piassa and Bulgaria. We sell directly to buyers, so you deal with the same company that designs, builds and hands over your home.",
    p2: "Our buyers include first-time homeowners, growing families, business owners looking for a shop of their own, and Ethiopians abroad investing back home. For every one of them we aim for the same thing: a well-built property, a fair price and a payment plan that works.",
    p3: {
      pre: "",
      linkA: "See our current and completed projects",
      mid: " or ",
      linkB: "book a site visit",
      post: " to see our work in person.",
    },
    stats: ["Happy customers", "Major projects completed", "Units delivered"],
    licensed: "Licensed and verified real estate developer",
    driveTitle: "What drives us",
    values: [
      { title: "Mission", text: "To elevate the living experience in Addis Ababa with well-built, well-located homes and commercial spaces at fair prices." },
      { title: "Values", text: "Trust, integrity, a personalised approach and an unwavering commitment to excellence, from the first visit to handover." },
      { title: "Vision", text: "To redefine the way real estate is sold in Ethiopia: transparent prices, clear payment plans and honest timelines." },
    ],
    deliveredTitle: "Projects we have delivered",
  },
  contact: {
    metaTitle: "Contact Temer Properties",
    metaDescription: (phone, street, hours) =>
      `Call ${phone}, message us on WhatsApp or Telegram, or visit our office at ${street}, Addis Ababa. Open ${hours}.`,
    breadcrumb: "Contact",
    h1: "Contact us",
    intro: "Have a question? Let's find the right place for you. Our sales team replies quickly during office hours.",
    callSales: "Call sales",
    salesLine2: "Sales line 2",
    whatsapp: "WhatsApp",
    chat: "Chat with us",
    telegram: "Telegram",
    messageUs: "Message us",
    email: "Email",
    waMessage: "Hello Temer Properties, I have a question.",
    office: "Office",
    directions: "Get directions",
    openingHours: "Opening hours",
    sendTitle: "Send us a message",
    sendText: "Tell us what you are looking for and we'll call you back.",
  },
  faq: {
    metaTitle: "FAQ: Buying an Apartment or Shop in Addis Ababa",
    metaDescription:
      "Answers to common questions about buying an apartment or shop from Temer Properties: payment plans, reservations, site visits and buying from abroad.",
    breadcrumb: "FAQ",
    h1: "Frequently asked questions",
    cantFind: "Can't find your answer?",
    askSales: "Ask our sales team",
    groups: { Buying: "Buying a property", Payments: "Prices and payment plans", Visits: "Site visits", Diaspora: "Buying from abroad" },
  },
  privacy: {
    metaTitle: "Privacy Policy",
    metaDescription: (name) => `How ${name} collects, uses and protects the personal information you share through this website.`,
    breadcrumb: "Privacy policy",
    h1: "Privacy policy",
    intro: (legalName, name) =>
      `This policy explains how ${legalName} ("${name}", "we") handles personal information collected through this website.`,
    collectTitle: "What we collect",
    collect:
      "When you book a site visit or send an enquiry, we collect the details you enter: your name, phone number, email address (optional), preferred visit date and time, and your message. We also keep the page you sent it from.",
    useTitle: "How we use it",
    uses: [
      "To contact you about your enquiry or confirm your site visit.",
      "To share information about the properties you asked about.",
      "To keep records of bookings and improve our service.",
    ],
    noSell: "We do not sell your personal information. We share it only with staff who need it to respond to you.",
    keepTitle: "How long we keep it",
    keep: "We keep enquiry and booking records for as long as needed to serve you and meet legal obligations, then delete them.",
    choicesTitle: "Your choices",
    choices: {
      pre: "You can ask us to access, correct or delete your information at any time by emailing ",
      mid: " or calling ",
      post: ".",
    },
    cookiesTitle: "Cookies",
    cookies:
      "This website does not use advertising or tracking cookies. Staff who sign in to the admin area receive a security cookie that keeps them signed in.",
  },
  terms: {
    metaTitle: "Terms of Use",
    metaDescription: (name) => `Terms that apply to using the ${name} website, including listing information, prices and site-visit bookings.`,
    breadcrumb: "Terms of use",
    h1: "Terms of use",
    listingTitle: "Listing information",
    listing:
      "We work to keep prices, sizes, availability and images accurate, but listings are provided for information only and may change without notice. Images may include artist's impressions or show sample units. Nothing on this website is an offer or a contract; the terms of any purchase are set out only in a signed sale agreement.",
    pricesTitle: "Prices",
    prices: "Prices are shown in Ethiopian Birr (ETB) and must be confirmed in writing with our sales team before reserving.",
    bookingsTitle: "Site-visit bookings",
    bookings:
      "A booking made online is a request. It is confirmed when our team contacts you. We may need to reschedule visits because of weather, safety or site conditions.",
    contactTitle: "Contact",
    contact: { pre: "Questions about these terms: ", post: "." },
  },
  blog: {
    metaTitle: "Property Buyer Guides for Addis Ababa",
    metaDescription:
      "Practical guides to buying an apartment or shop in Addis Ababa: payment plans, documents, buying from abroad, choosing a neighbourhood and what to check on a site visit.",
    breadcrumb: "Guides",
    h1: "Buyer guides",
    intro: "Straight answers to the questions buyers ask us most, from payment plans to buying from abroad.",
    comingSoon: "Guides are coming soon.",
    guideLabel: "Guide",
    by: (author) => `By ${author}`,
    updated: " · Updated ",
    moreGuides: "More guides",
  },
};

const am: PagesDict = {
  brand: "ቴምር ፕሮፐርቲስ",
  legalName: "እየሩስ ቴምር ፕሮፐርቲስ",
  founded: "2010 ዓ.ም",
  hours: "ሰኞ – ቅዳሜ፣ ከጠዋቱ 6:00 እስከ ምሽቱ 8:00",
  ethiopia: "ኢትዮጵያ",
  common: { home: "መነሻ", contact: "አግኙን", bookVisit: "ጉብኝት ይያዙ", whatsapp: "ዋትስአፕ", callPrefix: "ይደውሉ" },
  cta: {
    title: "በዓይንዎ ይመልከቱ፦ ነፃ የቦታ ጉብኝት ይያዙ",
    text: "ከሽያጭ ቡድናችን ጋር የተጠናቀቁ ክፍሎችንና እየተገነቡ ያሉ ቦታዎችን በአካል ወይም ከውጭ አገር በቀጥታ የቪዲዮ ጥሪ ይጎብኙ።",
    bookVisit: "ጉብኝት ይያዙ",
    whatsapp: "ዋትስአፕ",
    waMessage: "ሰላም ቴምር ፕሮፐርቲስ፣ የቦታ ጉብኝት መያዝ እፈልጋለሁ።",
  },
  notFound: {
    title: "ይህ ገጽ አልተገኘም",
    text: "ንብረቱ ተሽጦ ሊሆን ወይም አገናኙ ጊዜው ያለፈበት ሊሆን ይችላል። በምትኩ ከእነዚህ አንዱን ይሞክሩ፦",
    browse: "ንብረቶችን ይመልከቱ",
    projects: "ፕሮጀክቶቻችን",
    contact: "ያግኙን",
  },
  about: {
    metaTitle: "ስለ ቴምር ፕሮፐርቲስ፦ በአዲስ አበባ የሪል እስቴት ገንቢ",
    metaDescription:
      "በ2010 ዓ.ም የተመሠረተው ቴምር ፕሮፐርቲስ በአዲስ አበባ ፈቃድ ያለው የሪል እስቴት ገንቢ ሲሆን ከ10 በላይ የተጠናቀቁ ፕሮጀክቶችና ከ400 በላይ የተረከቡ ቤቶች አሉት። ተልዕኳችን፣ እሴቶቻችንና የሥራ ታሪካችን።",
    breadcrumb: "ስለ እኛ",
    h1: "ስለ ቴምር ፕሮፐርቲስ",
    hero: "ከ2010 ዓ.ም ጀምሮ በአዲስ አበባ አፓርታማዎችን፣ ቤቶችንና ሱቆችን እየገነባ ያለ ፈቃድ ያለውና የተረጋገጠ የሪል እስቴት ገንቢ",
    whoTitle: "እኛ ማን ነን",
    p1: "በ{founded} የተመሠረተው ቴምር ፕሮፐርቲስ በአዲስ አበባ በፍጥነት እያደጉ ባሉ አካባቢዎች ማለትም በሳርቤት፣ በመገናኛ፣ በአያት፣ በሃይሌ ጋርመንት፣ በፒያሳና በቡልጋሪያ የመኖሪያና ባለብዙ አገልግሎት ሕንፃዎችን ይገነባል። የምንሸጠው በቀጥታ ለገዢዎች ነው፤ ስለዚህ ቤትዎን ከሚቀርጸው፣ ከሚገነባውና ከሚያስረክበው ድርጅት ጋር ብቻ ይገናኛሉ።",
    p2: "ገዢዎቻችን የመጀመሪያ ቤት ባለቤቶችን፣ እያደጉ ያሉ ቤተሰቦችን፣ የራሳቸውን ሱቅ የሚፈልጉ ነጋዴዎችንና በአገራቸው ኢንቨስት የሚያደርጉ በውጭ የሚኖሩ ኢትዮጵያውያንን ያካትታሉ። ለሁሉም የምንፈልገው አንድ ነገር ነው፦ በጥራት የተገነባ ንብረት፣ ተገቢ ዋጋና የሚሠራ የክፍያ ዕቅድ።",
    p3: {
      pre: "",
      linkA: "ወቅታዊና የተጠናቀቁ ፕሮጀክቶቻችንን ይመልከቱ",
      mid: " ወይም ሥራችንን በአካል ለማየት ",
      linkB: "የቦታ ጉብኝት ይያዙ",
      post: "።",
    },
    stats: ["ደስተኛ ደንበኞች", "የተጠናቀቁ ዋና ፕሮጀክቶች", "የተረከቡ ክፍሎች"],
    licensed: "ፈቃድ ያለውና የተረጋገጠ የሪል እስቴት ገንቢ",
    driveTitle: "የሚመራን ምንድን ነው",
    values: [
      { title: "ተልዕኮ", text: "በአዲስ አበባ ያለውን የኑሮ ተሞክሮ በጥራት በተገነቡና ጥሩ ቦታ ላይ በሚገኙ ቤቶችና የንግድ ቦታዎች በተገቢ ዋጋ ማሳደግ።" },
      { title: "እሴቶች", text: "እምነት፣ ታማኝነት፣ ለእያንዳንዱ ደንበኛ የተስማማ አገልግሎትና ከመጀመሪያው ጉብኝት እስከ ርክክብ ድረስ የማይናወጥ የልህቀት ቁርጠኝነት።" },
      { title: "ራዕይ", text: "በኢትዮጵያ ሪል እስቴት የሚሸጥበትን መንገድ እንደገና መቅረጽ፦ ግልጽ ዋጋ፣ ግልጽ የክፍያ ዕቅድና ሐቀኛ የጊዜ ሰሌዳ።" },
    ],
    deliveredTitle: "ያስረከብናቸው ፕሮጀክቶች",
  },
  contact: {
    metaTitle: "ቴምር ፕሮፐርቲስን ያግኙ",
    metaDescription: (phone, street, hours) =>
      `ይደውሉ ${phone}፣ በዋትስአፕ ወይም በቴሌግራም መልዕክት ይላኩልን፣ ወይም ቢሮአችንን ${street}፣ አዲስ አበባ ይጎብኙ። የሥራ ሰዓት፦ ${hours}።`,
    breadcrumb: "አግኙን",
    h1: "ያግኙን",
    intro: "ጥያቄ አለዎት? ለእርስዎ ተስማሚውን ቦታ አብረን እንፈልግ። የሽያጭ ቡድናችን በሥራ ሰዓት ፈጥኖ ይመልሳል።",
    callSales: "ለሽያጭ ይደውሉ",
    salesLine2: "ሁለተኛ የሽያጭ መስመር",
    whatsapp: "ዋትስአፕ",
    chat: "ያነጋግሩን",
    telegram: "ቴሌግራም",
    messageUs: "መልዕክት ይላኩልን",
    email: "ኢሜይል",
    waMessage: "ሰላም ቴምር ፕሮፐርቲስ፣ ጥያቄ አለኝ።",
    office: "ቢሮ",
    directions: "አቅጣጫ ያግኙ",
    openingHours: "የሥራ ሰዓት",
    sendTitle: "መልዕክት ይላኩልን",
    sendText: "የሚፈልጉትን ይንገሩን፤ መልሰን እንደውልልዎታለን።",
  },
  faq: {
    metaTitle: "ተደጋጋሚ ጥያቄዎች፦ በአዲስ አበባ አፓርታማ ወይም ሱቅ መግዛት",
    metaDescription:
      "ከቴምር ፕሮፐርቲስ አፓርታማ ወይም ሱቅ ስለመግዛት የተለመዱ ጥያቄዎች መልሶች፦ የክፍያ ዕቅዶች፣ ቦታ ማስያዝ፣ የቦታ ጉብኝትና ከውጭ አገር መግዛት።",
    breadcrumb: "ተደጋጋሚ ጥያቄዎች",
    h1: "ተደጋጋሚ ጥያቄዎች",
    cantFind: "መልስዎን አላገኙም?",
    askSales: "የሽያጭ ቡድናችንን ይጠይቁ",
    groups: { Buying: "ንብረት መግዛት", Payments: "ዋጋና የክፍያ ዕቅዶች", Visits: "የቦታ ጉብኝት", Diaspora: "ከውጭ አገር መግዛት" },
  },
  privacy: {
    metaTitle: "የግላዊነት መመሪያ",
    metaDescription: (name) => `${name} በዚህ ድር ጣቢያ በኩል የሚያጋሩትን የግል መረጃ እንዴት እንደሚሰበስብ፣ እንደሚጠቀምና እንደሚጠብቅ።`,
    breadcrumb: "የግላዊነት መመሪያ",
    h1: "የግላዊነት መመሪያ",
    intro: (legalName, name) => `ይህ መመሪያ ${legalName} («${name}»፣ «እኛ») በዚህ ድር ጣቢያ በኩል የሚሰበሰበውን የግል መረጃ እንዴት እንደሚይዝ ያብራራል።`,
    collectTitle: "ምን እንሰበስባለን",
    collect:
      "የቦታ ጉብኝት ሲይዙ ወይም ጥያቄ ሲልኩ የሚያስገቡትን መረጃ እንሰበስባለን፦ ስምዎን፣ ስልክ ቁጥርዎን፣ የኢሜይል አድራሻዎን (አማራጭ)፣ የሚፈልጉትን የጉብኝት ቀንና ሰዓት እንዲሁም መልዕክትዎን። የላኩበትን ገጽም እናስቀምጣለን።",
    useTitle: "እንዴት እንጠቀምበታለን",
    uses: [
      "ስለ ጥያቄዎ ለማነጋገር ወይም የቦታ ጉብኝትዎን ለማረጋገጥ።",
      "ስለጠየቁባቸው ንብረቶች መረጃ ለማጋራት።",
      "የቦታ ማስያዣ መዝገቦችን ለመያዝና አገልግሎታችንን ለማሻሻል።",
    ],
    noSell: "የግል መረጃዎን አንሸጥም። የምናጋራው እርስዎን ለመመለስ ከሚያስፈልጋቸው ሠራተኞች ጋር ብቻ ነው።",
    keepTitle: "ለምን ያህል ጊዜ እናቆየዋለን",
    keep: "እርስዎን ለማገልገልና የሕግ ግዴታዎችን ለመወጣት እስከሚያስፈልግ ድረስ የጥያቄና የቦታ ማስያዣ መዝገቦችን እናቆያለን፤ ከዚያም እንሰርዛቸዋለን።",
    choicesTitle: "የእርስዎ ምርጫዎች",
    choices: {
      pre: "መረጃዎን ለማየት፣ ለማረም ወይም ለመሰረዝ በማንኛውም ጊዜ በኢሜይል ",
      mid: " በመጻፍ ወይም በስልክ ",
      post: " በመደወል ሊጠይቁን ይችላሉ።",
    },
    cookiesTitle: "ኩኪዎች",
    cookies:
      "ይህ ድር ጣቢያ የማስታወቂያ ወይም የክትትል ኩኪዎችን አይጠቀምም። ወደ አስተዳደር ክፍል የሚገቡ ሠራተኞች ግን እንደገቡ የሚያቆያቸው የደህንነት ኩኪ ይቀበላሉ።",
  },
  terms: {
    metaTitle: "የአጠቃቀም ደንቦች",
    metaDescription: (name) => `የ${name} ድር ጣቢያን ለመጠቀም የሚሠሩ ደንቦች፤ የዝርዝር መረጃን፣ ዋጋዎችንና የቦታ ጉብኝት ማስያዣዎችን ጨምሮ።`,
    breadcrumb: "የአጠቃቀም ደንቦች",
    h1: "የአጠቃቀም ደንቦች",
    listingTitle: "የዝርዝር መረጃ",
    listing:
      "ዋጋዎችን፣ ስፋቶችን፣ ተገኝነትንና ምስሎችን ትክክለኛ ለማድረግ እንሠራለን፤ ነገር ግን ዝርዝሮቹ ለመረጃ ብቻ የቀረቡ ሲሆኑ ያለ ቅድመ ማሳወቂያ ሊቀየሩ ይችላሉ። ምስሎች የአርቲስት ዕይታዎችን ሊያካትቱ ወይም ናሙና ክፍሎችን ሊያሳዩ ይችላሉ። በዚህ ድር ጣቢያ ላይ ያለ ምንም ነገር የሽያጭ ጥያቄ ወይም ውል አይደለም፤ የማንኛውም ግዢ ውሎች የሚገለጹት በተፈረመ የሽያጭ ውል ውስጥ ብቻ ነው።",
    pricesTitle: "ዋጋዎች",
    prices: "ዋጋዎች በኢትዮጵያ ብር (ETB) የተገለጹ ሲሆን ቦታ ከመያዝዎ በፊት ከሽያጭ ቡድናችን ጋር በጽሑፍ መረጋገጥ አለባቸው።",
    bookingsTitle: "የቦታ ጉብኝት ማስያዣዎች",
    bookings:
      "በኢንተርኔት የሚደረግ ቦታ ማስያዝ ጥያቄ ብቻ ነው። ቡድናችን ሲያነጋግርዎ ይረጋገጣል። በአየር ሁኔታ፣ በደህንነት ወይም በቦታው ሁኔታ ምክንያት ጉብኝቶችን ማዘዋወር ሊያስፈልገን ይችላል።",
    contactTitle: "አግኙን",
    contact: { pre: "ስለ እነዚህ ደንቦች ጥያቄ ካለዎት፦ ", post: "።" },
  },
  blog: {
    metaTitle: "ለአዲስ አበባ ንብረት ገዢዎች መመሪያዎች",
    metaDescription:
      "በአዲስ አበባ አፓርታማ ወይም ሱቅ ለመግዛት የሚረዱ ተግባራዊ መመሪያዎች፦ የክፍያ ዕቅዶች፣ ሰነዶች፣ ከውጭ አገር መግዛት፣ አካባቢ መምረጥና በቦታ ጉብኝት ወቅት ምን መፈተሽ እንዳለበት።",
    breadcrumb: "መመሪያዎች",
    h1: "የገዢ መመሪያዎች",
    intro: "ገዢዎች ከሚጠይቁን ጥያቄዎች ብዙዎቹ ቀጥተኛ መልሶች፣ ከክፍያ ዕቅዶች እስከ ከውጭ አገር መግዛት።",
    comingSoon: "መመሪያዎች በቅርቡ ይመጣሉ።",
    guideLabel: "መመሪያ",
    by: (author) => `በ${author}`,
    updated: " · የተሻሻለው፦ ",
    moreGuides: "ተጨማሪ መመሪያዎች",
  },
};

const dicts: Record<Locale, PagesDict> = { en, am };

export function getPagesDict(lang: Locale): PagesDict {
  return dicts[lang];
}

/** Date for blog cards and articles. English keeps the existing day-month-year format; Amharic uses Amharic month names. */
export function formatPostDate(date: Date | string | number, lang: Locale): string {
  const locale = lang === "am" ? "am-ET-u-ca-gregory" : "en-GB";
  return new Intl.DateTimeFormat(locale, { timeZone: ADDIS_TIME_ZONE, dateStyle: "long" }).format(new Date(date));
}
