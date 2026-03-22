import type { Metadata } from "next";
import { adminLoginAction, adminLogoutAction, updateNavigationAction, updateProjectAction, updateSectionLocaleAction } from "@/app/admin/actions";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";
import { getPrismaClient } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Admin | Noesis Studio",
  description: "Internal content administration for Noesis Studio.",
  robots: {
    index: false,
    follow: false
  }
};

async function getAdminData() {
  const prisma = getPrismaClient();
  if (!prisma) {
    return null;
  }

  const [navigation, pages, projects] = await Promise.all([
    prisma.navigationItem.findMany({
      orderBy: {
        orderIndex: "asc"
      }
    }),
    prisma.page.findMany({
      where: {
        slug: {
          in: ["home", "about", "essays"]
        }
      },
      orderBy: {
        slug: "asc"
      },
      include: {
        sections: {
          orderBy: {
            orderIndex: "asc"
          },
          include: {
            locales: {
              orderBy: {
                locale: "asc"
              }
            }
          }
        }
      }
    }),
    prisma.project.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        locales: {
          orderBy: {
            locale: "asc"
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    })
  ]);

  return {
    navigation,
    pages,
    projects
  };
}

export default async function AdminPage({
  searchParams
}: {
  searchParams?: {
    error?: string;
  };
}) {
  if (!isAdminConfigured()) {
    return (
      <main className="noesis-shell">
        <section className="brand-header">
          <h1>Admin is not configured</h1>
          <p className="page-hero-body">Add `ADMIN_SECRET` to `.env.local` and your deployment environment to enable the content admin.</p>
        </section>
      </main>
    );
  }

  if (!isAdminAuthenticated()) {
    const showError = searchParams?.error === "invalid-password";
    return (
      <main className="noesis-shell">
        <section className="brand-header">
          <p className="section-eyebrow">Protected Admin</p>
          <h1>Sign in to edit Noesis Studio content</h1>
          <p className="page-hero-body">This lightweight admin is designed for direct editing of navigation, page sections, and project copy stored in Neon.</p>
          <form action={adminLoginAction} className="admin-form auth-form">
            <label className="admin-label" htmlFor="password">
              Admin secret
            </label>
            <input className="admin-input" id="password" name="password" type="password" required />
            {showError ? <p className="admin-error">The admin secret did not match.</p> : null}
            <button className="primary-link" type="submit">
              Sign in
            </button>
          </form>
        </section>
      </main>
    );
  }

  const data = await getAdminData();

  if (!data) {
    return (
      <main className="noesis-shell">
        <section className="brand-header">
          <h1>Database unavailable</h1>
          <p className="page-hero-body">`DATABASE_URL` is required for the admin console.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="noesis-shell">
      <section className="brand-header">
        <div className="noesis-topbar">
          <div>
            <p className="noesis-mark">NOESIS.STUDIO ADMIN</p>
            <p className="noesis-submark">Edit navigation, localized section content, and project copy directly in Neon.</p>
          </div>
          <form action={adminLogoutAction}>
            <button className="secondary-link" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </section>

      <section className="database-section">
        <div className="section-heading">
          <p className="section-eyebrow">Navigation</p>
          <h2>Primary links</h2>
        </div>
        <div className="admin-grid">
          {data.navigation.map((item) => (
            <form action={updateNavigationAction} className="admin-card" key={item.id}>
              <input name="navigationId" type="hidden" value={item.id} />
              <label className="admin-label">
                Label
                <input className="admin-input" defaultValue={item.label} name="label" />
              </label>
              <label className="admin-label">
                Href
                <input className="admin-input" defaultValue={item.href} name="href" />
              </label>
              <button className="primary-link" type="submit">
                Save navigation
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="database-section">
        <div className="section-heading">
          <p className="section-eyebrow">Pages</p>
          <h2>Localized section editing</h2>
        </div>
        {data.pages.map((page) => (
          <div className="admin-page-group" key={page.id}>
            <h3>{page.slug}</h3>
            <div className="admin-grid">
              {page.sections.flatMap((section) =>
                ["zh_Hant", "en"].map((locale) => {
                  const localized = section.locales.find((entry) => entry.locale === locale);
                  return (
                    <form action={updateSectionLocaleAction} className="admin-card" key={`${section.id}-${locale}`}>
                      <input name="sectionId" type="hidden" value={section.id} />
                      <input name="locale" type="hidden" value={locale} />
                      <input
                        name="revalidateTarget"
                        type="hidden"
                        value={page.slug === "home" ? "/" : `/${page.slug}`}
                      />
                      <p className="admin-card-title">
                        {section.key} · {locale}
                      </p>
                      <label className="admin-label">
                        Eyebrow
                        <input className="admin-input" defaultValue={localized?.eyebrow ?? ""} name="eyebrow" />
                      </label>
                      <label className="admin-label">
                        Title
                        <input className="admin-input" defaultValue={localized?.title ?? ""} name="title" />
                      </label>
                      <label className="admin-label">
                        Body
                        <textarea className="admin-textarea" defaultValue={localized?.body ?? ""} name="body" rows={6} />
                      </label>
                      <button className="primary-link" type="submit">
                        Save section
                      </button>
                    </form>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="database-section">
        <div className="section-heading">
          <p className="section-eyebrow">Projects</p>
          <h2>Project copy and routing</h2>
        </div>
        <div className="admin-grid">
          {data.projects.flatMap((project) =>
            ["zh_Hant", "en"].map((locale) => {
              const localized = project.locales.find((entry) => entry.locale === locale);
              return (
                <form action={updateProjectAction} className="admin-card" key={`${project.id}-${locale}`}>
                  <input name="projectId" type="hidden" value={project.id} />
                  <input name="locale" type="hidden" value={locale} />
                  <p className="admin-card-title">
                    {project.slug} · {locale}
                  </p>
                  <label className="admin-label">
                    Name
                    <input className="admin-input" defaultValue={localized?.name ?? ""} name="name" />
                  </label>
                  <label className="admin-label">
                    Summary
                    <textarea className="admin-textarea" defaultValue={localized?.summary ?? ""} name="summary" rows={5} />
                  </label>
                  <label className="admin-label">
                    Role
                    <input className="admin-input" defaultValue={localized?.role ?? ""} name="role" />
                  </label>
                  <label className="admin-label">
                    Path
                    <input className="admin-input" defaultValue={project.path} name="path" />
                  </label>
                  <label className="admin-label">
                    Status
                    <select className="admin-input" defaultValue={project.status} name="status">
                      <option value="DRAFT">DRAFT</option>
                      <option value="LIVE">LIVE</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </label>
                  <label className="admin-label">
                    Tags
                    <input
                      className="admin-input"
                      defaultValue={project.tags.map((entry) => entry.tag.slug).join(", ")}
                      name="tags"
                    />
                  </label>
                  <button className="primary-link" type="submit">
                    Save project
                  </button>
                </form>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
