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
      vibeTags: ["Focus", "Classic"],
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
      vibeTags: ["Focus", "Classic"],
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
      vibeTags: ["Focus", "Classic"],
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
      vibeTags: ["Focus", "Late Night"],
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
      vibeTags: ["Focus", "Late Night", "Classic"],
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
      vibeTags: ["Focus", "Late Night"],
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
  ),
  withCover(
    {
      id: "milestones",
      title: "Milestones",
      artist: "Miles Davis",
      type: "album",
      subgenre: "Modal Jazz",
      vibeTags: ["Classic"],
      recommendationReason: "不需要太多鋪陳，整張一下去，秩序和張力就都在對的位置。",
      spotifyUrl: buildSpotifySearchUrl({ title: "Milestones", artist: "Miles Davis", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "Milestones", artist: "Miles Davis", type: "album" }),
      year: 1958,
      durationLabel: "38 min",
      accentColor: "#b59768",
      source: "curated"
    },
    { bg: "#17130f", glow: "#56422f", accent: "#caa36f", text: "#f4ebdf" }
  ),
  withCover(
    {
      id: "portrait-in-jazz",
      title: "Portrait in Jazz",
      artist: "Bill Evans Trio",
      type: "album",
      subgenre: "Piano Jazz",
      vibeTags: ["Classic"],
      recommendationReason: "鋼琴的步伐輕，重心卻穩，像一張永遠知道怎麼把房間收好的專輯。",
      spotifyUrl: buildSpotifySearchUrl({ title: "Portrait in Jazz", artist: "Bill Evans Trio", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "Portrait in Jazz", artist: "Bill Evans Trio", type: "album" }),
      year: 1960,
      durationLabel: "40 min",
      accentColor: "#9f9079",
      source: "curated"
    },
    { bg: "#161513", glow: "#474136", accent: "#b4a182", text: "#f2eee5" }
  ),
  withCover(
    {
      id: "brilliant-corners",
      title: "Brilliant Corners",
      artist: "Thelonious Monk",
      type: "album",
      subgenre: "Hard Bop",
      vibeTags: ["Classic"],
      recommendationReason: "棱角清楚，落點卻很準，那種只屬於經典名盤的分寸感全在裡面。",
      spotifyUrl: buildSpotifySearchUrl({ title: "Brilliant Corners", artist: "Thelonious Monk", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "Brilliant Corners", artist: "Thelonious Monk", type: "album" }),
      year: 1957,
      durationLabel: "42 min",
      accentColor: "#b17f61",
      source: "curated"
    },
    { bg: "#17110f", glow: "#4f3129", accent: "#cb8f6a", text: "#f5e8df" }
  ),
  withCover(
    {
      id: "soul-station",
      title: "Soul Station",
      artist: "Hank Mobley",
      type: "album",
      subgenre: "Hard Bop",
      vibeTags: ["Classic"],
      recommendationReason: "溫度、彈性、俐落感都對得剛剛好，是很容易讓一天穩下來的一張。",
      spotifyUrl: buildSpotifySearchUrl({ title: "Soul Station", artist: "Hank Mobley", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "Soul Station", artist: "Hank Mobley", type: "album" }),
      year: 1960,
      durationLabel: "37 min",
      accentColor: "#aa875b",
      source: "curated"
    },
    { bg: "#17120e", glow: "#4e3927", accent: "#c89b61", text: "#f4ebdf" }
  ),
  withCover(
    {
      id: "clifford-brown-and-max-roach",
      title: "Clifford Brown and Max Roach",
      artist: "Clifford Brown & Max Roach",
      type: "album",
      subgenre: "Hard Bop",
      vibeTags: ["Classic"],
      recommendationReason: "氣口明亮，推進俐落，放下去就知道老派硬派的漂亮在哪裡。",
      spotifyUrl: buildSpotifySearchUrl({ title: "Clifford Brown and Max Roach", artist: "Clifford Brown & Max Roach", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "Clifford Brown and Max Roach", artist: "Clifford Brown & Max Roach", type: "album" }),
      year: 1954,
      durationLabel: "39 min",
      accentColor: "#b87853",
      source: "curated"
    },
    { bg: "#18120e", glow: "#563126", accent: "#d48d60", text: "#f4e8de" }
  ),
  withCover(
    {
      id: "contours",
      title: "Contours",
      artist: "Sam Rivers",
      type: "album",
      subgenre: "Post-Bop",
      vibeTags: ["Exploratory"],
      recommendationReason: "它不把線條說滿，反而讓每一次偏移都留下更長的回味。",
      spotifyUrl: buildSpotifySearchUrl({ title: "Contours", artist: "Sam Rivers", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "Contours", artist: "Sam Rivers", type: "album" }),
      year: 1965,
      durationLabel: "40 min",
      accentColor: "#9aa07d",
      source: "curated"
    },
    { bg: "#141511", glow: "#404335", accent: "#b4ba8b", text: "#f2efe4" }
  ),
  withCover(
    {
      id: "the-real-mccoy",
      title: "The Real McCoy",
      artist: "McCoy Tyner",
      type: "album",
      subgenre: "Modal Jazz",
      vibeTags: ["Exploratory"],
      recommendationReason: "張力從不直接爆開，而是沿著鋼琴和鼓的縫一路向外延伸。",
      spotifyUrl: buildSpotifySearchUrl({ title: "The Real McCoy", artist: "McCoy Tyner", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "The Real McCoy", artist: "McCoy Tyner", type: "album" }),
      year: 1967,
      durationLabel: "40 min",
      accentColor: "#a08d6a",
      source: "curated"
    },
    { bg: "#15130f", glow: "#48392d", accent: "#bea275", text: "#f4ece1" }
  ),
  withCover(
    {
      id: "evolution",
      title: "Evolution",
      artist: "Grachan Moncur III",
      type: "album",
      subgenre: "Post-Bop",
      vibeTags: ["Exploratory"],
      recommendationReason: "不靠炫技，把空間拉開後，聲音自己會往更深的地方走。",
      spotifyUrl: buildSpotifySearchUrl({ title: "Evolution", artist: "Grachan Moncur III", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "Evolution", artist: "Grachan Moncur III", type: "album" }),
      year: 1963,
      durationLabel: "39 min",
      accentColor: "#8a9379",
      source: "curated"
    },
    { bg: "#141411", glow: "#384036", accent: "#a1b08d", text: "#f0efe7" }
  ),
  withCover(
    {
      id: "unit-structures",
      title: "Unit Structures",
      artist: "Cecil Taylor",
      type: "album",
      subgenre: "Post-Bop",
      vibeTags: ["Exploratory"],
      recommendationReason: "不是為了舒服，而是為了把耳朵往更遠的地方帶過去。",
      spotifyUrl: buildSpotifySearchUrl({ title: "Unit Structures", artist: "Cecil Taylor", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "Unit Structures", artist: "Cecil Taylor", type: "album" }),
      year: 1966,
      durationLabel: "41 min",
      accentColor: "#8f826f",
      source: "curated"
    },
    { bg: "#141210", glow: "#3c342e", accent: "#a99a83", text: "#f1ebe2" }
  ),
  withCover(
    {
      id: "inner-mounting-flame",
      title: "The Inner Mounting Flame",
      artist: "Mahavishnu Orchestra",
      type: "album",
      subgenre: "Fusion",
      vibeTags: ["Fusion"],
      recommendationReason: "速度和密度都往前衝，整張像帶電的骨架一路向外撐開。",
      spotifyUrl: buildSpotifySearchUrl({ title: "The Inner Mounting Flame", artist: "Mahavishnu Orchestra", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "The Inner Mounting Flame", artist: "Mahavishnu Orchestra", type: "album" }),
      year: 1971,
      durationLabel: "45 min",
      accentColor: "#83a4b7",
      source: "curated"
    },
    { bg: "#101518", glow: "#284a58", accent: "#9bc1d7", text: "#eef4f6" }
  ),
  withCover(
    {
      id: "spectrum",
      title: "Spectrum",
      artist: "Billy Cobham",
      type: "album",
      subgenre: "Fusion",
      vibeTags: ["Fusion"],
      recommendationReason: "鼓和電聲像齒輪一樣咬緊，往前的推力非常乾脆。",
      spotifyUrl: buildSpotifySearchUrl({ title: "Spectrum", artist: "Billy Cobham", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "Spectrum", artist: "Billy Cobham", type: "album" }),
      year: 1973,
      durationLabel: "40 min",
      accentColor: "#72a0af",
      source: "curated"
    },
    { bg: "#101619", glow: "#244750", accent: "#89bdcc", text: "#eef4f6" }
  ),
  withCover(
    {
      id: "mr-hands",
      title: "Mr. Hands",
      artist: "Herbie Hancock",
      type: "album",
      subgenre: "Fusion",
      vibeTags: ["Fusion"],
      recommendationReason: "律動更滑，電子質地更近，適合把身體和注意力一起往前推。",
      spotifyUrl: buildSpotifySearchUrl({ title: "Mr. Hands", artist: "Herbie Hancock", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "Mr. Hands", artist: "Herbie Hancock", type: "album" }),
      year: 1980,
      durationLabel: "39 min",
      accentColor: "#6f9cab",
      source: "curated"
    },
    { bg: "#111519", glow: "#26444f", accent: "#88b6c4", text: "#edf3f5" }
  ),
  withCover(
    {
      id: "secrets",
      title: "Secrets",
      artist: "Herbie Hancock",
      type: "album",
      subgenre: "Fusion",
      vibeTags: ["Fusion"],
      recommendationReason: "整張的電氣感不是鋪滿，而是一直貼著邊緣發光。",
      spotifyUrl: buildSpotifySearchUrl({ title: "Secrets", artist: "Herbie Hancock", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "Secrets", artist: "Herbie Hancock", type: "album" }),
      year: 1976,
      durationLabel: "43 min",
      accentColor: "#7d99b1",
      source: "curated"
    },
    { bg: "#11151a", glow: "#274150", accent: "#93b1cb", text: "#eef4f6" }
  ),
  withCover(
    {
      id: "hymn-of-the-seventh-galaxy",
      title: "Hymn of the Seventh Galaxy",
      artist: "Return to Forever",
      type: "album",
      subgenre: "Fusion",
      vibeTags: ["Fusion"],
      recommendationReason: "它不是只靠速度取勝，而是把每一個轉彎都推得非常有光澤。",
      spotifyUrl: buildSpotifySearchUrl({ title: "Hymn of the Seventh Galaxy", artist: "Return to Forever", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "Hymn of the Seventh Galaxy", artist: "Return to Forever", type: "album" }),
      year: 1973,
      durationLabel: "37 min",
      accentColor: "#8da5b8",
      source: "curated"
    },
    { bg: "#11161a", glow: "#294452", accent: "#a0bed3", text: "#eef4f7" }
  ),
  withCover(
    {
      id: "the-melody-at-night-with-you",
      title: "The Melody at Night, with You",
      artist: "Keith Jarrett",
      type: "album",
      subgenre: "Piano Jazz",
      vibeTags: ["Late Night"],
      recommendationReason: "幾乎沒有多餘動作，只留下觸鍵、空氣和夜裡很慢的光。",
      spotifyUrl: buildSpotifySearchUrl({ title: "The Melody at Night, with You", artist: "Keith Jarrett", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "The Melody at Night, with You", artist: "Keith Jarrett", type: "album" }),
      year: 1999,
      durationLabel: "55 min",
      accentColor: "#a3a08d",
      source: "curated"
    },
    { bg: "#141513", glow: "#403f38", accent: "#b8b39b", text: "#f2eee4" }
  ),
  withCover(
    {
      id: "know-what-i-mean",
      title: "Know What I Mean?",
      artist: "Bill Evans",
      type: "album",
      subgenre: "Piano Jazz",
      vibeTags: ["Late Night"],
      recommendationReason: "沒有刻意煽情，但情緒會沿著句尾慢慢留下來。",
      spotifyUrl: buildSpotifySearchUrl({ title: "Know What I Mean?", artist: "Bill Evans", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "Know What I Mean?", artist: "Bill Evans", type: "album" }),
      year: 1962,
      durationLabel: "41 min",
      accentColor: "#989382",
      source: "curated"
    },
    { bg: "#141411", glow: "#3c392f", accent: "#b0ab95", text: "#f1ede3" }
  ),
  withCover(
    {
      id: "we-get-requests",
      title: "We Get Requests",
      artist: "The Oscar Peterson Trio",
      type: "album",
      subgenre: "Piano Jazz",
      vibeTags: ["Late Night"],
      recommendationReason: "步伐很輕，收得很乾淨，適合夜深之後把呼吸放慢一點。",
      spotifyUrl: buildSpotifySearchUrl({ title: "We Get Requests", artist: "The Oscar Peterson Trio", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "We Get Requests", artist: "The Oscar Peterson Trio", type: "album" }),
      year: 1964,
      durationLabel: "35 min",
      accentColor: "#9d9885",
      source: "curated"
    },
    { bg: "#141412", glow: "#3e3a30", accent: "#b5af98", text: "#f2eee4" }
  ),
  withCover(
    {
      id: "round-about-midnight",
      title: "'Round About Midnight",
      artist: "Miles Davis",
      type: "album",
      subgenre: "Cool Jazz",
      vibeTags: ["Late Night"],
      recommendationReason: "夜色不是背景，而是整張專輯真正開始發亮的地方。",
      spotifyUrl: buildSpotifySearchUrl({ title: "'Round About Midnight", artist: "Miles Davis", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "'Round About Midnight", artist: "Miles Davis", type: "album" }),
      year: 1957,
      durationLabel: "40 min",
      accentColor: "#8f8c7c",
      source: "curated"
    },
    { bg: "#131311", glow: "#35342e", accent: "#a6a28f", text: "#f0ede4" }
  ),
  withCover(
    {
      id: "interplay",
      title: "Interplay",
      artist: "Bill Evans",
      type: "album",
      subgenre: "Piano Jazz",
      vibeTags: ["Focus"],
      recommendationReason: "節奏和留白都乾淨得很準，讓注意力可以穩穩停在眼前。",
      spotifyUrl: buildSpotifySearchUrl({ title: "Interplay", artist: "Bill Evans", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "Interplay", artist: "Bill Evans", type: "album" }),
      year: 1962,
      durationLabel: "42 min",
      accentColor: "#8aa298",
      source: "curated"
    },
    { bg: "#121615", glow: "#304640", accent: "#a2bcb0", text: "#eef3f0" }
  ),
  withCover(
    {
      id: "speak-like-a-child",
      title: "Speak Like a Child",
      artist: "Herbie Hancock",
      type: "album",
      subgenre: "Contemporary Jazz",
      vibeTags: ["Focus"],
      recommendationReason: "不急著推情緒，只把線條、色澤和節奏放在最剛好的位置。",
      spotifyUrl: buildSpotifySearchUrl({ title: "Speak Like a Child", artist: "Herbie Hancock", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "Speak Like a Child", artist: "Herbie Hancock", type: "album" }),
      year: 1968,
      durationLabel: "37 min",
      accentColor: "#8ca79f",
      source: "curated"
    },
    { bg: "#121615", glow: "#314740", accent: "#a4c0b4", text: "#eef3ef" }
  ),
  withCover(
    {
      id: "the-bridge",
      title: "The Bridge",
      artist: "Sonny Rollins",
      type: "album",
      subgenre: "Cool Jazz",
      vibeTags: ["Focus"],
      recommendationReason: "步伐穩、視野清，像一張很會替思緒留出空間的專輯。",
      spotifyUrl: buildSpotifySearchUrl({ title: "The Bridge", artist: "Sonny Rollins", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "The Bridge", artist: "Sonny Rollins", type: "album" }),
      year: 1962,
      durationLabel: "39 min",
      accentColor: "#7f9a99",
      source: "curated"
    },
    { bg: "#111617", glow: "#2a4141", accent: "#96b6b4", text: "#edf3f2" }
  ),
  withCover(
    {
      id: "empyrean-isles",
      title: "Empyrean Isles",
      artist: "Herbie Hancock",
      type: "album",
      subgenre: "Post-Bop",
      vibeTags: ["Focus"],
      recommendationReason: "重心很穩，細節卻一直在流動，特別適合長時間專注地放著。",
      spotifyUrl: buildSpotifySearchUrl({ title: "Empyrean Isles", artist: "Herbie Hancock", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "Empyrean Isles", artist: "Herbie Hancock", type: "album" }),
      year: 1964,
      durationLabel: "35 min",
      accentColor: "#7da0a1",
      source: "curated"
    },
    { bg: "#111617", glow: "#294245", accent: "#93b8ba", text: "#edf3f2" }
  ),
  withCover(
    {
      id: "quiet-kenny",
      title: "Quiet Kenny",
      artist: "Kenny Dorham",
      type: "album",
      subgenre: "Hard Bop",
      vibeTags: ["Late Night"],
      recommendationReason: "收得很近，卻不顯得薄，適合夜裡把情緒靜靜往內收。",
      spotifyUrl: buildSpotifySearchUrl({ title: "Quiet Kenny", artist: "Kenny Dorham", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "Quiet Kenny", artist: "Kenny Dorham", type: "album" }),
      year: 1959,
      durationLabel: "37 min",
      accentColor: "#9d9585",
      source: "curated"
    },
    { bg: "#141310", glow: "#3c3830", accent: "#b6ad9b", text: "#f2eee4" }
  ),
  withCover(
    {
      id: "night-train",
      title: "Night Train",
      artist: "Oscar Peterson Trio",
      type: "album",
      subgenre: "Piano Jazz",
      vibeTags: ["Late Night"],
      recommendationReason: "步伐輕快，質地卻很暖，夜再深一點反而更對味。",
      spotifyUrl: buildSpotifySearchUrl({ title: "Night Train", artist: "Oscar Peterson Trio", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "Night Train", artist: "Oscar Peterson Trio", type: "album" }),
      year: 1963,
      durationLabel: "39 min",
      accentColor: "#958f80",
      source: "curated"
    },
    { bg: "#141311", glow: "#38352f", accent: "#ada794", text: "#f0ece3" }
  ),
  withCover(
    {
      id: "concierto",
      title: "Concierto",
      artist: "Jim Hall",
      type: "album",
      subgenre: "Contemporary Jazz",
      vibeTags: ["Late Night"],
      recommendationReason: "乾淨、疏朗、帶一點夜色裡才會浮出的光澤。",
      spotifyUrl: buildSpotifySearchUrl({ title: "Concierto", artist: "Jim Hall", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "Concierto", artist: "Jim Hall", type: "album" }),
      year: 1975,
      durationLabel: "39 min",
      accentColor: "#9aa089",
      source: "curated"
    },
    { bg: "#141411", glow: "#3b4037", accent: "#afb49a", text: "#f1eee5" }
  ),
  withCover(
    {
      id: "page-one",
      title: "Page One",
      artist: "Joe Henderson",
      type: "album",
      subgenre: "Hard Bop",
      vibeTags: ["Focus"],
      recommendationReason: "線條清楚，推進穩，讓注意力有地方牢牢落下。",
      spotifyUrl: buildSpotifySearchUrl({ title: "Page One", artist: "Joe Henderson", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "Page One", artist: "Joe Henderson", type: "album" }),
      year: 1963,
      durationLabel: "40 min",
      accentColor: "#86a0a0",
      source: "curated"
    },
    { bg: "#111617", glow: "#2b4343", accent: "#9ab8b8", text: "#edf3f2" }
  ),
  withCover(
    {
      id: "takin-off",
      title: "Takin' Off",
      artist: "Herbie Hancock",
      type: "album",
      subgenre: "Hard Bop",
      vibeTags: ["Focus"],
      recommendationReason: "節奏乾淨俐落，沒有多餘手勢，很適合把心思重新校準。",
      spotifyUrl: buildSpotifySearchUrl({ title: "Takin' Off", artist: "Herbie Hancock", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "Takin' Off", artist: "Herbie Hancock", type: "album" }),
      year: 1962,
      durationLabel: "40 min",
      accentColor: "#8ba4a4",
      source: "curated"
    },
    { bg: "#111617", glow: "#2e4545", accent: "#a0bbbb", text: "#edf3f2" }
  ),
  withCover(
    {
      id: "hub-tones",
      title: "Hub-Tones",
      artist: "Freddie Hubbard",
      type: "album",
      subgenre: "Hard Bop",
      vibeTags: ["Focus"],
      recommendationReason: "輪廓鮮明但不躁進，剛好能把注意力穩穩往前推。",
      spotifyUrl: buildSpotifySearchUrl({ title: "Hub-Tones", artist: "Freddie Hubbard", type: "album" }),
      shareUrl: buildSpotifySearchUrl({ title: "Hub-Tones", artist: "Freddie Hubbard", type: "album" }),
      year: 1962,
      durationLabel: "39 min",
      accentColor: "#8b9fa3",
      source: "curated"
    },
    { bg: "#111617", glow: "#2c4345", accent: "#9db6bb", text: "#edf3f2" }
  )
];

