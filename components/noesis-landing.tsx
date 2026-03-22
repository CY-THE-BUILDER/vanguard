import Image from "next/image";
import { BrandFrame } from "@/components/brand-frame";
import { Locale } from "@/data/noesis-brand";
import { getBrandNavigation, getLandingContent } from "@/lib/noesis-content";

type NoesisLandingProps = {
  locale: Locale;
};

export async function NoesisLanding({ locale }: NoesisLandingProps) {
  const isZh = locale === "zh-Hant";
  const navigation = await getBrandNavigation(locale);
  const content = await getLandingContent(locale);

  return (
    <BrandFrame
      locale={locale}
      navigation={navigation}
      eyebrow={content.hero.eyebrow}
      title={content.hero.title}
      description={content.hero.body}
    >
      <section className="noesis-hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <blockquote>{content.hero.quote}</blockquote>

            <div className="hero-actions">
              <a className="primary-link" href="#projects">
                {isZh ? "瀏覽作品入口" : "Explore projects"}
              </a>
              <a className="secondary-link" href="#database-architecture">
                {isZh ? "查看資料架構" : "View content architecture"}
              </a>
            </div>
            </div>

          <div className="hero-panel">
            <div className="panel-orbit">
              <Image alt="Noesis icon candidate" src="/brand-icons/stillness-orbit.svg" width={260} height={260} />
            </div>
            <div className="panel-copy">
              <p>{isZh ? "品牌關鍵字" : "Brand keywords"}</p>
              <ul>
                <li>{isZh ? "沉穩與留白" : "Stillness and negative space"}</li>
                <li>{isZh ? "內斂但有重量" : "Quiet but substantial"}</li>
                <li>{isZh ? "禪意與哲思" : "Zen and philosophical"}</li>
                <li>{isZh ? "母品牌可延展" : "Expandable studio architecture"}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="narrative-grid">
        {content.narrativeSections.map((section) => (
          <article className="narrative-card" key={section.title}>
            <p className="section-eyebrow">{section.eyebrow}</p>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </section>

      <section className="projects-section" id="projects">
        <div className="section-heading">
          <p className="section-eyebrow">{isZh ? "作品入口" : "Project Gateway"}</p>
          <h2>{isZh ? "所有 side projects 將從這裡長出來" : "Every side project will branch out from here"}</h2>
        </div>

        <div className="project-grid">
          {content.projects.map((project) => (
            <a className="project-card" href={project.href} key={project.slug}>
              <div className="project-meta">
                <span>{project.status === "live" ? (isZh ? "已上線" : "Live") : isZh ? "建構中" : "Building"}</span>
                <span>{project.tags.join(" / ")}</span>
              </div>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="database-section">
        <div className="section-heading">
          <p className="section-eyebrow">{isZh ? "文章方向" : "Essay Directions"}</p>
          <h2>{isZh ? "品牌與產品背後的思想將在這裡展開" : "The thinking behind the brand and products unfolds here"}</h2>
        </div>
        <div className="essay-list compact-essay-list">
          {content.essays.map((essay) => (
            <article className="essay-card" key={essay.slug}>
              <p className="section-eyebrow">{essay.category}</p>
              <h2>{essay.title}</h2>
              <p>{essay.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="database-section" id="database-architecture">
        <div className="section-heading">
          <p className="section-eyebrow">{content.databaseEyebrow}</p>
          <h2>{content.databaseTitle}</h2>
        </div>

        <div className="database-layout">
          <div className="database-card">
            <pre>
              <code>{`Brand -> Site -> Page -> Section -> Block
                  \\-> Project -> ProjectLocale
                  \\-> Asset -> AssetVariant
                  \\-> ThemeToken -> ThemeTokenLocale
                  \\-> BrandIcon -> BrandIconVersion
Page -> SeoMeta
Page -> NavigationItem
Section -> BlockTranslation
Project -> Link / Tag / Release / ProjectMetric`}</code>
            </pre>
          </div>
          <div className="database-card">
            <ul className="principle-list">
              {content.databasePoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <p className="schema-note">{content.databaseBody}</p>
          </div>
        </div>
      </section>

      <section className="icons-section">
        <div className="section-heading">
          <p className="section-eyebrow">{isZh ? "品牌 Icon 提案" : "Brand Icon Directions"}</p>
          <h2>{isZh ? "五個可直接挑選的品牌識別方向" : "Five identity directions you can choose from"}</h2>
        </div>

        <div className="icon-grid">
          {content.icons.map((icon) => (
            <article className="icon-card" key={icon.id}>
              <div className="icon-preview">
                <Image
                  alt={icon.title}
                  src={icon.assetPath}
                  width={128}
                  height={128}
                />
              </div>
              {icon.recommendation === "primary" ? (
                <p className="icon-badge">{isZh ? "建議作為主識別" : "Recommended primary mark"}</p>
              ) : null}
              <h3>{icon.title}</h3>
              <p>{icon.meaning}</p>
              <p className="icon-personality">{icon.personality}</p>
            </article>
          ))}
        </div>
      </section>
    </BrandFrame>
  );
}
