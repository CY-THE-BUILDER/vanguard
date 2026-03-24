import { AppLocale, JazzPick, Vibe } from "@/types/jazz";

const LOCALE_KEY = "vanguard-locale";

const curatedReasonEnById: Record<string, string> = {
  "kind-of-blue": "When you want the room to exhale, this is the one. Almost nothing is forced, and that is exactly why it goes so deep.",
  moanin: "The band hits like a door swinging open on a packed room. All that heat, all that shape, and not a second wasted.",
  "time-out": "The pulse is crisp, the breathing room is generous, and the whole thing knows exactly how to gather your attention without tugging at it.",
  "blue-train": "Big sound, clean lines, real forward motion. It moves like a night train that already knows the track.",
  "somethin-else": "The brass gleams, the rhythm keeps spring underfoot, and the whole album carries itself with easy authority.",
  "saxophone-colossus": "Strong tone, clean stride, no overstatement. A record that knows exactly when to lean in and when to let the air do the work.",
  "a-love-supreme": "It steadies the mind by lifting it. The deeper you go, the clearer the center becomes.",
  "mingus-ah-um": "Funny, rough, sharp, and deeply alive. One pass through it and you understand why people keep returning.",
  "the-sidewinder": "Bright brass, hard swing, no drag at all. It snaps the room back into motion fast.",
  "getz-gilberto": "It opens the window without making a show of it. Light air, loose lines, and a night breeze built right into the record.",
  "night-dreamer": "It doesn't arrive all at once. It keeps opening and opening until suddenly you're fully inside it.",
  "speak-no-evil": "Cool on the surface, smoldering underneath. The longer it stays on, the bigger its shadow gets.",
  "out-to-lunch": "Nothing here begs for approval, and that's part of the thrill. Every sidestep earns its place.",
  "point-of-departure": "It keeps redrawing the center of gravity. Perfect when you want the ear to stop behaving itself for a while.",
  "the-black-saint-and-the-sinner-lady": "It plays like a fever dream with formal wear on. Big feeling, long arc, no wasted gesture.",
  karma: "This doesn't fill the room so much as suspend it. The farther in you go, the lighter the floor starts to feel.",
  "conference-of-the-birds": "Every line keeps its own shape, but nothing crowds. A beautiful listen when you want openness without drift.",
  "head-hunters": "It rolls like asphalt still holding heat after midnight. Loose, electric, and impossible to keep at arm's length.",
  sextant: "The synth haze and the improvising lock together beautifully. It feels less like a record than a slow-burn ignition.",
  "heavy-weather": "Everything is in full color here: groove, space, weather, shine. When Fusion needs to feel panoramic, this is the move.",
  "bitches-brew": "It doesn't walk into the room. It gathers around your feet and changes the air pressure.",
  thrust: "The low end stays planted, the motion stays clean, and the whole album moves with real bite.",
  "light-as-a-feather": "It stays buoyant without ever going soft. Grace and momentum are pressed right up against each other here.",
  "romantic-warrior": "Bright, fast, sharply drawn. The kind of record that turns the whole listening body on.",
  "bright-size-life": "Metheny sounds almost weightless here, but the record never drifts. A beautiful way to clear the desk and reset the hour.",
  "black-radio": "Jazz, soul, and late-night glow fold into each other so naturally it feels like one long mood instead of a concept.",
  "emma-jean-thackray": "Playful, exploratory, and still groove-conscious. It lets fresh air into the room without losing the pocket.",
  source: "Deep bottom, bright horn, real lift. It carries London after dark and warm-weather rhythm in the same breath.",
  "the-epic": "Massive in scale, but never bloated. It keeps building outward until the whole horizon feels farther away.",
  undercurrent: "Everything is understated, which only makes every gesture land harder. Best heard straight through, with no need to rush it.",
  "sunday-at-the-village-vanguard": "You can hear the room, the wood, the breath between notes. It feels less like a recording than a table quietly lit in front of you.",
  "waltz-for-debby": "If you need something tender, poised, and fully alive, Bill Evans almost never lets you down.",
  "chet-baker-sings": "The trumpet and the voice both know the power of not overselling the line. Late at night, that restraint turns luminous.",
  "black-focus": "Broken beat and jazz are stitched together so naturally here that the whole album seems to move on one long inhale.",
  "maiden-voyage": "Steady current, deep horizon, no wasted motion. It feels like watching the tide gather under a dark surface.",
  "journey-in-satchidananda": "It widens the night rather than darkening it. Once the strings and bass settle in, the whole thing turns devotional.",
  "idle-moments": "Relaxed pace, no sag. A beautiful record for letting breath and thought slide back into place.",
  "john-coltrane-and-johnny-hartman": "This one glows at lamp-light level. The voice, the horn, the restraint, all of it is exquisitely judged.",
  "mysterious-traveller": "The electric textures and the rhythmic architecture fit together with real elegance. It keeps moving, and you go with it.",
  "electric-byrd": "The groove sticks, the brass flashes, and the energy rises without ever getting noisy.",
  extensions: "There's plenty of force here, but it never loses its footing. Great when you want to stretch out without losing the center.",
  ballads: "It never spills the feeling all over the floor. It leaves the warmth suspended inside the pause.",
  "moon-beams": "Light, unhurried, and completely intact. A lovely way to let the night drop a level.",
  "night-lights": "Like streetlight on glass: close, low, and strangely lasting.",
  "beyond-the-missouri-sky": "It barely raises its voice, yet somehow the whole room opens wider around it.",
  "the-awakening": "The rhythm is exact, the silence is useful, and one side of this can straighten your thinking right up.",
  "alone-together": "Guitar and bass leave each other generous room while staying on the same quiet line. Ideal for long concentration.",
  crescent: "It lets the tension glow from underneath instead of forcing it to the surface.",
  "you-must-believe-in-spring": "It doesn't explain the feeling. It lets it hang in the room long enough for you to meet it yourself."
};

