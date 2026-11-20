/**
 * Site-visit booking rules. All times are Addis Ababa local time (UTC+3, no DST).
 */
export const bookingConfig = {
  /** Visit start times offered to customers. */
  slots: ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"] as const,
  /** Maximum active (pending + confirmed) bookings per slot. */
  capacityPerSlot: 3,
  /** 0 = Sunday … 6 = Saturday. Office is closed on Sunday. */
  closedWeekdays: [0] as number[],
  /** Earliest bookable day, counted from today in Addis Ababa. */
  minDaysAhead: 1,
  maxDaysAhead: 60,
  maxPartySize: 10,
};

export type TimeSlot = (typeof bookingConfig.slots)[number];

export const VISIT_TYPES = ["in_person", "video_call"] as const;
export type VisitType = (typeof VISIT_TYPES)[number];

export const visitTypeLabels: Record<VisitType, string> = {
  in_person: "In-person site visit",
  video_call: "Video call walkthrough",
};

export const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled", "no_show"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const bookingStatusLabels: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

/** Statuses that occupy a slot's capacity. */
export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ["pending", "confirmed"];

export const INQUIRY_INTERESTS = ["apartments", "homes", "shops", "delivered", "site_visit", "other"] as const;
export type InquiryInterest = (typeof INQUIRY_INTERESTS)[number];

export const inquiryInterestLabels: Record<InquiryInterest, string> = {
  apartments: "Apartments",
  homes: "Modern homes",
  shops: "Commercial shops",
  delivered: "Delivered projects",
  site_visit: "Booking a site visit",
  other: "Something else",
};

export const INQUIRY_STATUSES = ["new", "contacted", "closed"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const inquiryStatusLabels: Record<InquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};
