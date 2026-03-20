import { cookies } from "next/headers";
import { getCanonicalOrigin } from "@/lib/site-url";

const ACCESS_TOKEN_COOKIE = "spotify_access_token";
const REFRESH_TOKEN_COOKIE = "spotify_refresh_token";
const EXPIRES_AT_COOKIE = "spotify_expires_at";
const STATE_COOKIE = "spotify_oauth_state";
const VERIFIER_COOKIE = "spotify_code_verifier";

const cookieBase = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production"
};

type TokenResponse = {
  access_token: string;
  token_type: "Bearer";
  scope: string;
  expires_in: number;
  refresh_token?: string;
};

type SpotifyProfile = {
  display_name: string | null;
  external_urls?: { spotify?: string };
  images?: Array<{ url: string }>;
  product?: string | null;
  country?: string | null;
};

export function isSpotifyConfigured() {
  return Boolean(process.env.SPOTIFY_CLIENT_ID);
}

export function getSpotifyScopes() {
  return [
    "user-read-email",
    "user-read-private",
    "user-top-read",
    "user-library-read",
    "user-read-recently-played"
  ].join(" ");
}

export function getSpotifyClientId() {
  return process.env.SPOTIFY_CLIENT_ID ?? "";
}

export function getSpotifyRedirectUri(origin: string) {
  if (process.env.SPOTIFY_REDIRECT_URI) {
    return process.env.SPOTIFY_REDIRECT_URI;
  }

  return new URL("/api/spotify/callback", getCanonicalOrigin(origin)).toString();
}

export function buildSpotifyAuthorizeUrl(params: {
  origin: string;
  state: string;
  challenge: string;
}) {
  const url = new URL("https://accounts.spotify.com/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", getSpotifyClientId());
  url.searchParams.set("scope", getSpotifyScopes());
  url.searchParams.set("redirect_uri", getSpotifyRedirectUri(params.origin));
  url.searchParams.set("state", params.state);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("code_challenge", params.challenge);
  return url;
}

function createBase64Url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function createCodeVerifier() {
  return createBase64Url(Buffer.from(crypto.getRandomValues(new Uint8Array(64))));
}

export async function createCodeChallenge(verifier: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return createBase64Url(Buffer.from(digest));
}

export function createOAuthState() {
  return createBase64Url(Buffer.from(crypto.getRandomValues(new Uint8Array(16))));
}

export async function exchangeCodeForToken(code: string, verifier: string, redirectUri: string) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: getSpotifyClientId(),
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier
    })
  });

  if (!response.ok) {
    throw new Error("Failed to exchange Spotify authorization code.");
  }

  return (await response.json()) as TokenResponse;
}

export async function refreshSpotifyToken(refreshToken: string) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: getSpotifyClientId(),
      grant_type: "refresh_token",
      refresh_token: refreshToken
    })
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Spotify token.");
  }

  return (await response.json()) as TokenResponse;
}

export async function fetchSpotifyProfile(accessToken: string) {
  return spotifyGet<SpotifyProfile>(accessToken, "/me");
}

export async function spotifyGet<T>(
  accessToken: string,
  path: string,
  searchParams?: Record<string, string | number | undefined>
) {
  const url = new URL(`https://api.spotify.com/v1${path}`);

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Spotify request failed for ${path}.`);
  }

  return (await response.json()) as T;
}

export function persistSpotifyTokens(tokens: TokenResponse) {
  const cookieStore = cookies();
  const expiresAt = Date.now() + tokens.expires_in * 1000;

  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
    ...cookieBase,
    maxAge: tokens.expires_in
  });
  cookieStore.set(EXPIRES_AT_COOKIE, String(expiresAt), {
    ...cookieBase,
    maxAge: tokens.expires_in
  });

  if (tokens.refresh_token) {
    cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
      ...cookieBase,
      maxAge: 60 * 60 * 24 * 30
    });
  }
}

export function persistOAuthCookies(state: string, verifier: string) {
  const cookieStore = cookies();
  cookieStore.set(STATE_COOKIE, state, {
    ...cookieBase,
    maxAge: 60 * 10
  });
  cookieStore.set(VERIFIER_COOKIE, verifier, {
    ...cookieBase,
    maxAge: 60 * 10
  });
}

export function readOAuthCookies() {
  const cookieStore = cookies();
  return {
    state: cookieStore.get(STATE_COOKIE)?.value ?? null,
    verifier: cookieStore.get(VERIFIER_COOKIE)?.value ?? null
  };
}

export function clearOAuthCookies() {
  const cookieStore = cookies();
  cookieStore.delete(STATE_COOKIE);
  cookieStore.delete(VERIFIER_COOKIE);
}

export function clearSpotifyCookies() {
  const cookieStore = cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(EXPIRES_AT_COOKIE);
  cookieStore.delete(STATE_COOKIE);
  cookieStore.delete(VERIFIER_COOKIE);
}

export async function getValidSpotifyAccessToken() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const expiresAt = Number(cookieStore.get(EXPIRES_AT_COOKIE)?.value ?? "0");

  if (accessToken && expiresAt > Date.now() + 30_000) {
    return accessToken;
  }

  if (!refreshToken || !isSpotifyConfigured()) {
    return null;
  }

  try {
    const refreshed = await refreshSpotifyToken(refreshToken);
    persistSpotifyTokens({
      ...refreshed,
      refresh_token: refreshed.refresh_token ?? refreshToken
    });
    return refreshed.access_token;
  } catch {
    clearSpotifyCookies();
    return null;
  }
}
