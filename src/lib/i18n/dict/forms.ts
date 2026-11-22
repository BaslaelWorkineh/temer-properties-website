import { bookingConfig, type InquiryInterest, type VisitType } from "@/lib/config/booking";
import { addDays, isValidYmd, weekdayOf } from "@/lib/dates";
import type { Locale } from "@/lib/i18n/config";

/**
 * Text for the booking and enquiry forms, the Server Actions behind them, breadcrumbs and pagination.
 * Client-safe (no server imports). The Amharic is a first draft: have a native speaker review it.
 */

/** A piece of the confirmation sentence; `bold` pieces are the reference, date and time. */
export type TextPart = { text: string; bold?: boolean };

export type DateIssue = "invalid" | "too_soon" | "too_far" | "closed";

export type FormsDict = {
  hours: string;
  breadcrumb: { label: string; home: string };
  pagination: { label: string; previous: string; next: string };
  phone: { label: string; countryCode: string; placeholder: string; honeypot: string; countries: Record<string, string> };
  fields: { fullName: string; emailOptional: string; people: string; message: string; company: string };
  booking: {
    howToVisit: string;
    inPerson: string;
    videoCall: string;
    whichProject: string;
    notSure: string;
    date: string;
    time: string;
    checking: string;
    oneSpotLeft: string;
    messageLabel: string;
    messagePlaceholder: string;
    sending: string;
    submit: string;
    footnote: string;
    receivedTitle: string;
    successParts: (ref: string, type: string, date: string, time: string) => TextPart[];
    whatsappButton: string;
    whatsappMessage: (ref: string, date: string, time: string, subject?: string) => string;
  };
  inquiry: { sentTitle: string; interest: string; hint: string; submit: string; sending: string };
  visitTypes: Record<VisitType, string>;
  interests: Record<InquiryInterest, string>;
  validation: { name: string; phone: string; email: string; date: string; time: string; keepUnder: (n: number) => string };
  actions: {
    fixFields: string;
    bookingBlocked: string;
    bookingTooMany: string;
    slotFull: string;
    bookingFailed: string;
    bookingReceived: string;
    inquiryBlocked: string;
    inquiryTooMany: string;
    inquiryFailed: string;
    inquiryThanks: string;
  };
  dateIssues: Record<DateIssue, string> & { tooFar: (days: number) => string };
  page: {
    metaTitle: string;
    metaDescription: string;
    breadcrumb: string;
    h1: string;
    lead: string;
    points: Array<{ title: string; text: string }>;
    preferToTalk: string;
    yourVisit: string;
  };
};