const uiCopy = {
  "zh-Hant": {
    heroEyebrow: "Today's Jazz Picks",
    heroTitle: "今天，先從這張開始。",
    heroSubtitle: "先替你收好幾張專輯，讓今天不用從茫茫片海開始。",
    vibeEyebrow: "今日方向",
    savedHeading: "收藏",
    savedSubtitle: "把想回頭再聽的那張，先留在這裡。",
    savedEmptyTitle: "收藏",
    savedEmptyBody: "還沒有先留住的片刻。等你遇到想回頭再聽一次的那一張，它就會安靜地待在這裡。",
    savedCounter: (count: number) => `收藏 ${count} 張`,
    preparedCount: (count: number) => `已備好 ${count} 張`,
    savedCount: (count: number) => `已留 ${count} 張`,
    savedCountEmpty: "還沒有留片",
    feedModePersonalized: "依你的聆聽習慣",
    feedModeCurated: "編選起點",
    loadingFeed: "唱盤轉進中",
    loadingCover: "唱盤就位中",
    spotifySource: "來自你的 Spotify",
    openSpotify: "前往 Spotify",
    share: "分享",
    save: "收藏",
    saved: "已收藏",
    remove: "移除",
    shareSheetEyebrow: "分享這一刻",
    shareSheetAction: "分享這張專輯",
    close: "關閉",
    spotifyHeading: "Spotify",
    spotifyLoading: "正在確認連線狀態...",
    spotifyConnectTitle: "連接 Spotify",
    spotifyConnectBody: "連上帳號後，推薦會更貼近你真正常聽的聲音。",
    spotifyDisconnect: "中斷連線",
    spotifyNotConfigured: "尚未完成設定",
    spotifyConnectedBody: (product?: string | null) =>
      product ? `已開始按你的 ${product} 聆聽習慣微調今天的選片。` : "已開始按你的聆聽習慣微調今天的選片。",
    spotifyConnectedLabel: (displayName?: string) => (displayName ? `已連接 ${displayName}` : "已連接 Spotify"),
    toastSpotifyConnected: "Spotify 已連接。",
    toastSpotifyDenied: "已取消 Spotify 授權。",
    toastSpotifyMisconfigured: "Spotify 連線設定尚未完成。",
    toastSpotifyError: "Spotify 授權未完成。",
    toastRemoved: "已從收藏移除。",
    toastSaved: "已加入收藏。",
    toastShared: "已開啟分享。",
    toastCopied: "文字與連結已複製。",
    toastShareUnavailable: "目前無法分享。",
    toastDisconnected: "已中斷 Spotify 連線。",
    toastDisconnectUnavailable: "目前無法中斷 Spotify 連線。",
    copyright: (year: number) => `© ${year} noesis.studio`,
    languageLabel: "語言",
    chinese: "中文",
    english: "EN",
    vibeDescriptions: {
      Classic: "先回到那些一放下去，整個房間就會安定下來的名盤。",
      Exploratory: "從熟悉的入口偏一點航線，去聽爵士更野、更開的那一面。",
      Fusion: "把律動再推深一點，去接住電氣、速度和更鮮明的輪廓。",
      "Late Night": "適合夜深之後播放，聲音不急，情緒卻留得很長。",
      Focus: "把多餘的噪音先收掉，只留下能陪你往前走的節奏。"
    },
    shareLineByVibe: {
      Classic: "分寸很穩，也很耐聽，任何時候放下去都能把氣氛安定下來。",
      Exploratory: "想把耳朵再往外推一點時，這張很值得整張放完。",
      Fusion: "律動和推進力都很漂亮，整張放下去很容易一路聽完。",
      "Late Night": "適合把夜色放低一點再開始，餘韻會留得很長。",
      Focus: "線條乾淨，呼吸也穩，很適合陪一段需要專心的時間。"
    },
    sharePayload: (pick: JazzPick, line: string) =>
      `今天想把《${pick.title}》留給你。${pick.artist}，${line}`
  },
  en: {
    heroEyebrow: "Today's Jazz Picks",
    heroTitle: "Start here.",
    heroSubtitle: "Less choosing, more listening.",
    vibeEyebrow: "Today's lane",
    savedHeading: "Saved",
    savedSubtitle: "Keep the ones worth coming back to within arm's reach.",
    savedEmptyTitle: "Saved",
    savedEmptyBody: "Nothing's been set aside yet. The next record you know you'll want again can wait here quietly.",
    savedCounter: (count: number) => `${count} saved`,
    preparedCount: (count: number) => `${count} ready`,
    savedCount: (count: number) => `${count} saved`,
    savedCountEmpty: "Nothing saved yet",
    feedModePersonalized: "Shaped by your listening",
    feedModeCurated: "From the shelf",
    loadingFeed: "Cueing up the next side",
    loadingCover: "Sleeve coming into view",
    spotifySource: "From your Spotify",
    openSpotify: "Open in Spotify",
    share: "Share",
    save: "Save",
    saved: "Saved",
    remove: "Remove",
    shareSheetEyebrow: "Pass this one on",
    shareSheetAction: "Share the record",
    close: "Close",
    spotifyHeading: "Spotify",
    spotifyLoading: "Checking your connection...",
    spotifyConnectTitle: "Connect Spotify",
    spotifyConnectBody: "Connect your account and the shelf starts leaning toward what you actually live with.",
    spotifyDisconnect: "Disconnect",
    spotifyNotConfigured: "Setup incomplete",
    spotifyConnectedBody: () => "Today's shelf is already being tuned around the records and players you've been living with.",
    spotifyConnectedLabel: (displayName?: string) => (displayName ? `Connected: ${displayName}` : "Spotify connected"),
    toastSpotifyConnected: "Spotify connected.",
    toastSpotifyDenied: "Spotify authorization was cancelled.",
    toastSpotifyMisconfigured: "Spotify connection is not configured yet.",
    toastSpotifyError: "Spotify authorization did not complete.",
    toastRemoved: "Removed from saved.",
    toastSaved: "Saved for later.",
    toastShared: "Share sheet opened.",
    toastCopied: "Text and link copied.",
    toastShareUnavailable: "Sharing isn't available right now.",
    toastDisconnected: "Spotify disconnected.",
    toastDisconnectUnavailable: "Couldn't disconnect Spotify right now.",
    copyright: (year: number) => `© ${year} noesis.studio`,
    languageLabel: "Language",
    chinese: "中文",
    english: "EN",
    vibeDescriptions: {
      Classic: "Go with the records that never need an introduction. The first note lands, and the whole room is already where it needs to be.",
      Exploratory: "Take the side door. These are the records that stretch the form without losing the pulse.",
      Fusion: "More charge, more motion, more city in the bloodstream. Start here when you want the groove to lean forward.",
      "Late Night": "Low light, long shadows, no unnecessary volume. These records know how to stay close without crowding the room.",
      Focus: "Clean lines, steady motion, nothing ornamental. Just enough shape and swing to keep the mind locked in."
    },
    shareLineByVibe: {
      Classic: "Measured, deeply musical, and able to settle the room almost instantly.",
      Exploratory: "A full-record listen for when you want the ear to wander a little farther than usual.",
      Fusion: "The groove, the motion, and the charge are all there. Easy to put on, hard to turn off.",
      "Late Night": "Best with the lights down a little and enough room left for the afterglow.",
      Focus: "Clean-lined and steady enough to stay with you through a stretch of real concentration."
    },
    sharePayload: (pick: JazzPick, line: string) =>
      `Passing ${pick.title} your way. ${pick.artist}. ${line}`
  }
} as const satisfies Record<
  AppLocale,
  {
    heroEyebrow: string;
    heroTitle: string;
    heroSubtitle: string;
    vibeEyebrow: string;
    savedHeading: string;
    savedSubtitle: string;
    savedEmptyTitle: string;
    savedEmptyBody: string;
    savedCounter: (count: number) => string;
    preparedCount: (count: number) => string;
    savedCount: (count: number) => string;
    savedCountEmpty: string;
    feedModePersonalized: string;
    feedModeCurated: string;
    loadingFeed: string;
    loadingCover: string;
    spotifySource: string;
    openSpotify: string;
    share: string;
    save: string;
    saved: string;
    remove: string;
    shareSheetEyebrow: string;
    shareSheetAction: string;
    close: string;
    spotifyHeading: string;
    spotifyLoading: string;
    spotifyConnectTitle: string;
    spotifyConnectBody: string;
    spotifyDisconnect: string;
    spotifyNotConfigured: string;
    spotifyConnectedBody: (product?: string | null) => string;
    spotifyConnectedLabel: (displayName?: string) => string;
    toastSpotifyConnected: string;
    toastSpotifyDenied: string;
    toastSpotifyMisconfigured: string;
    toastSpotifyError: string;
    toastRemoved: string;
    toastSaved: string;
    toastShared: string;
    toastCopied: string;
    toastShareUnavailable: string;
    toastDisconnected: string;
    toastDisconnectUnavailable: string;
    copyright: (year: number) => string;
    languageLabel: string;
    chinese: string;
    english: string;
    vibeDescriptions: Record<Vibe, string>;
    shareLineByVibe: Record<Vibe, string>;
    sharePayload: (pick: JazzPick, line: string) => string;
  }
