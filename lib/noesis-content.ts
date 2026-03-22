import { cache } from "react";
import {
  Locale,
  essays,
  featuredProjects,
  getLocalizedText,
  iconConcepts,
  siteNav,
  brandNarrative,
  studioPrinciples
} from "@/data/noesis-brand";
import { getPrismaClient } from "@/lib/prisma";

function toPrismaLocale(locale: Locale) {
  return locale === "zh-Hant" ? "zh_Hant" : "en";
}

type NavItem = {
  href: string;
  label: string;
};

type LocalizedSection = {
  eyebrow?: string | null;
  title?: string | null;
  body?: string | null;
};

type ProjectCard = {
  slug: string;
  href: string;
  status: "live" | "building";
  title: string;
  summary: string;
  tags: string[];
  role: string;
};

type EssayCard = {
  slug: string;
  category: string;
  title: string;
  summary: string;
};

type PrincipleCard = {
  title: string;
  body: string;
};

function buildFallbackNav(locale: Locale): NavItem[] {
  return siteNav.map((item) => ({
    href: item.href,
    label: getLocalizedText(item.label, locale)
  }));
}

function buildFallbackProjects(locale: Locale): ProjectCard[] {
  return featuredProjects.map((project) => ({
    slug: project.slug,
    href: project.href,
    status: project.status,
    title: getLocalizedText(project.title, locale),
    summary: getLocalizedText(project.summary, locale),
    tags: project.tags,
    role: getLocalizedText(project.role, locale)
  }));
}

function buildFallbackEssays(locale: Locale): EssayCard[] {
  return essays.map((essay) => ({
    slug: essay.slug,
    category: getLocalizedText(essay.category, locale),
    title: getLocalizedText(essay.title, locale),
    summary: getLocalizedText(essay.summary, locale)
  }));
}

function buildFallbackPrinciples(locale: Locale): PrincipleCard[] {
  return studioPrinciples.map((principle) => ({
    title: getLocalizedText(principle.title, locale),
    body: getLocalizedText(principle.body, locale)
  }));
}

async function getPageSectionMap(pageSlug: string, locale: Locale) {
  const prisma = getPrismaClient();
  if (!prisma) {
    return null;
  }

  try {
    const page = await prisma.page.findFirst({
      where: {
        slug: pageSlug
      },
      include: {
        sections: {
          orderBy: {
            orderIndex: "asc"
          },
          include: {
            locales: {
              where: {
                locale: toPrismaLocale(locale)
              }
            }
          }
        }
      }
    });

    if (!page) {
      return null;
    }

    return Object.fromEntries(
      page.sections.map((section) => {
        const localized = section.locales[0] ?? null;
        return [
          section.key,
          {
            eyebrow: localized?.eyebrow ?? null,
            title: localized?.title ?? null,
            body: localized?.body ?? null
          } satisfies LocalizedSection
        ];
      })
    ) as Record<string, LocalizedSection>;
  } catch {
    return null;
  }
}

