import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Container } from "@/components/site/section";
import { site } from "@/lib/config/site";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses and protects the personal information you share through this website.`,
  path: "/privacy-policy",
});

// Template text: have it reviewed by the company's legal adviser before launch.
export default function PrivacyPage() {
  return (
    <Container className="max-w-3xl py-10">
      <Breadcrumbs items={[{ name: "Privacy policy", path: "/privacy-policy" }]} />
      <article className="prose-content mt-8">
        <h1 className="text-4xl font-bold">Privacy policy</h1>
        <p>
          This policy explains how {site.legalName} (&quot;{site.name}&quot;, &quot;we&quot;) handles personal information
          collected through this website.
        </p>
        <h2>What we collect</h2>
        <p>
          When you book a site visit or send an enquiry, we collect the details you enter: your name, phone number, email
          address (optional), preferred visit date and time, and your message. We also keep the page you sent it from.
        </p>
        <h2>How we use it</h2>
        <ul>
          <li>To contact you about your enquiry or confirm your site visit.</li>
          <li>To share information about the properties you asked about.</li>
          <li>To keep records of bookings and improve our service.</li>
        </ul>
        <p>We do not sell your personal information. We share it only with staff who need it to respond to you.</p>
        <h2>How long we keep it</h2>
        <p>We keep enquiry and booking records for as long as needed to serve you and meet legal obligations, then delete them.</p>
        <h2>Your choices</h2>
        <p>
          You can ask us to access, correct or delete your information at any time by emailing{" "}
          <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a> or calling{" "}
          <a href={`tel:${site.contact.phone}`}>{site.contact.phoneDisplay}</a>.
        </p>
        <h2>Cookies</h2>
        <p>
          This website does not use advertising or tracking cookies. Staff who sign in to the admin area receive a security
          cookie that keeps them signed in.
        </p>
      </article>
    </Container>
  );
}
