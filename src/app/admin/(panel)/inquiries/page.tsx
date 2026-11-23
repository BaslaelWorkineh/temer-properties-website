import type { Metadata } from "next";
import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { Inbox, MessageCircle, Phone } from "lucide-react";
import { PAGE_SIZE, customerWhatsapp, firstParam, pageFromParam } from "@/components/admin/helpers";
import { EmptyState, PageHeader, Pagination, TableCard, Tabs, td, th } from "@/components/admin/ui";
import { Badge, inquiryStatusTone } from "@/components/ui/badge";
import { db } from "@/db";
import { inquiries, projects, properties } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { INQUIRY_STATUSES, inquiryInterestLabels, inquiryStatusLabels, type InquiryStatus } from "@/lib/config/booking";
import { formatDateTime } from "@/lib/format";
import { truncate } from "@/lib/utils";

// Admin pages are per-request and authenticated; they are allowed to block (see the panel layout).
export const instant = false;

export const metadata: Metadata = { title: "Enquiries" };

export default async function AdminInquiriesPage({ searchParams }: PageProps<"/admin/inquiries">) {
  await requireAdmin();
  const sp = await searchParams;
  const statusParam = firstParam(sp.status);
  const status = INQUIRY_STATUSES.includes(statusParam as InquiryStatus) ? (statusParam as InquiryStatus) : undefined;
  const page = pageFromParam(sp.page);
  const where = status ? eq(inquiries.status, status) : undefined;

  const [rows, [totalRow], statusCounts] = await Promise.all([
    db
      .select({
        id: inquiries.id,
        fullName: inquiries.fullName,
        phone: inquiries.phone,
        email: inquiries.email,
        interest: inquiries.interest,
        message: inquiries.message,
        status: inquiries.status,
        createdAt: inquiries.createdAt,
        propertyTitle: properties.title,
        projectName: projects.name,
      })
      .from(inquiries)
      .leftJoin(properties, eq(properties.id, inquiries.propertyId))
      .leftJoin(projects, eq(projects.id, inquiries.projectId))
      .where(where)
      .orderBy(desc(inquiries.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(inquiries).where(where),
    db.select({ status: inquiries.status, n: count() }).from(inquiries).groupBy(inquiries.status),
  ]);

  const countFor = (s: InquiryStatus) => statusCounts.find((c) => c.status === s)?.n ?? 0;
  const tabs = [
    { key: "all", label: "All", href: "/admin/inquiries" },
    ...INQUIRY_STATUSES.map((s) => ({ key: s, label: inquiryStatusLabels[s], href: `/admin/inquiries?status=${s}`, count: countFor(s) })),
  ];

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (p > 1) params.set("page", String(p));
    const query = params.toString();
    return `/admin/inquiries${query ? `?${query}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Enquiries" description="Messages from the contact and enquiry forms. Reply quickly: the first developer to call back usually wins the buyer." />
      <Tabs tabs={tabs} active={status ?? "all"} />

      {rows.length === 0 ? (
        <EmptyState icon={Inbox} title="No enquiries here" description="Messages from the website's forms will appear in this list." />
      ) : (
        <>
          <TableCard>
            <table className="min-w-full divide-y divide-line">
              <thead className="bg-soft/60">
                <tr>
                  <th scope="col" className={th}>Received</th>
                  <th scope="col" className={th}>From</th>
                  <th scope="col" className={th}>Interest</th>
                  <th scope="col" className={th}>Message</th>
                  <th scope="col" className={th}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((q) => (
                  <tr key={q.id} className="hover:bg-soft/50">
                    <td className={`${td} whitespace-nowrap`}>
                      <Link href={`/admin/inquiries/${q.id}`} className="font-semibold text-ink hover:text-brand-700">
                        {formatDateTime(q.createdAt)}
                      </Link>
                    </td>
                    <td className={td}>
                      <span className="block font-medium">{q.fullName}</span>
                      <span className="mt-0.5 flex flex-wrap gap-x-3 text-xs">
                        <a href={`tel:${q.phone}`} className="inline-flex items-center gap-1 whitespace-nowrap text-brand-700 hover:underline">
                          <Phone className="size-3.5" aria-hidden="true" /> {q.phone}
                        </a>
                        <a href={customerWhatsapp(q.phone)} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-brand-700 hover:underline">
                          <MessageCircle className="size-3.5" aria-hidden="true" /> WhatsApp
                        </a>
                      </span>
                    </td>
                    <td className={`${td} min-w-40`}>
                      <span className="block">{inquiryInterestLabels[q.interest]}</span>
                      {q.propertyTitle || q.projectName ? <span className="block text-xs text-muted">{q.propertyTitle ?? q.projectName}</span> : null}
                    </td>
                    <td className={`${td} min-w-64 max-w-md text-muted`}>
                      <Link href={`/admin/inquiries/${q.id}`} className="hover:text-ink">
                        {q.message ? truncate(q.message, 120) : <span className="italic">No message</span>}
                      </Link>
                    </td>
                    <td className={td}>
                      <Badge tone={inquiryStatusTone[q.status]}>{inquiryStatusLabels[q.status]}</Badge>
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
