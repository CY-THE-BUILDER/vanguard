import type { Metadata } from "next";
import { headers } from "next/headers";
import { BrandFrame } from "@/components/brand-frame";
import { inferLocaleFromHeader } from "@/data/noesis-brand";
import { getEssaysPageContent } from "@/lib/noesis-content";

export const metadata: Metadata = {
  title: "Essays | Noesis Studio",
  description: "Philosophy, product writing, and brand essays from Noesis Studio."
};

export default async function EssaysPage() {
  const locale = inferLocaleFromHeader(headers().get("accept-language"));
  const isZh = locale === "zh-Hant";
  const content = await getEssaysPageContent(locale);

  return (
    <BrandFrame
      locale={locale}
      navigation={content.navigation}
      eyebrow={isZh ? "文章與思考" : "Essays and Thinking"}
      title={isZh ? "品牌、產品、審美與決策的長篇筆記" : "Long-form notes on brand, product, aesthetics, and decisions"}
      description={
        isZh
          ? "這裡會承接工作室的哲學思辨、產品觀與審美準則，讓每個 side project 背後的想法可以被完整看見。"
          : "This space will hold the studio's philosophical reflections, product points of view, and aesthetic principles so the thinking behind each side project remains visible."
      }
    >
      <section className="essay-list">
        {content.essays.map((essay) => (
          <article className="essay-card" id={essay.slug} key={essay.slug}>
            <p className="section-eyebrow">{essay.category}</p>
            <h2>{essay.title}</h2>
            <p>{essay.summary}</p>
          </article>
        ))}
      </section>
    </BrandFrame>
  );
}
