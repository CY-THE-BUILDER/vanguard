import { NextRequest, NextResponse } from "next/server";
import { getCuratedPicksForVibe, jazzPicks } from "@/data/jazz-picks";
import {
  getValidSpotifyAccessToken,
  spotifyGet
} from "@/lib/spotify-auth";
import {
  buildAlbumPick,
  buildAlbumRecommendationReason,
  buildCuratedFeed,
  collectListenerArtists,
  buildTasteProfile,
  buildTrackPick,
  isStrongFlavorMatch,
  pinPickToVibe,
  rankPicksForVibe,
  rankPicksForVibeWithSeed,
  scorePickForVibe,
  selectFreshPicks,
  isJazzAdjacentArtist,
  ListenerTasteProfile,
  parseVibe,
  scoreArtistForVibe,
  SpotifyAlbumEntity,
  SpotifyArtistEntity,
  SpotifyTrackEntity,
  vibeProfiles
} from "@/lib/spotify-recommendations";
import { hydratePublicArtworkForPick, isRenderableArtworkUrl } from "@/lib/cover-art";
import { ensureUniqueFeeds } from "@/lib/recommendation-feeds";
import { localizePick } from "@/lib/vanguard-i18n";
import { AppLocale, JazzPick, RecommendationBatchRequest, RecommendationBatchResponse, RecommendationFeed, vibeOptions, Vibe } from "@/types/jazz";

export const dynamic = "force-dynamic";

function parseLocale(value: string | null | undefined): AppLocale {
  return value === "en" ? "en" : "zh-Hant";
}

type PagingResponse<T> = {
  items: T[];
};

type TopItemsResponse<T> = PagingResponse<T>;

type RecentlyPlayedItem = {
  track: SpotifyTrackEntity;
};

type SearchResponse = {
  tracks?: { items: SpotifyTrackEntity[] };
  albums?: { items: SpotifyAlbumEntity[] };
};

type ListenerData = {
  topArtists: SpotifyArtistEntity[];
  topTracks: SpotifyTrackEntity[];
  recentlyPlayed: SpotifyTrackEntity[];
  savedTracks: SpotifyTrackEntity[];
  tasteProfile: ListenerTasteProfile;
};

function matchesCuratedJazzArtist(name: string) {
  const lowered = name.toLowerCase();
  return jazzPicks.some(
    (pick) =>
      pick.artist.toLowerCase().includes(lowered) ||
      lowered.includes(pick.artist.toLowerCase())
  );
}

function isRecommendableAlbum(album: SpotifyAlbumEntity) {
  return album.album_type !== "single";
}

function albumMatchesActiveFlavor(
  pick: JazzPick,
  activeVibe: JazzPick["vibeTags"][number]
) {
  return isStrongFlavorMatch(pick, activeVibe) || scorePickForVibe(pick, activeVibe) >= 7;
}

