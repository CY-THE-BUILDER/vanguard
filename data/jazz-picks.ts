import { JazzPick } from "@/types/jazz";
import { buildSpotifySearchUrl } from "@/lib/spotify-recommendations";
import { buildGeneratedCoverArt } from "@/lib/cover-art";

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
  const placeholderImageUrl = buildGeneratedCoverArt(pick.title, pick.artist, pick.accentColor);

  return {
    ...pick,
    imageUrl: createCoverArt(pick.title, pick.artist, palette),
    placeholderImageUrl,
    artworkSourceUrl,
    spotifyUrl:
      /open\.spotify\.com\/album\//.test(pick.spotifyUrl)
        ? pick.spotifyUrl
        : buildSpotifySearchUrl({
            title: pick.title,
            artist: pick.artist,
            type: "album"
          }),
    shareUrl:
      /open\.spotify\.com\/album\//.test(pick.shareUrl)
        ? pick.shareUrl
        : buildSpotifySearchUrl({
            title: pick.title,
            artist: pick.artist,
            type: "album"
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
      spotifyUrl: "https://open.spotify.com/album/6P3jzdPK5VMbzuJ2HcRt9y",
      shareUrl: "https://open.spotify.com/album/6P3jzdPK5VMbzuJ2HcRt9y",
      year: 1959,
      durationLabel: "38 min",
      accentColor: "#8aa190",
      source: "curated"
    },
    { bg: "#101517", glow: "#284648", accent: "#7db1a7", text: "#edf4ec" }
  ),
  withCover(
    {
      id: "blue-train",
      title: "Blue Train",
      artist: "John Coltrane",
      type: "album",
      subgenre: "Hard Bop",
      vibeTags: ["Classic", "Exploratory"],
      recommendationReason: "張力和秩序都在，像一列深夜列車進站前最後一段最穩的滑行。",
      spotifyUrl: "https://open.spotify.com/search/Blue%20Train%20John%20Coltrane",
      shareUrl: "https://open.spotify.com/search/Blue%20Train%20John%20Coltrane",
      year: 1957,
      durationLabel: "42 min",
      accentColor: "#6683a4",
      source: "curated"
    },
    { bg: "#10151b", glow: "#29425d", accent: "#7a9cc0", text: "#eef2f4" }
  ),
  withCover(
    {
      id: "somethin-else",
      title: "Somethin' Else",
      artist: "Cannonball Adderley",
      type: "album",
      subgenre: "Hard Bop",
      vibeTags: ["Classic", "Focus"],
      recommendationReason: "銅管的光澤和節奏的彈性都漂亮得恰到好處，任何時候放下去都體面。",
      spotifyUrl: "https://open.spotify.com/album/3Wu0chxAm4GxSeRnIIf2Om",
      shareUrl: "https://open.spotify.com/album/3Wu0chxAm4GxSeRnIIf2Om",
      year: 1958,
      durationLabel: "37 min",
      accentColor: "#9e8258",
      source: "curated"
    },
    { bg: "#15120f", glow: "#4e3d2c", accent: "#b29263", text: "#f4ece2" }
  ),
  withCover(
    {
      id: "saxophone-colossus",
      title: "Saxophone Colossus",
      artist: "Sonny Rollins",
      type: "album",
      subgenre: "Hard Bop",
      vibeTags: ["Classic", "Focus"],
      recommendationReason: "線條飽滿，步伐穩，像一張永遠知道什麼時候該往前、什麼時候該留白的專輯。",
      spotifyUrl: "https://open.spotify.com/album/02fJL5DUx4Ux71GPRXUCUj",
      shareUrl: "https://open.spotify.com/album/02fJL5DUx4Ux71GPRXUCUj",
      year: 1956,
      durationLabel: "40 min",
      accentColor: "#b86854",
      source: "curated"
    },
    { bg: "#171110", glow: "#563028", accent: "#cb7761", text: "#f4e7df" }
  ),
  withCover(
    {
      id: "a-love-supreme",
      title: "A Love Supreme",
      artist: "John Coltrane",
      type: "album",
      subgenre: "Spiritual Jazz",
      vibeTags: ["Classic", "Exploratory", "Focus"],
      recommendationReason: "像把心緒慢慢收成一道更高的線，越往後聽，重心越穩。",
      spotifyUrl: "https://open.spotify.com/search/A%20Love%20Supreme%20John%20Coltrane",
      shareUrl: "https://open.spotify.com/search/A%20Love%20Supreme%20John%20Coltrane",
      year: 1965,
      durationLabel: "33 min",
      accentColor: "#b49763",
      source: "curated"
    },
    { bg: "#17130f", glow: "#57432e", accent: "#cfaa67", text: "#f5ecdf" }
  ),
  withCover(
    {
      id: "mingus-ah-um",
      title: "Mingus Ah Um",
      artist: "Charles Mingus",
      type: "album",
      subgenre: "Post-Bop",
      vibeTags: ["Classic", "Exploratory"],
      recommendationReason: "粗礪與幽默都在裡面，放下去就知道這張名盤為什麼總有人回頭。",
      spotifyUrl: "https://open.spotify.com/search/Mingus%20Ah%20Um%20Charles%20Mingus",
      shareUrl: "https://open.spotify.com/search/Mingus%20Ah%20Um%20Charles%20Mingus",
      year: 1959,
      durationLabel: "38 min",
      accentColor: "#a97455",
      source: "curated"
    },
    { bg: "#18110e", glow: "#533027", accent: "#c7865d", text: "#f5e8dd" }
  ),
  withCover(
    {
      id: "the-sidewinder",
      title: "The Sidewinder",
      artist: "Lee Morgan",
      type: "album",
      subgenre: "Hard Bop",
      vibeTags: ["Classic", "Focus"],
      recommendationReason: "銅管明亮，步伐俐落，適合把一天的狀態迅速拉回正軌。",
      spotifyUrl: "https://open.spotify.com/search/The%20Sidewinder%20Lee%20Morgan",
      shareUrl: "https://open.spotify.com/search/The%20Sidewinder%20Lee%20Morgan",
      year: 1964,
      durationLabel: "37 min",
      accentColor: "#c18152",
      source: "curated"
    },
    { bg: "#18110d", glow: "#593224", accent: "#d68c58", text: "#f5e9df" }
  ),
  withCover(
    {
      id: "getz-gilberto",
      title: "Getz/Gilberto",
      artist: "Stan Getz & Joao Gilberto",
      type: "album",
      subgenre: "Cool Jazz",
      vibeTags: ["Classic", "Late Night", "Focus"],
      recommendationReason: "線條鬆，氣味輕，像把窗打開一點，讓夜裡的空氣自己進來。",
      spotifyUrl: "https://open.spotify.com/search/Getz%20Gilberto%20Stan%20Getz%20Joao%20Gilberto",
      shareUrl: "https://open.spotify.com/search/Getz%20Gilberto%20Stan%20Getz%20Joao%20Gilberto",
      year: 1964,
      durationLabel: "35 min",
      accentColor: "#96aaa4",
      source: "curated"
    },
    { bg: "#111617", glow: "#355056", accent: "#aac2ba", text: "#eef5f1" }
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
      spotifyUrl: "https://open.spotify.com/album/27Rl4E2uzBhtMjaqL5pdfc",
      shareUrl: "https://open.spotify.com/album/27Rl4E2uzBhtMjaqL5pdfc",
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
      spotifyUrl: "https://open.spotify.com/album/2iai0YIBFDEfgbOYs6P1Q",
      shareUrl: "https://open.spotify.com/album/2iai0YIBFDEfgbOYs6P1Q",
      year: 1964,
      durationLabel: "42 min",
      accentColor: "#b79267",
      source: "curated"
    },
    { bg: "#17120d", glow: "#534230", accent: "#c9a06f", text: "#f4eadc" }
  ),
  withCover(
    {
      id: "point-of-departure",
      title: "Point of Departure",
      artist: "Andrew Hill",
      type: "album",
      subgenre: "Post-Bop",
      vibeTags: ["Exploratory"],
      recommendationReason: "每個轉折都像在重新定義重心，適合耳朵還想再往外走一點的時候。",
      spotifyUrl: "https://open.spotify.com/search/Point%20of%20Departure%20Andrew%20Hill",
      shareUrl: "https://open.spotify.com/search/Point%20of%20Departure%20Andrew%20Hill",
      year: 1965,
      durationLabel: "40 min",
      accentColor: "#a88a6d",
      source: "curated"
    },
    { bg: "#151210", glow: "#46372d", accent: "#bc9a76", text: "#f4ece2" }
  ),
  withCover(
    {
      id: "the-black-saint-and-the-sinner-lady",
      title: "The Black Saint and the Sinner Lady",
      artist: "Charles Mingus",
      type: "album",
      subgenre: "Post-Bop",
      vibeTags: ["Exploratory", "Late Night"],
      recommendationReason: "敘事感很強，情緒一層一層推進，像一段帶著陰影的長鏡頭。",
      spotifyUrl: "https://open.spotify.com/search/The%20Black%20Saint%20and%20the%20Sinner%20Lady%20Charles%20Mingus",
      shareUrl: "https://open.spotify.com/search/The%20Black%20Saint%20and%20the%20Sinner%20Lady%20Charles%20Mingus",
      year: 1963,
      durationLabel: "39 min",
      accentColor: "#9b7f67",
      source: "curated"
    },
    { bg: "#15110f", glow: "#48322b", accent: "#b19070", text: "#f4ebe2" }
  ),
  withCover(
    {
      id: "karma",
      title: "Karma",
      artist: "Pharoah Sanders",
      type: "album",
      subgenre: "Spiritual Jazz",
      vibeTags: ["Exploratory", "Late Night"],
      recommendationReason: "不是要把房間填滿，而是把空間撐開，讓整個聆聽慢慢失重。",
      spotifyUrl: "https://open.spotify.com/search/Karma%20Pharoah%20Sanders",
      shareUrl: "https://open.spotify.com/search/Karma%20Pharoah%20Sanders",
      year: 1969,
      durationLabel: "32 min",
      accentColor: "#a68b61",
      source: "curated"
    },
    { bg: "#15120f", glow: "#473b2a", accent: "#bf9e67", text: "#f4ecdf" }
  ),
  withCover(
    {
      id: "conference-of-the-birds",
      title: "Conference of the Birds",
      artist: "Dave Holland",
      type: "album",
      subgenre: "Post-Bop",
      vibeTags: ["Exploratory", "Focus"],
      recommendationReason: "線條彼此牽引卻不互相擠壓，適合需要清醒又不想太平直的時候。",
      spotifyUrl: "https://open.spotify.com/search/Conference%20of%20the%20Birds%20Dave%20Holland",
      shareUrl: "https://open.spotify.com/search/Conference%20of%20the%20Birds%20Dave%20Holland",
      year: 1973,
      durationLabel: "44 min",
      accentColor: "#7e938c",
      source: "curated"
    },
    { bg: "#121615", glow: "#324744", accent: "#94aca3", text: "#edf4ef" }
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
      spotifyUrl: "https://open.spotify.com/album/0J6PpQHDOcr54tXvh1MMCr",
      shareUrl: "https://open.spotify.com/album/0J6PpQHDOcr54tXvh1MMCr",
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
      spotifyUrl: "https://open.spotify.com/search/album%3AHeavy%20Weather%20artist%3AWeather%20Report",
      shareUrl: "https://open.spotify.com/search/album%3AHeavy%20Weather%20artist%3AWeather%20Report",
      year: 1977,
      durationLabel: "37 min",
      accentColor: "#cba55f",
      source: "curated"
    },
    { bg: "#0d1820", glow: "#234759", accent: "#e1be63", text: "#eef5f4" }
  ),
  withCover(
    {
      id: "bitches-brew",
      title: "Bitches Brew",
      artist: "Miles Davis",
      type: "album",
      subgenre: "Fusion",
      vibeTags: ["Fusion", "Exploratory", "Late Night"],
      recommendationReason: "不是平順地往前，而是讓節奏和電流在你腳邊慢慢積起來。",
      spotifyUrl: "https://open.spotify.com/search/Bitches%20Brew%20Miles%20Davis",
      shareUrl: "https://open.spotify.com/search/Bitches%20Brew%20Miles%20Davis",
      year: 1970,
      durationLabel: "94 min",
      accentColor: "#a07a63",
      source: "curated"
    },
    { bg: "#171110", glow: "#47302e", accent: "#b58a71", text: "#f3e9e0" }
  ),
  withCover(
    {
      id: "thrust",
      title: "Thrust",
      artist: "Herbie Hancock",
      type: "album",
      subgenre: "Fusion",
      vibeTags: ["Fusion", "Focus"],
      recommendationReason: "低頻往前推得很穩，整張帶著一種乾淨俐落的速度感。",
      spotifyUrl: "https://open.spotify.com/search/Thrust%20Herbie%20Hancock",
      shareUrl: "https://open.spotify.com/search/Thrust%20Herbie%20Hancock",
      year: 1974,
      durationLabel: "38 min",
      accentColor: "#b67c56",
      source: "curated"
    },
    { bg: "#16110f", glow: "#4a2d27", accent: "#cd8d62", text: "#f4ebe2" }
  ),
  withCover(
    {
      id: "light-as-a-feather",
      title: "Light as a Feather",
      artist: "Return to Forever",
      type: "album",
      subgenre: "Fusion",
      vibeTags: ["Fusion", "Exploratory"],
      recommendationReason: "輕盈和推進力並不互斥，這張就把兩者貼得很近。",
      spotifyUrl: "https://open.spotify.com/search/Light%20as%20a%20Feather%20Return%20to%20Forever",
      shareUrl: "https://open.spotify.com/search/Light%20as%20a%20Feather%20Return%20to%20Forever",
      year: 1973,
      durationLabel: "47 min",
      accentColor: "#b8a56a",
      source: "curated"
    },
    { bg: "#17150e", glow: "#4c4422", accent: "#ceb66e", text: "#f5efdc" }
  ),
  withCover(
    {
      id: "romantic-warrior",
      title: "Romantic Warrior",
      artist: "Return to Forever",
      type: "album",
      subgenre: "Fusion",
      vibeTags: ["Fusion", "Exploratory"],
      recommendationReason: "輪廓很亮，速度感也很足，適合想把耳朵徹底喚醒的時候。",
      spotifyUrl: "https://open.spotify.com/search/Romantic%20Warrior%20Return%20to%20Forever",
      shareUrl: "https://open.spotify.com/search/Romantic%20Warrior%20Return%20to%20Forever",
      year: 1976,
      durationLabel: "44 min",
      accentColor: "#9a8474",
      source: "curated"
    },
    { bg: "#161211", glow: "#433633", accent: "#b69a86", text: "#f3ece5" }
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
      spotifyUrl: "https://open.spotify.com/search/album%3ABlack%20Radio%20artist%3ARobert%20Glasper%20Experiment",
      shareUrl: "https://open.spotify.com/search/album%3ABlack%20Radio%20artist%3ARobert%20Glasper%20Experiment",
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
      spotifyUrl: "https://open.spotify.com/search/album%3AThe%20Epic%20artist%3AKamasi%20Washington",
      shareUrl: "https://open.spotify.com/search/album%3AThe%20Epic%20artist%3AKamasi%20Washington",
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
      spotifyUrl: "https://open.spotify.com/album/3b2s2A8DPISbaQNxhrEsGQ",
      shareUrl: "https://open.spotify.com/album/3b2s2A8DPISbaQNxhrEsGQ",
      year: 1962,
      durationLabel: "38 min",
      accentColor: "#9ea18d",
      source: "curated"
    },
    { bg: "#161715", glow: "#49483f", accent: "#bab79b", text: "#f3efe3" }
  ),
  withCover(
    {
      id: "sunday-at-the-village-vanguard",
      title: "Sunday at the Village Vanguard",
      artist: "Bill Evans Trio",
      type: "album",
      subgenre: "Piano Jazz",
      vibeTags: ["Classic", "Late Night", "Focus"],
      recommendationReason: "現場的呼吸、鋼琴的留白與低音的步伐都收得近，像把人直接帶回桌燈下那一刻。",
      spotifyUrl: "https://open.spotify.com/album/20ONXPfQ4EmoClthSFCq48",
      shareUrl: "https://open.spotify.com/album/20ONXPfQ4EmoClthSFCq48",
      year: 1961,
      durationLabel: "43 min",
      accentColor: "#9d9585",
      source: "curated"
    },
    { bg: "#171715", glow: "#44423c", accent: "#b6ae97", text: "#f4efe5" }
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
      spotifyUrl: "https://open.spotify.com/album/5JJ779nrbHx0KB2lBrMMa4",
      shareUrl: "https://open.spotify.com/album/5JJ779nrbHx0KB2lBrMMa4",
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
  ),
  withCover(
    {
      id: "maiden-voyage",
      title: "Maiden Voyage",
      artist: "Herbie Hancock",
      type: "album",
      subgenre: "Modal Jazz",
      vibeTags: ["Classic", "Exploratory", "Focus"],
      recommendationReason: "推進很穩，線條很深，像把海面下那種安靜而持續的流動慢慢放大。",
      spotifyUrl: "https://open.spotify.com/album/4PMwCdbTTBTgyMh8dbTVrb",
      shareUrl: "https://open.spotify.com/album/4PMwCdbTTBTgyMh8dbTVrb",
      year: 1965,
      durationLabel: "40 min",
      accentColor: "#6f8ca6",
      source: "curated"
    },
    { bg: "#10151a", glow: "#29495e", accent: "#7fa2c3", text: "#eef3f6" }
  ),
  withCover(
    {
      id: "journey-in-satchidananda",
      title: "Journey in Satchidananda",
      artist: "Alice Coltrane",
      type: "album",
      subgenre: "Spiritual Jazz",
      vibeTags: ["Exploratory", "Late Night"],
      recommendationReason: "不是把夜色壓低，而是把它撐開。弦樂與低音一落，整張就有了冥想般的向心力。",
      spotifyUrl: "https://open.spotify.com/album/6zV55Ff7OwHfgIBOXR1wNH",
      shareUrl: "https://open.spotify.com/album/6zV55Ff7OwHfgIBOXR1wNH",
      year: 1971,
      durationLabel: "33 min",
      accentColor: "#9f8b60",
      source: "curated"
    },
    { bg: "#15130f", glow: "#4c3f2b", accent: "#bea36d", text: "#f4ecdf" }
  ),
  withCover(
    {
      id: "idle-moments",
      title: "Idle Moments",
      artist: "Grant Green",
      type: "album",
      subgenre: "Jazz",
      vibeTags: ["Late Night", "Focus"],
      recommendationReason: "速度放得很鬆，卻沒有一秒散掉。適合在夜裡把呼吸和思緒都慢慢放回原位。",
      spotifyUrl: "https://open.spotify.com/album/1lDtUlOPGKp56gQ24MvmNG",
      shareUrl: "https://open.spotify.com/album/1lDtUlOPGKp56gQ24MvmNG",
      year: 1963,
      durationLabel: "40 min",
      accentColor: "#8c9d86",
      source: "curated"
    },
    { bg: "#131613", glow: "#3b4a3c", accent: "#9cb08f", text: "#eef2e8" }
  ),
  withCover(
    {
      id: "john-coltrane-and-johnny-hartman",
      title: "John Coltrane and Johnny Hartman",
      artist: "John Coltrane & Johnny Hartman",
      type: "album",
      subgenre: "Jazz",
      vibeTags: ["Late Night", "Classic"],
      recommendationReason: "像把窗邊的燈調暗一格之後，才聽得見的那種溫度。聲線與薩克斯風都極有分寸。",
      spotifyUrl: "https://open.spotify.com/album/2AXOXo6QGfUJyFO9cw6sHb",
      shareUrl: "https://open.spotify.com/album/2AXOXo6QGfUJyFO9cw6sHb",
      year: 1963,
      durationLabel: "31 min",
      accentColor: "#9d8976",
      source: "curated"
    },
    { bg: "#171311", glow: "#4a3b34", accent: "#b29a83", text: "#f4ece1" }
  ),
  withCover(
    {
      id: "mysterious-traveller",
      title: "Mysterious Traveller",
      artist: "Weather Report",
      type: "album",
      subgenre: "Fusion",
      vibeTags: ["Fusion", "Exploratory"],
      recommendationReason: "電氣聲響與節奏結構交錯得非常漂亮，整張像一段始終向前的長鏡頭。",
      spotifyUrl: "https://open.spotify.com/album/2JARH6A2TX28OzcPwJnD1p",
      shareUrl: "https://open.spotify.com/album/2JARH6A2TX28OzcPwJnD1p",
      year: 1974,
      durationLabel: "41 min",
      accentColor: "#7a8da7",
      source: "curated"
    },
    { bg: "#101419", glow: "#273f53", accent: "#89a2c4", text: "#eef3f6" }
  ),
  withCover(
    {
      id: "electric-byrd",
      title: "Electric Byrd",
      artist: "Donald Byrd",
      type: "album",
      subgenre: "Fusion",
      vibeTags: ["Fusion", "Focus"],
      recommendationReason: "律動黏得住，銅管也亮得夠俐落，適合想把精神提起來但不想太躁的時候。",
      spotifyUrl: "https://open.spotify.com/search/Electric%20Byrd%20Donald%20Byrd",
      shareUrl: "https://open.spotify.com/search/Electric%20Byrd%20Donald%20Byrd",
      year: 1970,
      durationLabel: "38 min",
      accentColor: "#b88656",
      source: "curated"
    },
    { bg: "#17120f", glow: "#503626", accent: "#cf9660", text: "#f4ebe0" }
  ),
  withCover(
    {
      id: "extensions",
      title: "Extensions",
      artist: "McCoy Tyner",
      type: "album",
      subgenre: "Spiritual Jazz",
      vibeTags: ["Exploratory", "Focus"],
      recommendationReason: "張力不小，但重心很穩。適合想把耳朵再往外推一點，卻又不想失去中心的時候。",
      spotifyUrl: "https://open.spotify.com/search/Extensions%20McCoy%20Tyner",
      shareUrl: "https://open.spotify.com/search/Extensions%20McCoy%20Tyner",
      year: 1973,
      durationLabel: "44 min",
      accentColor: "#a38b67",
      source: "curated"
    },
    { bg: "#15120f", glow: "#4a3b2b", accent: "#b89b72", text: "#f3ece1" }
  ),
  withCover(
    {
      id: "ballads",
      title: "Ballads",
      artist: "John Coltrane Quartet",
      type: "album",
      subgenre: "Jazz",
      vibeTags: ["Late Night", "Classic"],
      recommendationReason: "不是把情緒唱滿，而是把溫度留在每一次停頓裡。",
      spotifyUrl: "https://open.spotify.com/search/Ballads%20John%20Coltrane%20Quartet",
      shareUrl: "https://open.spotify.com/search/Ballads%20John%20Coltrane%20Quartet",
      year: 1963,
      durationLabel: "33 min",
      accentColor: "#9a8d7b",
      source: "curated"
    },
    { bg: "#161412", glow: "#433933", accent: "#b09f87", text: "#f4ece3" }
  ),
  withCover(
    {
      id: "moon-beams",
      title: "Moon Beams",
      artist: "Bill Evans Trio",
      type: "album",
      subgenre: "Piano Jazz",
      vibeTags: ["Late Night", "Focus"],
      recommendationReason: "輕，卻不薄；慢，卻沒有鬆掉，很適合把夜裡的步伐放低。",
      spotifyUrl: "https://open.spotify.com/search/Moon%20Beams%20Bill%20Evans%20Trio",
      shareUrl: "https://open.spotify.com/search/Moon%20Beams%20Bill%20Evans%20Trio",
      year: 1962,
      durationLabel: "38 min",
      accentColor: "#96a08e",
      source: "curated"
    },
    { bg: "#141513", glow: "#40443d", accent: "#acb7a2", text: "#f1eee6" }
  ),
  withCover(
    {
      id: "night-lights",
      title: "Night Lights",
      artist: "Gerry Mulligan",
      type: "album",
      subgenre: "Cool Jazz",
      vibeTags: ["Late Night", "Focus"],
      recommendationReason: "像街角燈光映在窗上的那種亮度，整張都很近，也很耐聽。",
      spotifyUrl: "https://open.spotify.com/search/Night%20Lights%20Gerry%20Mulligan",
      shareUrl: "https://open.spotify.com/search/Night%20Lights%20Gerry%20Mulligan",
      year: 1963,
      durationLabel: "36 min",
      accentColor: "#7f9299",
      source: "curated"
    },
    { bg: "#111418", glow: "#2b3e48", accent: "#95acb3", text: "#ecf2f4" }
  ),
  withCover(
    {
      id: "beyond-the-missouri-sky",
      title: "Beyond the Missouri Sky",
      artist: "Charlie Haden & Pat Metheny",
      type: "album",
      subgenre: "Contemporary Jazz",
      vibeTags: ["Late Night", "Focus"],
      recommendationReason: "幾乎不需要太多動作，就能把整個空間拉得很遠很安靜。",
      spotifyUrl: "https://open.spotify.com/search/Beyond%20the%20Missouri%20Sky%20Charlie%20Haden%20Pat%20Metheny",
      shareUrl: "https://open.spotify.com/search/Beyond%20the%20Missouri%20Sky%20Charlie%20Haden%20Pat%20Metheny",
      year: 1997,
      durationLabel: "56 min",
      accentColor: "#8ca0a0",
      source: "curated"
    },
    { bg: "#111515", glow: "#304444", accent: "#9eb3b1", text: "#edf3f0" }
  ),
  withCover(
    {
      id: "the-awakening",
      title: "The Awakening",
      artist: "Ahmad Jamal Trio",
      type: "album",
      subgenre: "Piano Jazz",
      vibeTags: ["Focus", "Classic"],
      recommendationReason: "節奏和留白都拿捏得很準，放下去就能把注意力慢慢扶正。",
      spotifyUrl: "https://open.spotify.com/search/The%20Awakening%20Ahmad%20Jamal%20Trio",
      shareUrl: "https://open.spotify.com/search/The%20Awakening%20Ahmad%20Jamal%20Trio",
      year: 1970,
      durationLabel: "35 min",
      accentColor: "#92a08f",
      source: "curated"
    },
    { bg: "#131513", glow: "#3a443b", accent: "#a8b6a1", text: "#eff1e9" }
  ),
  withCover(
    {
      id: "alone-together",
      title: "Alone Together",
      artist: "Jim Hall & Ron Carter",
      type: "album",
      subgenre: "Jazz",
      vibeTags: ["Focus", "Late Night"],
      recommendationReason: "吉他和低音彼此留出空間，卻始終走在同一條線上，很適合長時間放著。",
      spotifyUrl: "https://open.spotify.com/search/Alone%20Together%20Jim%20Hall%20Ron%20Carter",
      shareUrl: "https://open.spotify.com/search/Alone%20Together%20Jim%20Hall%20Ron%20Carter",
      year: 1972,
      durationLabel: "41 min",
      accentColor: "#8ca095",
      source: "curated"
    },
    { bg: "#121513", glow: "#33433d", accent: "#9db3a6", text: "#edf2eb" }
  ),
  withCover(
    {
      id: "crescent",
      title: "Crescent",
      artist: "John Coltrane Quartet",
      type: "album",
      subgenre: "Modal Jazz",
      vibeTags: ["Focus", "Late Night", "Exploratory"],
      recommendationReason: "不是直接把張力推滿，而是讓它在暗處緩緩發亮。",
      spotifyUrl: "https://open.spotify.com/search/Crescent%20John%20Coltrane%20Quartet",
      shareUrl: "https://open.spotify.com/search/Crescent%20John%20Coltrane%20Quartet",
      year: 1964,
      durationLabel: "40 min",
      accentColor: "#8f9586",
      source: "curated"
    },
    { bg: "#141512", glow: "#3c4237", accent: "#a7ae98", text: "#f1efe5" }
  ),
  withCover(
    {
      id: "you-must-believe-in-spring",
      title: "You Must Believe in Spring",
      artist: "Bill Evans",
      type: "album",
      subgenre: "Piano Jazz",
      vibeTags: ["Late Night", "Focus"],
      recommendationReason: "不是把情緒說滿，而是把細節留得夠長。很適合夜深之後，讓鋼琴把房間慢慢安靜下來。",
      spotifyUrl: "https://open.spotify.com/album/20r762YmB5HeofjMCiPMLv",
      shareUrl: "https://open.spotify.com/album/20r762YmB5HeofjMCiPMLv",
      year: 1981,
      durationLabel: "37 min",
      accentColor: "#96a08d",
      source: "curated"
    },
    { bg: "#141513", glow: "#40433d", accent: "#a7b19d", text: "#f1eee6" }
  )
];

