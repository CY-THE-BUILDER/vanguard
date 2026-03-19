import { describe, expect, it } from "vitest";
import { getCuratedPicksForVibe, jazzPicks } from "@/data/jazz-picks";

describe("curated jazz picks", () => {
  function countOverlap(left: string[], right: string[]) {
    const rightSet = new Set(right);
    return left.filter((id) => rightSet.has(id)).length;
  }

  it("only ship album recommendations in the curated feed", () => {
    for (const pick of jazzPicks) {
      expect(pick.type).toBe("album");
      expect(pick.durationLabel.toLowerCase()).not.toBe("album");
    }
  });

  it("use spotify search urls instead of stale hardcoded ids", () => {
    for (const pick of jazzPicks) {
      expect(pick.spotifyUrl.startsWith("https://open.spotify.com/search/")).toBe(true);
      expect(pick.shareUrl).toBe(pick.spotifyUrl);
    }
  });

  it("ship fallback art only as a last resort in data and rely on API hydration for live covers", () => {
    for (const pick of jazzPicks) {
      expect(typeof pick.imageUrl).toBe("string");
      expect(pick.imageUrl.length).toBeGreaterThan(0);
      expect(pick.artworkSourceUrl?.startsWith("https://open.spotify.com/")).toBe(true);
    }
  });

  it("curated shelves are explicitly shaped per flavor instead of reusing the same slice", () => {
    const classic = getCuratedPicksForVibe("Classic").map((pick) => pick.id);
    const exploratory = getCuratedPicksForVibe("Exploratory").map((pick) => pick.id);
    const fusion = getCuratedPicksForVibe("Fusion").map((pick) => pick.id);
    const lateNight = getCuratedPicksForVibe("Late Night").map((pick) => pick.id);
    const focus = getCuratedPicksForVibe("Focus").map((pick) => pick.id);

    expect(classic).not.toEqual(exploratory);
    expect(exploratory).not.toEqual(fusion);
    expect(fusion).not.toEqual(lateNight);
    expect(lateNight).not.toEqual(focus);
    expect(countOverlap(exploratory, fusion)).toBeLessThanOrEqual(1);
    expect(countOverlap(fusion, lateNight)).toBeLessThanOrEqual(1);
    expect(countOverlap(exploratory, lateNight)).toBeLessThanOrEqual(1);
    expect(countOverlap(classic, lateNight)).toBeLessThanOrEqual(2);
    expect(countOverlap(lateNight, focus)).toBeLessThanOrEqual(2);
  });
});