const getProjectsFromDb = cache(async (locale: Locale) => {
  const prisma = getPrismaClient();
  if (!prisma) {
    return null;
  }

  try {
    const projects = await prisma.project.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        locales: {
          where: {
            locale: toPrismaLocale(locale)
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (projects.length === 0) {
      return null;
    }

    return projects.map((project) => {
      const localized = project.locales[0];
      return {
        slug: project.slug,
        href: project.path,
        status: project.status === "LIVE" ? "live" : "building",
        title: localized?.name ?? project.slug,
        summary: localized?.summary ?? "",
        tags: project.tags.map((entry) => entry.tag.slug),
        role: localized?.role ?? ""
      } satisfies ProjectCard;
    });
  } catch {
    return null;
  }
});

export const getBrandNavigation = cache(async (locale: Locale) => {
  const prisma = getPrismaClient();
  if (!prisma) {
    return buildFallbackNav(locale);
  }

  try {
    const items = await prisma.navigationItem.findMany({
      orderBy: {
        orderIndex: "asc"
      }
    });

    if (items.length === 0) {
      return buildFallbackNav(locale);
    }

    return items.map((item) => ({
      href: item.href,
      label: item.label
    }));
  } catch {
    return buildFallbackNav(locale);
  }
});

export const getLandingContent = cache(async (locale: Locale) => {
  const sections = await getPageSectionMap("home", locale);
  const projects = (await getProjectsFromDb(locale)) ?? buildFallbackProjects(locale);
  const essaysPageSections = await getPageSectionMap("essays", locale);
  const essayCards =
    essaysPageSections
      ? Object.entries(essaysPageSections)
          .filter(([key]) => key.startsWith("essay_"))
          .map(([key, section]) => ({
            slug: key,
            category: section.eyebrow ?? "",
            title: section.title ?? "",
            summary: section.body ?? ""
          }))
          .filter((essay) => essay.title)
      : buildFallbackEssays(locale);

  return {
    hero: {
      eyebrow: sections?.hero?.eyebrow ?? getLocalizedText(brandNarrative.hero.eyebrow, locale),
      title: sections?.hero?.title ?? getLocalizedText(brandNarrative.hero.title, locale),
      body: sections?.hero?.body ?? getLocalizedText(brandNarrative.hero.body, locale),
      quote: getLocalizedText(brandNarrative.hero.quote, locale)
    },
    narrativeSections: [
      {
        eyebrow: sections?.brand_core?.eyebrow ?? getLocalizedText(brandNarrative.sections[0].eyebrow, locale),
        title: sections?.brand_core?.title ?? getLocalizedText(brandNarrative.sections[0].title, locale),
        body: sections?.brand_core?.body ?? getLocalizedText(brandNarrative.sections[0].body, locale)
      },
      {
        eyebrow:
          sections?.visual_language?.eyebrow ?? getLocalizedText(brandNarrative.sections[1].eyebrow, locale),
        title: sections?.visual_language?.title ?? getLocalizedText(brandNarrative.sections[1].title, locale),
        body: sections?.visual_language?.body ?? getLocalizedText(brandNarrative.sections[1].body, locale)
      }
    ],
    databaseTitle:
      sections?.database_architecture?.title ?? getLocalizedText(brandNarrative.database.title, locale),
    databaseEyebrow:
      sections?.database_architecture?.eyebrow ?? (locale === "zh-Hant" ? "資料庫架構" : "Database Architecture"),
    databaseBody:
      sections?.database_architecture?.body ??
      (locale === "zh-Hant"
        ? "完整資料 schema 已放入 docs，方便你後續接 Prisma、Postgres、Supabase 或任何 headless CMS。"
        : "A complete schema draft is included in docs so you can later plug this into Prisma, Postgres, Supabase, or any headless CMS."),
    databasePoints: brandNarrative.database.points[locale],
    projects,
    essays: essayCards.length > 0 ? essayCards : buildFallbackEssays(locale),
    icons: iconConcepts.map((icon) => ({
      id: icon.id,
      assetPath: icon.assetPath,
      title: getLocalizedText(icon.title, locale),
      meaning: getLocalizedText(icon.meaning, locale),
      personality: getLocalizedText(icon.personality, locale),
      recommendation: icon.recommendation
    }))
  };
});

export const getProjectsPageContent = cache(async (locale: Locale) => {
  return {
    navigation: await getBrandNavigation(locale),
    projects: (await getProjectsFromDb(locale)) ?? buildFallbackProjects(locale)
  };
});

export const getEssaysPageContent = cache(async (locale: Locale) => {
  const sections = await getPageSectionMap("essays", locale);

  if (!sections) {
    return {
      navigation: await getBrandNavigation(locale),
      essays: buildFallbackEssays(locale)
    };
  }

  const mapped = Object.entries(sections)
    .filter(([key]) => key.startsWith("essay_"))
    .map(([key, value]) => ({
      slug: key,
      category: value.eyebrow ?? "",
      title: value.title ?? "",
      summary: value.body ?? ""
    }))
    .filter((essay) => essay.title);

  return {
    navigation: await getBrandNavigation(locale),
    essays: mapped.length > 0 ? mapped : buildFallbackEssays(locale)
  };
});

export const getAboutPageContent = cache(async (locale: Locale) => {
  const sections = await getPageSectionMap("about", locale);

  const principles = sections
    ? ["principle_1", "principle_2", "principle_3"]
        .map((key) => sections[key])
        .filter(Boolean)
        .map((entry) => ({
          title: entry?.title ?? "",
          body: entry?.body ?? ""
        }))
        .filter((entry) => entry.title)
    : buildFallbackPrinciples(locale);

  return {
    navigation: await getBrandNavigation(locale),
    intro: {
      eyebrow: sections?.about_intro?.eyebrow ?? getLocalizedText(brandNarrative.aboutIntro.eyebrow, locale),
      title: sections?.about_intro?.title ?? getLocalizedText(brandNarrative.aboutIntro.title, locale),
      body: sections?.about_intro?.body ?? getLocalizedText(brandNarrative.aboutIntro.body, locale)
    },
    principles: principles.length > 0 ? principles : buildFallbackPrinciples(locale),
    lens: {
      eyebrow: sections?.studio_lens?.eyebrow ?? (locale === "zh-Hant" ? "角色視角" : "Studio Lens"),
      title:
        sections?.studio_lens?.title ??
        (locale === "zh-Hant"
          ? "品牌、產品、工程同時在線"
          : "Brand, product, and engineering in one continuous practice"),
      body:
        sections?.studio_lens?.body ??
        (locale === "zh-Hant"
          ? "這個工作室不是把品牌包裝外包給設計，再把產品丟給工程，而是把敘事、功能、技術選型與細節體驗一起思考。"
          : "This studio does not separate branding, product, and engineering into disconnected phases. Narrative, utility, implementation, and sensory detail are designed together.")
    }
  };
});
