import { afterEach, describe, expect, it, vi } from "vitest";

describe("site url helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("defaults to the noesis canonical site url", async () => {
    const { getCanonicalSiteUrl } = await import("@/lib/site-url");
    expect(getCanonicalSiteUrl()).toBe("https://www.noesis.studio");
  });

  it("maps the root domain to the canonical www origin", async () => {
    const { getCanonicalOrigin } = await import("@/lib/site-url");
    expect(getCanonicalOrigin("https://noesis.studio")).toBe("https://www.noesis.studio");
  });

  it("lets explicit site env win", async () => {
    vi.stubEnv("SITE_URL", "https://jazz.example");
    const { getCanonicalSiteUrl, getCanonicalOrigin } = await import("@/lib/site-url");

    expect(getCanonicalSiteUrl()).toBe("https://jazz.example");
    expect(getCanonicalOrigin("https://noesis.studio")).toBe("https://jazz.example");
  });
});