const curatedPickIdsByVibe = {
  Classic: [
    "kind-of-blue",
    "blue-train",
    "somethin-else",
    "moanin",
    "time-out",
    "sunday-at-the-village-vanguard",
    "saxophone-colossus",
    "mingus-ah-um",
    "the-sidewinder",
    "getz-gilberto",
    "john-coltrane-and-johnny-hartman",
    "milestones",
    "portrait-in-jazz",
    "brilliant-corners",
    "soul-station",
    "clifford-brown-and-max-roach"
  ],
  Exploratory: [
    "out-to-lunch",
    "point-of-departure",
    "speak-no-evil",
    "journey-in-satchidananda",
    "night-dreamer",
    "the-epic",
    "the-black-saint-and-the-sinner-lady",
    "karma",
    "conference-of-the-birds",
    "crescent",
    "a-love-supreme",
    "emma-jean-thackray",
    "contours",
    "the-real-mccoy",
    "evolution",
    "unit-structures"
  ],
  Fusion: [
    "head-hunters",
    "sextant",
    "heavy-weather",
    "black-radio",
    "bitches-brew",
    "thrust",
    "mysterious-traveller",
    "electric-byrd",
    "light-as-a-feather",
    "romantic-warrior",
    "black-focus",
    "inner-mounting-flame",
    "spectrum",
    "mr-hands",
    "secrets",
    "hymn-of-the-seventh-galaxy"
  ],
  "Late Night": [
    "undercurrent",
    "chet-baker-sings",
    "idle-moments",
    "you-must-believe-in-spring",
    "waltz-for-debby",
    "ballads",
    "moon-beams",
    "night-lights",
    "beyond-the-missouri-sky",
    "alone-together",
    "the-melody-at-night-with-you",
    "know-what-i-mean",
    "we-get-requests",
    "round-about-midnight",
    "quiet-kenny",
    "night-train",
    "concierto"
  ],
  Focus: [
    "bright-size-life",
    "source",
    "maiden-voyage",
    "extensions",
    "the-awakening",
    "conference-of-the-birds",
    "john-coltrane-and-johnny-hartman",
    "emma-jean-thackray",
    "time-out",
    "interplay",
    "speak-like-a-child",
    "the-bridge",
    "empyrean-isles",
    "page-one",
    "takin-off",
    "hub-tones"
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
  options?: {
    limit?: number;
    excludeIds?: Set<string>;
    hardExcludeIds?: Set<string>;
    softExcludeIds?: Set<string>;
    rotation?: number;
    seed?: number;
    avoidIds?: string[];
  }
) {
  const pool = curatedPickIdsByVibe[vibe]
    .map((id) => jazzPicks.find((pick) => pick.id === id))
    .filter((pick): pick is JazzPick => Boolean(pick))
    .map((pick) => ({
      ...pick,
      vibeTags: [vibe]
    }));
  const hardExcludedIds = new Set<string>([
    ...(options?.excludeIds ?? []),
    ...(options?.hardExcludeIds ?? [])
  ]);
  const softExcludedIds = options?.softExcludeIds ?? new Set<string>();
  const seed = options?.seed ?? 0;
  const visitOffset = pool.length > 0 ? Math.abs(seed) % pool.length : 0;
  const fresh = rotatePicks(
    seededShuffle(
      pool.filter((pick) => !hardExcludedIds.has(pick.id) && !softExcludedIds.has(pick.id)),
      seed + hashSeed(vibe)
    ),
    (options?.rotation ?? 0) + visitOffset
  );
  const fallback = rotatePicks(
    seededShuffle(
      pool.filter((pick) => !hardExcludedIds.has(pick.id) && softExcludedIds.has(pick.id)),
      seed + hashSeed(`${vibe}-fallback`) + 97
    ),
    (options?.rotation ?? 0) + visitOffset
  );

  const limit = options?.limit ?? 5;
  const avoidSignature = (options?.avoidIds ?? []).slice(0, limit).join("|");
  const selectionOffset =
    fresh.length > 0
      ? Math.abs(hashSeed(`${vibe}-${seed}`)) % fresh.length
      : 0;
  const rotatedFresh = rotatePicks(fresh, selectionOffset);
  const combined = [...rotatedFresh, ...fallback];

  if (!avoidSignature) {
    return combined.slice(0, limit);
  }

  for (let offset = 0; offset < Math.max(rotatedFresh.length, 1); offset += 1) {
    const candidate = [...rotatePicks(rotatedFresh, offset), ...fallback].slice(0, limit);
    if (candidate.map((pick) => pick.id).join("|") !== avoidSignature) {
      return candidate;
    }
  }

  return combined.slice(0, limit);
}