const en: FormsDict = {
  hours: "Monday – Saturday, 6:00 AM – 8:00 PM",
  breadcrumb: { label: "Breadcrumb", home: "Home" },
  pagination: { label: "Pagination", previous: "Previous page", next: "Next page" },
  phone: {
    label: "Phone number",
    countryCode: "Country code",
    placeholder: "0911 234 567",
    honeypot: "Leave this field empty",
    countries: {
      "+251": "ET +251",
      "+1": "US/CA +1",
      "+44": "UK +44",
      "+971": "UAE +971",
      "+966": "KSA +966",
      "+49": "DE +49",
      "+46": "SE +46",
      "+31": "NL +31",
      "+61": "AU +61",
      "+254": "KE +254",
      "+249": "SD +249",
      "+27": "ZA +27",
    },
  },
  fields: { fullName: "Full name", emailOptional: "Email (optional)", people: "People", message: "Message", company: "Company (optional)" },
  booking: {
    howToVisit: "How would you like to visit?",
    inPerson: "In person",
    videoCall: "Video call",
    whichProject: "Which project?",
    notSure: "Not sure yet, advise me",
    date: "Preferred date",
    time: "Preferred time",
    checking: "Checking availability…",
    oneSpotLeft: "1 spot left",
    messageLabel: "Anything we should know? (optional)",
    messagePlaceholder: "e.g. I'm interested in a 3-bedroom unit and payment plans",
    sending: "Sending…",
    submit: "Request site visit",
    footnote: "Free, no obligation. We confirm every visit by phone.",
    receivedTitle: "Visit request received",
    successParts: (ref, type, date, time) => [
      { text: "Thank you! Your reference is " },
      { text: ref, bold: true },
      { text: `. Our team will call you to confirm your ${type.toLowerCase()} on ` },
      { text: date, bold: true },
      { text: " at " },
      { text: time, bold: true },
      { text: "." },
    ],
    whatsappButton: "Message us on WhatsApp",
    whatsappMessage: (ref, date, time, subject) =>
      `Hello Temer Properties, I booked a site visit${subject ? ` for ${subject}` : ""} (reference ${ref}) on ${date} at ${time}.`,
  },
  inquiry: { sentTitle: "Message sent", interest: "I am interested in", hint: "Up to 1,000 characters.", submit: "Send enquiry", sending: "Sending…" },
  visitTypes: { in_person: "In-person site visit", video_call: "Video call walkthrough" },
  interests: {
    apartments: "Apartments",
    homes: "Modern homes",
    shops: "Commercial shops",
    delivered: "Delivered projects",
    site_visit: "Booking a site visit",
    other: "Something else",
  },
  validation: {
    name: "Enter your full name",
    phone: "Enter a valid phone number, e.g. 0911 234 567",
    email: "Enter a valid email",
    date: "Choose a visit date",
    time: "Choose a time",
    keepUnder: (n) => `Keep this under ${n} characters`,
  },
  actions: {
    fixFields: "Please correct the highlighted fields.",
    bookingBlocked: "Your request could not be sent. Please call us instead.",
    bookingTooMany: "Too many booking attempts. Please wait a few minutes or call us directly.",
    slotFull: "That time has just been fully booked. Please choose another time.",
    bookingFailed: "Something went wrong while saving your booking. Please try again or call us.",
    bookingReceived: "Your visit request has been received.",
    inquiryBlocked: "Your message could not be sent. Please call us instead.",
    inquiryTooMany: "Too many messages. Please wait a few minutes or call us directly.",
    inquiryFailed: "Something went wrong while sending your message. Please try again or call us.",
    inquiryThanks: "Thank you! Our sales team will contact you shortly.",
  },
  dateIssues: {
    invalid: "Choose a valid date.",
    too_soon: "Visits can be booked from tomorrow onwards.",
    too_far: "",
    tooFar: (days) => `Visits can be booked up to ${days} days ahead.`,
    closed: "Our office is closed on Sundays. Please choose another day.",
  },
  page: {
    metaTitle: "Book a Free Site Visit",
    metaDescription:
      "Book a free site visit or a live video walkthrough of Temer Properties' apartments and shops in Addis Ababa. Pick a date and time online; our team confirms by phone.",
    breadcrumb: "Book a visit",
    h1: "Book a free site visit",
    lead: "See the building, the finishing and the neighbourhood for yourself, in person or on a video call.",
    points: [
      { title: "Pick a time that suits you", text: "Visits run Monday to Saturday. Choose a slot online in under a minute." },
      { title: "Abroad? Join by video", text: "A sales advisor walks you through the site and units on a live video call." },
      { title: "Free, no obligation", text: "See finished units and construction quality before you decide anything." },
    ],
    preferToTalk: "Prefer to talk first? Call",
    yourVisit: "Your visit",
  },
};

