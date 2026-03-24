import { describe, expect, it, vi } from "vitest";
import { buildPickSharePayload, copyShareText, sharePick } from "@/lib/share";
import { JazzPick } from "@/types/jazz";

const pick: JazzPick = {
  id: "kind-of-blue",
  title: "Kind of Blue",
  artist: "Miles Davis",
  type: "album",
  subgenre: "Modal Jazz",
  vibeTags: ["Classic", "Late Night", "Focus"],
  recommendationReason: "把房間的光線降下來，這張會用極少的音符把空氣拉得很深。",
  imageUrl: "https://example.com/kob.jpg",
  spotifyUrl: "https://open.spotify.com/album/example",
  shareUrl: "https://open.spotify.com/album/example",
  year: 1959,
  durationLabel: "45 min",
  accentColor: "#b08f57"
};

describe("share helpers", () => {
  it("builds a curator-style payload from a pick", () => {
    const payload = buildPickSharePayload(pick, "zh-Hant");

    expect(payload.title).toBe("Kind of Blue · Miles Davis");
    expect(payload.text).toContain("Kind of Blue");
    expect(payload.text).toContain("Miles Davis");
    expect(payload.url).toBe("https://open.spotify.com/album/example");
    expect(payload.text).not.toContain("Spotify");
    expect(payload.text).not.toContain("最近");
  });

  it("copies text and link together when native share is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText
      },
      share: undefined
    });

    const result = await copyShareText(buildPickSharePayload(pick, "zh-Hant"));

    expect(result.status).toBe("copied");
    expect(writeText).toHaveBeenCalledWith(
      "Kind of Blue · Miles Davis\n今天想把《Kind of Blue》留給你。Miles Davis，分寸很穩，也很耐聽，任何時候放下去都能把氣氛安定下來。\nhttps://open.spotify.com/album/example"
    );
  });

  it("uses native share for text plus link when available", async () => {
    const nativeShare = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      share: nativeShare
    });

    const result = await sharePick(buildPickSharePayload(pick, "zh-Hant"));

    expect(result.status).toBe("shared");
    expect(nativeShare).toHaveBeenCalledWith({
      title: "Kind of Blue · Miles Davis",
      text: "今天想把《Kind of Blue》留給你。Miles Davis，分寸很穩，也很耐聽，任何時候放下去都能把氣氛安定下來。",
      url: "https://open.spotify.com/album/example"
    });
  });

  it("builds an English payload with the same editorial warmth", () => {
    const payload = buildPickSharePayload(pick, "en");

    expect(payload.title).toBe("Kind of Blue · Miles Davis");
    expect(payload.text).toContain("Wanted to pass Kind of Blue your way.");
    expect(payload.text).toContain("Measured, enduring");
    expect(payload.text).not.toContain("最近");
  });
});