function selectSeedArtistsForVibe(
  activeVibe: JazzPick["vibeTags"][number],
  listenerArtists: SpotifyArtistEntity[]
) {
  const profile = vibeProfiles[activeVibe];
  const rankedTopArtists = [...listenerArtists]
    .filter(isJazzAdjacentArtist)
    .sort((left, right) => scoreArtistForVibe(right, activeVibe) - scoreArtistForVibe(left, activeVibe))
    .filter((artist) => scoreArtistForVibe(artist, activeVibe) >= 8)
    .filter((artist, index, list) => list.findIndex((entry) => entry.id === artist.id) === index);

  const anchorArtists = profile.anchorArtists
    .filter(
      (artistName) =>
        !rankedTopArtists.some((artist) => artist.name.toLowerCase() === artistName.toLowerCase())
    )
    .map((artistName) => ({
      id: `anchor-${activeVibe}-${artistName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: artistName,
      genres: profile.seedGenreTerms
    }));

  return [...rankedTopArtists.slice(0, 4), ...anchorArtists].slice(0, 6);
}

async function getTopArtists(accessToken: string) {
  const [shortTerm, mediumTerm] = await Promise.all([
    spotifyGet<TopItemsResponse<SpotifyArtistEntity>>(accessToken, "/me/top/artists", {
      time_range: "short_term",
      limit: 10
    }),
    spotifyGet<TopItemsResponse<SpotifyArtistEntity>>(accessToken, "/me/top/artists", {
      time_range: "medium_term",
      limit: 10
    })
  ]);

  return [...shortTerm.items, ...mediumTerm.items];
}

async function safeSpotifyLoad<T>(loader: () => Promise<T>, fallback: T) {
  try {
    return await loader();
  } catch {
    return fallback;
  }
}

async function getTopTracks(accessToken: string) {
  const [shortTerm, mediumTerm] = await Promise.all([
    spotifyGet<TopItemsResponse<SpotifyTrackEntity>>(accessToken, "/me/top/tracks", {
      time_range: "short_term",
      limit: 10
    }),
    spotifyGet<TopItemsResponse<SpotifyTrackEntity>>(accessToken, "/me/top/tracks", {
      time_range: "medium_term",
      limit: 10
    })
  ]);

  return [...shortTerm.items, ...mediumTerm.items];
}

async function getRecentlyPlayed(accessToken: string) {
  const recent = await spotifyGet<PagingResponse<RecentlyPlayedItem>>(
    accessToken,
    "/me/player/recently-played",
    {
      limit: 12
    }
  );

  return recent.items.map((item) => item.track);
}

async function getSavedTracks(accessToken: string) {
  const saved = await spotifyGet<PagingResponse<{ track: SpotifyTrackEntity }>>(
    accessToken,
    "/me/tracks",
    {
      limit: 12
    }
  );

  return saved.items.map((item) => item.track);
}

async function searchSpotify(
  accessToken: string,
  params: { q: string; type: "track" | "album" | "track,album"; limit: number }
) {
  return spotifyGet<SearchResponse>(accessToken, "/search", {
    q: params.q,
    type: params.type,
    limit: params.limit
  });
}

async function hydrateCuratedPick(accessToken: string, pick: JazzPick) {
  let response: SearchResponse;

  try {
    const query = `${pick.type}:"${pick.title}" artist:"${pick.artist}"`;
    response = await searchSpotify(accessToken, {
      q: query,
      type: pick.type,
      limit: 1
    });
  } catch {
    return hydratePublicArtworkForPick(pick);
  }

  if (pick.type === "track") {
    const track = response.tracks?.items[0];
    if (!track) {
      return hydratePublicArtworkForPick(pick);
    }

    const sourceArtist = track.artists[0];
    return buildTrackPick(track, sourceArtist, pick.vibeTags[0], "search", pick.recommendationReason);
  }

  const album = response.albums?.items[0];
  if (!album) {
    return hydratePublicArtworkForPick(pick);
  }

  const sourceArtist = album.artists?.[0] ?? { id: "unknown", name: pick.artist, genres: [] };
  return buildAlbumPick(album, sourceArtist, pick.vibeTags[0], "search", pick.recommendationReason);
}

async function buildSearchDrivenPicks(
  accessToken: string,
  activeVibe: JazzPick["vibeTags"][number],
  seedArtists: SpotifyArtistEntity[],
  excludedAlbumIds: Set<string>,
  tasteProfile: ListenerTasteProfile,
  locale: AppLocale
) {
  const searchResults = await Promise.all(
    seedArtists.slice(0, 4).map(async (artist) => {
      const queries = Array.from(
        new Set([
          ...vibeProfiles[activeVibe].searchTerms.map(
            (term) => `artist:"${artist.name}" ${term}`
          ),
          `artist:"${artist.name}"`,
          `${artist.name} ${vibeProfiles[activeVibe].searchTerms[0]}`
        ])
      );

      const responses = await Promise.all(
        queries.map((query) =>
          safeSpotifyLoad(
            () =>
              searchSpotify(accessToken, {
                q: query,
                type: "album",
                limit: 8
              }),
            {} as SearchResponse
          )
        )
      );

      const picks = responses.flatMap((response) => {
        const albumPicks = (response.albums?.items ?? [])
          .filter((album) => isRecommendableAlbum(album) && !excludedAlbumIds.has(album.id))
          .map((album) => {
            const basePick = buildAlbumPick(album, artist, activeVibe, "search");
            return buildAlbumPick(
              album,
              artist,
              activeVibe,
              "search",
              buildAlbumRecommendationReason({
                albumId: album.id,
                albumTitle: album.name,
                albumArtist: basePick.artist,
                albumYear: basePick.year,
                subgenre: basePick.subgenre,
                activeVibe,
                tasteProfile,
                sourceArtistName: artist.name,
                origin: "search",
                locale
              })
            );
          });

        return albumPicks;
      });

      return picks;
    })
  );

  return rankPicksForVibe(
    searchResults.flat().filter((pick) => albumMatchesActiveFlavor(pick, activeVibe)),
    activeVibe,
    12
  ).map((pick) => pinPickToVibe(pick, activeVibe));
}

async function buildCuratedResponseForVibe(
  vibe: Vibe,
  excludedIds: Set<string>,
  rotation: number,
  accessToken?: string | null,
  limit = 5,
  seed = 0,
  avoidIds: string[] = [],
  locale: AppLocale = "zh-Hant"
) {
  const hydratedCurated = await Promise.all(
    getCuratedPicksForVibe(vibe, {
      limit: Math.max(limit + 8, 10),
      excludeIds: excludedIds,
      rotation,
      seed,
      avoidIds
    })
      .map((pick) => localizePick(pick, locale))
      .map((pick) =>
      accessToken ? hydrateCuratedPick(accessToken, pick) : hydratePublicArtworkForPick(pick)
      )
  );

  const selected = hydratedCurated.slice(0, limit);
  const reservePicks = hydratedCurated
    .slice(limit)
    .filter((pick) => !selected.some((entry) => entry.id === pick.id))
    .slice(0, Math.max(limit, 6));

  return buildCuratedFeed(vibe, selected, reservePicks, locale);
}

async function hydrateMissingArtwork(picks: JazzPick[]) {
  return Promise.all(
    picks.map((pick) =>
      isRenderableArtworkUrl(pick.imageUrl)
        ? Promise.resolve(pick)
        : hydratePublicArtworkForPick({
            ...pick,
            artworkSourceUrl: pick.artworkSourceUrl ?? pick.spotifyUrl
          })
    )
  );
}

async function finalizeFeedArtwork(feed: RecommendationFeed, limit: number) {
  const picks = await hydrateMissingArtwork(feed.picks);
  const reservePicks = await hydrateMissingArtwork(feed.reservePicks ?? []);

  const nextPicks = [...picks];
  const nextReserve = reservePicks.filter(
    (pick) => !nextPicks.some((entry) => entry.id === pick.id)
  );

  for (const pick of nextReserve) {
    if (nextPicks.length >= limit) {
      break;
    }

    nextPicks.push(pick);
  }

  return {
    ...feed,
    picks: nextPicks.slice(0, limit),
    reservePicks: nextReserve
  };
}

function buildSignalDrivenPicks(
  activeVibe: JazzPick["vibeTags"][number],
  topArtists: SpotifyArtistEntity[],
  topTracks: SpotifyTrackEntity[],
  recentlyPlayed: SpotifyTrackEntity[],
  savedTracks: SpotifyTrackEntity[],
  tasteProfile: ListenerTasteProfile,
  locale: AppLocale
) {
  const topArtistMap = new Map(topArtists.map((artist) => [artist.id, artist]));
  const candidates = [
    ...topTracks.map((track) => ({ track, origin: "top" as const })),
    ...savedTracks.map((track) => ({ track, origin: "saved" as const })),
    ...recentlyPlayed.map((track) => ({ track, origin: "recent" as const }))
  ];

  return rankPicksForVibe(
    candidates
      .map(({ track, origin }) => {
        const sourceArtist =
          track.artists
            .map((artist) => topArtistMap.get(artist.id) ?? artist)
            .find(isJazzAdjacentArtist) ?? track.artists[0];
        const basePick = buildAlbumPick(track.album, sourceArtist, activeVibe, origin);

        return {
          pick: buildAlbumPick(
            track.album,
            sourceArtist,
            activeVibe,
            origin,
            buildAlbumRecommendationReason({
              albumId: track.album.id,
              albumTitle: basePick.title,
              albumArtist: basePick.artist,
              albumYear: basePick.year,
              subgenre: basePick.subgenre,
              activeVibe,
              tasteProfile,
              sourceArtistName: sourceArtist.name,
              origin,
              sourceTrackTitle: track.name,
              sourceAlbumTitle: track.album.name,
              locale
            })
          ),
          allowed:
            isRecommendableAlbum(track.album) &&
            (isJazzAdjacentArtist(sourceArtist) ||
              matchesCuratedJazzArtist(sourceArtist.name))
        };
      })
      .filter((entry) => entry.allowed)
      .map((entry) => entry.pick)
      .filter((pick) => albumMatchesActiveFlavor(pick, activeVibe)),
    activeVibe,
    12
  ).map((pick) => pinPickToVibe(pick, activeVibe));
}

async function loadListenerData(accessToken: string): Promise<ListenerData> {
  const [topArtists, topTracks, recentlyPlayed, savedTracks] = await Promise.all([
    safeSpotifyLoad(() => getTopArtists(accessToken), [] as SpotifyArtistEntity[]),
    safeSpotifyLoad(() => getTopTracks(accessToken), [] as SpotifyTrackEntity[]),
    safeSpotifyLoad(() => getRecentlyPlayed(accessToken), [] as SpotifyTrackEntity[]),
    safeSpotifyLoad(() => getSavedTracks(accessToken), [] as SpotifyTrackEntity[])
  ]);

  return {
    topArtists,
    topTracks,
    recentlyPlayed,
    savedTracks,
    tasteProfile: buildTasteProfile(topArtists, topTracks, recentlyPlayed, savedTracks)
  };
}

async function buildFeedForVibe(params: {
  vibe: Vibe;
  excludedIds: Set<string>;
  rotation: number;
  seed: number;
  limit: number;
  avoidIds?: string[];
  accessToken?: string | null;
  listenerData?: ListenerData | null;
  locale: AppLocale;
}): Promise<RecommendationFeed> {
  const { vibe, excludedIds, rotation, seed, limit, avoidIds = [], accessToken, listenerData, locale } = params;

  if (!accessToken || !listenerData) {
    return buildCuratedResponseForVibe(vibe, excludedIds, rotation, null, limit, seed, avoidIds, locale);
  }

  const { topArtists, topTracks, recentlyPlayed, savedTracks, tasteProfile } = listenerData;
  const listenerArtists = collectListenerArtists({
    topArtists,
    topTracks,
    recentlyPlayed,
    savedTracks
  });

  const seedArtists = selectSeedArtistsForVibe(vibe, listenerArtists).filter(
    (artist) => isJazzAdjacentArtist(artist) || matchesCuratedJazzArtist(artist.name)
  );

  const excludedAlbumIds = new Set([
    ...topTracks.map((track) => track.album.id),
    ...recentlyPlayed.map((track) => track.album.id),
    ...savedTracks.map((track) => track.album.id)
  ]);

  const searchedPicks = await buildSearchDrivenPicks(
    accessToken,
    vibe,
    seedArtists,
    excludedAlbumIds,
    tasteProfile,
    locale
  );
  const signalPicks = buildSignalDrivenPicks(
    vibe,
    topArtists,
    topTracks,
    recentlyPlayed,
    savedTracks,
    tasteProfile,
    locale
  );
  const allPersonalizedCandidates = rankPicksForVibeWithSeed(
    [...searchedPicks, ...signalPicks],
    vibe,
    seed,
    18
  );
  const strongPersonalizedPicks = allPersonalizedCandidates.filter((pick) =>
    isStrongFlavorMatch(pick, vibe)
  );
  const personalizedPool =
    strongPersonalizedPicks.length >= Math.min(3, limit)
      ? strongPersonalizedPicks
      : allPersonalizedCandidates;
  const personalizedPicks = selectFreshPicks(
    personalizedPool,
    excludedIds,
    limit,
    rotation,
    seed
  );
  const reservePicks = selectFreshPicks(
    personalizedPool,
    new Set([...excludedIds, ...personalizedPicks.map((pick) => pick.id)]),
    Math.max(limit, 6),
    rotation + 1,
    seed + 17
  );

  if (personalizedPicks.length > 0) {
    const seedNames = Array.from(
      new Set(personalizedPicks.map((pick) => pick.seedArtist).filter(Boolean))
    ).slice(0, 3);

    return finalizeFeedArtwork(
      {
      mode: "personalized",
      headline: locale === "en" ? "Follow where your ear has been" : "順著你最近的耳朵走",
      note:
        locale === "en"
          ? seedNames.length > 0
            ? `This round drifts outward from the atmosphere around ${seedNames.join(", ")}, leaving you a few records that sit closer to ${vibe}.`
            : `This round starts from the sound you've been living with lately and leaves you a few records that sit closer to ${vibe}.`
          : seedNames.length > 0
            ? `這一輪順著 ${seedNames.join("、")} 附近的氣味往外展開，先替你留幾張更貼近 ${vibe} 的專輯。`
            : `先照著你最近的聽感往前推一步，替你留幾張更貼近 ${vibe} 的專輯。`,
      picks: personalizedPicks,
      reservePicks
      },
      limit
    );
  }

  return buildCuratedResponseForVibe(vibe, excludedIds, rotation, accessToken, limit, seed, avoidIds, locale);
}

