"use client";

import Image from "next/image";
import type { MouseEvent } from "react";
import { getSpotifyActionUrl, getSpotifyNavigationTarget } from "@/lib/spotify-actions";
import { getUiCopy } from "@/lib/vanguard-i18n";
import { AppLocale, JazzPick } from "@/types/jazz";

type SavedPicksProps = {
  picks: JazzPick[];
  onToggleSave: (pick: JazzPick) => void;
  onShare: (pick: JazzPick) => void;
  locale: AppLocale;
};

export function SavedPicks({ picks, onToggleSave, onShare, locale }: SavedPicksProps) {
  const copy = getUiCopy(locale);
  function handleOpenSpotify(
    event: MouseEvent<HTMLAnchorElement>,
    pick: JazzPick
  ) {
    const actionUrl = getSpotifyActionUrl(pick, navigator.userAgent);
    const target = getSpotifyNavigationTarget(navigator.userAgent);

    if (target === "_self") {
      event.preventDefault();
      window.location.assign(actionUrl);
    }
  }

  if (picks.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.04] p-8 text-center text-sm leading-7 text-mist">
        <p className="font-display text-2xl text-cream">{copy.savedEmptyTitle}</p>
        <p className="mx-auto mt-3 max-w-xl">{copy.savedEmptyBody}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {picks.map((pick) => (
        <article
          key={pick.id}
          className="flex gap-4 rounded-[24px] border border-white/10 bg-white/[0.05] p-4 transition hover:border-white/20"
        >
          <Image
            src={pick.imageUrl}
            alt={`${pick.title} by ${pick.artist}`}
            width={96}
            height={96}
            unoptimized
            className="h-24 w-24 rounded-[18px] object-cover"
          />
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <p className="font-display text-xl text-cream">{pick.title}</p>
              <p className="text-sm text-mist">{pick.artist}</p>
            </div>
            <p className="line-clamp-2 text-sm leading-6 text-cream/75">
              {pick.recommendationReason}
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href={getSpotifyActionUrl(pick)}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => handleOpenSpotify(event, pick)}
                className="rounded-full bg-olive-50 px-3 py-1.5 text-xs font-medium text-ink"
              >
                {copy.openSpotify}
              </a>
              <button
                type="button"
                onClick={() => onShare(pick)}
                className="rounded-full border border-white/12 px-3 py-1.5 text-xs text-cream"
              >
                {copy.share}
              </button>
              <button
                type="button"
                onClick={() => onToggleSave(pick)}
                className="rounded-full border border-white/12 px-3 py-1.5 text-xs text-mist"
              >
                {copy.remove}
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
