import type { Metadata } from "next";
import { headers } from "next/headers";
import { BrandFrame } from "@/components/brand-frame";
import { inferLocaleFromHeader } from "@/data/noesis-brand";
import { getAboutPageContent } from "@/lib/noesis-content";

export const metadata: Metadata = {
  title: "About | Noesis Studio",
  description: "The worldview, design principles, and studio philosophy behind Noesis Studio."
};

export default async function AboutPage() {
  const locale = inferLocaleFromHeader(headers().get("accept-language"));
  const isZh = locale === "zh-Hant";
  const content = await getAboutPageContent(locale);

  return (
    <BrandFrame
      locale={locale}
      navigation={content.navigation}
      eyebrow={content.intro.eyebrow}
      title={content.intro.title}
      description={content.intro.body}
    >
      <section className="narrative-grid">
        {content.principles.map((principle) => (
          <article className="narrative-card" key={principle.title}>
            <h2>{principle.title}</h2>
            <p>{principle.body}</p>
          </article>
        ))}
      </section>

      <section className="database-section">
        <div className="section-heading">
          <p className="section-eyebrow">{content.lens.eyebrow}</p>
          <h2>{content.lens.title}</h2>
        </div>
        <div className="database-layout">
          <article className="database-card">
            <p>{content.lens.body}</p>
          </article>
          <article className="database-card">
            <p>
              {isZh
                ? "因此 noesis.studio 會像一個可長期演進的母系統，而不只是某個單點作品的展示頁。"
                : "That is why noesis.studio is shaped as an evolving parent system rather than a single-project promo page."}
            </p>
          </article>
        </div>
      </section>
    </BrandFrame>
  );
}
