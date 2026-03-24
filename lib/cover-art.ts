import { JazzPick } from "@/types/jazz";
import { buildSpotifySearchUrl } from "@/lib/spotify-recommendations";

type FetchLike = typeof fetch;

type OEmbedResponse = {
  thumbnail_url?: string;
};

type ItunesResult = {
  artistName?: string;
  trackName?: string;
  collectionName?: string;
  artworkUrl100?: string;
};

type ItunesResponse = {
  results?: ItunesResult[];
};

const publicArtworkHydrationCache = new Map<string, Promise<JazzPick>>();

export function isRenderableArtworkUrl(url?: string | null) {
  if (!url) {
    return false;
  }

  if (url.startsWith("data:image/") || url.startsWith("blob:")) {
    return true;
  }

  try {
    const parsed = new URL(url);
    if (!/^https?:$/.test(parsed.protocol)) {
      return false;
    }

    if (/open\.spotify\.com$/i.test(parsed.hostname)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function buildGeneratedCoverArt(
  title: string,
  artist: string,
  accentColor = "#c8a46c"
) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" role="img" aria-label="${title} by ${artist}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#101916" />
          <stop offset="100%" stop-color="#21423f" />
        </linearGradient>
      </defs>
      <rect width="640" height="640" rx="48" fill="url(#bg)" />
      <circle cx="520" cy="140" r="120" fill="${accentColor}" opacity="0.16" />
      <circle cx="180" cy="480" r="170" fill="#f5efde" opacity="0.08" />
      <path d="M140 474c58-182 151-273 279-273" stroke="${accentColor}" stroke-width="12" stroke-linecap="round" opacity="0.7" />
      <path d="M208 472c16-120 70-205 164-255" stroke="#f4e8cd" stroke-width="3" stroke-dasharray="8 12" opacity="0.7" />
      <rect x="92" y="82" width="456" height="476" rx="26" fill="rgba(9, 12, 10, 0.12)" />
      <text x="124" y="368" fill="#f4efdf" font-family="Georgia, serif" font-size="56" letter-spacing="2">${title}</text>
      <text x="126" y="430" fill="#f4efdf" font-family="Arial, sans-serif" font-size="24" opacity="0.8">${artist}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function includesNormalized(haystack: string, needle: string) {
  const normalizedHaystack = normalizeText(haystack);
  const normalizedNeedle = normalizeText(needle);

  return (
    normalizedHaystack === normalizedNeedle ||
    normalizedHaystack.includes(normalizedNeedle) ||
    normalizedNeedle.includes(normalizedHaystack)
  );
}

function scoreItunesResult(pick: JazzPick, result: ItunesResult) {
  const titleCandidate = pick.type === "track" ? result.trackName : result.collectionName;
  let score = 0;

  if (titleCandidate && includesNormalized(titleCandidate, pick.title)) {
    score += 3;
  }

  if (result.artistName && includesNormalized(result.artistName, pick.artist)) {
    score += 3;
  }

  if (pick.type === "track" && result.collectionName) {
    score += 1;
  }

  return score;
}

function upscaleItunesArtwork(url: string) {
  return url.replace(/\/\d+x\d+bb\./, "/600x600bb.");
}

export async function fetchSpotifyOEmbedThumbnail(
  spotifyUrl: string,
  fetchImpl: FetchLike = fetch
) {
  const response = await fetchImpl(
    `https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`,
    {
      cache: "force-cache"
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as OEmbedResponse;
  return data.thumbnail_url ?? null;
}

function isSpotifyAlbumUrl(url: string) {
  return /open\.spotify\.com\/album\//.test(url);
}

export function buildItunesArtworkSearchUrl(pick: JazzPick) {
  return buildItunesArtworkSearchUrlForTerm(
    `${pick.title} ${pick.artist}`,
    pick.type
  );
}

function buildItunesArtworkSearchUrlForTerm(
  term: string,
  type: JazzPick["type"]
) {
  const entity = type === "track" ? "song" : "album";
  return `https://itunes.apple.com/search?media=music&entity=${entity}&limit=5&term=${encodeURIComponent(term)}`;
}

async function fetchItunesArtworkForTerm(
  pick: JazzPick,
  term: string,
  minScore: number,
  fetchImpl: FetchLike = fetch
) {
  const response = await fetchImpl(buildItunesArtworkSearchUrlForTerm(term, pick.type), {
    cache: "force-cache"
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as ItunesResponse;
  const result =
    (data.results ?? [])
      .map((entry) => ({ entry, score: scoreItunesResult(pick, entry) }))
      .sort((left, right) => right.score - left.score)[0]?.entry ?? null;

  if (!result?.artworkUrl100 || scoreItunesResult(pick, result) < minScore) {
    return null;
  }

  return upscaleItunesArtwork(result.artworkUrl100);
}

export async function fetchItunesArtwork(pick: JazzPick, fetchImpl: FetchLike = fetch) {
  const exactArtwork = await fetchItunesArtworkForTerm(
    pick,
    `${pick.title} ${pick.artist}`,
    4,
    fetchImpl
  );

  if (exactArtwork) {
    return exactArtwork;
  }

  return fetchItunesArtworkForTerm(pick, pick.title, 3, fetchImpl);
}

export async function hydratePublicArtworkForPick(
  pick: JazzPick,
  fetchImpl: FetchLike = fetch
) {
  if (fetchImpl === fetch) {
    const cacheKey = `${pick.id}:${pick.spotifyUrl}:${pick.artworkSourceUrl ?? ""}`;
    const cached = publicArtworkHydrationCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const pending = hydratePublicArtworkForPickUncached(pick, fetchImpl);
    publicArtworkHydrationCache.set(cacheKey, pending);
    return pending;
  }

  return hydratePublicArtworkForPickUncached(pick, fetchImpl);
}

async function hydratePublicArtworkForPickUncached(
  pick: JazzPick,
  fetchImpl: FetchLike = fetch
) {
  const exactSpotifyUrl = isSpotifyAlbumUrl(pick.spotifyUrl) ? pick.spotifyUrl : null;
  const exactThumbnailUrl = exactSpotifyUrl
    ? await fetchSpotifyOEmbedThumbnail(exactSpotifyUrl, fetchImpl)
    : null;

  if (exactThumbnailUrl && exactSpotifyUrl) {
    return {
      ...pick,
      imageUrl: exactThumbnailUrl,
      placeholderImageUrl: pick.placeholderImageUrl ?? pick.imageUrl,
      artworkSourceUrl: exactSpotifyUrl
    };
  }

  const thumbnailUrl = await fetchSpotifyOEmbedThumbnail(
    pick.artworkSourceUrl ?? pick.spotifyUrl,
    fetchImpl
  );

  if (thumbnailUrl) {
    return {
      ...pick,
      imageUrl: thumbnailUrl,
      placeholderImageUrl: pick.placeholderImageUrl ?? pick.imageUrl
    };
  }

  const itunesArtworkUrl = await fetchItunesArtwork(pick, fetchImpl);
  if (!itunesArtworkUrl) {
    return exactSpotifyUrl
      ? {
          ...pick,
          spotifyUrl: buildSpotifySearchUrl({
            title: pick.title,
            artist: pick.artist,
            type: "album"
          }),
          shareUrl: buildSpotifySearchUrl({
            title: pick.title,
            artist: pick.artist,
            type: "album"
          })
        }
      : pick;
  }

  return {
    ...pick,
    imageUrl: itunesArtworkUrl,
    placeholderImageUrl: pick.placeholderImageUrl ?? pick.imageUrl,
    ...(exactSpotifyUrl
      ? {
          spotifyUrl: buildSpotifySearchUrl({
            title: pick.title,
            artist: pick.artist,
            type: "album"
          }),
          shareUrl: buildSpotifySearchUrl({
            title: pick.title,
            artist: pick.artist,
            type: "album"
          })
        }
      : {})
  };
}

export function clearPublicArtworkHydrationCache() {
  publicArtworkHydrationCache.clear();
}
