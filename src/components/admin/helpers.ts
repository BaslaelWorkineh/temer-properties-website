/** Pure helpers shared by admin server pages and client components. */

export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/** WhatsApp chat link to a customer's number (stored as +2519…). */
export function customerWhatsapp(phone: string, text?: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** "Sat, 22 Nov 2026" from a YYYY-MM-DD date. */
export function shortVisitDate(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return ymd;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export const PAGE_SIZE = 25;

export function pageFromParam(value: string | string[] | undefined) {
  const page = Number(firstParam(value));
  return Number.isInteger(page) && page > 0 ? page : 1;
}

/** Message for `?deleted=N` after deleting one item or several at once (null when nothing was deleted). */
export function deletedMessage(param: string | string[] | undefined, one: string, many: string, after = "") {
  const n = Number(firstParam(param));
  if (!Number.isInteger(n) || n < 1) return null;
  return `${n === 1 ? `The ${one} was deleted.` : `${n} ${many} were deleted.`}${after ? ` ${after}` : ""}`;
}
