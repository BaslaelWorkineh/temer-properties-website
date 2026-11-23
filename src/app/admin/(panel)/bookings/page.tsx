import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, count, desc, eq, gte, inArray, lt, type SQL } from "drizzle-orm";
import { CalendarCheck, MessageCircle, Phone } from "lucide-react";
import { PAGE_SIZE, customerWhatsapp, firstParam, pageFromParam, shortVisitDate } from "@/components/admin/helpers";
import { EmptyState, PageHeader, Pagination, TableCard, Tabs, td, th } from "@/components/admin/ui";
import { Badge, bookingStatusTone } from "@/components/ui/badge";
import { db } from "@/db";
import { bookings, projects, properties } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { ACTIVE_BOOKING_STATUSES, bookingStatusLabels, visitTypeLabels } from "@/lib/config/booking";
import { addisToday, formatSlot } from "@/lib/format";

// Admin pages are per-request and authenticated; they are allowed to block (see the panel layout).
export const instant = false;

export const metadata: Metadata = { title: "Bookings" };

const VIEWS = ["upcoming", "pending", "past", "all"] as const;
type View = (typeof VIEWS)[number];

export default async function AdminBookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  await requireAdmin();
  const sp = await searchParams;
  const viewParam = firstParam(sp.view);
  const view: View = VIEWS.includes(viewParam as View) ? (viewParam as View) : "upcoming";
  const page = pageFromParam(sp.page);
  const today = addisToday();

  const conditions: Record<View, SQL | undefined> = {
    upcoming: and(gte(bookings.visitDate, today), inArray(bookings.status, ACTIVE_BOOKING_STATUSES)),
    pending: eq(bookings.status, "pending"),
    past: lt(bookings.visitDate, today),
    all: undefined,
  };
  const orderBy = {
    upcoming: [asc(bookings.visitDate), asc(bookings.timeSlot)],
    pending: [asc(bookings.visitDate), asc(bookings.timeSlot)],
    past: [desc(bookings.visitDate), desc(bookings.timeSlot)],
    all: [desc(bookings.createdAt)],
  }[view];
  const where = conditions[view];

  const [rows, [totalRow], [upcomingCount], [pendingCount]] = await Promise.all([
    db
      .select({
        id: bookings.id,
        reference: bookings.reference,
        fullName: bookings.fullName,
        phone: bookings.phone,
        visitDate: bookings.visitDate,
        timeSlot: bookings.timeSlot,
        visitType: bookings.visitType,
        partySize: bookings.partySize,
        status: bookings.status,
        propertyTitle: properties.title,
        projectName: projects.name,
      })
      .from(bookings)
      .leftJoin(properties, eq(properties.id, bookings.propertyId))
      .leftJoin(projects, eq(projects.id, bookings.projectId))
      .where(where)
      .orderBy(...orderBy)
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(bookings).where(where),
    db.select({ n: count() }).from(bookings).where(conditions.upcoming),
    db.select({ n: count() }).from(bookings).where(conditions.pending),
  ]);

  const tabs = [
    { key: "upcoming", label: "Upcoming", count: upcomingCount?.n ?? 0 },
    { key: "pending", label: "To confirm", count: pendingCount?.n ?? 0 },
    { key: "past", label: "Past" },
    { key: "all", label: "All" },
  ].map((t) => ({ ...t, href: t.key === "upcoming" ? "/admin/bookings" : `/admin/bookings?view=${t.key}` }));

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (view !== "upcoming") params.set("view", view);
    if (p > 1) params.set("page", String(p));
    const query = params.toString();
    return `/admin/bookings${query ? `?${query}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Site-visit bookings" description="Bookings made on the website. Confirm each one with the customer by phone or WhatsApp." />
      <Tabs tabs={tabs} active={view} />

      {rows.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={view === "upcoming" ? "No upcoming visits" : view === "pending" ? "Nothing to confirm" : "No bookings here"}
          description="Customers book visits from property and project pages and from the Book a Visit page."
        />
      ) : (
        <>
          <TableCard>
            <table className="min-w-full divide-y divide-line">
              <thead className="bg-soft/60">
                <tr>
                  <th scope="col" className={th}>Visit</th>
                  <th scope="col" className={th}>Customer</th>
                  <th scope="col" className={th}>For</th>
                  <th scope="col" className={th}>Type</th>
                  <th scope="col" className={th}>Status</th>
                  <th scope="col" className={th}>Ref.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((b) => (
                  <tr key={b.id} className="hover:bg-soft/50">
                    <td className={`${td} whitespace-nowrap`}>
                      <Link href={`/admin/bookings/${b.id}`} className="font-semibold text-ink hover:text-brand-700">
                        {shortVisitDate(b.visitDate)}
                      </Link>
                      <span className="block text-xs text-muted">{formatSlot(b.timeSlot)}</span>
                    </td>
                    <td className={td}>
                      <span className="block font-medium">{b.fullName}</span>
                      <span className="mt-0.5 flex flex-wrap gap-x-3 text-xs">
                        <a href={`tel:${b.phone}`} className="inline-flex items-center gap-1 whitespace-nowrap text-brand-700 hover:underline">
                          <Phone className="size-3.5" aria-hidden="true" /> {b.phone}
                        </a>
                        <a href={customerWhatsapp(b.phone)} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-brand-700 hover:underline">
                          <MessageCircle className="size-3.5" aria-hidden="true" /> WhatsApp
                        </a>
                      </span>
                    </td>
                    <td className={`${td} min-w-48 max-w-64`}>
                      <span className="line-clamp-2">{b.propertyTitle ?? b.projectName ?? "General visit"}</span>
                    </td>
                    <td className={`${td} whitespace-nowrap`}>
                      {visitTypeLabels[b.visitType]}
                      <span className="block text-xs text-muted">
                        {b.partySize} {b.partySize === 1 ? "person" : "people"}
                      </span>
                    </td>
                    <td className={td}>
                      <Badge tone={bookingStatusTone[b.status]}>{bookingStatusLabels[b.status]}</Badge>
                    </td>
                    <td className={`${td} whitespace-nowrap font-mono text-xs text-muted`}>
                      <Link href={`/admin/bookings/${b.id}`} className="hover:text-brand-700">
                        {b.reference}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>
          <Pagination page={page} total={totalRow?.n ?? 0} pageSize={PAGE_SIZE} hrefFor={hrefFor} />
        </>
      )}
    </>
  );
}
