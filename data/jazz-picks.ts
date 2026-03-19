import { JazzPick } from "@/types/jazz";
import { buildSpotifySearchUrl } from "@/lib/spotify-recommendations";

function createCoverArt(
  title: string,
  artist: string,
  palette: { bg: string; glow: string; accent: string; text: string }
) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" role="img" aria-label="${title} by ${artist}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.bg}" />
          <stop offset="100%" stop-color="${palette.glow}" />
        </linearGradient>
      </defs>
      <rect width="640" height="640" rx="48" fill="url(#bg)" />
      <circle cx="520" cy="140" r="120" fill="${palette.accent}" opacity="0.16" />
      <circle cx="180" cy="480" r="170" fill="#f5efde" opacity="0.08" />
      <path d="M140 474c58-182 151-273 279-273" stroke="${palette.accent}" stroke-width="12" stroke-linecap="round" opacity="0.7" />
      <path d="M208 472c16-120 70-205 164-255" stroke="#f4e8cd" stroke-width="3" stroke-dasharray="8 12" opacity="0.7" />
      <rect x="92" y="82" width="456" height="476" rx="26" fill="rgba(9, 12, 10, 0.12)" />
      <text x="124" y="368" fill="${palette.text}" font-family="Georgia, serif" font-size="56" letter-spacing="2">${title}</text>
      <text x="126" y="430" fill="${palette.text}" font-family="Arial, sans-serif" font-size="24" opacity="0.8">${artist}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function withCover(pick: Omit<JazzPick, "imageUrl">, palette: Parameters<typeof createCoverArt>[2]): JazzPick {
  const artworkSourceUrl = pick.artworkSourceUrl ?? pick.spotifyUrl;

  return {
    ...pick,
    imageUrl: createCoverArt(pick.title, pick.artist, palette),
    artworkSourceUrl,
    spotifyUrl: buildSpotifySearchUrl({
      title: pick.title,
      artist: pick.artist,
      type: pick.type
    }),
    shareUrl: buildSpotifySearchUrl({
      title: pick.title,
      artist: pick.artist,
      type: pick.type
    })
  };
}

