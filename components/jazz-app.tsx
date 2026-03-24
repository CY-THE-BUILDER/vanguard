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
import { getSavedPicks, savePicks } from "@/lib/jazz-storage";
import {
  createRecommendationSessionSeed,
  getGlobalRecommendationIds,
  getRecommendationRotation,
  getRecentRecommendationIds,
  rememberRecommendationIds
} from "@/lib/recommendation-history";
import { buildCuratedFeed } from "@/lib/spotify-recommendations";
import {
  clearStoredSpotifySession,
  normalizeSpotifySession,
  readStoredSpotifySession,
  writeStoredSpotifySession
} from "@/lib/spotify-session";
import {
  buildPickSharePayload,
  copyShareText,
  sharePick
} from "@/lib/share";
import {
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
const initialVisiblePicks = 3;
const fullVisiblePicks = 5;

function buildFallbackFeedMap(savedIds: Set<string>, seed = 0, limit = initialVisiblePicks) {
  const reservedIds = new Set<string>([...savedIds, ...getGlobalRecommendationIds()]);
  const feeds = {} as Record<Vibe, RecommendationFeed>;

  for (const vibe of vibeOptions) {
    const excludeIds = new Set([...reservedIds, ...getRecentRecommendationIds(vibe)]);
    const rotation = getRecommendationRotation(vibe);
    const picks = getCuratedPicksForVibe(vibe, {
      excludeIds,
      rotation,
      seed,
      limit
    });

    feeds[vibe] = buildCuratedFeed(vibe, picks);
    picks.forEach((pick) => {
      reservedIds.add(pick.id);
    });
  }

  return feeds;
}

function getCrossVibeExcludedIds(vibe: Vibe, feedByVibe: Partial<Record<Vibe, RecommendationFeed>>) {
  return Object.entries(feedByVibe)
    .filter(([entryVibe]) => entryVibe !== vibe)
    .flatMap(([, feed]) => feed?.picks.map((pick) => pick.id) ?? []);
}

function buildRecommendationRequest(
  savedIds: Set<string>,
  vibe: Vibe,
  seed: number,
  limit: number,
  feedByVibe: Partial<Record<Vibe, RecommendationFeed>>
): RecommendationBatchRequest {
  return {
    vibe,
    excludeIds: Array.from(
      new Set([
        ...savedIds,
        ...getGlobalRecommendationIds(),
        ...getRecentRecommendationIds(vibe),
        ...getCrossVibeExcludedIds(vibe, feedByVibe)
      ])
    ),
    rotation: getRecommendationRotation(vibe),
    seed,
    limit
  };
}

export function JazzApp() {
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
    buildFallbackFeedMap(new Set<string>())
  );
  const [hydratedVibes, setHydratedVibes] = useState<Partial<Record<Vibe, true>>>({});
  const [expandedVibes, setExpandedVibes] = useState<Partial<Record<Vibe, true>>>({});
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [sessionSeed, setSessionSeed] = useState(0);
  const viewedVibesRef = useRef<Set<Vibe>>(new Set());

  useEffect(() => {
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
  const feed = feedByVibe[activeVibe] ?? buildCuratedFeed(activeVibe, getCuratedPicksForVibe(activeVibe));

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
      pushToast("Spotify 已連接。");
    } else if (spotifyStatus === "denied") {
      pushToast("已取消 Spotify 授權。");
    } else if (spotifyStatus === "misconfigured") {
      pushToast("Spotify 連線設定尚未完成。");
    } else if (spotifyStatus === "error") {
      pushToast("Spotify 授權未完成。");
    }

    currentUrl.searchParams.delete("spotify");
    window.history.replaceState({}, "", currentUrl.toString());
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    setFeedByVibe(buildFallbackFeedMap(savedIds, sessionSeed, initialVisiblePicks));
    setHydratedVibes({});
    setExpandedVibes({});
    viewedVibesRef.current = new Set();
    setIsLoadingFeed(false);
  }, [isReady, sessionSeed, spotifySession.connected, savedIds]);

  useEffect(() => {
    if (!isReady || viewedVibesRef.current.has(activeVibe)) {
      return;
    }

    const currentFeed = feedByVibe[activeVibe];
    if (!currentFeed || currentFeed.picks.length === 0) {
      return;
    }

    rememberRecommendationIds(
      activeVibe,
      currentFeed.picks.map((pick) => pick.id)
    );
    viewedVibesRef.current.add(activeVibe);
  }, [activeVibe, feedByVibe, isReady]);

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
      const request = buildRecommendationRequest(savedIds, activeVibe, sessionSeed, initialVisiblePicks, feedByVibe);
      const query = new URLSearchParams({
        vibe: request.vibe,
        exclude: request.excludeIds.join(","),
        rotation: String(request.rotation),
        seed: String(request.seed ?? 0),
        limit: String(request.limit ?? initialVisiblePicks)
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
            ...current,
            [activeVibe]: nextFeed
          }));
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
  }, [activeVibe, feedByVibe, hydratedVibes, isReady, savedIds, sessionSeed, spotifySession.connected]);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    if (!isReady || !hydratedVibes[activeVibe] || expandedVibes[activeVibe]) {
      return;
    }

    async function expandActiveVibeFeed() {
      const request = buildRecommendationRequest(savedIds, activeVibe, sessionSeed, fullVisiblePicks, feedByVibe);
      const query = new URLSearchParams({
        vibe: request.vibe,
        exclude: request.excludeIds.join(","),
        rotation: String(request.rotation),
        seed: String(request.seed ?? 0),
        limit: String(request.limit ?? fullVisiblePicks)
      });

      try {
        const response = await fetch(`/api/jazz/recommendations?${query.toString()}`, {
          cache: "no-store",
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("Failed to expand recommendations.");
        }

        const nextFeed = (await response.json()) as RecommendationFeed;
        if (!ignore) {
          setFeedByVibe((current) => ({
            ...current,
            [activeVibe]: nextFeed
          }));
          setExpandedVibes((current) => ({
            ...current,
            [activeVibe]: true
          }));
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    void expandActiveVibeFeed();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [activeVibe, expandedVibes, feedByVibe, hydratedVibes, isReady, savedIds, sessionSeed]);

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
        buildRecommendationRequest(savedIds, vibe, sessionSeed, initialVisiblePicks, feedByVibe)
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
            ...current,
            ...payload.feeds
          }));
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
  }, [activeVibe, feedByVibe, hydratedVibes, isReady, savedIds, sessionSeed, spotifySession.connected]);

  function handleToggleSave(pick: JazzPick) {
    setSavedPicks((current) => {
      const exists = current.some((entry) => entry.id === pick.id);
      const nextPicks = exists ? current.filter((entry) => entry.id !== pick.id) : [pick, ...current];
      savePicks(nextPicks);
      pushToast(exists ? "已從收藏移除。" : "已加入收藏。");
      return nextPicks;
    });
  }

  function handleShare(pick: JazzPick) {
    setShareTarget(pick);
  }

  async function handleShareTextLink(pick: JazzPick) {
    const payload = buildPickSharePayload(pick);
    const result = await sharePick(payload);

    if (result.status === "shared") {
      pushToast("已開啟分享。");
    } else if (result.status === "copied") {
      pushToast("文字與連結已複製。");
    } else {
      const copied = await copyShareText(payload);
      pushToast(copied.status === "copied" ? "文字與連結已複製。" : "目前無法分享。");
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
      pushToast("已中斷 Spotify 連線。");
    } catch {
      pushToast("目前無法中斷 Spotify 連線。");
    }
  }

  return (
    <>
      <Toasts toasts={toasts} />
      <ShareSheet
        pick={shareTarget}
        onClose={() => setShareTarget(null)}
        onShareTextLink={handleShareTextLink}
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
                <p className="text-sm uppercase tracking-[0.3em] text-mist/80">Today&apos;s Jazz Picks</p>
                <h1 className="font-display text-5xl leading-none text-cream sm:text-6xl lg:text-7xl">
                  今天，先從這張開始。
                </h1>
                <p className="max-w-2xl text-base leading-7 text-mist sm:text-lg">
                  先替你收好幾張專輯，讓今天不用從茫茫片海開始。
                </p>
              </div>
              <VibeFilter activeVibe={activeVibe} onChange={setActiveVibe} />
            </div>

            <aside className="rounded-[32px] border border-white/10 bg-white/[0.05] p-6 shadow-panel backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-mist/80">今日方向</p>
              <p className="mt-3 font-display text-3xl text-cream">{activeVibe}</p>
              <p className="mt-4 text-sm leading-7 text-mist">
                {activeVibe === "Classic" &&
                  "先回到那些一放下去，整個房間就會安定下來的名盤。"}
                {activeVibe === "Exploratory" &&
                  "從熟悉的入口偏一點航線，去聽爵士更野、更開的那一面。"}
                {activeVibe === "Fusion" &&
                  "把律動再推深一點，去接住電氣、速度和更鮮明的輪廓。"}
                {activeVibe === "Late Night" &&
                  "適合夜深之後播放，聲音不急，情緒卻留得很長。"}
                {activeVibe === "Focus" &&
                  "把多餘的噪音先收掉，只留下能陪你往前走的節奏。"}
              </p>
              <div className="mt-8 flex items-center justify-between text-sm text-mist">
                <span>已備好 {feed.picks.length} 張</span>
                <span>收藏 {savedPicks.length} 張</span>
              </div>
              <SpotifyConnectionCard
                isLoading={isLoadingSpotify}
                session={spotifySession}
                onLogout={handleSpotifyLogout}
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
                  {feed.mode === "personalized" ? "依你的聆聽習慣" : "編選起點"}
                </p>
                {isLoadingFeed ? (
                  <div className="mt-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-mist/70">
                    <VinylSpinner size="sm" />
                    <span>唱盤轉進中</span>
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
                />
              ))}
            </div>
          </section>

          <section className="space-y-5" aria-labelledby="saved-picks">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 id="saved-picks" className="font-display text-3xl text-cream">
                  收藏
                </h2>
                <p className="mt-2 text-sm leading-6 text-mist">
                  把想回頭再聽的那張，先留在這裡。
                </p>
              </div>
              {isReady ? (
                <p className="hidden text-xs uppercase tracking-[0.22em] text-mist/80 sm:block">
                  {savedPicks.length === 0 ? "還沒有留片" : `已留 ${savedPicks.length} 張`}
                </p>
              ) : null}
            </div>

            <SavedPicks picks={savedPicks} onToggleSave={handleToggleSave} onShare={handleShare} />
          </section>

          <footer className="border-t border-white/8 pt-6 text-center text-xs uppercase tracking-[0.22em] text-mist/70">
            © {new Date().getFullYear()} noesis.studio
          </footer>
        </section>
      </main>
    </>
  );
}
