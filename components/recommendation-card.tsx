"use client";

import Image from "next/image";
import { useEffect, useState, type MouseEvent } from "react";
import { VinylSpinner } from "@/components/vinyl-spinner";
import { buildGeneratedCoverArt } from "@/lib/cover-art";
import { getSpotifyActionUrl, getSpotifyNavigationTarget } from "@/lib/spotify-actions";
import { JazzPick } from "@/types/jazz";

type RecommendationCardProps = {
  pick: JazzPick;
  isSaved: boolean;
  onToggleSave: (pick: JazzPick) => void;
  onShare: (pick: JazzPick) => void;
  prioritizeImage?: boolean;
};

export function RecommendationCard({
  pick,
  isSaved,
  onToggleSave,
  onShare,
  prioritizeImage = false
}: RecommendationCardProps) {
  const spotifyHref = getSpotifyActionUrl(pick);
  const placeholderImage = pick.placeholderImageUrl || buildGeneratedCoverArt(pick.title, pick.artist, pick.accentColor);
  const [imageSrc, setImageSrc] = useState(
    pick.imageUrl || placeholderImage
  );
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    setImageSrc(pick.imageUrl || placeholderImage);
    setIsImageLoading(true);
  }, [pick.imageUrl, placeholderImage]);

  function handleOpenSpotify(event: MouseEvent<HTMLAnchorElement>) {
    const actionUrl = getSpotifyActionUrl(pick, navigator.userAgent);
    const target = getSpotifyNavigationTarget(navigator.userAgent);

    if (target === "_self") {
      event.preventDefault();
      window.location.assign(actionUrl);
    }
  }

  return (
    <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-card/90 shadow-panel backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-white/20">
      <div
        className="relative aspect-square overflow-hidden"
        style={{
          backgroundImage: `url("${placeholderImage}")`,
          backgroundPosition: "center",
          backgroundSize: "cover"
        }}
      >
        <Image
          src={imageSrc}
          alt={`${pick.title} by ${pick.artist}`}
          fill
          unoptimized
          priority={prioritizeImage}
          loading={prioritizeImage ? "eager" : "lazy"}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className={`object-cover transition duration-500 group-hover:scale-[1.03] ${
            isImageLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => {
            setIsImageLoading(false);
          }}
          onError={() => {
            setImageSrc(placeholderImage);
          }}
        />
        <div
          className={`absolute inset-0 flex items-center justify-center bg-[#0b1110]/55 backdrop-blur-[2px] transition duration-300 ${
            isImageLoading ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <VinylSpinner size="lg" />
            <p className="text-xs uppercase tracking-[0.24em] text-mist/80">唱盤就位中</p>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.22em] text-mist/80">
            {pick.source === "spotify" ? (
              <span className="rounded-full border border-olive-100/30 bg-olive-100/10 px-2.5 py-1 text-olive-50">
                來自你的 Spotify
              </span>
            ) : null}
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              {pick.type}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              {pick.subgenre}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              {pick.year}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="font-display text-2xl text-cream">{pick.title}</h3>
            <p className="text-sm text-mist">{pick.artist}</p>
          </div>

          <p className="text-sm leading-6 text-cream/82">{pick.recommendationReason}</p>
        </div>

        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-mist/80">
          <span>{pick.durationLabel}</span>
          <span>{pick.vibeTags.join(" / ")}</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={spotifyHref}
            target="_blank"
            rel="noreferrer"
            onClick={handleOpenSpotify}
            className="rounded-full bg-olive-50 px-4 py-2 text-sm font-medium text-ink transition hover:bg-olive-100"
          >
            前往 Spotify
          </a>
          <button
            type="button"
            onClick={() => onShare(pick)}
            className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-cream transition hover:bg-white/10"
          >
            分享
          </button>
          <button
            type="button"
            onClick={() => onToggleSave(pick)}
            aria-pressed={isSaved}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              isSaved
                ? "border-brass/40 bg-brass/20 text-cream"
                : "border-white/12 bg-transparent text-mist hover:bg-white/5 hover:text-cream"
            }`}
          >
            {isSaved ? "已收藏" : "收藏"}
          </button>
        </div>
      </div>
    </article>
  );
}