export const jazzPicks: JazzPick[] = [
  withCover(
    {
      id: "kind-of-blue",
      title: "Kind of Blue",
      artist: "Miles Davis",
      type: "album",
      subgenre: "Modal Jazz",
      vibeTags: ["Classic", "Late Night", "Focus"],
      recommendationReason: "當你想把房間的光線降下來，這張會用極少的音符把空氣拉得很深。",
      spotifyUrl: "https://open.spotify.com/album/1weenld61qoidwYuZ1GESA",
      shareUrl: "https://open.spotify.com/album/1weenld61qoidwYuZ1GESA",
      year: 1959,
      durationLabel: "45 min",
      accentColor: "#b08f57",
      source: "curated"
    },
    { bg: "#101916", glow: "#21423f", accent: "#c8a46c", text: "#f4efdf" }
  ),
  withCover(
    {
      id: "moanin",
      title: "Moanin'",
      artist: "Art Blakey & The Jazz Messengers",
      type: "album",
      subgenre: "Hard Bop",
      vibeTags: ["Classic", "Exploratory"],
      recommendationReason: "鼓聲一落下就像推開門走進現場，熱度和紀律感都漂亮得剛剛好。",
      spotifyUrl: "https://open.spotify.com/album/5PzlTnVafjgt5RtjTdIKoC",
      shareUrl: "https://open.spotify.com/album/5PzlTnVafjgt5RtjTdIKoC",
      year: 1958,
      durationLabel: "40 min",
      accentColor: "#ba7e43",
      source: "curated"
    },
    { bg: "#1b130e", glow: "#533521", accent: "#d59d52", text: "#f8ead2" }
  ),
  withCover(
    {
      id: "time-out",
      title: "Time Out",
      artist: "The Dave Brubeck Quartet",
      type: "album",
      subgenre: "Cool Jazz",
      vibeTags: ["Classic", "Focus"],
      recommendationReason: "節拍和留白都收得很漂亮，適合把注意力慢慢帶回來，也適合整張放完。",
      spotifyUrl: "https://open.spotify.com/track/1YQWosTIljIvxAgHWTp7KP",
      shareUrl: "https://open.spotify.com/track/1YQWosTIljIvxAgHWTp7KP",
      year: 1959,
      durationLabel: "38 min",
      accentColor: "#8aa190",
      source: "curated"
    },
    { bg: "#101517", glow: "#284648", accent: "#7db1a7", text: "#edf4ec" }
  ),
  withCover(
    {
      id: "night-dreamer",
      title: "Night Dreamer",
      artist: "Wayne Shorter",
      type: "album",
      subgenre: "Post-Bop",
      vibeTags: ["Exploratory", "Late Night"],
      recommendationReason: "它不急著取悅你，而是慢慢把輪廓打開，越聽越會想待久一點。",
      spotifyUrl: "https://open.spotify.com/album/4zjQdZVtVq9vM4lqQkP4M8",
      shareUrl: "https://open.spotify.com/album/4zjQdZVtVq9vM4lqQkP4M8",
      year: 1964,
      durationLabel: "37 min",
      accentColor: "#7a8572",
      source: "curated"
    },
    { bg: "#121311", glow: "#3a4130", accent: "#9cb07d", text: "#f1ecd9" }
  ),
  withCover(
    {
      id: "speak-no-evil",
      title: "Speak No Evil",
      artist: "Wayne Shorter",
      type: "album",
      subgenre: "Modal Jazz",
      vibeTags: ["Exploratory", "Late Night"],
      recommendationReason: "輪廓是冷的，內裡卻很熱，越往後聽越會覺得這張把想像力留得很深。",
      spotifyUrl: "https://open.spotify.com/search/Speak%20No%20Evil%20Wayne%20Shorter",
      shareUrl: "https://open.spotify.com/search/Speak%20No%20Evil%20Wayne%20Shorter",
      year: 1966,
      durationLabel: "41 min",
      accentColor: "#8f9582",
      source: "curated"
    },
    { bg: "#131412", glow: "#394238", accent: "#a3b08a", text: "#f3efe4" }
  ),
  withCover(
    {
      id: "out-to-lunch",
      title: "Out to Lunch!",
      artist: "Eric Dolphy",
      type: "album",
      subgenre: "Post-Bop",
      vibeTags: ["Exploratory"],
      recommendationReason: "不是一張急著討好的專輯，但每一次偏離都很有必要，適合把耳朵往外再推一點。",
      spotifyUrl: "https://open.spotify.com/search/Out%20to%20Lunch!%20Eric%20Dolphy",
      shareUrl: "https://open.spotify.com/search/Out%20to%20Lunch!%20Eric%20Dolphy",
      year: 1964,
      durationLabel: "42 min",
      accentColor: "#b79267",
      source: "curated"
    },
    { bg: "#17120d", glow: "#534230", accent: "#c9a06f", text: "#f4eadc" }
  ),
  withCover(
    {
      id: "head-hunters",
      title: "Head Hunters",
      artist: "Herbie Hancock",
      type: "album",
      subgenre: "Fusion",
      vibeTags: ["Fusion", "Exploratory", "Late Night"],
      recommendationReason: "節奏像城市深夜還沒熄火的路面，鬆弛裡帶著一點電子光澤。",
      spotifyUrl: "https://open.spotify.com/album/5fmIolILp5NAtNYiRPjhzA",
      shareUrl: "https://open.spotify.com/album/5fmIolILp5NAtNYiRPjhzA",
      year: 1973,
      durationLabel: "41 min",
      accentColor: "#c97944",
      source: "curated"
    },
    { bg: "#130f17", glow: "#3d2837", accent: "#ca7d3e", text: "#f4e9de" }
  ),
  withCover(
    {
      id: "sextant",
      title: "Sextant",
      artist: "Herbie Hancock",
      type: "album",
      subgenre: "Fusion",
      vibeTags: ["Fusion", "Exploratory"],
      recommendationReason: "電氣聲響和即興在這裡纏得很緊，整張像一段持續升溫的夜行。",
      spotifyUrl: "https://open.spotify.com/search/Sextant%20Herbie%20Hancock",
      shareUrl: "https://open.spotify.com/search/Sextant%20Herbie%20Hancock",
      year: 1973,
      durationLabel: "39 min",
      accentColor: "#bf7a4e",
      source: "curated"
    },
    { bg: "#151017", glow: "#4b2c42", accent: "#d28a5b", text: "#f5e9de" }
  ),
  withCover(
    {
      id: "heavy-weather",
      title: "Heavy Weather",
      artist: "Weather Report",
      type: "album",
      subgenre: "Fusion",
      vibeTags: ["Fusion", "Exploratory", "Focus"],
      recommendationReason: "律動、空間感和電氣聲響都很立體，想把 Fusion 聽得更開闊時，整張最過癮。",
      spotifyUrl: "https://open.spotify.com/track/5lXzHqVhkjz0Sx6wW5y1rN",
      shareUrl: "https://open.spotify.com/track/5lXzHqVhkjz0Sx6wW5y1rN",
      year: 1977,
      durationLabel: "37 min",
      accentColor: "#cba55f",
      source: "curated"
    },
    { bg: "#0d1820", glow: "#234759", accent: "#e1be63", text: "#eef5f4" }
  ),
  withCover(
    {
      id: "bright-size-life",
      title: "Bright Size Life",
      artist: "Pat Metheny",
      type: "album",
      subgenre: "Contemporary Jazz",
      vibeTags: ["Focus", "Exploratory"],
      recommendationReason: "吉他的線條乾淨得近乎透明，適合用來把一天的節奏重新整理好。",
      spotifyUrl: "https://open.spotify.com/album/6HcJY9H7W8jKj5uDkR5G6g",
      shareUrl: "https://open.spotify.com/album/6HcJY9H7W8jKj5uDkR5G6g",
      year: 1976,
      durationLabel: "36 min",
      accentColor: "#9aaf96",
      source: "curated"
    },
    { bg: "#121915", glow: "#405d52", accent: "#9ab68f", text: "#f1f3e8" }
  ),
  withCover(
    {
      id: "black-radio",
      title: "Black Radio",
      artist: "Robert Glasper Experiment",
      type: "album",
      subgenre: "Contemporary Jazz",
      vibeTags: ["Late Night", "Fusion", "Exploratory"],
      recommendationReason: "爵士、靈魂和夜色在這張裡自然疊在一起，想把晚上的氛圍聽完整，從這裡開始很對。",
      spotifyUrl: "https://open.spotify.com/track/08V0DjxLNpgcN4Yj7R0Q4e",
      shareUrl: "https://open.spotify.com/track/08V0DjxLNpgcN4Yj7R0Q4e",
      year: 2012,
      durationLabel: "57 min",
      accentColor: "#b46e54",
      source: "curated"
    },
    { bg: "#170f10", glow: "#4e2d32", accent: "#c67b57", text: "#f6ebe1" }
  ),
  withCover(
    {
      id: "emma-jean-thackray",
      title: "Yellow",
      artist: "Emma-Jean Thackray",
      type: "album",
      subgenre: "Contemporary Jazz",
      vibeTags: ["Fusion", "Exploratory"],
      recommendationReason: "有英式實驗精神，也保留律動的愉悅感，像把新鮮空氣帶進爵士裡。",
      spotifyUrl: "https://open.spotify.com/album/2m2JxWjP7Lhbrf4tPcNI0Y",
      shareUrl: "https://open.spotify.com/album/2m2JxWjP7Lhbrf4tPcNI0Y",
      year: 2021,
      durationLabel: "48 min",
      accentColor: "#d1af4f",
      source: "curated"
    },
    { bg: "#201b0e", glow: "#5e4f1c", accent: "#dbbd59", text: "#f7f0d8" }
  ),
  withCover(
    {
      id: "source",
      title: "Source",
      artist: "Nubya Garcia",
      type: "album",
      subgenre: "Contemporary Jazz",
      vibeTags: ["Fusion", "Focus", "Late Night"],
      recommendationReason: "低頻很穩，薩克斯風很亮，像一條把倫敦夜色和加勒比節奏接起來的路。",
      spotifyUrl: "https://open.spotify.com/album/3Y0XfGFWfJqYJdBZ5qTqLQ",
      shareUrl: "https://open.spotify.com/album/3Y0XfGFWfJqYJdBZ5qTqLQ",
      year: 2020,
      durationLabel: "59 min",
      accentColor: "#5d8c87",
      source: "curated"
    },
    { bg: "#101a1b", glow: "#214b4a", accent: "#67a79b", text: "#eef5f1" }
  ),
  withCover(
    {
      id: "the-epic",
      title: "The Epic",
      artist: "Kamasi Washington",
      type: "album",
      subgenre: "Spiritual Jazz",
      vibeTags: ["Exploratory", "Focus"],
      recommendationReason: "規模很大，但不是炫技式地鋪滿，而是把情緒和敘事慢慢推到很遠的地方。",
      spotifyUrl: "https://open.spotify.com/track/2S6jGJd1iA4Y8C5dB7Pq4W",
      shareUrl: "https://open.spotify.com/track/2S6jGJd1iA4Y8C5dB7Pq4W",
      year: 2015,
      durationLabel: "173 min",
      accentColor: "#ad8256",
      source: "curated"
    },
    { bg: "#17120f", glow: "#524230", accent: "#ca9660", text: "#f4ede3" }
  ),
  withCover(
    {
      id: "undercurrent",
      title: "Undercurrent",
      artist: "Bill Evans & Jim Hall",
      type: "album",
      subgenre: "Piano Jazz",
      vibeTags: ["Late Night", "Focus"],
      recommendationReason: "兩個人都把力道收得很低，卻讓每一次靠近都更清楚，適合安靜地整張放完。",
      spotifyUrl: "https://open.spotify.com/search/Undercurrent%20Bill%20Evans%20Jim%20Hall",
      shareUrl: "https://open.spotify.com/search/Undercurrent%20Bill%20Evans%20Jim%20Hall",
      year: 1962,
      durationLabel: "38 min",
      accentColor: "#9ea18d",
      source: "curated"
    },
    { bg: "#161715", glow: "#49483f", accent: "#bab79b", text: "#f3efe3" }
  ),
  withCover(
    {
      id: "waltz-for-debby",
      title: "Waltz for Debby",
      artist: "Bill Evans Trio",
      type: "album",
      subgenre: "Piano Jazz",
      vibeTags: ["Classic", "Late Night", "Focus"],
      recommendationReason: "如果今天需要一種安靜但不單薄的陪伴，Bill Evans 幾乎總是穩妥的選擇。",
      spotifyUrl: "https://open.spotify.com/album/3wR3N8wTzJf2M9o0nVddrz",
      shareUrl: "https://open.spotify.com/album/3wR3N8wTzJf2M9o0nVddrz",
      year: 1961,
      durationLabel: "41 min",
      accentColor: "#a09b86",
      source: "curated"
    },
    { bg: "#181716", glow: "#47443d", accent: "#b9b18e", text: "#f4f0e6" }
  ),
  withCover(
    {
      id: "chet-baker-sings",
      title: "Chet Baker Sings",
      artist: "Chet Baker",
      type: "album",
      subgenre: "Cool Jazz",
      vibeTags: ["Late Night", "Classic"],
      recommendationReason: "聲線和小號都不急著把情緒說滿，越晚越能聽見它的分寸。",
      spotifyUrl: "https://open.spotify.com/search/Chet%20Baker%20Sings%20Chet%20Baker",
      shareUrl: "https://open.spotify.com/search/Chet%20Baker%20Sings%20Chet%20Baker",
      year: 1954,
      durationLabel: "38 min",
      accentColor: "#b7a184",
      source: "curated"
    },
    { bg: "#171411", glow: "#51463a", accent: "#ccb08b", text: "#f5eee2" }
  ),
  withCover(
    {
      id: "black-focus",
      title: "Black Focus",
      artist: "Yussef Kamaal",
      type: "album",
      subgenre: "Fusion",
      vibeTags: ["Fusion", "Late Night", "Focus"],
      recommendationReason: "爵士在這裡和 broken beat 長得很自然，適合夜裡還想保持流動感的時候。",
      spotifyUrl: "https://open.spotify.com/album/3Jf4g8nA1R9i1YVo2V8q8o",
      shareUrl: "https://open.spotify.com/album/3Jf4g8nA1R9i1YVo2V8q8o",
      year: 2016,
      durationLabel: "45 min",
      accentColor: "#7d8f9b",
      source: "curated"
    },
    { bg: "#101316", glow: "#29343f", accent: "#87a0af", text: "#ecf0ef" }
  )
];

const curatedPickIdsByVibe = {
  Classic: [
    "kind-of-blue",
    "moanin",
    "time-out",
    "waltz-for-debby"
  ],
  Exploratory: [
    "night-dreamer",
    "speak-no-evil",
    "out-to-lunch",
    "the-epic",
    "yellow"
  ],
  Fusion: [
    "head-hunters",
    "sextant",
    "heavy-weather",
    "black-radio",
    "black-focus"
  ],
  "Late Night": [
    "night-dreamer",
    "undercurrent",
    "waltz-for-debby",
    "chet-baker-sings",
    "kind-of-blue"
  ],
  Focus: [
    "time-out",
    "bright-size-life",
    "undercurrent",
    "source",
    "black-focus"
  ]
} satisfies Record<JazzPick["vibeTags"][number], string[]>;

export function getCuratedPicksForVibe(vibe: JazzPick["vibeTags"][number]) {
  const ids = curatedPickIdsByVibe[vibe];
  const pickMap = new Map(jazzPicks.map((pick) => [pick.id, pick]));

  return ids
    .map((id) => pickMap.get(id))
    .filter((pick): pick is JazzPick => Boolean(pick));
}