const am: FormsDict = {
  hours: "ሰኞ – ቅዳሜ፣ ከጠዋቱ 6:00 እስከ ምሽቱ 8:00",
  breadcrumb: { label: "የአሰሳ መንገድ", home: "መነሻ" },
  pagination: { label: "ገጽ ማገላበጫ", previous: "ቀዳሚ ገጽ", next: "ቀጣይ ገጽ" },
  phone: {
    label: "ስልክ ቁጥር",
    countryCode: "የአገር ኮድ",
    placeholder: "0911 234 567",
    honeypot: "ይህን መስክ ባዶ ይተዉት",
    countries: {
      "+251": "ኢትዮጵያ +251",
      "+1": "አሜሪካ/ካናዳ +1",
      "+44": "ዩኬ +44",
      "+971": "ኤምሬትስ +971",
      "+966": "ሳዑዲ +966",
      "+49": "ጀርመን +49",
      "+46": "ስዊድን +46",
      "+31": "ኔዘርላንድስ +31",
      "+61": "አውስትራሊያ +61",
      "+254": "ኬንያ +254",
      "+249": "ሱዳን +249",
      "+27": "ደቡብ አፍሪካ +27",
    },
  },
  fields: { fullName: "ሙሉ ስም", emailOptional: "ኢሜይል (አማራጭ)", people: "የሰዎች ብዛት", message: "መልዕክት", company: "ድርጅት (አማራጭ)" },
  booking: {
    howToVisit: "እንዴት መጎብኘት ይፈልጋሉ?",
    inPerson: "በአካል",
    videoCall: "የቪዲዮ ጥሪ",
    whichProject: "የትኛውን ፕሮጀክት?",
    notSure: "እስካሁን አልወሰንኩም፣ ይምከሩኝ",
    date: "የሚመርጡት ቀን",
    time: "የሚመርጡት ሰዓት",
    checking: "ተገኝነትን በማረጋገጥ ላይ…",
    oneSpotLeft: "1 ቦታ ቀርቷል",
    messageLabel: "ማወቅ ያለብን ነገር አለ? (አማራጭ)",
    messagePlaceholder: "ለምሳሌ፦ ባለ 3 መኝታ ክፍልና የክፍያ ዕቅዶች ፍላጎት አለኝ",
    sending: "በመላክ ላይ…",
    submit: "የቦታ ጉብኝት ይጠይቁ",
    footnote: "ነፃ ነው፣ ምንም ግዴታ የለበትም። እያንዳንዱን ጉብኝት በስልክ እናረጋግጣለን።",
    receivedTitle: "የጉብኝት ጥያቄዎ ደርሶናል",
    successParts: (ref, type, date, time) => [
      { text: "አመሰግናለሁ! የማጣቀሻ ቁጥርዎ " },
      { text: ref, bold: true },
      { text: " ነው። ቡድናችን በ" },
      { text: date, bold: true },
      { text: " " },
      { text: time, bold: true },
      { text: ` ሰዓት የሚካሄደውን ${type} ለማረጋገጥ ይደውልልዎታል።` },
    ],
    whatsappButton: "በዋትስአፕ ያግኙን",
    whatsappMessage: (ref, date, time, subject) =>
      `ሰላም ቴምር ፕሮፐርቲስ፣ ${subject ? `ለ${subject} ` : ""}የቦታ ጉብኝት ይዣለሁ (የማጣቀሻ ቁጥር ${ref}) በ${date} ${time} ሰዓት።`,
  },
  inquiry: { sentTitle: "መልዕክቱ ተልኳል", interest: "ፍላጎቴ", hint: "እስከ 1,000 ፊደላት።", submit: "ጥያቄ ላክ", sending: "በመላክ ላይ…" },
  visitTypes: { in_person: "በአካል የቦታ ጉብኝት", video_call: "የቪዲዮ ጥሪ ጉብኝት" },
  interests: {
    apartments: "አፓርታማዎች",
    homes: "ዘመናዊ ቤቶች",
    shops: "የንግድ ሱቆች",
    delivered: "የተረከቡ ፕሮጀክቶች",
    site_visit: "የቦታ ጉብኝት መያዝ",
    other: "ሌላ ነገር",
  },
  validation: {
    name: "ሙሉ ስምዎን ያስገቡ",
    phone: "ትክክለኛ ስልክ ቁጥር ያስገቡ፤ ለምሳሌ 0911 234 567",
    email: "ትክክለኛ ኢሜይል ያስገቡ",
    date: "የጉብኝት ቀን ይምረጡ",
    time: "ሰዓት ይምረጡ",
    keepUnder: (n) => `ከ${n} ፊደላት በታች ያድርጉ`,
  },
  actions: {
    fixFields: "እባክዎ ምልክት የተደረገባቸውን መስኮች ያስተካክሉ።",
    bookingBlocked: "ጥያቄዎ ሊላክ አልቻለም። እባክዎ በምትኩ ይደውሉልን።",
    bookingTooMany: "በጣም ብዙ የጉብኝት ሙከራዎች። እባክዎ ጥቂት ደቂቃዎች ይጠብቁ ወይም በቀጥታ ይደውሉልን።",
    slotFull: "ያ ሰዓት አሁን ሞልቷል። እባክዎ ሌላ ሰዓት ይምረጡ።",
    bookingFailed: "ቦታዎን በማስቀመጥ ላይ ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ ወይም ይደውሉልን።",
    bookingReceived: "የጉብኝት ጥያቄዎ ደርሶናል።",
    inquiryBlocked: "መልዕክትዎ ሊላክ አልቻለም። እባክዎ በምትኩ ይደውሉልን።",
    inquiryTooMany: "በጣም ብዙ መልዕክቶች። እባክዎ ጥቂት ደቂቃዎች ይጠብቁ ወይም በቀጥታ ይደውሉልን።",
    inquiryFailed: "መልዕክትዎን በመላክ ላይ ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ ወይም ይደውሉልን።",
    inquiryThanks: "አመሰግናለሁ! የሽያጭ ቡድናችን በቅርቡ ያነጋግርዎታል።",
  },
  dateIssues: {
    invalid: "ትክክለኛ ቀን ይምረጡ።",
    too_soon: "ጉብኝት ከነገ ጀምሮ ብቻ ነው የሚያዘው።",
    too_far: "",
    tooFar: (days) => `ጉብኝት እስከ ${days} ቀናት ድረስ ብቻ ቀድሞ መያዝ ይቻላል።`,
    closed: "ቢሮአችን እሑድ ዝግ ነው። እባክዎ ሌላ ቀን ይምረጡ።",
  },
  page: {
    metaTitle: "ነፃ የቦታ ጉብኝት ይያዙ",
    metaDescription:
      "በአዲስ አበባ የሚገኙትን የቴምር ፕሮፐርቲስ አፓርታማዎችና ሱቆች ነፃ የቦታ ጉብኝት ወይም የቀጥታ የቪዲዮ ጉብኝት ይያዙ። ቀንና ሰዓት በኢንተርኔት ይምረጡ፤ ቡድናችን በስልክ ያረጋግጣል።",
    breadcrumb: "ጉብኝት ይያዙ",
    h1: "ነፃ የቦታ ጉብኝት ይያዙ",
    lead: "ሕንፃውን፣ አጨራረሱንና አካባቢውን በራስዎ ይመልከቱ፤ በአካል ወይም በቪዲዮ ጥሪ።",
    points: [
      { title: "ለእርስዎ የሚስማማ ሰዓት ይምረጡ", text: "ጉብኝት ከሰኞ እስከ ቅዳሜ ነው። በአንድ ደቂቃ ውስጥ ሰዓት በኢንተርኔት ይምረጡ።" },
      { title: "ከውጭ አገር ነዎት? በቪዲዮ ይቀላቀሉ", text: "የሽያጭ አማካሪ በቀጥታ የቪዲዮ ጥሪ ቦታውንና ክፍሎቹን ያስጎበኝዎታል።" },
      { title: "ነፃ ነው፣ ምንም ግዴታ የለበትም", text: "ማንኛውንም ውሳኔ ከመወሰንዎ በፊት የተጠናቀቁ ክፍሎችንና የግንባታ ጥራትን ይመልከቱ።" },
    ],
    preferToTalk: "መጀመሪያ ማነጋገር ይመርጣሉ? ይደውሉ፦",
    yourVisit: "ጉብኝትዎ",
  },
};

const dictionaries: Record<Locale, FormsDict> = { en, am };

export function getFormsDict(lang: Locale): FormsDict {
  return dictionaries[lang];
}

/**
 * Why a visit date cannot be booked, or null when it can. Pure (takes today's date), so the booking form and the
 * Server Action use the same rule.
 */
export function bookableDateIssue(ymd: string, today: string): DateIssue | null {
  if (!isValidYmd(ymd)) return "invalid";
  if (ymd < addDays(today, bookingConfig.minDaysAhead)) return "too_soon";
  if (ymd > addDays(today, bookingConfig.maxDaysAhead)) return "too_far";
  if (bookingConfig.closedWeekdays.includes(weekdayOf(ymd))) return "closed";
  return null;
}

export function dateIssueMessage(issue: DateIssue, lang: Locale): string {
  const d = getFormsDict(lang).dateIssues;
  return issue === "too_far" ? d.tooFar(bookingConfig.maxDaysAhead) : d[issue];
}
