import { AppLocale, JazzPick, Vibe } from "@/types/jazz";

const LOCALE_KEY = "vanguard-locale";

const curatedReasonEnById: Record<string, string> = {
  "kind-of-blue": "When you want the room to dim a shade, this one deepens the air with almost no excess.",
  moanin: "The drums land like a club door swinging open, all heat and discipline in just the right measure.",
  "time-out": "Its pulse and its pauses are both beautifully placed, ideal for bringing your attention quietly back into line.",
  "blue-train": "Tension and order move together here, like the last, steadiest glide before a late train pulls in.",
  "somethin-else": "The brass has just enough sheen, the rhythm just enough spring. It sounds poised at any hour.",
  "saxophone-colossus": "Full-bodied lines, steady footing, a record that always knows when to step forward and when to leave space.",
  "a-love-supreme": "It gathers the mind into a higher, steadier line; the deeper it goes, the more centered it feels.",
  "mingus-ah-um": "Rough edges and wit live side by side here. One spin is enough to hear why people always come back to it.",
  "the-sidewinder": "Bright horns and brisk footing make it a quick, sure way to pull the day back into focus.",
  "getz-gilberto": "Loose lines, light air, like cracking a window just enough to let the night drift in on its own.",
  "night-dreamer": "It does not rush to charm you; it slowly opens its outline until you want to stay longer than planned.",
  "speak-no-evil": "Its surface feels cool, but the heat underneath keeps widening the further in you go.",
  "out-to-lunch": "It is not a record built to reassure, but every detour matters. Perfect when your ears want to push farther out.",
  "point-of-departure": "Each turn feels like a redefinition of center, ideal when you want your ears to keep moving beyond the obvious.",
  "the-black-saint-and-the-sinner-lady": "Its sense of narrative is immense, the feeling unfolding layer by layer like a long shadowed tracking shot.",
  karma: "Rather than filling the room, it stretches the space until the whole listening experience starts to float.",
  "conference-of-the-birds": "The lines pull against one another without crowding, perfect when you need clarity without going flat.",
  "head-hunters": "The groove moves like a city street still warm after midnight, relaxed but streaked with electric light.",
  sextant: "Electric textures and improvisation coil tightly together, the whole album moving like a slow rise in temperature.",
  "heavy-weather": "Rhythm, space and electric detail all arrive in full dimension. When you want Fusion to open wide, this is the one.",
  "bitches-brew": "It does not glide forward so much as gather charge around your feet, one pulse at a time.",
  thrust: "The low end pushes with real control, giving the whole record a clean, aerodynamic sense of speed.",
  "light-as-a-feather": "Lightness and forward motion are not opposites here; this album keeps them right up against each other.",
  "romantic-warrior": "Brightly contoured and full of motion, perfect when you want your ears completely switched on.",
  "bright-size-life": "Metheny's guitar lines are nearly transparent in their clarity, ideal for setting your day back into balance.",
  "black-radio": "Jazz, soul and nightfall stack naturally here. If you want to hear the evening all the way through, start here.",
  "emma-jean-thackray": "It carries a distinctly British experimental streak without giving up the pleasure of groove, like fresh air moving through jazz.",
  source: "The low end holds steady while the saxophone keeps glowing, a route between London night and Caribbean pulse.",
  "the-epic": "Huge in scale without ever turning showy, it keeps pushing emotion and narrative toward a very distant horizon.",
  undercurrent: "Both players keep the force low, yet every approach feels more vivid for it. Best heard all the way through in one calm sitting.",
  "sunday-at-the-village-vanguard": "The room tone, the piano's breathing space, the bass line's pace, all close enough to feel like being returned to the table lamp itself.",
  "waltz-for-debby": "If today calls for company that is quiet but never thin, Bill Evans is almost always the safe and beautiful answer.",
  "chet-baker-sings": "Voice and trumpet both refuse to oversay the feeling. The later it gets, the more their restraint begins to glow.",
  "black-focus": "Broken beat and jazz meet here with unusual ease, perfect when you want the night to stay fluid.",
  "maiden-voyage": "Its forward motion is steady and its lines are deep, like enlarging the quiet current beneath the surface of the sea.",
  "journey-in-satchidananda": "It does not darken the night so much as widen it. Once the strings and bass arrive, the record turns quietly devotional.",
  "idle-moments": "The pace is loose, but it never slips. A good one for easing breath and thought back into place at night.",
  "john-coltrane-and-johnny-hartman": "It has the warmth you only notice after the lamp is turned down a notch. Voice and sax are both exquisitely measured.",
  "mysterious-traveller": "Electric texture and rhythmic architecture interlock beautifully here, the whole thing moving like a long shot with no desire to stop.",
  "electric-byrd": "The groove holds, the brass stays bright, and the whole thing lifts your energy without tipping into noise.",
  extensions: "There is plenty of force here, but the center never wobbles. Ideal when you want to push outward without losing your footing.",
  ballads: "It never floods the room with feeling; it leaves the warmth inside each pause instead.",
  "moon-beams": "Light, but never slight; slow, but never slack. A beautiful way to lower the pace of the night.",
  "night-lights": "Like streetlight reflecting on a window, the glow is close, gentle, and surprisingly durable.",
  "beyond-the-missouri-sky": "With almost no overt gesture, it can make the whole room feel wider and much quieter.",
  "the-awakening": "The rhythm and the silence are both measured exactly right. One spin and your attention begins to stand up straight again.",
  "alone-together": "Guitar and bass leave each other plenty of room while staying on the same line, ideal for long listening.",
  crescent: "Instead of pushing the tension to the surface, it lets it brighten slowly from underneath.",
  "you-must-believe-in-spring": "It does not explain the feeling outright; it leaves the detail lingering long enough for the room to settle around it."
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
    heroTitle: "Start with this one today.",
    heroSubtitle: "A few records, already narrowed down, so the day doesn't have to begin in a sea of options.",
    vibeEyebrow: "Today's Direction",
    savedHeading: "Saved",
    savedSubtitle: "Leave the one you want to return to right here.",
    savedEmptyTitle: "Saved",
    savedEmptyBody: "Nothing has been set aside yet. The next record you know you'll come back to can wait here quietly.",
    savedCounter: (count: number) => `${count} saved`,
    preparedCount: (count: number) => `${count} ready`,
    savedCount: (count: number) => `${count} saved`,
    savedCountEmpty: "Nothing saved yet",
    feedModePersonalized: "Shaped by your listening",
    feedModeCurated: "Curated starting point",
    loadingFeed: "Cueing the record",
    loadingCover: "Bringing the sleeve in",
    spotifySource: "From your Spotify",
    openSpotify: "Open in Spotify",
    share: "Share",
    save: "Save",
    saved: "Saved",
    remove: "Remove",
    shareSheetEyebrow: "Share this moment",
    shareSheetAction: "Share this record",
    close: "Close",
    spotifyHeading: "Spotify",
    spotifyLoading: "Checking your connection...",
    spotifyConnectTitle: "Connect Spotify",
    spotifyConnectBody: "Once your account is connected, the picks will lean closer to what you actually live with.",
    spotifyDisconnect: "Disconnect",
    spotifyNotConfigured: "Setup incomplete",
    spotifyConnectedBody: () => "Today's shelf is already being tuned around the way you listen.",
    spotifyConnectedLabel: (displayName?: string) => (displayName ? `Connected ${displayName}` : "Connected Spotify"),
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
      Classic: "Begin with the records that steady a room the moment the needle drops.",
      Exploratory: "Lean a little off the familiar route and let the ear widen into stranger, brighter territory.",
      Fusion: "Push the groove forward and move closer to electricity, speed, and sharper contour.",
      "Late Night": "Built for the later hour: unhurried sound, long afterglow, feeling that never has to overstate itself.",
      Focus: "Clear the extra noise away and keep only the rhythm that can carry your concentration forward."
    },
    shareLineByVibe: {
      Classic: "Measured, enduring, and always able to settle the room the moment it starts.",
      Exploratory: "A beautiful whole-album listen when you want your ears to reach a little farther out.",
      Fusion: "The groove and forward motion are both beautifully placed, the kind of record that plays straight through.",
      "Late Night": "Best when the light is a little lower and the afterglow has room to stay.",
      Focus: "Clean-lined and steady-breathed, perfect for a stretch of time that asks for concentration."
    },
    sharePayload: (pick: JazzPick, line: string) =>
      `Wanted to pass ${pick.title} your way. ${pick.artist}, ${line}`
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