>;

export function getLocaleStorageKey() {
  return LOCALE_KEY;
}

export function isTraditionalChineseLocale(locale: string | null | undefined) {
  if (!locale) {
    return false;
  }

  const normalized = locale.toLowerCase();
  return normalized.startsWith("zh-hant") || normalized === "zh-tw" || normalized === "zh-hk" || normalized === "zh-mo";
}

export function detectPreferredLocale(input: readonly string[] | string | null | undefined): AppLocale {
  const values = Array.isArray(input) ? input : input ? [input] : [];
  return values.some((value) => isTraditionalChineseLocale(value)) ? "zh-Hant" : "en";
}

export function getStoredLocale(): AppLocale | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(LOCALE_KEY);
  return value === "zh-Hant" || value === "en" ? value : null;
}

export function storeLocale(locale: AppLocale) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCALE_KEY, locale);
}

export function getUiCopy(locale: AppLocale) {
  return uiCopy[locale];
}

export function localizeCuratedReason(pick: JazzPick, locale: AppLocale) {
  if (locale === "zh-Hant") {
    return pick.recommendationReason;
  }

  return curatedReasonEnById[pick.id] ?? pick.recommendationReason;
}

export function localizePick(pick: JazzPick, locale: AppLocale): JazzPick {
  return {
    ...pick,
    recommendationReason: localizeCuratedReason(pick, locale)
  };
}
