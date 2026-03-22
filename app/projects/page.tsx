import type { Metadata } from "next";
import { headers } from "next/headers";
import { BrandFrame } from "@/components/brand-frame";
import { inferLocaleFromHeader } from "@/data/noesis-brand";
import { getProjectsPageContent } from "@/lib/noesis-content";

export const metadata: Metadata = {
  title: "Projects | Noesis Studio",
  description: "Projects, products, and studio experiments built under Noesis Studio."
};

export default async function ProjectsPage() {
  const locale = inferLocaleFromHeader(headers().get("accept-language"));
  const isZh = locale === "zh-Hant";
  const content = await getProjectsPageContent(locale);

  return (
    <BrandFrame
      locale={locale}
      navigation={content.navigation}
      eyebrow={isZh ? "作品入口" : "Project Gateway"}
      title={isZh ? "每個作品都有自己的節奏，也共享同一個母語" : "Each project keeps its own rhythm while sharing one parent language"}
      description={
        isZh
          ? "這裡收攏目前已上線與正在醞釀中的 side projects。未來每個新產品都會先回到這裡，與整個品牌系統對話。"
          : "This is the collection of live and emerging side projects. Every future product will return here and stay in dialogue with the wider brand system."
      }
    >
      <section className="project-grid standalone-grid">
        {content.projects.map((project) => (
          <a className="project-card" href={project.href} key={project.slug}>
            <div className="project-meta">
              <span>{project.role}</span>
              <span>{project.tags.join(" / ")}</span>
            </div>
            <h3>{project.title}</h3>
            <p>{project.summary}</p>
          </a>
        ))}
      </section>
    </BrandFrame>
  );
}
