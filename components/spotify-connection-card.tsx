"use client";

import Image from "next/image";
import { VinylSpinner } from "@/components/vinyl-spinner";
import { getSpotifyConnectionActions, getSpotifyConnectionLabel } from "@/lib/spotify-session";
import { getUiCopy } from "@/lib/vanguard-i18n";
import { AppLocale, SpotifySession } from "@/types/jazz";

type SpotifyConnectionCardProps = {
  isLoading: boolean;
  session: SpotifySession;
  onLogout: () => void;
  locale: AppLocale;
};

export function SpotifyConnectionCard({
  isLoading,
  session,
  onLogout,
  locale
}: SpotifyConnectionCardProps) {
  const actions = getSpotifyConnectionActions(session);
  const copy = getUiCopy(locale);

  return (
    <div className="mt-8 rounded-[24px] border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-mist/80">{copy.spotifyHeading}</p>
          {isLoading ? (
            <div className="mt-3 flex items-center gap-3 text-sm text-mist">
              <VinylSpinner size="sm" />
              <span>{copy.spotifyLoading}</span>
            </div>
          ) : session.connected ? (
            <>
              <p className="mt-2 text-lg text-cream">{getSpotifyConnectionLabel(session, locale)}</p>
              <p className="mt-1 text-sm text-mist">{copy.spotifyConnectedBody(session.product)}</p>
            </>
          ) : (
            <>
              <p className="mt-2 text-lg text-cream">{copy.spotifyConnectTitle}</p>
              <p className="mt-1 text-sm text-mist">{copy.spotifyConnectBody}</p>
            </>
          )}
        </div>

        {session.connected && session.avatarUrl ? (
          <Image
            src={session.avatarUrl}
            alt={session.displayName ?? "Spotify profile"}
            width={48}
            height={48}
            unoptimized
            className="h-12 w-12 rounded-full border border-white/10 object-cover"
          />
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {actions[0] === "disconnect" ? (
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-cream transition hover:bg-white/10"
          >
            {copy.spotifyDisconnect}
          </button>
        ) : (
          <a
            href="/api/spotify/login"
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              session.configured
                ? "bg-olive-50 text-ink hover:bg-olive-100"
                : "pointer-events-none cursor-not-allowed border border-white/10 bg-white/5 text-mist"
            }`}
          >
            {session.configured ? copy.spotifyConnectTitle : copy.spotifyNotConfigured}
          </a>
        )}
      </div>
    </div>
  );
}
