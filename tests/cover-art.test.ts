import { describe, expect, it, vi } from "vitest";
import { jazzPicks } from "@/data/jazz-picks";
import {
  buildItunesArtworkSearchUrl,
  clearPublicArtworkHydrationCache,
  fetchItunesArtwork,
  hydratePublicArtworkForPick,
  isRenderableArtworkUrl
} from "@/lib/cover-art";
import { JazzPick } from "@/types/jazz";

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    json: async () => body
  } as Response;
}

const syntheticTrackPick: JazzPick = {
  id: "synthetic-track",
  title: "Take Five",
  artist: "The Dave Brubeck Quartet",
  type: "track",
  subgenre: "Cool Jazz",
  vibeTags: ["Classic", "Focus"],
  recommendationReason: "synthetic",
  imageUrl: "data:image/svg+xml,placeholder",
  spotifyUrl: "https://open.spotify.com/search/track%3ATake%20Five",
  shareUrl: "https://open.spotify.com/search/track%3ATake%20Five",
  artworkSourceUrl: "https://open.spotify.com/track/1YQWosTIljIvxAgHWTp7KP",
  year: 1959,
  durationLabel: "5 min",
  accentColor: "#8aa190",
  source: "curated"
};

describe("public artwork hydration", () => {
  it("memoizes repeated hydration calls when using the default fetch path", async () => {
    clearPublicArtworkHydrationCache();
    const originalFetch = global.fetch;
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        thumbnail_url: "https://image-cdn.spotify.com/kind-of-blue.jpg"
      })
    );

    global.fetch = fetchMock as typeof fetch;

    try {
      const [first, second] = await Promise.all([
        hydratePublicArtworkForPick(jazzPicks[0]),
        hydratePublicArtworkForPick(jazzPicks[0])
      ]);

      expect(first.imageUrl).toBe("https://image-cdn.spotify.com/kind-of-blue.jpg");
      expect(second.imageUrl).toBe("https://image-cdn.spotify.com/kind-of-blue.jpg");
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      global.fetch = originalFetch;
      clearPublicArtworkHydrationCache();
    }
  });

  it("builds catalog-specific iTunes search urls for albums and tracks", () => {
    const albumPick = jazzPicks.find((pick) => pick.type === "album");
    const trackPick = syntheticTrackPick;

    if (!albumPick) {
      throw new Error("Expected at least one album pick.");
    }

    expect(buildItunesArtworkSearchUrl(albumPick)).toContain("entity=album");
    expect(buildItunesArtworkSearchUrl(trackPick)).toContain("entity=song");
  });

  it("keeps Spotify oEmbed as the first stop when the canonical item is available", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.startsWith("https://open.spotify.com/oembed")) {
        return jsonResponse({
          thumbnail_url: "https://image-cdn.spotify.com/kind-of-blue.jpg"
        });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    const hydrated = await hydratePublicArtworkForPick(jazzPicks[0], fetchMock as typeof fetch);

    expect(hydrated.imageUrl).toBe("https://image-cdn.spotify.com/kind-of-blue.jpg");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("falls back to iTunes artwork when Spotify oEmbed cannot resolve the cover", async () => {
    const trackPick = syntheticTrackPick;

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.startsWith("https://open.spotify.com/oembed")) {
        return jsonResponse({}, false);
      }

      if (url.startsWith("https://itunes.apple.com/search")) {
        return jsonResponse({
          results: [
            {
              trackName: trackPick.title,
              collectionName: "Time Out",
              artistName: trackPick.artist,
              artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music/100x100bb.jpg"
            }
          ]
        });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    const hydrated = await hydratePublicArtworkForPick(trackPick, fetchMock as typeof fetch);

    expect(hydrated.imageUrl).toBe(
      "https://is1-ssl.mzstatic.com/image/thumb/Music/600x600bb.jpg"
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(buildItunesArtworkSearchUrl(trackPick)).toContain("entity=song");
  });

  it("retries iTunes artwork lookup with the album title when the exact search misses", async () => {
    const albumPick = jazzPicks.find((pick) => pick.id === "light-as-a-feather");
    if (!albumPick) {
      throw new Error("Expected Light as a Feather in curated picks.");
    }

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.startsWith("https://itunes.apple.com/search")) {
        const parsed = new URL(url);
        const term = parsed.searchParams.get("term");

        if (term === "Light as a Feather Return to Forever") {
          return jsonResponse({ results: [] });
        }

        if (term === "Light as a Feather") {
          return jsonResponse({
            results: [
              {
                collectionName: "Light as a Feather",
                artistName: "Chick Corea & Return to Forever",
                artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music116/100x100bb.jpg"
              }
            ]
          });
        }
      }

      return jsonResponse({}, false);
    });

    const artwork = await fetchItunesArtwork(albumPick, fetchMock as typeof fetch);

    expect(artwork).toBe(
      "https://is1-ssl.mzstatic.com/image/thumb/Music116/600x600bb.jpg"
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("downgrades invalid exact album links to a stable Spotify search url instead of shipping a dead album page", async () => {
    const albumPick = {
      ...jazzPicks[0],
      spotifyUrl: "https://open.spotify.com/album/not-a-real-album",
      shareUrl: "https://open.spotify.com/album/not-a-real-album",
      artworkSourceUrl: "https://open.spotify.com/album/not-a-real-album"
    };

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.startsWith("https://open.spotify.com/oembed")) {
        return jsonResponse({}, false);
      }

      if (url.startsWith("https://itunes.apple.com/search")) {
        return jsonResponse({
          results: [
            {
              collectionName: albumPick.title,
              artistName: albumPick.artist,
              artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music/100x100bb.jpg"
            }
          ]
        });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    const hydrated = await hydratePublicArtworkForPick(albumPick, fetchMock as typeof fetch);

    expect(hydrated.spotifyUrl).toBe("https://open.spotify.com/search/Kind%20of%20Blue%20Miles%20Davis");
    expect(hydrated.shareUrl).toBe(hydrated.spotifyUrl);
    expect(hydrated.imageUrl).toBe("https://is1-ssl.mzstatic.com/image/thumb/Music/600x600bb.jpg");
  });

  it("queries the right catalog for every curated recommendation type and returns non-default art", async () => {
    const requestLog: string[] = [];
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      requestLog.push(url);

      if (url.startsWith("https://open.spotify.com/oembed")) {
        return jsonResponse({}, false);
      }

      if (url.startsWith("https://itunes.apple.com/search")) {
        const parsed = new URL(url);
        const term = parsed.searchParams.get("term") ?? "";
        const match =
          jazzPicks.find((pick) => term === `${pick.title} ${pick.artist}`) ?? jazzPicks[0];
        const type = parsed.searchParams.get("entity");

        return jsonResponse({
          results: [
            type === "song"
              ? {
                  trackName: match.title,
                  collectionName: `${match.title} Session`,
                  artistName: match.artist,
                  artworkUrl100: `https://is1-ssl.mzstatic.com/image/thumb/${encodeURIComponent(match.title)}/100x100bb.jpg`
                }
              : {
                  collectionName: match.title,
                  artistName: match.artist,
                  artworkUrl100: `https://is1-ssl.mzstatic.com/image/thumb/${encodeURIComponent(match.title)}/100x100bb.jpg`
                }
          ]
        });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    const hydrated = await Promise.all(
      jazzPicks.map((pick) => hydratePublicArtworkForPick(pick, fetchMock as typeof fetch))
    );

    for (const pick of hydrated) {
      expect(pick.imageUrl.startsWith("data:image/svg+xml")).toBe(false);
      expect(pick.imageUrl).toContain("600x600bb");
    }

    for (const pick of jazzPicks) {
      const expectedEntity = pick.type === "track" ? "entity=song" : "entity=album";
      expect(
        requestLog.some(
          (url) =>
            url.includes("https://itunes.apple.com/search") &&
            url.includes(expectedEntity) &&
            url.includes(encodeURIComponent(`${pick.title} ${pick.artist}`))
        )
      ).toBe(true);
    }
  });

  it("rejects weak iTunes matches instead of attaching the wrong cover", async () => {
    const albumPick = jazzPicks.find((pick) => pick.type === "album");
    if (!albumPick) {
      throw new Error("Expected at least one curated album.");
    }

    const fetchMock = vi.fn(async () =>
      jsonResponse({
        results: [
          {
            collectionName: "Completely Different Record",
            artistName: "Someone Else",
            artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music/100x100bb.jpg"
          }
        ]
      })
    );

    const artwork = await fetchItunesArtwork(albumPick, fetchMock as typeof fetch);

    expect(artwork).toBeNull();
  });

  it("treats Spotify page urls as non-renderable artwork so cards fall back cleanly", () => {
    expect(isRenderableArtworkUrl("https://open.spotify.com/search/Light%20as%20a%20Feather")).toBe(false);
    expect(isRenderableArtworkUrl("https://open.spotify.com/album/abc123")).toBe(false);
    expect(isRenderableArtworkUrl("https://i.scdn.co/image/abc123")).toBe(true);
    expect(isRenderableArtworkUrl("data:image/svg+xml,placeholder")).toBe(true);
  });
});
