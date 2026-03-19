import { describe, expect, it } from "vitest";
import {
  buildAlbumPick,
  buildAlbumRecommendationReason,
  buildSpotifySearchUrl,
  buildTasteProfile,
  buildTrackPick,
  diversifyPicks,
  inferVibes,
  rankPicksForVibe,
  scoreArtistForVibe,
  scorePickForVibe
} from "@/lib/spotify-recommendations";

describe("spotify recommendation mapping", () => {
  it("maps a Spotify track to a pick with the exact album image and track url", () => {
    const pick = buildTrackPick(
      {
        id: "track-123",
        name: "Actual Track",
        duration_ms: 301000,
        artists: [{ id: "artist-1", name: "Nubya Garcia" }],
        album: {
          id: "album-1",
          name: "Source",
          release_date: "2020-08-21",
          images: [{ url: "https://i.scdn.co/image/album-cover" }]
        },
        external_urls: {
          spotify: "https://open.spotify.com/track/track-123"
        }
      },
      {
        id: "artist-1",
        name: "Nubya Garcia",
        genres: ["contemporary jazz", "jazz saxophone"]
      },
      "Late Night",
      "search"
    );

    expect(pick.imageUrl).toBe("https://i.scdn.co/image/album-cover");
    expect(pick.spotifyUrl).toBe("https://open.spotify.com/track/track-123");
    expect(pick.shareUrl).toBe("https://open.spotify.com/track/track-123");
    expect(pick.type).toBe("track");
  });

  it("maps a Spotify album to a pick with the exact album url", () => {
    const pick = buildAlbumPick(
      {
        id: "album-1",
        name: "Kind of Blue",
        release_date: "1959-08-17",
        images: [{ url: "https://i.scdn.co/image/kob" }],
        external_urls: {
          spotify: "https://open.spotify.com/album/album-1"
        },
        artists: [{ id: "artist-1", name: "Miles Davis" }]
      },
      {
        id: "artist-1",
        name: "Miles Davis",
        genres: ["modal jazz", "jazz trumpet"]
      },
      "Classic",
      "search"
    );

    expect(pick.imageUrl).toBe("https://i.scdn.co/image/kob");
    expect(pick.spotifyUrl).toBe("https://open.spotify.com/album/album-1");
    expect(pick.type).toBe("album");
    expect(pick.artist).toBe("Miles Davis");
  });

  it("falls back to a Spotify search URL when an exact item has not been hydrated yet", () => {
    expect(
      buildSpotifySearchUrl({
        title: "Kind of Blue",
        artist: "Miles Davis",
        type: "album"
      })
    ).toBe(
      "https://open.spotify.com/search/album%3AKind%20of%20Blue%20artist%3AMiles%20Davis"
    );
  });

  it("does not force every inferred result to include the active vibe", () => {
    const inferred = inferVibes(["modal jazz", "jazz trumpet"], "Fusion");
    expect(inferred.vibeTags).toContain("Late Night");
    expect(inferred.vibeTags).not.toContain("Fusion");
  });

  it("scores the same pick differently across vibes", () => {
    const fusionPick = buildAlbumPick(
      {
        id: "album-2",
        name: "Head Hunters",
        release_date: "1973-10-26",
        images: [{ url: "https://i.scdn.co/image/headhunters" }],
        external_urls: {
          spotify: "https://open.spotify.com/album/album-2"
        },
        artists: [{ id: "artist-2", name: "Herbie Hancock" }]
      },
      {
        id: "artist-2",
        name: "Herbie Hancock",
        genres: ["jazz fusion", "jazz funk"]
      },
      "Fusion",
      "search"
    );

    expect(scorePickForVibe(fusionPick, "Fusion")).toBeGreaterThan(
      scorePickForVibe(fusionPick, "Classic")
    );
  });

  it("can derive an album recommendation reason from listening taste instead of repeating the same template", () => {
    const tasteProfile = buildTasteProfile(
      [
        {
          id: "artist-2",
          name: "Herbie Hancock",
          genres: ["jazz fusion", "jazz funk"]
        }
      ],
      [
        {
          id: "track-1",
          name: "Chameleon",
          duration_ms: 900000,
          artists: [{ id: "artist-2", name: "Herbie Hancock" }],
          album: {
            id: "album-2",
            name: "Head Hunters",
            release_date: "1973-10-26"
          }
        }
      ],
      [],
      []
    );

    const reason = buildAlbumRecommendationReason({
      albumId: "album-3",
      albumTitle: "Thrust",
      albumArtist: "Herbie Hancock",
      albumYear: 1974,
      subgenre: "Fusion",
      activeVibe: "Fusion",
      tasteProfile,
      sourceArtistName: "Herbie Hancock",
      origin: "search",
      sourceAlbumTitle: "Head Hunters"
    });

    expect(reason).toContain("Thrust");
    expect(reason).not.toContain("數據");
    expect(reason).not.toContain("分析");
    expect(reason).not.toContain("觀察");
    expect(reason).not.toContain("最近常聽的年代感");
  });

  it("scores artists differently by flavor so seeds can shift with the selected vibe", () => {
    const fusionArtist = {
      id: "artist-fusion",
      name: "Herbie Hancock",
      genres: ["jazz fusion", "jazz funk"]
    };
    const focusArtist = {
      id: "artist-focus",
      name: "Bill Evans",
      genres: ["piano jazz", "cool jazz"]
    };

    expect(scoreArtistForVibe(fusionArtist, "Fusion")).toBeGreaterThan(
      scoreArtistForVibe(fusionArtist, "Classic")
    );
    expect(scoreArtistForVibe(focusArtist, "Focus")).toBeGreaterThan(
      scoreArtistForVibe(focusArtist, "Fusion")
    );
  });

  it("diversifies picks by artist before filling the rest of the shelf", () => {
    const picks = [
      buildAlbumPick(
        {
          id: "album-a1",
          name: "A One",
          release_date: "1973-01-01",
          images: [{ url: "https://i.scdn.co/image/a1" }],
          external_urls: { spotify: "https://open.spotify.com/album/a1" },
          artists: [{ id: "artist-a", name: "Artist A" }]
        },
        { id: "artist-a", name: "Artist A", genres: ["jazz fusion"] },
        "Fusion",
        "search"
      ),
      buildAlbumPick(
        {
          id: "album-a2",
          name: "A Two",
          release_date: "1974-01-01",
          images: [{ url: "https://i.scdn.co/image/a2" }],
          external_urls: { spotify: "https://open.spotify.com/album/a2" },
          artists: [{ id: "artist-a", name: "Artist A" }]
        },
        { id: "artist-a", name: "Artist A", genres: ["jazz fusion"] },
        "Fusion",
        "search"
      ),
      buildAlbumPick(
        {
          id: "album-b1",
          name: "B One",
          release_date: "1975-01-01",
          images: [{ url: "https://i.scdn.co/image/b1" }],
          external_urls: { spotify: "https://open.spotify.com/album/b1" },
          artists: [{ id: "artist-b", name: "Artist B" }]
        },
        { id: "artist-b", name: "Artist B", genres: ["jazz fusion"] },
        "Fusion",
        "search"
      )
    ];

    const diversified = diversifyPicks(picks, "Fusion", 2);

    expect(diversified).toHaveLength(2);
    expect(new Set(diversified.map((pick) => pick.artist)).size).toBe(2);
  });

  it("produces different shelves for different flavors from the same candidate pool", () => {
    const candidates = [
      buildAlbumPick(
        {
          id: "classic-1",
          name: "Kind of Blue",
          release_date: "1959-08-17",
          images: [{ url: "https://i.scdn.co/image/kob" }],
          external_urls: { spotify: "https://open.spotify.com/album/classic-1" },
          artists: [{ id: "artist-miles", name: "Miles Davis" }]
        },
        { id: "artist-miles", name: "Miles Davis", genres: ["modal jazz", "jazz trumpet"] },
        "Classic",
        "search"
      ),
      buildAlbumPick(
        {
          id: "fusion-1",
          name: "Head Hunters",
          release_date: "1973-10-26",
          images: [{ url: "https://i.scdn.co/image/hh" }],
          external_urls: { spotify: "https://open.spotify.com/album/fusion-1" },
          artists: [{ id: "artist-herbie", name: "Herbie Hancock" }]
        },
        { id: "artist-herbie", name: "Herbie Hancock", genres: ["jazz fusion", "jazz funk"] },
        "Fusion",
        "search"
      ),
      buildAlbumPick(
        {
          id: "late-1",
          name: "Night Dreamer",
          release_date: "1964-01-01",
          images: [{ url: "https://i.scdn.co/image/night" }],
          external_urls: { spotify: "https://open.spotify.com/album/late-1" },
          artists: [{ id: "artist-wayne", name: "Wayne Shorter" }]
        },
        { id: "artist-wayne", name: "Wayne Shorter", genres: ["post-bop", "modal jazz"] },
        "Late Night",
        "search"
      ),
      buildAlbumPick(
        {
          id: "focus-1",
          name: "Bright Size Life",
          release_date: "1976-01-01",
          images: [{ url: "https://i.scdn.co/image/focus" }],
          external_urls: { spotify: "https://open.spotify.com/album/focus-1" },
          artists: [{ id: "artist-pat", name: "Pat Metheny" }]
        },
        { id: "artist-pat", name: "Pat Metheny", genres: ["contemporary jazz", "jazz guitar"] },
        "Focus",
        "search"
      )
    ];

    const fusionShelf = rankPicksForVibe(candidates, "Fusion", 3).map((pick) => pick.title);
    const lateNightShelf = rankPicksForVibe(candidates, "Late Night", 3).map((pick) => pick.title);

    expect(fusionShelf).not.toEqual(lateNightShelf);
    expect(fusionShelf[0]).toBe("Head Hunters");
    expect(lateNightShelf).toContain("Night Dreamer");
    expect(lateNightShelf).not.toEqual(fusionShelf);
  });
});
