"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RecommendationCard } from "@/components/recommendation-card";
import { SavedPicks } from "@/components/saved-picks";
import { ShareSheet } from "@/components/share-sheet";
import { SpotifyConnectionCard } from "@/components/spotify-connection-card";
import { Toasts } from "@/components/toast";
import { VinylSpinner } from "@/components/vinyl-spinner";
import { VibeFilter } from "@/components/vibe-filter";
import { getCuratedPicksForVibe } from "@/data/jazz-picks";
import { ensureUniqueFeeds } from "@/lib/recommendation-feeds";
import { getSavedPicks, savePicks } from "@/lib/jazz-storage";
import {
  createRecommendationSessionSeed,
  getGlobalRecommendationIds,
  getRecommendationRotation,
  getRecentRecommendationIds,
  rememberRecommendationBatch
} from "@/lib/recommendation-history";
import { buildCuratedFeed } from "@/lib/spotify-recommendations";
import {
  clearStoredSpotifySession,
  normalizeSpotifySession,
  readStoredSpotifySession,
  writeStoredSpotifySession
} from "@/lib/spotify-session";
import {
  detectPreferredLocale,
  getStoredLocale,
  getUiCopy,
  localizePick,
  storeLocale
} from "@/lib/vanguard-i18n";
import {
  buildPickSharePayload,
  copyShareText,
  sharePick
} from "@/lib/share";
import {
  AppLocale,
  JazzPick,
  RecommendationBatchRequest,
  RecommendationBatchResponse,
  RecommendationFeed,
  SpotifySession,
  ToastMessage,
  vibeOptions,
  Vibe
} from "@/types/jazz";

const defaultVibe: Vibe = "Classic";
const initialVisiblePicks = 5;

function buildFallbackFeedMap(
  savedIds: Set<string>,
  locale: AppLocale,
  seed = 0,
  limit = initialVisiblePicks
) {
  const reservedIds = new Set<string>([...savedIds, ...getGlobalRecommendationIds()]);
  const feeds = {} as Record<Vibe, RecommendationFeed>;

  for (const vibe of vibeOptions) {
    const excludeIds = new Set([...reservedIds, ...getRecentRecommendationIds(vibe)]);
    const rotation = getRecommendationRotation(vibe);
    const picks = getCuratedPicksForVibe(vibe, {
      excludeIds,
      rotation,
      seed,
      avoidIds: getRecentRecommendationIds(vibe),
      limit
    }).map((pick) => localizePick(pick, locale));

    feeds[vibe] = buildCuratedFeed(vibe, picks, [], locale);
    picks.forEach((pick) => {
      reservedIds.add(pick.id);
    });
  }

  return ensureUniqueFeeds(feeds, { savedIds, seed }) as Record<Vibe, RecommendationFeed>;
}

function buildRecommendationRequest(
  savedIds: Set<string>,
  vibe: Vibe,
  seed: number,
  limit: number,
  locale: AppLocale
): RecommendationBatchRequest {
  return {
    vibe,
    avoidIds: getRecentRecommendationIds(vibe),
    excludeIds: Array.from(
      new Set([
        ...savedIds,
        ...getGlobalRecommendationIds(),
        ...getRecentRecommendationIds(vibe)
      ])
    ),
    rotation: getRecommendationRotation(vibe),
    seed,
    limit,
    locale
  };
}

