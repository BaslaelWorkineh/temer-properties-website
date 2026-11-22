import { notFound } from "next/navigation";
import { ContactBar } from "@/components/site/contact-bar";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { LangProvider } from "@/components/site/lang";
import { hasLocale, locales } from "@/lib/i18n/config";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <LangProvider lang={lang}>
      {/* `display: contents` keeps the layout unchanged; the lang attribute tells browsers, screen readers and
          search engines which language this part of the page is in. */}
      <div lang={lang} className="contents">
        <Header lang={lang} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer lang={lang} />
        <ContactBar lang={lang} />
      </div>
    </LangProvider>
  );
}
