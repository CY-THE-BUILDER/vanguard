import { describe, expect, it } from "vitest";
import {
  detectPreferredLocale,
  getUiCopy,
  isTraditionalChineseLocale,
  localizeCuratedReason
} from "@/lib/vanguard-i18n";
import { JazzPick } from "@/types/jazz";

const curatedPick = {
  id: "kind-of-blue",
  title: "Kind of Blue",
  artist: "Miles Davis",
  type: "album",
  subgenre: "Modal Jazz",
  vibeTags: ["Classic"],
  recommendationReason: "當你想把房間的光線降下來，這張會用極少的音符把空氣拉得很深。",
  imageUrl: "https://example.com/kob.jpg",
  spotifyUrl: "https://open.spotify.com/album/example",
  shareUrl: "https://open.spotify.com/album/example",
  year: 1959,
  durationLabel: "45 min",
  accentColor: "#b08f57",
  source: "curated"
} satisfies JazzPick;

describe("vanguard i18n", () => {
  it("treats Traditional Chinese locales as zh-Hant and everything else as English", () => {
    expect(isTraditionalChineseLocale("zh-Hant")).toBe(true);
    expect(isTraditionalChineseLocale("zh-TW")).toBe(true);
    expect(isTraditionalChineseLocale("en-US")).toBe(false);
    expect(detectPreferredLocale(["en-US", "ja-JP"])).toBe("en");
    expect(detectPreferredLocale(["en-US", "zh-TW"])).toBe("zh-Hant");
  });

  it("returns polished English curated copy for translated picks", () => {
    expect(localizeCuratedReason(curatedPick, "en")).toContain("deepens the air");
    expect(localizeCuratedReason(curatedPick, "zh-Hant")).toBe(curatedPick.recommendationReason);
  });

  it("ships English and Chinese UI dictionaries for the footer language toggle", () => {
    expect(getUiCopy("zh-Hant").languageLabel).toBe("語言");
    expect(getUiCopy("en").languageLabel).toBe("Language");
    expect(getUiCopy("en").shareSheetAction).toBe("Share this record");
  });
});
