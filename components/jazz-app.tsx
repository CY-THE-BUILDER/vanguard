"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { RecommendationCard } from "@/components/recommendation-card";
import { SavedPicks } from "@/components/saved-picks";
import { ShareSheet } from "@/components/share-sheet";
import { Toasts } from "@/components/toast";
import { VibeFilter } from "@/components/vibe-filter";
import { getCuratedPicksForVibe } from "@/data/jazz-picks";
import { getSavedPicks, savePicks } from "@/lib/jazz-storage";
import { getRecentRecommendationIds, rememberRecommendationIds } from "@/lib/recommendation-history";
import { buildCuratedFeed } from "@/lib/spotify-recommendations";
import {
  buildFacebookShareUrl,
  buildInstagramLaunchUrl,
  buildInstagramWebUrl,
  buildPickSharePayload,
  buildSmsShareUrl,
  copyShareText,
  sharePick
} from "@/lib/share";
import { JazzPick, RecommendationFeed, SpotifySession, ToastMessage, Vibe } from "@/types/jazz";

const defaultVibe: Vibe = "Classic";

export function JazzApp() {
  const [activeVibe, setActiveVibe] = useState<Vibe>(defaultVibe);
  const [savedPicks, setSavedPicks] = useState<JazzPick[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [spotifySession, setSpotifySession] = useState<SpotifySession>({
    configured: true,
    connected: false
  });
  const [isLoadingSpotify, setIsLoadingSpotify] = useState(true);
  const [shareTarget, setShareTarget] = useState<JazzPick | null>(null);
  const [feed, setFeed] = useState<RecommendationFeed>({
    ...buildCuratedFeed(defaultVibe, getCuratedPicksForVibe(defaultVibe))
  });
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);

  useEffect(() => {
    setSavedPicks(getSavedPicks());
    setIsReady(true);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadSpotifySession() {
      try {
        const response = await fetch("/api/spotify/session", {
          cache: "no-store"
        });
        const session = (await response.json()) as SpotifySession;
        if (!ignore) {
          setSpotifySession(session);
        }
      } catch {
        if (!ignore) {
          setSpotifySession({
            configured: true,
            connected: false
          });
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
    let ignore = false;

    async function loadRecommendations() {
      setIsLoadingFeed(true);
      const excludeIds = Array.from(
        new Set([...savedIds, ...getRecentRecommendationIds(activeVibe)])
      );

      try {
        const response = await fetch(
          `/api/jazz/recommendations?vibe=${encodeURIComponent(activeVibe)}&exclude=${encodeURIComponent(excludeIds.join(","))}`,
          {
            cache: "no-store"
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load recommendations.");
        }

        const nextFeed = (await response.json()) as RecommendationFeed;
        if (!ignore) {
          setFeed(nextFeed);
          rememberRecommendationIds(
            activeVibe,
            nextFeed.picks.map((pick) => pick.id)
          );
        }
      } catch {
        if (!ignore) {
          const fallbackFeed = buildCuratedFeed(
            activeVibe,
            getCuratedPicksForVibe(activeVibe, {
              excludeIds: new Set(excludeIds)
            })
          );
          setFeed(fallbackFeed);
          rememberRecommendationIds(
            activeVibe,
            fallbackFeed.picks.map((pick) => pick.id)
          );
        }
      } finally {
        if (!ignore) {
          setIsLoadingFeed(false);
        }
      }
    }

    void loadRecommendations();

    return () => {
      ignore = true;
    };
  }, [activeVibe, spotifySession.connected, savedIds]);

  function handleToggleSave(pick: JazzPick) {
    setSavedPicks((current) => {
      const exists = current.some((entry) => entry.id === pick.id);
      const nextPicks = exists ? current.filter((entry) => entry.id !== pick.id) : [pick, ...current];
      savePicks(nextPicks);
      pushToast(exists ? "已從收藏移除。" : "已加入收藏。");
      return nextPicks;
    });
  }

  async function handleNativeShare(pick: JazzPick) {
    try {
      const result = await sharePick(buildPickSharePayload(pick));

      if (result.status === "shared") {
        pushToast("已送出分享。");
        setShareTarget(null);
        return;
      }

      if (result.status === "copied") {
        pushToast("連結已複製。");
        setShareTarget(null);
        return;
      }

      pushToast("這個裝置目前無法直接分享。");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      pushToast("分享已取消。");
    }
  }

  function handleShare(pick: JazzPick) {
    setShareTarget(pick);
  }

  async function handleTextShare(pick: JazzPick) {
    const payload = buildPickSharePayload(pick);
    const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = buildSmsShareUrl(payload);
      setShareTarget(null);
      return;
    }

    await handleNativeShare(pick);
  }

  function handleFacebookShare(pick: JazzPick) {
    window.open(buildFacebookShareUrl(buildPickSharePayload(pick)), "_blank", "noopener,noreferrer");
    pushToast("已開啟 Facebook 分享頁。");
    setShareTarget(null);
  }

  async function handleInstagramShare(pick: JazzPick) {
    const payload = buildPickSharePayload(pick);
    const copyResult = await copyShareText(payload);
    const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);

    window.location.assign(isMobile ? buildInstagramLaunchUrl() : buildInstagramWebUrl());
    pushToast(
      copyResult.status === "copied"
        ? "貼文文字已複製，接著到 Instagram 貼上。"
        : "已開啟 Instagram。"
    );
    setShareTarget(null);
  }

  async function handleCopyLink(pick: JazzPick) {
    const result = await copyShareText(buildPickSharePayload(pick));
    pushToast(result.status === "copied" ? "分享文字與連結已複製。" : "目前無法複製連結。");
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
        onTextShare={handleTextShare}
        onFacebookShare={handleFacebookShare}
        onInstagramShare={handleInstagramShare}
        onCopyLink={handleCopyLink}
      />
      <main className="relative overflow-hidden">
        <div className="ambient ambient-left" />
        <div className="ambient ambient-right" />
        <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-14 px-5 pb-16 pt-8 sm:px-8 lg:px-12">
          <header className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_360px] lg:items-end">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs uppercase tracking-[0.26em] text-mist">
                jazz-your-life
              </div>
              <div className="max-w-3xl space-y-5">
                <p className="text-sm uppercase tracking-[0.3em] text-mist/80">Today&apos;s Jazz Picks</p>
                <h1 className="font-display text-5xl leading-none text-cream sm:text-6xl lg:text-7xl">
                  少花點時間選。
                  <br />
                  多留點時間聽。
                </h1>
                <p className="max-w-2xl text-base leading-7 text-mist sm:text-lg">
                  給每天打開 Spotify，卻不想把心情耗在選擇上的爵士樂迷。
                  先替你留好幾張此刻值得播放的專輯。
                </p>
              </div>
              <VibeFilter activeVibe={activeVibe} onChange={setActiveVibe} />
            </div>

            <aside className="rounded-[32px] border border-white/10 bg-white/[0.05] p-6 shadow-panel backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-mist/80">今日方向</p>
              <p className="mt-3 font-display text-3xl text-cream">{activeVibe}</p>
              <p className="mt-4 text-sm leading-7 text-mist">
                {activeVibe === "Classic" &&
                  "從穩妥的名盤開始，讓今天第一個選擇自然落下。"}
                {activeVibe === "Exploratory" &&
                  "在熟悉的語彙之外再多走幾步，留一點空間給新的驚喜。"}
                {activeVibe === "Fusion" &&
                  "當你想把節奏聽得更黏、更有電流感，這裡會更對味。"}
                {activeVibe === "Late Night" &&
                  "適合夜裡播放的選擇，輪廓柔和，但情緒依然飽滿。"}
                {activeVibe === "Focus" &&
                  "節奏還在，情緒也在，只先把多餘的干擾收乾淨。"}
              </p>
              <div className="mt-8 flex items-center justify-between text-sm text-mist">
                <span>已備好 {feed.picks.length} 張</span>
                <span>收藏 {savedPicks.length} 張</span>
              </div>

              <div className="mt-8 rounded-[24px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-mist/80">Spotify</p>
                    {isLoadingSpotify ? (
                      <p className="mt-2 text-sm text-mist">正在確認連線狀態...</p>
                    ) : spotifySession.connected ? (
                      <>
                        <p className="mt-2 text-lg text-cream">
                          已連接 {spotifySession.displayName ?? "Spotify"}
                        </p>
                        <p className="mt-1 text-sm text-mist">
                          {spotifySession.product
                            ? `已開始參考你的 ${spotifySession.product} 帳號聆聽紀錄調整推薦。`
                            : "已開始參考你的聆聽紀錄調整推薦。"}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mt-2 text-lg text-cream">連接 Spotify</p>
                        <p className="mt-1 text-sm text-mist">
                          連上帳號之後，推薦會慢慢讀懂你最近常聽、收藏與反覆播放的線索。
                        </p>
                      </>
                    )}
                  </div>

                  {spotifySession.connected && spotifySession.avatarUrl ? (
                    <Image
                      src={spotifySession.avatarUrl}
                      alt={spotifySession.displayName ?? "Spotify profile"}
                      width={48}
                      height={48}
                      unoptimized
                      className="h-12 w-12 rounded-full border border-white/10 object-cover"
                    />
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {spotifySession.connected ? (
                    <>
                      {spotifySession.profileUrl ? (
                        <a
                          href={spotifySession.profileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-olive-50 px-4 py-2 text-sm font-medium text-ink transition hover:bg-olive-100"
                        >
                          查看 Spotify 個人頁
                        </a>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleSpotifyLogout}
                        className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-cream transition hover:bg-white/10"
                      >
                        中斷連線
                      </button>
                    </>
                  ) : (
                    <a
                      href="/api/spotify/login"
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        spotifySession.configured
                          ? "bg-olive-50 text-ink hover:bg-olive-100"
                          : "cursor-not-allowed border border-white/10 bg-white/5 text-mist pointer-events-none"
                      }`}
                    >
                      {spotifySession.configured ? "連接 Spotify" : "尚未完成設定"}
                    </a>
                  )}
                </div>
              </div>
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
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-mist/70">整理中...</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {feed.picks.map((pick) => (
                <RecommendationCard
                  key={pick.id}
                  pick={pick}
                  isSaved={savedIds.has(pick.id)}
                  onToggleSave={handleToggleSave}
                  onShare={handleShare}
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
                  把想晚點回來、或值得再播一次的聲音先留在這裡。
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
        </section>
      </main>
    </>
  );
}
