import { NextRequest, NextResponse } from "next/server";
import { getCuratedPicksForVibe, jazzPicks } from "@/data/jazz-picks";
import {
  clearSpotifyCookies,
  getValidSpotifyAccessToken,
  spotifyGet
} from "@/lib/spotify-auth";
import {
  buildAlbumPick,
  buildAlbumRecommendationReason,
  buildCuratedFeed,
  buildTasteProfile,
  buildTrackPick,
  isStrongFlavorMatch,
  rankPicksForVibe,
  isJazzAdjacentArtist,
  ListenerTasteProfile,
  parseVibe,
  scoreArtistForVibe,
  SpotifyAlbumEntity,
  SpotifyArtistEntity,
  SpotifyTrackEntity,
  vibeProfiles
} from "@/lib/spotify-recommendations";
import { hydratePublicArtworkForPick } from "@/lib/cover-art";
import { JazzPick } from "@/types/jazz";

export const dynamic = "force-dynamic";

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
  return isStrongFlavorMatch(pick, activeVibe);
}

function selectSeedArtistsForVibe(
  activeVibe: JazzPick["vibeTags"][number],
  topArtists: SpotifyArtistEntity[]
) {
  const profile = vibeProfiles[activeVibe];
  const rankedTopArtists = [...topArtists]
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
  const query = `${pick.type}:"${pick.title}" artist:"${pick.artist}"`;
  const response = await searchSpotify(accessToken, {
    q: query,
    type: pick.type,
    limit: 1
  });

  if (pick.type === "track") {
    const track = response.tracks?.items[0];
    if (!track) {
      return hydratePublicArtworkForPick(pick);
    }

    const sourceArtist = track.artists[0];
    return buildTrackPick(track, sourceArtist, pick.vibeTags[0], "search");
  }

  const album = response.albums?.items[0];
  if (!album) {
    return hydratePublicArtworkForPick(pick);
  }

  const sourceArtist = album.artists?.[0] ?? { id: "unknown", name: pick.artist, genres: [] };
  return buildAlbumPick(album, sourceArtist, pick.vibeTags[0], "search");
}

async function buildSearchDrivenPicks(
  accessToken: string,
  activeVibe: JazzPick["vibeTags"][number],
  seedArtists: SpotifyArtistEntity[],
  excludedAlbumIds: Set<string>,
  tasteProfile: ListenerTasteProfile
) {
  const searchResults = await Promise.all(
    seedArtists.slice(0, 4).map(async (artist) => {
      const queries = vibeProfiles[activeVibe].searchTerms.map(
        (term) => `artist:"${artist.name}" ${term}`
      );

      const responses = await Promise.all(
        queries.map((query) =>
          searchSpotify(accessToken, {
            q: query,
            type: "album",
            limit: 5
          })
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
                origin: "search"
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
  );
}

function buildSignalDrivenPicks(
  activeVibe: JazzPick["vibeTags"][number],
  topArtists: SpotifyArtistEntity[],
  topTracks: SpotifyTrackEntity[],
  recentlyPlayed: SpotifyTrackEntity[],
  savedTracks: SpotifyTrackEntity[],
  tasteProfile: ListenerTasteProfile
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
              sourceAlbumTitle: track.album.name
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
  );
}

export async function GET(request: NextRequest) {
  const vibe = parseVibe(request.nextUrl.searchParams.get("vibe"));
  const accessToken = await getValidSpotifyAccessToken();

  if (!accessToken) {
    const hydratedCurated = await Promise.all(
      getCuratedPicksForVibe(vibe).map((pick) => hydratePublicArtworkForPick(pick))
    );

    return NextResponse.json(buildCuratedFeed(vibe, hydratedCurated), {
      headers: { "Cache-Control": "no-store" }
    });
  }

  try {
    const [topArtists, topTracks, recentlyPlayed, savedTracks] = await Promise.all([
      getTopArtists(accessToken),
      getTopTracks(accessToken),
      getRecentlyPlayed(accessToken),
      getSavedTracks(accessToken)
    ]);
    const tasteProfile = buildTasteProfile(topArtists, topTracks, recentlyPlayed, savedTracks);

    const seedArtists = selectSeedArtistsForVibe(vibe, topArtists).filter(
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
      tasteProfile
    );
    const signalPicks = buildSignalDrivenPicks(
      vibe,
      topArtists,
      topTracks,
      recentlyPlayed,
      savedTracks,
      tasteProfile
    );
    const strongPersonalizedPicks = [...searchedPicks, ...signalPicks].filter((pick) =>
      isStrongFlavorMatch(pick, vibe)
    );
    const personalizedPicks = rankPicksForVibe(strongPersonalizedPicks, vibe, 5);

    if (personalizedPicks.length >= 3) {
      const seedNames = Array.from(
        new Set(personalizedPicks.map((pick) => pick.seedArtist).filter(Boolean))
      ).slice(0, 3);

      return NextResponse.json(
        {
          mode: "personalized",
          headline: "順著你最近的耳朵走",
          note:
            seedNames.length > 0
              ? `這一輪順著 ${seedNames.join("、")} 附近的氣味往外展開，先替你留幾張更貼近 ${vibe} 的專輯。`
              : `先照著你最近的聽感往前推一步，替你留幾張更貼近 ${vibe} 的專輯。`,
          picks: personalizedPicks
        },
        {
          headers: { "Cache-Control": "no-store" }
        }
      );
    }

    const hydratedCurated = await Promise.all(
      getCuratedPicksForVibe(vibe).map((pick) => hydrateCuratedPick(accessToken, pick))
    );

    return NextResponse.json(
      buildCuratedFeed(vibe, hydratedCurated),
      {
        headers: { "Cache-Control": "no-store" }
      }
    );
  } catch {
    clearSpotifyCookies();
    const hydratedCurated = await Promise.all(
      getCuratedPicksForVibe(vibe).map((pick) => hydratePublicArtworkForPick(pick))
    );

    return NextResponse.json(buildCuratedFeed(vibe, hydratedCurated), {
      headers: { "Cache-Control": "no-store" }
    });
  }
}