export async function GET(request: NextRequest) {
  const vibe = parseVibe(request.nextUrl.searchParams.get("vibe"));
  const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
  const excludedIds = new Set(
    (request.nextUrl.searchParams.get("exclude") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  );
  const avoidIds = (request.nextUrl.searchParams.get("avoid") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const rotation = Number.parseInt(request.nextUrl.searchParams.get("rotation") ?? "0", 10) || 0;
  const seed = Number.parseInt(request.nextUrl.searchParams.get("seed") ?? "0", 10) || 0;
  const limit = Math.max(1, Math.min(8, Number.parseInt(request.nextUrl.searchParams.get("limit") ?? "5", 10) || 5));
  const accessToken = await getValidSpotifyAccessToken();
  try {
    const listenerData = accessToken ? await loadListenerData(accessToken) : null;
    const feed = await buildFeedForVibe({
      vibe,
      excludedIds,
      rotation,
      seed,
        limit,
        avoidIds,
        accessToken,
        listenerData,
        locale
      });

    return NextResponse.json(feed, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch {
    const feed = await buildCuratedResponseForVibe(vibe, excludedIds, rotation, null, limit, seed, avoidIds, locale);
    return NextResponse.json(feed, {
      headers: { "Cache-Control": "no-store" }
    });
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { requests?: RecommendationBatchRequest[] }
    | null;
  const requests = (body?.requests ?? [])
    .filter((entry) => vibeOptions.includes(entry.vibe))
    .map((entry) => ({
      vibe: entry.vibe,
      excludeIds: entry.excludeIds ?? [],
      avoidIds: entry.avoidIds ?? [],
      rotation: entry.rotation ?? 0,
      seed: entry.seed ?? 0,
      limit: entry.limit ?? 5,
      locale: parseLocale(entry.locale)
    }));

  if (requests.length === 0) {
    return NextResponse.json({ feeds: {} satisfies RecommendationBatchResponse["feeds"] }, {
      headers: { "Cache-Control": "no-store" }
    });
  }

  const accessToken = await getValidSpotifyAccessToken();

  try {
    const listenerData = accessToken ? await loadListenerData(accessToken) : null;
    const feeds = {} as RecommendationBatchResponse["feeds"];

    for (const entry of requests) {
      const feed = await buildFeedForVibe({
        vibe: entry.vibe,
        excludedIds: new Set(entry.excludeIds),
        rotation: entry.rotation,
        seed: entry.seed ?? 0,
        limit: Math.max(1, Math.min(8, entry.limit ?? 5)),
        avoidIds: entry.avoidIds,
        accessToken,
        listenerData,
        locale: entry.locale
      });

      feeds[entry.vibe] = feed;
    }

    const uniqueFeeds = ensureUniqueFeeds(feeds, {
      seed: requests[0]?.seed ?? 0,
      priorityVibe: requests[0]?.vibe,
      recentIdsByVibe: Object.fromEntries(
        requests.map((entry) => [entry.vibe, entry.avoidIds ?? []])
      )
    }) as RecommendationBatchResponse["feeds"];

    const hydratedFeeds = Object.fromEntries(
      await Promise.all(
        Object.entries(uniqueFeeds).map(async ([vibe, feed]) => [
          vibe,
          await finalizeFeedArtwork(feed as RecommendationFeed, requests.find((entry) => entry.vibe === vibe)?.limit ?? 5)
        ])
      )
    ) as RecommendationBatchResponse["feeds"];

    return NextResponse.json({ feeds: hydratedFeeds }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch {
    const feeds = {} as RecommendationBatchResponse["feeds"];

    for (const entry of requests) {
      const feed = await buildCuratedResponseForVibe(
        entry.vibe,
        new Set(entry.excludeIds),
        entry.rotation,
        null,
        Math.max(1, Math.min(8, entry.limit ?? 5)),
        entry.seed ?? 0,
        entry.avoidIds,
        entry.locale
      );

      feeds[entry.vibe] = feed;
    }

    const uniqueFeeds = ensureUniqueFeeds(feeds, {
      seed: requests[0]?.seed ?? 0,
      priorityVibe: requests[0]?.vibe,
      recentIdsByVibe: Object.fromEntries(
        requests.map((entry) => [entry.vibe, entry.avoidIds ?? []])
      )
    }) as RecommendationBatchResponse["feeds"];

    const hydratedFeeds = Object.fromEntries(
      await Promise.all(
        Object.entries(uniqueFeeds).map(async ([vibe, feed]) => [
          vibe,
          await finalizeFeedArtwork(feed as RecommendationFeed, requests.find((entry) => entry.vibe === vibe)?.limit ?? 5)
        ])
      )
    ) as RecommendationBatchResponse["feeds"];

    return NextResponse.json({ feeds: hydratedFeeds }, {
      headers: { "Cache-Control": "no-store" }
    });
  }
}
