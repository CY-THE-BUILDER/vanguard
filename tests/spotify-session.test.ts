import { beforeEach, describe, expect, it } from "vitest";
import {
  getSpotifyConnectionActions,
  clearStoredSpotifySession,
  getSpotifyConnectionLabel,
  normalizeSpotifySession,
  readStoredSpotifySession,
  writeStoredSpotifySession
} from "@/lib/spotify-session";
import { SpotifySession } from "@/types/jazz";

describe("spotify session helpers", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("keeps a connected Spotify session across reload-like reads", () => {
    const session: SpotifySession = {
      configured: true,
      connected: true,
      displayName: "Hank.t",
      avatarUrl: "https://example.com/avatar.jpg"
    };

    writeStoredSpotifySession(session);

    expect(readStoredSpotifySession()).toEqual({
      configured: true,
      connected: true,
      displayName: "Hank.t",
      avatarUrl: "https://example.com/avatar.jpg",
      product: null,
      profileUrl: null,
      country: null
    });
  });

  it("reuses the cached display name instead of falling back to Spotify listener", () => {
    const normalized = normalizeSpotifySession(
      {
        configured: true,
        connected: true,
        displayName: null as unknown as string
      },
      {
        configured: true,
        connected: true,
        displayName: "Hank.t"
      }
    );

    expect(normalized.displayName).toBe("Hank.t");
    expect(getSpotifyConnectionLabel(normalized)).toBe("已連接 Hank.t");
  });

  it("only exposes the disconnect action once Spotify is connected", () => {
    expect(
      getSpotifyConnectionActions({
        configured: true,
        connected: true,
        displayName: "Hank.t"
      })
    ).toEqual(["disconnect"]);

    expect(
      getSpotifyConnectionActions({
        configured: true,
        connected: false
      })
    ).toEqual(["connect"]);
  });

  it("clears the cached session when the user disconnects", () => {
    writeStoredSpotifySession({
      configured: true,
      connected: true,
      displayName: "Hank.t"
    });

    clearStoredSpotifySession();
    expect(readStoredSpotifySession()).toBeNull();
  });
});
