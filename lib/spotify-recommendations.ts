import { JazzPick, RecommendationFeed, Vibe } from "@/types/jazz";

export type RecommendationOrigin = "top" | "recent" | "saved" | "search";
export type ListenerSignal = "top" | "recent" | "saved";

export type SpotifyArtistEntity = {
  id: string;
  name: string;
  genres?: string[];
};

export type SpotifyImageEntity = {
  url: string;
};

export type SpotifyAlbumEntity = {
  id: string;
  name: string;
  album_type?: "album" | "single" | "compilation";
  images?: SpotifyImageEntity[];
  release_date?: string;
  external_urls?: { spotify?: string };
  artists?: SpotifyArtistEntity[];
};

export type SpotifyTrackEntity = {
  id: string;
  name: string;
  duration_ms: number;
  artists: SpotifyArtistEntity[];
  album: SpotifyAlbumEntity;
  external_urls?: { spotify?: string };
};

export type ListenerTasteProfile = {
  topArtistNames: string[];
  recentArtistNames: string[];
  savedArtistNames: string[];
  favoriteGenres: string[];
  favoriteDecadeStart: number | null;
};

type RecommendationContext = {
  relationship: "familiar" | "saved" | "recent" | "adjacent" | "fresh";
  sonic: "shadowy" | "electric" | "open" | "steady" | "restless";
  era: "timeless" | "vintage" | "modern";
};

const vibeValues: Vibe[] = ["Classic", "Exploratory", "Fusion", "Late Night", "Focus"];
const strongFlavorMatchThreshold = 10;

const genreToVibes: Array<{ match: RegExp; vibes: Vibe[]; subgenre: string }> = [
  { match: /fusion|jazz funk|nu jazz|broken beat|jazztronica/i, vibes: ["Fusion", "Exploratory"], subgenre: "Fusion" },
  { match: /modal jazz|spiritual jazz/i, vibes: ["Exploratory", "Late Night"], subgenre: "Modal Jazz" },
  { match: /hard bop|bebop|post-bop/i, vibes: ["Classic", "Exploratory"], subgenre: "Hard Bop" },
  { match: /cool jazz|west coast jazz/i, vibes: ["Classic", "Focus"], subgenre: "Cool Jazz" },
  { match: /contemporary jazz|modern jazz|jazz saxophone|indie jazz|jazz trio/i, vibes: ["Focus", "Late Night"], subgenre: "Contemporary Jazz" },
  { match: /jazz/i, vibes: ["Classic", "Late Night"], subgenre: "Jazz" }
];

export function parseVibe(value: string | null): Vibe {
  return vibeValues.includes(value as Vibe) ? (value as Vibe) : "Classic";
}

export function formatMinutes(durationMs: number) {
  const minutes = Math.max(1, Math.round(durationMs / 60000));
  return `${minutes} min`;
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function describeDecade(year: number | null) {
  if (!year) {
    return null;
  }

  const decade = Math.floor(year / 10) * 10;
  return `${decade}s`;
}

function uniqueByFrequency(values: string[]) {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([value]) => value);
}

