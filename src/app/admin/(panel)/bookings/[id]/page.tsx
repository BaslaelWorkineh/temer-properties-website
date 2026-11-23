import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Ban, CalendarCheck, CheckCheck, ExternalLink, Mail, MessageCircle, Phone, UserX } from "lucide-react";
import { toId } from "@/app/admin/_lib/server";
import { setBookingStatusAction } from "@/app/admin/(panel)/bookings/actions";
import { customerWhatsapp } from "@/components/admin/helpers";
import { BookingUpdateForm } from "@/components/admin/status-forms";
import { Card, PageHeader } from "@/components/admin/ui";
import { Badge, bookingStatusTone } from "@/components/ui/badge";
import { buttonStyles, type ButtonVariant } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { db } from "@/db";
import { bookings, projects, properties } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { bookingStatusLabels, visitTypeLabels, type BookingStatus } from "@/lib/config/booking";
import { formatDateTime, formatSlot, formatVisitDate } from "@/lib/format";

// Admin pages are per-request and authenticated; they are allowed to block (see the panel layout).
export const instant = false;

export const metadata: Metadata = { title: "Booking" };

function QuickStatus({ id, status, label, icon, variant = "outline" }: { id: number; status: BookingStatus; label: string; icon: React.ReactNode; variant?: ButtonVariant }) {
  return (
    <form action={setBookingStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <SubmitButton variant={variant} size="sm" pendingText="Updating…">
        {icon}
        {label}
      </SubmitButton>
    </form>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  );
}

export default async function AdminBookingPage({ params }: PageProps<"/admin/bookings/[id]">) {
  await requireAdmin();
  const id = toId((await params).id);
  if (!id) notFound();

  const [row] = await db
    .select({
      booking: bookings,
      property: { id: properties.id, title: properties.title, slug: properties.slug },
      project: { id: projects.id, name: projects.name, slug: projects.slug },
    })
    .from(bookings)
    .leftJoin(properties, eq(properties.id, bookings.propertyId))
    .leftJoin(projects, eq(projects.id, bookings.projectId))
    .where(eq(bookings.id, id))
    .limit(1);
  if (!row) notFound();
  const { booking: b, property, project } = row;

  const confirmation = `Hello ${b.fullName}, your site visit with Temer Properties is confirmed for ${formatVisitDate(b.visitDate)} at ${formatSlot(b.timeSlot)}. Reference: ${b.reference}.`;

  return (
    <>
      <PageHeader
        title={`Booking ${b.reference}`}
        back={{ href: "/admin/bookings", label: "Bookings" }}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={bookingStatusTone[b.status]}>{bookingStatusLabels[b.status]}</Badge>
            <span>Booked {formatDateTime(b.createdAt)}</span>
          </span>
        }
        actions={
          <>
            {b.status === "pending" ? (
              <QuickStatus id={b.id} status="confirmed" label="Confirm" variant="primary" icon={<CalendarCheck className="size-4" aria-hidden="true" />} />
            ) : null}
            {b.status === "confirmed" ? (
              <>
                <QuickStatus id={b.id} status="completed" label="Mark visited" icon={<CheckCheck className="size-4" aria-hidden="true" />} />
                <QuickStatus id={b.id} status="no_show" label="No-show" icon={<UserX className="size-4" aria-hidden="true" />} />
              </>
            ) : null}
            {b.status === "pending" || b.status === "confirmed" ? (
              <QuickStatus id={b.id} status="cancelled" label="Cancel" icon={<Ban className="size-4" aria-hidden="true" />} />
            ) : null}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="grid gap-6">
          <Card>
            <h2 className="font-display text-xl font-bold">Visit</h2>
            <dl className="mt-2 divide-y divide-line">
              <Row label="Date">{formatVisitDate(b.visitDate)}</Row>
              <Row label="Time">{formatSlot(b.timeSlot)}</Row>
              <Row label="Type">{visitTypeLabels[b.visitType]}</Row>
              <Row label="Party size">
                {b.partySize} {b.partySize === 1 ? "person" : "people"}
              </Row>
              <Row label="Interested in">
                {property?.id ? (
                  <span className="flex flex-wrap items-center gap-3">
                    <Link href={`/admin/properties/${property.id}`} className="font-medium text-brand-700 hover:underline">
                      {property.title}
                    </Link>
                    <a href={`/properties/${property.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-muted hover:text-brand-700">
                      Public page <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                  </span>
                ) : project?.id ? (
                  <Link href={`/admin/projects/${project.id}`} className="font-medium text-brand-700 hover:underline">
                    {project.name}
                  </Link>
                ) : (
                  "General visit"
                )}
              </Row>
              {property?.id && project?.id ? <Row label="Project">{project.name}</Row> : null}
              <Row label="Message">{b.message ? <span className="whitespace-pre-line">{b.message}</span> : <span className="text-muted">—</span>}</Row>
              <Row label="Booked from">{b.source ? <span className="break-all font-mono text-xs">{b.source}</span> : <span className="text-muted">—</span>}</Row>
            </dl>
          </Card>

          <Card>
            <h2 className="font-display text-xl font-bold">Update booking</h2>
            <div className="mt-4">
              <BookingUpdateForm id={b.id} status={b.status} adminNotes={b.adminNotes} />
            </div>
          </Card>
        </div>

        <div className="grid content-start gap-6">
          <Card>
            <h2 className="font-display text-xl font-bold">Customer</h2>
            <p className="mt-3 text-lg font-semibold">{b.fullName}</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href={`tel:${b.phone}`} className="inline-flex items-center gap-2 text-brand-700 hover:underline">
                  <Phone className="size-4" aria-hidden="true" /> {b.phone}
                </a>
              </li>
              {b.email ? (
                <li>
                  <a href={`mailto:${b.email}`} className="inline-flex items-center gap-2 break-all text-brand-700 hover:underline">
                    <Mail className="size-4 shrink-0" aria-hidden="true" /> {b.email}
                  </a>
                </li>
              ) : null}
            </ul>
            <div className="mt-5 grid gap-2">
              <a href={customerWhatsapp(b.phone, confirmation)} target="_blank" rel="noopener" className={buttonStyles({ className: "w-full" })}>
                <MessageCircle className="size-4" aria-hidden="true" /> Send confirmation on WhatsApp
              </a>
              <a href={`tel:${b.phone}`} className={buttonStyles({ variant: "outline", className: "w-full" })}>
                <Phone className="size-4" aria-hidden="true" /> Call customer
              </a>
            </div>
            <p className="mt-3 text-xs text-muted">The WhatsApp message is prefilled; you can edit it before sending.</p>
          </Card>
        </div>
      </div>
    </>
  );
}
