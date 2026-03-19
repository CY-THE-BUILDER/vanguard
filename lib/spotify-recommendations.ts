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
const strongFlavorMatchThreshold = 12;

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
    discouragedSubgenres: string[];
    preferredDecades: Array<[number, number]>;
    discouragedDecades?: Array<[number, number]>;
    preferredTypes: Array<"track" | "album">;
    seedGenreTerms: string[];
    anchorArtists: string[];
  }
> = {
  Classic: {
    searchTerms: ["hard bop", "cool jazz", "modal jazz"],
    preferredSubgenres: ["Hard Bop", "Cool Jazz", "Modal Jazz", "Jazz"],
    discouragedSubgenres: ["Fusion", "Contemporary Jazz"],
    preferredDecades: [
      [1950, 1959],
      [1960, 1969]
    ],
    discouragedDecades: [[1990, 2035]],
    preferredTypes: ["album"],
    seedGenreTerms: ["hard bop", "cool jazz", "modal jazz", "jazz"],
    anchorArtists: ["Miles Davis", "Bill Evans", "Art Blakey", "The Dave Brubeck Quartet"]
  },
  Exploratory: {
    searchTerms: ["spiritual jazz", "post-bop", "avant-garde jazz", "modal jazz"],
    preferredSubgenres: ["Modal Jazz", "Post-Bop", "Contemporary Jazz", "Jazz"],
    discouragedSubgenres: ["Cool Jazz", "Piano Jazz"],
    preferredDecades: [
      [1960, 1969],
      [2000, 2035]
    ],
    preferredTypes: ["album"],
    seedGenreTerms: ["spiritual jazz", "post-bop", "modal jazz", "avant-garde jazz", "contemporary jazz"],
    anchorArtists: ["Wayne Shorter", "Eric Dolphy", "Kamasi Washington", "Nubya Garcia", "Emma-Jean Thackray"]
  },
  Fusion: {
    searchTerms: ["jazz fusion", "jazz funk", "electric jazz", "broken beat jazz"],
    preferredSubgenres: ["Fusion", "Contemporary Jazz"],
    discouragedSubgenres: ["Cool Jazz", "Piano Jazz", "Modal Jazz"],
    preferredDecades: [
      [1970, 1979],
      [2000, 2035]
    ],
    preferredTypes: ["album"],
    seedGenreTerms: ["fusion", "jazz funk", "electric jazz", "nu jazz", "broken beat"],
    anchorArtists: ["Herbie Hancock", "Weather Report", "Yussef Kamaal", "Robert Glasper"]
  },
  "Late Night": {
    searchTerms: ["modal jazz", "spiritual jazz", "ballads jazz", "night jazz"],
    preferredSubgenres: ["Modal Jazz", "Cool Jazz", "Piano Jazz", "Jazz", "Contemporary Jazz"],
    discouragedSubgenres: ["Fusion", "Hard Bop"],
    preferredDecades: [
      [1950, 1969],
      [1990, 2035]
    ],
    preferredTypes: ["album"],
    seedGenreTerms: ["modal jazz", "spiritual jazz", "cool jazz", "piano jazz", "jazz"],
    anchorArtists: ["Miles Davis", "Wayne Shorter", "Bill Evans", "Chet Baker", "Nubya Garcia"]
  },
  Focus: {
    searchTerms: ["cool jazz", "piano jazz", "jazz trio", "contemporary jazz"],
    preferredSubgenres: ["Cool Jazz", "Piano Jazz", "Contemporary Jazz", "Jazz"],
    discouragedSubgenres: ["Fusion", "Hard Bop"],
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

  if (profile.discouragedSubgenres.includes(pick.subgenre)) {
    score -= 6;
  }

  if (
    profile.discouragedDecades?.some(([start, end]) => pick.year >= start && pick.year <= end)
  ) {
    score -= 3;
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

export function selectFreshPicks(picks: JazzPick[], excludedIds: Set<string>, limit = 5) {
  const deduped = dedupePicks(picks);

  if (excludedIds.size === 0) {
    return deduped.slice(0, limit);
  }

  const fresh = deduped.filter((pick) => !excludedIds.has(pick.id));
  const seen = new Set(fresh.map((pick) => pick.id));
  const fallback = deduped.filter((pick) => !seen.has(pick.id));

  return [...fresh, ...fallback].slice(0, limit);
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
  const topArtists = new Set(params.tasteProfile.topArtistNames.map(normalizeText));
  const savedArtists = new Set(params.tasteProfile.savedArtistNames.map(normalizeText));
  const recentArtists = new Set(params.tasteProfile.recentArtistNames.map(normalizeText));
  const albumArtistKey = normalizeText(params.albumArtist);
  const sourceArtistKey = normalizeText(params.sourceArtistName);
  const voiceByVibe: Record<
    Vibe,
    {
      familiar: string[];
      saved: string[];
      recent: string[];
      adjacent: string[];
      fresh: string[];
      sonic: string[];
      era: string[];
    }
  > = {
    Classic: {
      familiar: [
        `既然最近一直回到 ${params.sourceArtistName}，今天就讓《${params.albumTitle}》把那份從容聽完整。`,
        `你耳朵還停在 ${params.sourceArtistName} 的餘韻裡，《${params.albumTitle}》剛好把那道老派光澤接住。`
      ],
      saved: [
        `既然你曾經替 ${params.albumArtist} 留過位置，今天回到《${params.albumTitle}》，分寸會比記憶裡更漂亮。`,
        `《${params.albumTitle}》這種專輯不適合只取一段，既然你留過 ${params.albumArtist}，就讓它完整走一遍。`
      ],
      recent: [
        `耳朵還記得 ${params.albumArtist} 的手勢時，接著聽《${params.albumTitle}》會很順。`,
        `你最近才碰過 ${params.albumArtist}，現在回到《${params.albumTitle}》，像回到一間熟悉卻仍講究的房間。`
      ],
      adjacent: [
        `沿著 ${params.sourceArtistName} 這條線再往外走一步，《${params.albumTitle}》會把視野打開，卻不會失了分寸。`,
        `如果想從 ${params.sourceArtistName} 再聽出一點枝節，《${params.albumTitle}》會是一個很準的延伸。`
      ],
      fresh: [
        `如果今天想從穩妥開始，《${params.albumTitle}》會是很好的第一張。`,
        `《${params.albumTitle}》不需要鋪陳太多，一放下去，氣氛就會自己站穩。`
      ],
      sonic: [
        "它的呼吸和留白都拿得準，像老牌樂手下手，不急，也不空。",
        "聽這張很像看一位老派調酒師收尾，手勢極少，卻沒有一筆多餘。"
      ],
      era: [
        "那種歷久不疲的重量，在這張裡不是招牌，而是底色。",
        "它像一本翻得很舊卻始終好讀的冊子，每次回來都還有新的光。"
      ]
    },
    Exploratory: {
      familiar: [
        `既然最近一直回到 ${params.sourceArtistName}，今天不妨讓《${params.albumTitle}》把那條線往外再推遠一點。`,
        `你耳朵還留在 ${params.sourceArtistName} 的方向上，《${params.albumTitle}》剛好把熟悉推向更開的邊界。`
      ],
      saved: [
        `既然你曾把 ${params.albumArtist} 留下來，現在回到《${params.albumTitle}》，會比停在安全區更有意思。`,
        `《${params.albumTitle}》不是拿來求穩的專輯，它更像一扇門，既然你留過 ${params.albumArtist}，就值得往裡再走。`
      ],
      recent: [
        `趁耳朵還記得 ${params.albumArtist} 的質地，把《${params.albumTitle}》接進來，剛好能把想像力再打開一格。`,
        `你最近才碰過 ${params.albumArtist}，現在回到《${params.albumTitle}》，像從熟路拐進另一條更亮的巷子。`
      ],
      adjacent: [
        `從 ${params.sourceArtistName} 出發，把角度稍微偏一點，剛好會走到《${params.albumTitle}》最有意思的地方。`,
        `如果想從 ${params.sourceArtistName} 再聽出一點岔路，《${params.albumTitle}》會是一個很漂亮的轉身。`
      ],
      fresh: [
        `如果今天想讓耳朵多走幾步，《${params.albumTitle}》會是很好的入口。`,
        `《${params.albumTitle}》不急著討好人，卻很懂得怎麼把你慢慢帶進去。`
      ],
      sonic: [
        "它的轉折像一條尚未畫完的線，邊走邊亮，邊亮邊分岔。",
        "聽這張像在看夜色裡的街燈一盞一盞往遠處亮起，方向不是唯一的，卻都通往更深處。"
      ],
      era: [
        "它真正迷人的地方，不是陌生，而是把熟悉的語彙重新排出新的景深。",
        "像一些只在深夜場才聽得出真正分量的演出，越晚越顯得精準。"
      ]
    },
    Fusion: {
      familiar: [
        `既然最近一直回到 ${params.sourceArtistName}，今天就讓《${params.albumTitle}》把那股推進感徹底打開。`,
        `你耳朵還停在 ${params.sourceArtistName} 的節奏裡，《${params.albumTitle}》剛好把那道電流接續下去。`
      ],
      saved: [
        `既然你曾替 ${params.albumArtist} 留過位置，現在回到《${params.albumTitle}》，會比記憶裡更帶電。`,
        `《${params.albumTitle}》不是只靠幾個亮點成立，既然你留過 ${params.albumArtist}，整張放下去才會真正過癮。`
      ],
      recent: [
        `趁耳朵還記得 ${params.albumArtist} 的律動，接著把《${params.albumTitle}》打開，重心會立刻落下來。`,
        `你最近才碰過 ${params.albumArtist}，現在回到《${params.albumTitle}》，像把推子再往前送一格。`
      ],
      adjacent: [
        `從 ${params.sourceArtistName} 再往外聽一點，《${params.albumTitle}》會把節奏、低頻和光澤一次補齊。`,
        `如果想從 ${params.sourceArtistName} 再拉高一點電壓，《${params.albumTitle}》會很對味。`
      ],
      fresh: [
        `如果今天想把重心放在律動和推進，《${params.albumTitle}》會是很好的第一張。`,
        `《${params.albumTitle}》一放下去，整個空間就會開始帶速。`
      ],
      sonic: [
        "它的低頻抓得穩，切分也俐落，像夜車沿著反光的柏油一路往前滑。",
        "電氣聲響在這張裡不是裝飾，而是骨架，越往後聽越能感覺到那股牽引。"
      ],
      era: [
        "它有那種七零年代之後才真正長成的亮面與推力，聽起來像城市夜景剛點亮的瞬間。",
        "如果爵士也有霓虹，這張就是把霓虹擦得最亮卻不俗氣的一種。"
      ]
    },
    "Late Night": {
      familiar: [
        `既然最近一直回到 ${params.sourceArtistName}，今天就讓《${params.albumTitle}》把那股夜色慢慢鋪開。`,
        `你耳朵還留在 ${params.sourceArtistName} 的陰影裡，《${params.albumTitle}》剛好能把那份餘溫接住。`
      ],
      saved: [
        `既然你曾替 ${params.albumArtist} 留過位置，現在回到《${params.albumTitle}》，會比白天更對。`,
        `《${params.albumTitle}》不是拿來趕時間的專輯，既然你留過 ${params.albumArtist}，今晚就讓它慢慢展開。`
      ],
      recent: [
        `趁耳朵還記得 ${params.albumArtist} 的餘韻，把《${params.albumTitle}》接進來，情緒會很自然地續上。`,
        `你最近才碰過 ${params.albumArtist}，現在回到《${params.albumTitle}》，像把窗邊最後一盞燈再調暗一點。`
      ],
      adjacent: [
        `沿著 ${params.sourceArtistName} 這條線再往夜裡走一步，《${params.albumTitle}》會把輪廓收得更深。`,
        `如果想從 ${params.sourceArtistName} 再多留一點餘白，《${params.albumTitle}》會是一個很準的去處。`
      ],
      fresh: [
        `如果今晚想慢一點開始，《${params.albumTitle}》會是很好的第一張。`,
        `《${params.albumTitle}》不急著把情緒說滿，它更像把房間裡的光輕輕轉暗。`
      ],
      sonic: [
        "它的留白和陰影都收得深，像午夜後半場，聲音不必太多，空氣就已經夠了。",
        "聽這張很像酒杯邊緣最後一道反光，細，慢，卻久久不散。"
      ],
      era: [
        "它有那種夜裡才真正浮上來的質地，白天聽得見輪廓，晚上才聽得見心事。",
        "像老電影裡窗邊的一盞檯燈，亮度不高，卻把整個場景定住。"
      ]
    },
    Focus: {
      familiar: [
        `既然最近一直回到 ${params.sourceArtistName}，今天就讓《${params.albumTitle}》把那份清醒和秩序慢慢撐開。`,
        `你耳朵還停在 ${params.sourceArtistName} 的線條裡，《${params.albumTitle}》剛好能把注意力重新收回來。`
      ],
      saved: [
        `既然你曾替 ${params.albumArtist} 留過位置，現在回到《${params.albumTitle}》，會比隨手挑一張更穩。`,
        `《${params.albumTitle}》不是拿來搶戲的專輯，既然你留過 ${params.albumArtist}，它會很好地陪你把節奏整理好。`
      ],
      recent: [
        `趁耳朵還記得 ${params.albumArtist} 的線條，把《${params.albumTitle}》接進來，專注會自己回來。`,
        `你最近才碰過 ${params.albumArtist}，現在回到《${params.albumTitle}》，像把桌面重新理順。`
      ],
      adjacent: [
        `從 ${params.sourceArtistName} 再往外走一步，《${params.albumTitle}》會把空間收乾淨，卻不會顯得無聊。`,
        `如果想從 ${params.sourceArtistName} 聽出更穩的重心，《${params.albumTitle}》會是一個很好的延伸。`
      ],
      fresh: [
        `如果今天想把注意力慢慢收回來，《${params.albumTitle}》會是很好的起點。`,
        `《${params.albumTitle}》像一張把桌面整理乾淨的專輯，放下去之後，心緒會自己歸位。`
      ],
      sonic: [
        "它的節奏收得整齊，不搶戲，卻始終把空間安穩地撐住。",
        "線條乾淨，推進穩，像晨間光線沿著桌面慢慢鋪平。"
      ],
      era: [
        "它的好處不是刺激，而是讓思緒維持在剛剛好的清醒裡。",
        "像一本排版漂亮的書，翻開之後，眼睛和腦子都比較容易安靜下來。"
      ]
    }
  };
  const voice = voiceByVibe[params.activeVibe];
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

  const relationshipPool = [...voice[context.relationship]];
  const supportPool = [...voice.sonic, ...voice.era];

  if (recentArtists.has(albumArtistKey) && params.sourceTrackTitle) {
    relationshipPool.push(
      `你最近播過〈${params.sourceTrackTitle}〉，現在回到《${params.albumTitle}》整張去聽，情緒會接得更完整。`
    );
  }

  if (
    params.sourceAlbumTitle &&
    normalizeText(params.sourceAlbumTitle) !== normalizeText(params.albumTitle)
  ) {
    relationshipPool.push(
      `如果《${params.sourceAlbumTitle}》已經在你耳邊待了一陣子，接著讓《${params.albumTitle}》把景深再往外推一層。`
    );
  }

  if (params.activeVibe === "Classic") {
    supportPool.push("它有那種老名盤才有的穩定感，一放下去，今天的起點就定了。");
  }

  if (params.activeVibe === "Exploratory") {
    supportPool.push("它不是為了炫耀陌生而陌生，而是把熟悉的語彙推向更遠、更亮的地方。");
  }

  if (params.activeVibe === "Fusion") {
    supportPool.push("如果今天想把重心放在律動、推進和一點電氣火花，這張會耐放得多。");
  }

  if (params.activeVibe === "Late Night") {
    supportPool.push("它把情緒壓得很低，細節卻沒有退，正適合夜裡慢慢聽開。");
  }

  if (params.activeVibe === "Focus") {
    supportPool.push("它不搶你的注意力，卻能讓整個空間維持在剛剛好的清醒裡。");
  }

  const primaryIndex =
    hashValue(`${params.albumId}:${params.activeVibe}:${params.origin}:${params.sourceArtistName}`) %
    Math.max(relationshipPool.length, 1);
  const secondaryIndex =
    hashValue(`${params.albumId}:${params.subgenre}:${params.albumYear}:${params.activeVibe}`) %
    Math.max(supportPool.length, 1);
  const primary =
    relationshipPool[primaryIndex] ??
    `《${params.albumTitle}》和你最近的聆聽方向貼得很近，今天從這裡開始剛好。`;
  const secondaryPool = supportPool.filter((sentence) => sentence !== primary);
  const secondary =
    secondaryPool[secondaryIndex % Math.max(secondaryPool.length, 1)] ??
    "如果今天不想選太久，直接把整張交給它就好。";

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
  const copyByVibe: Record<Vibe, { headline: string; note: string }> = {
    Classic: {
      headline: "先把經典放進今天",
      note: "從分寸最穩的幾張開始，讓今天第一張專輯自然落下。"
    },
    Exploratory: {
      headline: "往外再聽一點",
      note: "把熟悉的語彙推遠一點，留幾張會讓耳朵慢慢打開的專輯在前面。"
    },
    Fusion: {
      headline: "把電流接進來",
      note: "先挑幾張律動更黏、聲響更亮的專輯，讓今天的重心直接落在推進感上。"
    },
    "Late Night": {
      headline: "留給夜裡的幾張",
      note: "把光線壓低之後，先從這些層次更深、呼吸更慢的專輯開始。"
    },
    Focus: {
      headline: "把注意力收回來",
      note: "先留幾張線條乾淨、推進穩的專輯，讓耳朵和思緒一起回到正中。"
    }
  };

  return {
    mode: "curated",
    headline: copyByVibe[vibe].headline,
    note: copyByVibe[vibe].note,
    picks
  };
}
