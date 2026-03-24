import { SpotifySession } from "@/types/jazz";

const SPOTIFY_SESSION_KEY = "vanguard-spotify-session";

function isBrowser() {
  return typeof window !== "undefined";
}

function sanitizeDisplayName(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.toLowerCase() === "spotify listener") {
    return undefined;
  }

  return trimmed;
}

export function normalizeSpotifySession(
  session: SpotifySession,
  cachedSession?: SpotifySession | null
): SpotifySession {
  if (!session.connected) {
    return {
      configured: session.configured,
      connected: false
    };
  }

  return {
    configured: session.configured,
    connected: true,
    displayName: sanitizeDisplayName(session.displayName) ?? sanitizeDisplayName(cachedSession?.displayName),
    avatarUrl: session.avatarUrl ?? cachedSession?.avatarUrl ?? null,
    product: session.product ?? cachedSession?.product ?? null,
    profileUrl: session.profileUrl ?? cachedSession?.profileUrl ?? null,
    country: session.country ?? cachedSession?.country ?? null
  };
}

export function readStoredSpotifySession() {
  if (!isBrowser()) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(SPOTIFY_SESSION_KEY);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const normalized = normalizeSpotifySession(parsed as SpotifySession, null);
    return normalized.connected ? normalized : null;
  } catch {
    return null;
  }
}

export function writeStoredSpotifySession(session: SpotifySession) {
  if (!isBrowser() || !session.connected) {
    return;
  }

  window.localStorage.setItem(
    SPOTIFY_SESSION_KEY,
    JSON.stringify(normalizeSpotifySession(session, null))
  );
}

export function clearStoredSpotifySession() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(SPOTIFY_SESSION_KEY);
}

export function getSpotifyConnectionLabel(session: SpotifySession) {
  const displayName = sanitizeDisplayName(session.displayName);
  return displayName ? `已連接（${displayName}）` : "已連接 Spotify";
}

export function getSpotifyConnectionActions(session: SpotifySession) {
  return session.connected ? ["disconnect"] as const : ["connect"] as const;
}
