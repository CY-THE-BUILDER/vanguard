import { JazzPick } from "@/types/jazz";

export type SharePayload = {
  title: string;
  text: string;
  url: string;
};

export function buildPickSharePayload(pick: JazzPick): SharePayload {
  return {
    title: `${pick.title} · ${pick.artist}`,
    text: `今天想把《${pick.title}》留給你。${pick.artist}，${pick.recommendationReason}`,
    url: pick.shareUrl
  };
}

export function buildFacebookShareUrl(payload: SharePayload) {
  const url = new URL("https://www.facebook.com/sharer/sharer.php");
  url.searchParams.set("u", payload.url);
  url.searchParams.set("quote", `${payload.title}\n${payload.text}`);
  return url.toString();
}

export function buildSmsShareUrl(payload: SharePayload) {
  return `sms:?&body=${encodeURIComponent(`${payload.title}\n${payload.text}\n${payload.url}`)}`;
}

export function buildInstagramLaunchUrl() {
  return "instagram://app";
}

export function buildInstagramWebUrl() {
  return "https://www.instagram.com/";
}

export async function copyShareText(payload: SharePayload) {
  if (typeof window === "undefined" || !navigator.clipboard?.writeText) {
    return { status: "unavailable" as const };
  }

  await navigator.clipboard.writeText(`${payload.title}\n${payload.text}\n${payload.url}`);
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
    await navigator.clipboard.writeText(payload.url);
    return { status: "copied" as const };
  }

  return { status: "unavailable" as const };
}
