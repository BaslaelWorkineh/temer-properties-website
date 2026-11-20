import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ExternalLink, Mail, MessageCircle, Phone } from "lucide-react";
import { toId } from "@/app/admin/_lib/server";
import { customerWhatsapp } from "@/components/admin/helpers";
import { InquiryUpdateForm } from "@/components/admin/status-forms";
import { Card, PageHeader } from "@/components/admin/ui";
import { Badge, inquiryStatusTone } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { db } from "@/db";
import { inquiries, projects, properties } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { inquiryInterestLabels, inquiryStatusLabels } from "@/lib/config/booking";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Enquiry" };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  );
}

export default async function AdminInquiryPage({ params }: PageProps<"/admin/inquiries/[id]">) {
  await requireAdmin();
  const id = toId((await params).id);
  if (!id) notFound();

  const [row] = await db
    .select({
      inquiry: inquiries,
      property: { id: properties.id, title: properties.title, slug: properties.slug },
      project: { id: projects.id, name: projects.name, slug: projects.slug },
    })
    .from(inquiries)
    .leftJoin(properties, eq(properties.id, inquiries.propertyId))
    .leftJoin(projects, eq(projects.id, inquiries.projectId))
    .where(eq(inquiries.id, id))
    .limit(1);
  if (!row) notFound();
  const { inquiry: q, property, project } = row;

  const reply = `Hello ${q.fullName}, thank you for contacting Temer Properties${property?.title ? ` about ${property.title}` : ""}.`;

  return (
    <>
      <PageHeader
        title={`Enquiry from ${q.fullName}`}
        back={{ href: "/admin/inquiries", label: "Enquiries" }}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={inquiryStatusTone[q.status]}>{inquiryStatusLabels[q.status]}</Badge>
            <span>Received {formatDateTime(q.createdAt)}</span>
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="grid gap-6">
          <Card>
            <h2 className="font-display text-xl font-bold">Message</h2>
            <dl className="mt-2 divide-y divide-line">
              <Row label="Interested in">{inquiryInterestLabels[q.interest]}</Row>
              {property?.id ? (
                <Row label="Property">
                  <span className="flex flex-wrap items-center gap-3">
                    <Link href={`/admin/properties/${property.id}`} className="font-medium text-brand-700 hover:underline">
                      {property.title}
                    </Link>
                    <a href={`/properties/${property.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-muted hover:text-brand-700">
                      Public page <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                  </span>
                </Row>
              ) : null}
              {project?.id ? (
                <Row label="Project">
                  <Link href={`/admin/projects/${project.id}`} className="font-medium text-brand-700 hover:underline">
                    {project.name}
                  </Link>
                </Row>
              ) : null}
              {q.company ? <Row label="Company">{q.company}</Row> : null}
              <Row label="Message">{q.message ? <span className="whitespace-pre-line">{q.message}</span> : <span className="text-muted">—</span>}</Row>
              <Row label="Sent from">{q.source ? <span className="break-all font-mono text-xs">{q.source}</span> : <span className="text-muted">—</span>}</Row>
            </dl>
          </Card>

          <Card>
            <h2 className="font-display text-xl font-bold">Follow-up</h2>
            <div className="mt-4">
              <InquiryUpdateForm id={q.id} status={q.status} adminNotes={q.adminNotes} />
            </div>
          </Card>
        </div>

        <div className="grid content-start gap-6">
          <Card>
            <h2 className="font-display text-xl font-bold">Contact</h2>
            <p className="mt-3 text-lg font-semibold">{q.fullName}</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href={`tel:${q.phone}`} className="inline-flex items-center gap-2 text-brand-700 hover:underline">
                  <Phone className="size-4" aria-hidden="true" /> {q.phone}
                </a>
              </li>
              {q.email ? (
                <li>
                  <a href={`mailto:${q.email}`} className="inline-flex items-center gap-2 break-all text-brand-700 hover:underline">
                    <Mail className="size-4 shrink-0" aria-hidden="true" /> {q.email}
                  </a>
                </li>
              ) : null}
            </ul>
            <div className="mt-5 grid gap-2">
              <a href={customerWhatsapp(q.phone, reply)} target="_blank" rel="noopener" className={buttonStyles({ className: "w-full" })}>
                <MessageCircle className="size-4" aria-hidden="true" /> Reply on WhatsApp
              </a>
              <a href={`tel:${q.phone}`} className={buttonStyles({ variant: "outline", className: "w-full" })}>
                <Phone className="size-4" aria-hidden="true" /> Call
              </a>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
