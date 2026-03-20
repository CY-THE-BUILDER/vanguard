const DEFAULT_SITE_URL = "https://www.noesis.studio";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getCanonicalSiteUrl() {
  return trimTrailingSlash(
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? DEFAULT_SITE_URL
  );
}

export function getCanonicalOrigin(origin: string) {
  const canonicalSiteUrl = getCanonicalSiteUrl();

  try {
    const canonicalUrl = new URL(canonicalSiteUrl);
    const requestUrl = new URL(origin);

    if (
      requestUrl.hostname === "noesis.studio" ||
      requestUrl.hostname === canonicalUrl.hostname
    ) {
      return canonicalUrl.origin;
    }
  } catch {
    return canonicalSiteUrl;
  }

  return trimTrailingSlash(origin);
}
