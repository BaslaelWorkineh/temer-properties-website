import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, count, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { Building2, CalendarCheck, CalendarClock, CheckCircle2, Inbox, MessageCircle, Phone, Plus } from "lucide-react";
import { customerWhatsapp, shortVisitDate } from "@/components/admin/helpers";
import { Card, EmptyState, Notice, PageHeader, StatCard, TableCard, td, th } from "@/components/admin/ui";
import { Badge, bookingStatusTone, inquiryStatusTone } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { db } from "@/db";
import { bookings, inquiries, projects, properties } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { ACTIVE_BOOKING_STATUSES, bookingStatusLabels, inquiryInterestLabels, inquiryStatusLabels, visitTypeLabels } from "@/lib/config/booking";
import { addDays, addisToday, formatDateTime, formatSlot } from "@/lib/format";
import { truncate } from "@/lib/utils";

// Admin pages are per-request and authenticated; they are allowed to block (see the panel layout).
export const instant = false;

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({ searchParams }: PageProps<"/admin">) {
  const admin = await requireAdmin();
  const ownerOnly = (await searchParams).notice === "owner-only";
  const today = addisToday();
  const weekAhead = addDays(today, 7);

  const [[published], [available], [pending], [nextWeek], [newInquiries], upcoming, latestInquiries] = await Promise.all([
    db.select({ n: count() }).from(properties).where(eq(properties.isPublished, true)),
    db
      .select({ n: count() })
      .from(properties)
      .where(and(eq(properties.isPublished, true), eq(properties.status, "available"))),
    db.select({ n: count() }).from(bookings).where(eq(bookings.status, "pending")),
    db
      .select({ n: count() })
      .from(bookings)
      .where(and(gte(bookings.visitDate, today), lte(bookings.visitDate, weekAhead), inArray(bookings.status, ACTIVE_BOOKING_STATUSES))),
    db.select({ n: count() }).from(inquiries).where(eq(inquiries.status, "new")),
    db
      .select({
        id: bookings.id,
        reference: bookings.reference,
        fullName: bookings.fullName,
        phone: bookings.phone,
        visitDate: bookings.visitDate,
        timeSlot: bookings.timeSlot,
        visitType: bookings.visitType,
        status: bookings.status,
        propertyTitle: properties.title,
        projectName: projects.name,
      })
      .from(bookings)
      .leftJoin(properties, eq(properties.id, bookings.propertyId))
      .leftJoin(projects, eq(projects.id, bookings.projectId))
      .where(and(gte(bookings.visitDate, today), inArray(bookings.status, ACTIVE_BOOKING_STATUSES)))
      .orderBy(asc(bookings.visitDate), asc(bookings.timeSlot))
      .limit(8),
    db
      .select({
        id: inquiries.id,
        fullName: inquiries.fullName,
        interest: inquiries.interest,
        message: inquiries.message,
        status: inquiries.status,
        createdAt: inquiries.createdAt,
      })
      .from(inquiries)
      .orderBy(desc(inquiries.createdAt))
      .limit(5),
  ]);

  return (
    <>
      {ownerOnly ? <Notice tone="amber">That page is for admins only. Ask the owner if you need access.</Notice> : null}
      <PageHeader
        title={`Welcome, ${admin.name.split(" ")[0]}`}
        description="Today's visits, new enquiries and your listings at a glance."
        actions={
          <>
            <Link href="/admin/properties/new" className={buttonStyles({ size: "sm" })}>
              <Plus className="size-4" aria-hidden="true" /> New property
            </Link>
            <Link href="/admin/posts/new" className={buttonStyles({ variant: "outline", size: "sm" })}>
              <Plus className="size-4" aria-hidden="true" /> New guide
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Published listings" value={published?.n ?? 0} icon={Building2} href="/admin/properties" />
        <StatCard label="Available to sell" value={available?.n ?? 0} icon={CheckCircle2} href="/admin/properties?status=available" />
        <StatCard label="Bookings to confirm" value={pending?.n ?? 0} icon={CalendarClock} href="/admin/bookings?view=pending" tone="gold" />
        <StatCard label="Visits in next 7 days" value={nextWeek?.n ?? 0} icon={CalendarCheck} href="/admin/bookings" />
        <StatCard label="New enquiries" value={newInquiries?.n ?? 0} icon={Inbox} href="/admin/inquiries?status=new" tone="gold" />
      </div>

      <section className="mt-10" aria-labelledby="upcoming-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="upcoming-heading" className="font-display text-2xl font-bold">
            Upcoming site visits
          </h2>
          <Link href="/admin/bookings" className="text-sm font-semibold text-brand-700 hover:underline">
            All bookings
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No upcoming visits" description="New bookings from the website appear here." />
        ) : (
          <TableCard>
            <table className="min-w-full divide-y divide-line">
              <thead className="bg-soft/60">
                <tr>
                  <th scope="col" className={th}>When</th>
                  <th scope="col" className={th}>Customer</th>
                  <th scope="col" className={th}>For</th>
                  <th scope="col" className={th}>Type</th>
                  <th scope="col" className={th}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {upcoming.map((b) => (
                  <tr key={b.id} className="hover:bg-soft/50">
                    <td className={td}>
                      <Link href={`/admin/bookings/${b.id}`} className="font-semibold text-ink hover:text-brand-700">
                        {shortVisitDate(b.visitDate)}
                      </Link>
                      <span className="block text-xs text-muted">{formatSlot(b.timeSlot)}</span>
                    </td>
                    <td className={td}>
                      <span className="block font-medium">{b.fullName}</span>
                      <span className="mt-0.5 flex gap-3 text-xs">
                        <a href={`tel:${b.phone}`} className="inline-flex items-center gap-1 text-brand-700 hover:underline">
                          <Phone className="size-3.5" aria-hidden="true" /> {b.phone}
                        </a>
                        <a href={customerWhatsapp(b.phone)} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-brand-700 hover:underline">
                          <MessageCircle className="size-3.5" aria-hidden="true" /> WhatsApp
                        </a>
                      </span>
                    </td>
                    <td className={`${td} max-w-56`}>
                      <span className="line-clamp-2">{b.propertyTitle ?? b.projectName ?? "General visit"}</span>
                    </td>
                    <td className={`${td} whitespace-nowrap`}>{visitTypeLabels[b.visitType]}</td>
                    <td className={td}>
                      <Badge tone={bookingStatusTone[b.status]}>{bookingStatusLabels[b.status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>
        )}
      </section>

      <section className="mt-10" aria-labelledby="enquiries-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="enquiries-heading" className="font-display text-2xl font-bold">
            Latest enquiries
          </h2>
          <Link href="/admin/inquiries" className="text-sm font-semibold text-brand-700 hover:underline">
            All enquiries
          </Link>
        </div>
        {latestInquiries.length === 0 ? (
          <EmptyState icon={Inbox} title="No enquiries yet" description="Messages sent from the contact forms appear here." />
        ) : (
          <Card className="p-0 sm:p-0">
            <ul className="divide-y divide-line">
              {latestInquiries.map((q) => (
                <li key={q.id}>
                  <Link href={`/admin/inquiries/${q.id}`} className="flex flex-col gap-1 px-5 py-4 hover:bg-soft/50 sm:flex-row sm:items-center sm:gap-4">
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-ink">
                        {q.fullName} <span className="font-normal text-muted">· {inquiryInterestLabels[q.interest]}</span>
                      </span>
                      {q.message ? <span className="mt-0.5 block text-sm text-muted">{truncate(q.message, 110)}</span> : null}
                    </span>
                    <span className="flex shrink-0 items-center gap-3 text-xs text-muted">
                      {formatDateTime(q.createdAt)}
                      <Badge tone={inquiryStatusTone[q.status]}>{inquiryStatusLabels[q.status]}</Badge>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </>
  );
}