const curatedPickIdsByVibe = {
  Classic: [
    "kind-of-blue",
    "blue-train",
    "somethin-else",
    "time-out",
    "sunday-at-the-village-vanguard",
    "moanin",
    "maiden-voyage",
    "chet-baker-sings",
    "john-coltrane-and-johnny-hartman",
    "a-love-supreme",
    "mingus-ah-um",
    "the-sidewinder",
    "getz-gilberto",
    "saxophone-colossus",
    "the-awakening",
    "ballads"
  ],
  Exploratory: [
    "out-to-lunch",
    "journey-in-satchidananda",
    "speak-no-evil",
    "night-dreamer",
    "the-epic",
    "extensions",
    "yellow",
    "maiden-voyage",
    "a-love-supreme",
    "point-of-departure",
    "the-black-saint-and-the-sinner-lady",
    "karma",
    "conference-of-the-birds",
    "crescent",
    "light-as-a-feather",
    "romantic-warrior",
    "bitches-brew",
    "mingus-ah-um"
  ],
  Fusion: [
    "head-hunters",
    "sextant",
    "heavy-weather",
    "mysterious-traveller",
    "electric-byrd",
    "black-focus",
    "black-radio",
    "yellow",
    "bitches-brew",
    "thrust",
    "light-as-a-feather",
    "romantic-warrior",
    "source"
  ],
  "Late Night": [
    "undercurrent",
    "chet-baker-sings",
    "john-coltrane-and-johnny-hartman",
    "idle-moments",
    "you-must-believe-in-spring",
    "waltz-for-debby",
    "journey-in-satchidananda",
    "night-dreamer",
    "getz-gilberto",
    "ballads",
    "moon-beams",
    "night-lights",
    "beyond-the-missouri-sky",
    "the-black-saint-and-the-sinner-lady",
    "karma",
    "crescent"
  ],
  Focus: [
    "time-out",
    "bright-size-life",
    "source",
    "maiden-voyage",
    "black-focus",
    "undercurrent",
    "idle-moments",
    "extensions",
    "you-must-believe-in-spring",
    "a-love-supreme",
    "the-sidewinder",
    "conference-of-the-birds",
    "the-awakening",
    "alone-together",
    "crescent",
    "getz-gilberto",
    "moon-beams",
    "beyond-the-missouri-sky"
  ]
} satisfies Record<JazzPick["vibeTags"][number], string[]>;