function hashValue(value: string) {
  return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function buildSpotifySearchUrl(params: {
  title: string;
  artist: string;
  type: "track" | "album";
}) {
  const query = `${params.type}:${params.title} artist:${params.artist}`;
  return `https://open.spotify.com/search/${encodeURIComponent(query)}`;
}

export function inferVibes(genres: string[], fallback: Vibe): { vibeTags: Vibe[]; subgenre: string } {
  const matched = genreToVibes.find((entry) => genres.some((genre) => entry.match.test(genre)));
  if (!matched) {
    return {
      vibeTags: [fallback, "Exploratory"],
      subgenre: fallback === "Fusion" ? "Fusion" : "Contemporary Jazz"
    };
  }

  const vibeTags = Array.from(new Set(matched.vibes)).slice(0, 3);
  return {
    vibeTags,
    subgenre: matched.subgenre
  };
}

export function buildTasteProfile(
  topArtists: SpotifyArtistEntity[],
  topTracks: SpotifyTrackEntity[],
  recentlyPlayed: SpotifyTrackEntity[],
  savedTracks: SpotifyTrackEntity[]
): ListenerTasteProfile {
  const allAlbumYears = [...topTracks, ...recentlyPlayed, ...savedTracks]
    .map((track) => Number(track.album.release_date?.slice(0, 4) ?? ""))
    .filter((year) => !Number.isNaN(year));

  return {
    topArtistNames: uniqueByFrequency(topArtists.map((artist) => artist.name)).slice(0, 6),
    recentArtistNames: uniqueByFrequency(
      recentlyPlayed.flatMap((track) => track.artists.map((artist) => artist.name))
    ).slice(0, 6),
    savedArtistNames: uniqueByFrequency(
      savedTracks.flatMap((track) => track.artists.map((artist) => artist.name))
    ).slice(0, 6),
    favoriteGenres: uniqueByFrequency(topArtists.flatMap((artist) => artist.genres ?? [])).slice(0, 4),
    favoriteDecadeStart:
      allAlbumYears.length > 0
        ? Math.floor(
            allAlbumYears.reduce((sum, year) => sum + year, 0) / allAlbumYears.length / 10
          ) * 10
        : null
  };
}

export const vibeProfiles: Record<
  Vibe,
  {
    searchTerms: string[];
    preferredSubgenres: string[];
    preferredDecades: Array<[number, number]>;
    preferredTypes: Array<"track" | "album">;
    seedGenreTerms: string[];
    anchorArtists: string[];
  }
> = {
  Classic: {
    searchTerms: ["hard bop", "cool jazz", "modal jazz"],
    preferredSubgenres: ["Hard Bop", "Cool Jazz", "Modal Jazz", "Jazz"],
    preferredDecades: [
      [1950, 1959],
      [1960, 1969]
    ],
    preferredTypes: ["album"],
    seedGenreTerms: ["hard bop", "cool jazz", "modal jazz", "jazz"],
    anchorArtists: ["Miles Davis", "Bill Evans", "Art Blakey", "The Dave Brubeck Quartet"]
  },
  Exploratory: {
    searchTerms: ["spiritual jazz", "post-bop", "contemporary jazz"],
    preferredSubgenres: ["Modal Jazz", "Contemporary Jazz", "Jazz"],
    preferredDecades: [
      [1960, 1969],
      [2000, 2035]
    ],
    preferredTypes: ["album"],
    seedGenreTerms: ["spiritual jazz", "post-bop", "modal jazz", "contemporary jazz"],
    anchorArtists: ["Wayne Shorter", "Kamasi Washington", "Nubya Garcia", "Emma-Jean Thackray"]
  },
  Fusion: {
    searchTerms: ["jazz fusion", "jazz funk", "electric jazz"],
    preferredSubgenres: ["Fusion", "Contemporary Jazz"],
    preferredDecades: [
      [1970, 1979],
      [2000, 2035]
    ],
    preferredTypes: ["album"],
    seedGenreTerms: ["fusion", "jazz funk", "electric jazz", "nu jazz", "broken beat"],
    anchorArtists: ["Herbie Hancock", "Weather Report", "Yussef Kamaal", "Robert Glasper"]
  },
  "Late Night": {
    searchTerms: ["modal jazz", "spiritual jazz", "night jazz"],
    preferredSubgenres: ["Modal Jazz", "Jazz", "Contemporary Jazz"],
    preferredDecades: [
      [1950, 1969],
      [1990, 2035]
    ],
    preferredTypes: ["album"],
    seedGenreTerms: ["modal jazz", "spiritual jazz", "cool jazz", "jazz"],
    anchorArtists: ["Miles Davis", "Wayne Shorter", "Bill Evans", "Nubya Garcia"]
  },
  Focus: {
    searchTerms: ["cool jazz", "piano jazz", "contemporary jazz"],
    preferredSubgenres: ["Cool Jazz", "Contemporary Jazz", "Jazz"],
    preferredDecades: [
      [1950, 1969],
      [1990, 2035]
    ],
    preferredTypes: ["album"],
    seedGenreTerms: ["cool jazz", "piano jazz", "contemporary jazz", "jazz trio"],
    anchorArtists: ["Bill Evans", "Pat Metheny", "The Dave Brubeck Quartet", "Yussef Kamaal"]
  }
};

export function scorePickForVibe(pick: JazzPick, vibe: Vibe) {
  const profile = vibeProfiles[vibe];
  let score = 0;

  if (pick.vibeTags.includes(vibe)) {
    score += 8;
  }

  if (profile.preferredSubgenres.includes(pick.subgenre)) {
    score += 6;
  }

  if (profile.preferredTypes.includes(pick.type)) {
    score += pick.type === profile.preferredTypes[0] ? 3 : 1;
  }

  if (profile.preferredDecades.some(([start, end]) => pick.year >= start && pick.year <= end)) {
    score += 4;
  }

  return score;
}

export function scoreArtistForVibe(artist: SpotifyArtistEntity, vibe: Vibe) {
  const haystack = normalizeText([artist.name, ...(artist.genres ?? [])].join(" "));
  const profile = vibeProfiles[vibe];
  let score = 0;

  if (profile.seedGenreTerms.some((term) => haystack.includes(normalizeText(term)))) {
    score += 6;
  }

  if (profile.anchorArtists.some((name) => normalizeText(name) === normalizeText(artist.name))) {
    score += 5;
  }

  if (isJazzAdjacentArtist(artist)) {
    score += 3;
  }

  return score;
}

export function diversifyPicks(picks: JazzPick[], vibe: Vibe, limit = 5) {
  const sorted = [...picks].sort(
    (left, right) => scorePickForVibe(right, vibe) - scorePickForVibe(left, vibe)
  );
  const selected: JazzPick[] = [];
  const seenArtists = new Set<string>();

  for (const pick of sorted) {
    const key = normalizeText(pick.artist);
    if (seenArtists.has(key)) {
      continue;
    }

    selected.push(pick);
    seenArtists.add(key);
    if (selected.length === limit) {
      return selected;
    }
  }

  for (const pick of sorted) {
    if (selected.some((entry) => entry.id === pick.id)) {
      continue;
    }

    selected.push(pick);
    if (selected.length === limit) {
      break;
    }
  }

  return selected;
}

export function isStrongFlavorMatch(pick: JazzPick, vibe: Vibe) {
  return scorePickForVibe(pick, vibe) >= strongFlavorMatchThreshold;
}

export function rankPicksForVibe(picks: JazzPick[], vibe: Vibe, limit = 5) {
  const deduped = dedupePicks(picks).sort(
    (left, right) => scorePickForVibe(right, vibe) - scorePickForVibe(left, vibe)
  );
  const strongMatches = deduped.filter((pick) => isStrongFlavorMatch(pick, vibe));

  if (strongMatches.length >= Math.min(3, limit)) {
    return diversifyPicks(strongMatches, vibe, limit);
  }

  return diversifyPicks(deduped, vibe, limit);
}

export function isJazzAdjacentArtist(artist: SpotifyArtistEntity) {
  const haystack = [artist.name, ...(artist.genres ?? [])].join(" ");
  return /jazz|fusion|bebop|bop|swing|blue note|improv|soul jazz/i.test(haystack);
}

export function buildReason(artistName: string, origin: RecommendationOrigin, vibe: Vibe) {
  if (origin === "top") {
    return `你最近在 ${artistName} 這條線上停留得夠久，今天就順勢往前聽。`;
  }

  if (origin === "saved") {
    return `你收過 ${artistName} 相關的聲音，這首很適合接在後面。`;
  }

  if (origin === "search") {
    return `從你常聽的 ${artistName} 稍微再走遠一點，這首剛好接得上。`;
  }

  if (vibe === "Late Night") {
    return `你最近夜裡常聽到 ${artistName} 這種質地，這首會把那道光延續下去。`;
  }

  return `從你最近播過的 ${artistName} 出發，這首會把熟悉感再往前推一點。`;
}

export function buildAlbumRecommendationReason(params: {
  albumId: string;
  albumTitle: string;
  albumArtist: string;
  albumYear: number;
  subgenre: string;
  activeVibe: Vibe;
  tasteProfile: ListenerTasteProfile;
  sourceArtistName: string;
  origin: RecommendationOrigin;
  sourceTrackTitle?: string;
  sourceAlbumTitle?: string;
}) {
  const leadLines: string[] = [];
  const supportLines: string[] = [];
  const favoriteDecade = describeDecade(params.tasteProfile.favoriteDecadeStart);
  const topArtists = new Set(params.tasteProfile.topArtistNames.map(normalizeText));
  const savedArtists = new Set(params.tasteProfile.savedArtistNames.map(normalizeText));
  const recentArtists = new Set(params.tasteProfile.recentArtistNames.map(normalizeText));
  const albumArtistKey = normalizeText(params.albumArtist);
  const sourceArtistKey = normalizeText(params.sourceArtistName);
  const context: RecommendationContext = {
    relationship:
      topArtists.has(albumArtistKey) || topArtists.has(sourceArtistKey)
        ? "familiar"
        : savedArtists.has(albumArtistKey)
          ? "saved"
          : recentArtists.has(albumArtistKey)
            ? "recent"
            : params.origin === "search"
              ? "adjacent"
              : "fresh",
    sonic:
      params.activeVibe === "Late Night"
        ? "shadowy"
        : params.activeVibe === "Fusion"
          ? "electric"
          : params.activeVibe === "Focus"
            ? "steady"
            : params.activeVibe === "Exploratory"
              ? "restless"
              : "open",
    era: params.albumYear >= 1990 ? "modern" : params.albumYear >= 1970 ? "vintage" : "timeless"
  };

  const relationshipLines: Record<RecommendationContext["relationship"], string[]> = {
    familiar: [
      `既然這陣子耳朵一直往 ${params.sourceArtistName} 靠，不如直接把《${params.albumTitle}》整張放完。`,
      `你最近常回到 ${params.sourceArtistName}，這張剛好能把那股熟悉感留得更完整。`
    ],
    saved: [
      `你先前留下的那條線，回到《${params.albumTitle}》會比停在片段更有味道。`,
      `既然你收過 ${params.albumArtist} 的聲音，這張很適合直接從第一首開始。`
    ],
    recent: [
      `耳朵還停在 ${params.albumArtist} 的質地上時，接著聽《${params.albumTitle}》會很自然。`,
      `你最近剛碰過 ${params.albumArtist}，這張接上去幾乎不需要重新進入狀態。`
    ],
    adjacent: [
      `沿著 ${params.sourceArtistName} 這條線再走半步，《${params.albumTitle}》會把視野打開，但不會一下子拉得太遠。`,
      `如果想從 ${params.sourceArtistName} 再往外聽一點，《${params.albumTitle}》會是一個很穩的延伸。`
    ],
    fresh: [
      `《${params.albumTitle}》和你這一輪的聽感貼得很近，今天從這裡開始剛好。`,
      `如果今天想換一張新的起點，《${params.albumTitle}》會是很穩的一步。`
    ]
  };

  const sonicLines: Record<RecommendationContext["sonic"], string[]> = {
    shadowy: [
      "它的陰影和留白都夠，夜裡聽尤其見長。",
      "把燈稍微壓低一點再放這張，層次會一層一層慢慢浮上來。"
    ],
    electric: [
      "節奏和電氣感都帶著光澤，整張的推進很俐落。",
      "它不是只靠幾個亮點撐場，而是從頭到尾都帶著一股帶電的推力。"
    ],
    open: [
      "它的空間感很寬，從第一首進去就能慢慢把耳朵打開。",
      "留白和呼吸都收得好，聽起來會比你記得的更從容。"
    ],
    steady: [
      "線條乾淨，推進穩，不會把注意力硬生生扯走。",
      "它的節奏收得很整齊，剛好能陪一段不被打斷的專注。"
    ],
    restless: [
      "轉折不少，但並不故作艱深，越往後聽越有層次。",
      "它不急著把答案一次說滿，正好留了一點探索的空間。"
    ]
  };

  const eraLines: Record<RecommendationContext["era"], string[]> = {
    timeless: [
      "它幾乎不需要背景交代，放下去就會成立。",
      "那種經得起反覆回來的重量，在這張裡很明顯。"
    ],
    vintage: [
      "帶點年代感的溫度，會讓整張更耐聽。",
      "它身上的舊時代質地不厚重，反而把輪廓收得更乾淨。"
    ],
    modern: [
      "聲響是新的，但收法很克制，不會把情緒說得太滿。",
      "它的現代感不是炫技，而是把線條整理得更俐落。"
    ]
  };

  if (topArtists.has(albumArtistKey) || topArtists.has(sourceArtistKey)) {
    leadLines.push(...relationshipLines.familiar);
  }

  if (savedArtists.has(albumArtistKey)) {
    leadLines.push(...relationshipLines.saved);
  }

  if (recentArtists.has(albumArtistKey) && params.sourceTrackTitle) {
    leadLines.push(
      `你最近播過〈${params.sourceTrackTitle}〉，把它放回整張裡聽，情緒會自然連成一條線。`
    );
  } else if (recentArtists.has(albumArtistKey)) {
    leadLines.push(...relationshipLines.recent);
  }

  if (
    params.sourceAlbumTitle &&
    normalizeText(params.sourceAlbumTitle) !== normalizeText(params.albumTitle)
  ) {
    leadLines.push(`如果《${params.sourceAlbumTitle}》已經在你耳邊待了一陣子，接著聽《${params.albumTitle}》會很順。`);
  }

  if (params.origin === "search") {
    leadLines.push(...relationshipLines.adjacent);
  }

  if (params.albumYear > 0) {
    supportLines.push(...eraLines[context.era]);
  }

  if (params.tasteProfile.favoriteGenres.some((genre) => normalizeText(genre).includes(normalizeText(params.subgenre)))) {
    supportLines.push(`你最近耳朵熟悉的質地裡，本來就有 ${params.subgenre} 這一面，所以它落下來很自然。`);
  } else {
    supportLines.push(`它的 ${params.subgenre} 氣質收得很完整，適合從頭放到尾。`);
  }

  if (favoriteDecade) {
    supportLines.push(`如果你最近耳朵偏向 ${favoriteDecade} 的聲音，這張會很快進到狀態。`);
  }

  if (params.activeVibe === "Late Night") {
    supportLines.push(...sonicLines.shadowy);
  }

  if (params.activeVibe === "Focus") {
    supportLines.push(...sonicLines.steady);
  }

  if (params.activeVibe === "Fusion") {
    supportLines.push(...sonicLines.electric);
  }

  if (params.activeVibe === "Exploratory") {
    supportLines.push(...sonicLines.restless);
  }

  if (params.activeVibe === "Classic") {
    supportLines.push(...sonicLines.open);
  }

  const leadPool =
    leadLines.length > 0
      ? leadLines
      : relationshipLines.fresh;
  const supportPool =
    supportLines.length > 0
      ? supportLines
      : ["如果今天不想選太久，直接把整張交給它就好。"];
  const primaryIndex = hashValue(`${params.albumId}:${params.activeVibe}:${params.sourceArtistName}`) % Math.max(leadPool.length, 1);
  const secondaryIndex = hashValue(`${params.albumId}:${params.subgenre}:${params.albumYear}`) % Math.max(supportPool.length, 1);
  const primary =
    leadPool[primaryIndex] ??
    `《${params.albumTitle}》和你最近的聆聽方向貼得很近，今天從這裡開始剛好。`;
  const secondaryPool = supportPool.filter((sentence) => sentence !== primary);
  const secondary =
    secondaryPool[secondaryIndex % Math.max(secondaryPool.length, 1)] ??
    "如果今天想少選一點，直接把整張交給它就好。";

  return `${primary}${secondary}`;
}

export function buildTrackPick(
  track: SpotifyTrackEntity,
  sourceArtist: SpotifyArtistEntity,
  fallbackVibe: Vibe,
  origin: RecommendationOrigin,
  reasonOverride?: string
): JazzPick {
  const releaseYear = Number(track.album.release_date?.slice(0, 4) ?? new Date().getFullYear());
  const { subgenre, vibeTags } = inferVibes(sourceArtist.genres ?? [], fallbackVibe);

  return {
    id: `spotify-track-${track.id}`,
    title: track.name,
    artist: track.artists.map((artist) => artist.name).join(", "),
    type: "track",
    subgenre,
    vibeTags,
    recommendationReason: reasonOverride ?? buildReason(sourceArtist.name, origin, fallbackVibe),
    imageUrl: track.album.images?.[0]?.url ?? buildSpotifySearchUrl({
      title: track.name,
      artist: track.artists[0]?.name ?? sourceArtist.name,
      type: "track"
    }),
    spotifyUrl: track.external_urls?.spotify ?? `https://open.spotify.com/track/${track.id}`,
    shareUrl: track.external_urls?.spotify ?? `https://open.spotify.com/track/${track.id}`,
    year: Number.isNaN(releaseYear) ? new Date().getFullYear() : releaseYear,
    durationLabel: formatMinutes(track.duration_ms),
    accentColor: "#8ea58c",
    source: "spotify",
    seedArtist: sourceArtist.name
  };
}

export function buildAlbumPick(
  album: SpotifyAlbumEntity,
  sourceArtist: SpotifyArtistEntity,
  fallbackVibe: Vibe,
  origin: RecommendationOrigin,
  reasonOverride?: string
): JazzPick {
  const releaseYear = Number(album.release_date?.slice(0, 4) ?? new Date().getFullYear());
  const { subgenre, vibeTags } = inferVibes(sourceArtist.genres ?? [], fallbackVibe);
  const albumArtist = album.artists?.map((artist) => artist.name).join(", ") ?? sourceArtist.name;

  return {
    id: `spotify-album-${album.id}`,
    title: album.name,
    artist: albumArtist,
    type: "album",
    subgenre,
    vibeTags,
    recommendationReason: reasonOverride ?? buildReason(sourceArtist.name, origin, fallbackVibe),
    imageUrl: album.images?.[0]?.url ?? buildSpotifySearchUrl({
      title: album.name,
      artist: albumArtist,
      type: "album"
    }),
    spotifyUrl: album.external_urls?.spotify ?? `https://open.spotify.com/album/${album.id}`,
    shareUrl: album.external_urls?.spotify ?? `https://open.spotify.com/album/${album.id}`,
    year: Number.isNaN(releaseYear) ? new Date().getFullYear() : releaseYear,
    durationLabel: "Album",
    accentColor: "#8ea58c",
    source: "spotify",
    seedArtist: sourceArtist.name
  };
}

export function dedupePicks(picks: JazzPick[]) {
  return picks.reduce<JazzPick[]>((list, pick) => {
    if (list.some((entry) => entry.spotifyUrl === pick.spotifyUrl)) {
      return list;
    }

    return [...list, pick];
  }, []);
}

export function buildCuratedFeed(vibe: Vibe, picks: JazzPick[]): RecommendationFeed {
  return {
    mode: "curated",
    headline: "先從這裡聽起",
    note: "先把範圍收得剛剛好，讓今天第一張不必在太多選擇裡猶豫。",
    picks
  };
}
