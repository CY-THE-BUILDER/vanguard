import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockGetValidSpotifyAccessToken = vi.fn();
const mockSpotifyGet = vi.fn();

vi.mock("@/lib/spotify-auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/spotify-auth")>("@/lib/spotify-auth");
  return {
    ...actual,
    getValidSpotifyAccessToken: mockGetValidSpotifyAccessToken,
    spotifyGet: mockSpotifyGet
  };
});

vi.mock("@/lib/cover-art", async () => {
  const actual = await vi.importActual<typeof import("@/lib/cover-art")>("@/lib/cover-art");
  return {
    ...actual,
    hydratePublicArtworkForPick: vi.fn(async (pick) => ({
      ...pick,
      imageUrl:
        pick.imageUrl ||
        `https://image-cdn.test/${encodeURIComponent(pick.id)}.jpg`
    }))
  };
});

function track(params: {
  id: string;
  name: string;
  artistId: string;
  artistName: string;
  albumId: string;
  albumName: string;
  albumImage?: string;
  releaseDate?: string;
}) {
  return {
    id: params.id,
    name: params.name,
    duration_ms: 300000,
    artists: [{ id: params.artistId, name: params.artistName }],
    album: {
      id: params.albumId,
      name: params.albumName,
      release_date: params.releaseDate ?? "1973-01-01",
      images: params.albumImage ? [{ url: params.albumImage }] : [],
      external_urls: {
        spotify: `https://open.spotify.com/album/${params.albumId}`
      },
      artists: [{ id: params.artistId, name: params.artistName }]
    },
    external_urls: {
      spotify: `https://open.spotify.com/track/${params.id}`
    }
  };
}

describe("recommendations route", () => {
  beforeEach(() => {
    vi.resetModules();
    mockGetValidSpotifyAccessToken.mockReset();
    mockSpotifyGet.mockReset();
  });

  it("keeps personalized shelves alive when one Spotify signal endpoint fails", async () => {
    mockGetValidSpotifyAccessToken.mockResolvedValue("token");
    mockSpotifyGet.mockImplementation(async (_token: string, path: string) => {
      if (path === "/me/top/artists") {
        throw new Error("temporary spotify failure");
      }

      if (path === "/me/top/tracks") {
        return {
          items: [
            track({
              id: "track-1",
              name: "Spain",
              artistId: "artist-rtf",
              artistName: "Return to Forever",
              albumId: "album-light-as-a-feather",
              albumName: "Light as a Feather",
              albumImage: "https://i.scdn.co/image/light-as-a-feather"
            })
          ]
        };
      }

      if (path === "/me/player/recently-played") {
        return {
          items: [
            {
              track: track({
                id: "track-2",
                name: "500 Miles High",
                artistId: "artist-rtf",
                artistName: "Return to Forever",
                albumId: "album-light-as-a-feather",
                albumName: "Light as a Feather",
                albumImage: "https://i.scdn.co/image/light-as-a-feather"
              })
            }
          ]
        };
      }

      if (path === "/me/tracks") {
        return {
          items: [
            {
              track: track({
                id: "track-3",
                name: "Vulcan Worlds",
                artistId: "artist-rtf-2",
                artistName: "Return to Forever",
                albumId: "album-where-have-i-known-you-before",
                albumName: "Where Have I Known You Before",
                albumImage: "https://i.scdn.co/image/where-have-i-known-you-before",
                releaseDate: "1974-01-01"
              })
            }
          ]
        };
      }

      if (path === "/search") {
        return {
          albums: {
            items: [
              {
                id: "album-romantic-warrior",
                name: "Romantic Warrior",
                release_date: "1976-01-01",
                images: [{ url: "https://i.scdn.co/image/romantic-warrior" }],
                external_urls: {
                  spotify: "https://open.spotify.com/album/album-romantic-warrior"
                },
                artists: [{ id: "artist-rtf", name: "Return to Forever" }]
              }
            ]
          }
        };
      }

      throw new Error(`Unexpected path ${path}`);
    });

    const { GET } = await import("@/app/api/jazz/recommendations/route");
    const request = new NextRequest("https://vanguard.noesis.studio/api/jazz/recommendations?vibe=Fusion&limit=3");
    const response = await GET(request);
    const payload = await response.json();

    expect(payload.mode).toBe("personalized");
    expect(payload.picks.length).toBeGreaterThan(0);
    expect(payload.picks.every((pick: { source?: string }) => pick.source === "spotify")).toBe(true);
    expect(payload.picks.every((pick: { imageUrl?: string }) => typeof pick.imageUrl === "string" && pick.imageUrl.length > 0)).toBe(true);
    expect(payload.picks.some((pick: { title: string }) => pick.title === "Light as a Feather")).toBe(true);
  });

  it("does not collapse the whole request to curated when Spotify search fails for one query", async () => {
    mockGetValidSpotifyAccessToken.mockResolvedValue("token");
    mockSpotifyGet.mockImplementation(async (_token: string, path: string, searchParams?: Record<string, string | number | undefined>) => {
      if (path === "/me/top/artists") {
        return {
          items: [
            {
              id: "artist-bill-evans",
              name: "Bill Evans",
              genres: ["piano jazz", "cool jazz"]
            }
          ]
        };
      }

      if (path === "/me/top/tracks") {
        return {
          items: [
            track({
              id: "track-focus-1",
              name: "My Foolish Heart",
              artistId: "artist-bill-evans",
              artistName: "Bill Evans",
              albumId: "album-waltz-for-debby",
              albumName: "Waltz for Debby",
              albumImage: "https://i.scdn.co/image/waltz-for-debby",
              releaseDate: "1961-01-01"
            })
          ]
        };
      }

      if (path === "/me/player/recently-played") {
        return { items: [] };
      }

      if (path === "/me/tracks") {
        return { items: [] };
      }

      if (path === "/search") {
        if (String(searchParams?.q ?? "").includes("piano jazz")) {
          throw new Error("one search query failed");
        }

        return {
          albums: {
            items: [
              {
                id: "album-undercurrent",
                name: "Undercurrent",
                release_date: "1962-01-01",
                images: [{ url: "https://i.scdn.co/image/undercurrent" }],
                external_urls: {
                  spotify: "https://open.spotify.com/album/album-undercurrent"
                },
                artists: [{ id: "artist-bill-evans", name: "Bill Evans" }]
              }
            ]
          }
        };
      }

      throw new Error(`Unexpected path ${path}`);
    });

    const { GET } = await import("@/app/api/jazz/recommendations/route");
    const request = new NextRequest("https://vanguard.noesis.studio/api/jazz/recommendations?vibe=Focus&limit=3");
    const response = await GET(request);
    const payload = await response.json();

    expect(payload.mode).toBe("personalized");
    expect(payload.picks.every((pick: { source?: string }) => pick.source === "spotify")).toBe(true);
    expect(payload.note).toContain("貼近 Focus");
  });
});