export function JazzApp() {
  const [locale, setLocale] = useState<AppLocale>("zh-Hant");
  const [activeVibe, setActiveVibe] = useState<Vibe>(defaultVibe);
  const [savedPicks, setSavedPicks] = useState<JazzPick[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [spotifySession, setSpotifySession] = useState<SpotifySession>(() =>
    readStoredSpotifySession() ?? {
      configured: true,
      connected: false
    }
  );
  const [isLoadingSpotify, setIsLoadingSpotify] = useState(true);
  const [shareTarget, setShareTarget] = useState<JazzPick | null>(null);
  const [feedByVibe, setFeedByVibe] = useState<Record<Vibe, RecommendationFeed>>(() =>
    buildFallbackFeedMap(new Set<string>(), "zh-Hant")
  );
  const [hydratedVibes, setHydratedVibes] = useState<Partial<Record<Vibe, true>>>({});
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [sessionSeed, setSessionSeed] = useState(0);
  const rememberedSeedRef = useRef<number | null>(null);

  useEffect(() => {
    const storedLocale = getStoredLocale();
    const nextLocale =
      storedLocale ??
      detectPreferredLocale(
        typeof navigator !== "undefined" ? navigator.languages ?? navigator.language : null
      );

    setLocale(nextLocale);
    document.documentElement.lang = nextLocale;
    setSavedPicks(getSavedPicks());
    setSessionSeed(createRecommendationSessionSeed());
    setIsReady(true);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadSpotifySession() {
      try {
        const response = await fetch("/api/spotify/session", {
          cache: "no-store"
        });
        const session = normalizeSpotifySession(
          (await response.json()) as SpotifySession,
          readStoredSpotifySession()
        );
        if (!ignore) {
          setSpotifySession(session);
          if (session.connected) {
            writeStoredSpotifySession(session);
          } else {
            clearStoredSpotifySession();
          }
        }
      } catch {
        if (!ignore) {
          setSpotifySession(
            readStoredSpotifySession() ?? {
              configured: true,
              connected: false
            }
          );
        }
      } finally {
        if (!ignore) {
          setIsLoadingSpotify(false);
        }
      }
    }

    void loadSpotifySession();

    return () => {
      ignore = true;
    };
  }, []);

  const savedIds = useMemo(() => new Set(savedPicks.map((pick) => pick.id)), [savedPicks]);
  const localizedSavedPicks = useMemo(
    () => savedPicks.map((pick) => (pick.source === "curated" ? localizePick(pick, locale) : pick)),
    [locale, savedPicks]
  );
  const copy = getUiCopy(locale);
  const feed =
    feedByVibe[activeVibe] ??
    buildCuratedFeed(
      activeVibe,
      getCuratedPicksForVibe(activeVibe).map((pick) => localizePick(pick, locale)),
      [],
      locale
    );

  function pushToast(text: string) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, text }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2200);
  }

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const spotifyStatus = currentUrl.searchParams.get("spotify");
    if (!spotifyStatus) {
      return;
    }

    if (spotifyStatus === "connected") {
      pushToast(copy.toastSpotifyConnected);
    } else if (spotifyStatus === "denied") {
      pushToast(copy.toastSpotifyDenied);
    } else if (spotifyStatus === "misconfigured") {
      pushToast(copy.toastSpotifyMisconfigured);
    } else if (spotifyStatus === "error") {
      pushToast(copy.toastSpotifyError);
    }

    currentUrl.searchParams.delete("spotify");
    window.history.replaceState({}, "", currentUrl.toString());
  }, [copy.toastSpotifyConnected, copy.toastSpotifyDenied, copy.toastSpotifyError, copy.toastSpotifyMisconfigured]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    setFeedByVibe(buildFallbackFeedMap(savedIds, locale, sessionSeed, initialVisiblePicks));
    setHydratedVibes({});
    rememberedSeedRef.current = null;
    setIsLoadingFeed(false);
  }, [isReady, locale, sessionSeed, spotifySession.connected, savedIds]);

  useEffect(() => {
    if (!isReady || rememberedSeedRef.current === sessionSeed) {
      return;
    }

    const hasCompleteBatch = vibeOptions.every(
      (vibe) => (feedByVibe[vibe]?.picks.length ?? 0) >= initialVisiblePicks
    );

    if (!hasCompleteBatch) {
      return;
    }

    rememberRecommendationBatch(feedByVibe);
    rememberedSeedRef.current = sessionSeed;
  }, [feedByVibe, isReady, sessionSeed]);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    if (!isReady || hydratedVibes[activeVibe]) {
      return;
    }

    async function loadActiveVibeFeed() {
      if (spotifySession.connected) {
        setIsLoadingFeed(true);
      }
      const request = buildRecommendationRequest(savedIds, activeVibe, sessionSeed, initialVisiblePicks, locale);
      const query = new URLSearchParams({
        vibe: request.vibe,
        exclude: request.excludeIds.join(","),
        avoid: (request.avoidIds ?? []).join(","),
        rotation: String(request.rotation),
        seed: String(request.seed ?? 0),
        limit: String(request.limit ?? initialVisiblePicks),
        locale: request.locale ?? locale
      });

      try {
        const response = await fetch(`/api/jazz/recommendations?${query.toString()}`, {
          cache: "no-store",
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("Failed to load recommendations.");
        }

        const nextFeed = (await response.json()) as RecommendationFeed;
        if (!ignore) {
          setFeedByVibe((current) => ({
            ...ensureUniqueFeeds(
              {
                ...current,
                [activeVibe]: nextFeed
              },
              { savedIds, seed: sessionSeed, priorityVibe: activeVibe }
            )
          } as Record<Vibe, RecommendationFeed>));
          setHydratedVibes((current) => ({
            ...current,
            [activeVibe]: true
          }));
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      } finally {
        if (!ignore && spotifySession.connected) {
          setIsLoadingFeed(false);
        }
      }
    }

    void loadActiveVibeFeed();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [activeVibe, feedByVibe, hydratedVibes, isReady, locale, savedIds, sessionSeed, spotifySession.connected]);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let idleId: number | undefined;

    if (!isReady || !hydratedVibes[activeVibe]) {
      return;
    }

    const pendingVibes = vibeOptions.filter((vibe) => vibe !== activeVibe && !hydratedVibes[vibe]);
    if (pendingVibes.length === 0) {
      return;
    }

    const runPrefetch = async () => {
        const requests = pendingVibes.map((vibe) =>
          buildRecommendationRequest(savedIds, vibe, sessionSeed, initialVisiblePicks, locale)
      );

      try {
        const response = await fetch("/api/jazz/recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          cache: "no-store",
          body: JSON.stringify({ requests })
        });

        if (!response.ok) {
          throw new Error("Failed to prefetch recommendations.");
        }

        const payload = (await response.json()) as RecommendationBatchResponse;
        if (!cancelled) {
          setFeedByVibe((current) => ({
            ...ensureUniqueFeeds(
              {
                ...current,
                ...payload.feeds
              },
              { savedIds, seed: sessionSeed, priorityVibe: activeVibe }
            )
          } as Record<Vibe, RecommendationFeed>));
          setHydratedVibes((current) => ({
            ...current,
            ...Object.fromEntries(pendingVibes.map((vibe) => [vibe, true]))
          }));
        }
      } catch {
        return;
      }
    };

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(() => {
        void runPrefetch();
      });
    } else {
      timeoutId = setTimeout(() => {
        void runPrefetch();
      }, 350);
    }

    return () => {
      cancelled = true;
      if (typeof idleId === "number" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (typeof timeoutId !== "undefined") {
        clearTimeout(timeoutId);
      }
    };
  }, [activeVibe, feedByVibe, hydratedVibes, isReady, locale, savedIds, sessionSeed, spotifySession.connected]);

  function handleToggleSave(pick: JazzPick) {
    setSavedPicks((current) => {
      const exists = current.some((entry) => entry.id === pick.id);
      const nextPicks = exists ? current.filter((entry) => entry.id !== pick.id) : [pick, ...current];
      savePicks(nextPicks);
      pushToast(exists ? copy.toastRemoved : copy.toastSaved);
      return nextPicks;
    });
  }

  function handleShare(pick: JazzPick) {
    setShareTarget(pick);
  }

  async function handleShareTextLink(pick: JazzPick) {
    const payload = buildPickSharePayload(pick, locale);
    const result = await sharePick(payload);

    if (result.status === "shared") {
      pushToast(copy.toastShared);
    } else if (result.status === "copied") {
      pushToast(copy.toastCopied);
    } else {
      const copied = await copyShareText(payload);
      pushToast(copied.status === "copied" ? copy.toastCopied : copy.toastShareUnavailable);
    }

    setShareTarget(null);
  }

  async function handleSpotifyLogout() {
    try {
      const response = await fetch("/api/spotify/logout", {
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("Failed to logout.");
      }

      setSpotifySession((current) => ({
        ...current,
        connected: false,
        displayName: undefined,
        avatarUrl: null,
        product: null,
        profileUrl: null,
        country: null
      }));
      clearStoredSpotifySession();
      pushToast(copy.toastDisconnected);
    } catch {
      pushToast(copy.toastDisconnectUnavailable);
    }
  }

  function handleLocaleChange(nextLocale: AppLocale) {
    setLocale(nextLocale);
    storeLocale(nextLocale);
    document.documentElement.lang = nextLocale;
  }

  return (
    <>
      <Toasts toasts={toasts} />
      <ShareSheet
        pick={shareTarget}
        onClose={() => setShareTarget(null)}
        onShareTextLink={handleShareTextLink}
        locale={locale}
      />
      <main className="relative overflow-hidden">
        <div className="ambient ambient-left" />
        <div className="ambient ambient-right" />
        <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-14 px-5 pb-16 pt-8 sm:px-8 lg:px-12">
          <header className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_360px] lg:items-end">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs uppercase tracking-[0.26em] text-mist">
                Vanguard
              </div>
              <div className="max-w-3xl space-y-5">
                <p className="text-sm uppercase tracking-[0.3em] text-mist/80">{copy.heroEyebrow}</p>
                <h1 className="font-display text-5xl leading-none text-cream sm:text-6xl lg:text-7xl">
                  {copy.heroTitle}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-mist sm:text-lg">
                  {copy.heroSubtitle}
                </p>
              </div>
              <VibeFilter activeVibe={activeVibe} onChange={setActiveVibe} locale={locale} />
            </div>

            <aside className="rounded-[32px] border border-white/10 bg-white/[0.05] p-6 shadow-panel backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-mist/80">{copy.vibeEyebrow}</p>
              <p className="mt-3 font-display text-3xl text-cream">{activeVibe}</p>
              <p className="mt-4 text-sm leading-7 text-mist">
                {copy.vibeDescriptions[activeVibe]}
              </p>
              <div className="mt-8 flex items-center justify-between text-sm text-mist">
                <span>{copy.preparedCount(feed.picks.length)}</span>
                <span>{copy.savedCounter(savedPicks.length)}</span>
              </div>
              <SpotifyConnectionCard
                isLoading={isLoadingSpotify}
                session={spotifySession}
                onLogout={handleSpotifyLogout}
                locale={locale}
              />
            </aside>
          </header>

          <section className="space-y-5" aria-labelledby="today-picks">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 id="today-picks" className="font-display text-3xl text-cream">
                  {feed.headline}
                </h2>
                <p className="mt-2 text-sm leading-6 text-mist">
                  {feed.note}
                </p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-xs uppercase tracking-[0.22em] text-mist/80">
                  {feed.mode === "personalized" ? copy.feedModePersonalized : copy.feedModeCurated}
                </p>
                {isLoadingFeed ? (
                  <div className="mt-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-mist/70">
                    <VinylSpinner size="sm" />
                    <span>{copy.loadingFeed}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {feed.picks.map((pick, index) => (
                <RecommendationCard
                  key={pick.id}
                  pick={pick}
                  isSaved={savedIds.has(pick.id)}
                  onToggleSave={handleToggleSave}
                  onShare={handleShare}
                  prioritizeImage={index < initialVisiblePicks}
                  locale={locale}
                />
              ))}
            </div>
          </section>

          <section className="space-y-5" aria-labelledby="saved-picks">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 id="saved-picks" className="font-display text-3xl text-cream">
                  {copy.savedHeading}
                </h2>
                <p className="mt-2 text-sm leading-6 text-mist">
                  {copy.savedSubtitle}
                </p>
              </div>
              {isReady ? (
                <p className="hidden text-xs uppercase tracking-[0.22em] text-mist/80 sm:block">
                  {savedPicks.length === 0 ? copy.savedCountEmpty : copy.savedCount(savedPicks.length)}
                </p>
              ) : null}
            </div>

            <SavedPicks picks={localizedSavedPicks} onToggleSave={handleToggleSave} onShare={handleShare} locale={locale} />
          </section>

          <footer className="flex flex-col items-center justify-center gap-3 border-t border-white/8 pt-6 text-xs uppercase tracking-[0.22em] text-mist/70 sm:flex-row sm:justify-between">
            <span>{copy.copyright(new Date().getFullYear())}</span>
            <div className="flex items-center gap-2" aria-label={copy.languageLabel}>
              <button
                type="button"
                onClick={() => handleLocaleChange("zh-Hant")}
                className={`rounded-full border px-3 py-1.5 transition ${
                  locale === "zh-Hant"
                    ? "border-olive-200 bg-olive-50 text-ink"
                    : "border-white/10 bg-white/5 text-mist hover:border-white/20 hover:bg-white/10 hover:text-cream"
                }`}
              >
                {copy.chinese}
              </button>
              <button
                type="button"
                onClick={() => handleLocaleChange("en")}
                className={`rounded-full border px-3 py-1.5 transition ${
                  locale === "en"
                    ? "border-olive-200 bg-olive-50 text-ink"
                    : "border-white/10 bg-white/5 text-mist hover:border-white/20 hover:bg-white/10 hover:text-cream"
                }`}
              >
                {copy.english}
              </button>
            </div>
          </footer>
        </section>
      </main>
    </>
  );
}
