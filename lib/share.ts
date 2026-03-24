import { getUiCopy } from "@/lib/vanguard-i18n";
import { AppLocale, JazzPick } from "@/types/jazz";

export type SharePayload = {
  title: string;
  text: string;
  url: string;
};

function buildShareRecommendationLine(pick: JazzPick, locale: AppLocale) {
  return getUiCopy(locale).shareLineByVibe[pick.vibeTags[0]];
}

function serializeSharePayload(payload: SharePayload) {
  return `${payload.title}\n${payload.text}\n${payload.url}`;
}

export function buildPickSharePayload(pick: JazzPick, locale: AppLocale): SharePayload {
  const copy = getUiCopy(locale);
  const line = buildShareRecommendationLine(pick, locale);

  return {
    title: `${pick.title} · ${pick.artist}`,
    text: copy.sharePayload(pick, line),
    url: pick.shareUrl
  };
}

export async function copyShareText(payload: SharePayload) {
  if (typeof window === "undefined" || !navigator.clipboard?.writeText) {
    return { status: "unavailable" as const };
  }

  await navigator.clipboard.writeText(serializeSharePayload(payload));
  return { status: "copied" as const };
}

export async function copyShareUrl(url: string) {
  if (typeof window === "undefined" || !navigator.clipboard?.writeText) {
    return { status: "unavailable" as const };
  }

  await navigator.clipboard.writeText(url);
  return { status: "copied" as const };
}

export async function sharePick(payload: SharePayload) {
  if (typeof window === "undefined") {
    return { status: "unavailable" as const };
  }

  if (navigator.share) {
    await navigator.share(payload);
    return { status: "shared" as const };
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(serializeSharePayload(payload));
    return { status: "copied" as const };
  }

  return { status: "unavailable" as const };
}