function hashSeed(value: string) {
  return [...value].reduce((sum, char) => sum * 31 + char.charCodeAt(0), 7);
}

function createSeededRandom(seed: number) {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seed: number) {
  if (items.length <= 1) {
    return items;
  }

  const random = createSeededRandom(hashSeed(String(seed)));
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function rotatePicks<T>(picks: T[], rotation: number) {
  if (picks.length <= 1 || rotation === 0) {
    return picks;
  }

  const offset = ((rotation % picks.length) + picks.length) % picks.length;
  if (offset === 0) {
    return picks;
  }

  return [...picks.slice(offset), ...picks.slice(0, offset)];
}

export function getCuratedPicksForVibe(
  vibe: JazzPick["vibeTags"][number],
  options?: { limit?: number; excludeIds?: Set<string>; rotation?: number; seed?: number }
) {
  const ids = curatedPickIdsByVibe[vibe];
  const pickMap = new Map(jazzPicks.map((pick) => [pick.id, pick]));
  const pool = ids
    .map((id) => pickMap.get(id))
    .filter((pick): pick is JazzPick => Boolean(pick));
  const excludedIds = options?.excludeIds ?? new Set<string>();
  const seed = options?.seed ?? 0;
  const fresh = seededShuffle(
    pool.filter((pick) => !excludedIds.has(pick.id)),
    seed + (options?.rotation ?? 0)
  );
  const fallback = seededShuffle(
    pool.filter((pick) => excludedIds.has(pick.id)),
    seed + (options?.rotation ?? 0) + 97
  );

  return rotatePicks([...fresh, ...fallback], options?.rotation ?? 0).slice(0, options?.limit ?? 5);
}
