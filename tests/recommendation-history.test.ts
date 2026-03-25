import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCuratedPicksForVibe } from "@/data/jazz-picks";
import { ensureUniqueFeeds } from "@/lib/recommendation-feeds";
import {
  createRecommendationSessionSeed,
  getGlobalRecommendationIds,
  getRecommendationRotation,
  getRecentRecommendationIds,
  rememberRecommendationBatch,
  rememberRecommendationIds
} from "@/lib/recommendation-history";
import { buildCuratedFeed } from "@/lib/spotify-recommendations";
import { vibeOptions } from "@/types/jazz";

describe("recommendation history", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("keeps recent ids and increments rotation each time a shelf is remembered", () => {
    expect(getRecommendationRotation("Fusion")).toBe(0);

    rememberRecommendationIds("Fusion", ["head-hunters", "sextant"]);
    expect(getRecentRecommendationIds("Fusion")).toEqual(["head-hunters", "sextant"]);
    expect(getRecommendationRotation("Fusion")).toBe(1);
    expect(getGlobalRecommendationIds()).toEqual(["head-hunters", "sextant"]);

    rememberRecommendationIds("Fusion", ["heavy-weather", "black-focus"]);
    expect(getRecentRecommendationIds("Fusion")).toEqual([
      "heavy-weather",
      "black-focus",
      "head-hunters",
      "sextant"
    ]);
    expect(getRecommendationRotation("Fusion")).toBe(2);
    expect(getGlobalRecommendationIds()).toEqual([
      "heavy-weather",
      "black-focus",
      "head-hunters",
      "sextant"
    ]);
  });

  it("reads legacy array history without crashing", () => {
    window.localStorage.setItem(
      "daily-jazz-history",
      JSON.stringify({
        Focus: ["time-out", "source"]
      })
    );

    expect(getRecentRecommendationIds("Focus")).toEqual(["time-out", "source"]);
    expect(getRecommendationRotation("Focus")).toBe(0);
  });

  it("creates a new session seed every time the app starts", () => {
    vi.spyOn(Date, "now").mockReturnValue(1710000000000);
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.111)
      .mockReturnValueOnce(0.222)
      .mockReturnValueOnce(0.333);

    const first = createRecommendationSessionSeed();
    const second = createRecommendationSessionSeed();
    const third = createRecommendationSessionSeed();

    expect(first).not.toBe(second);
    expect(second).not.toBe(third);
    expect(first).toBeGreaterThan(1710000000000);
  });

  it("keeps all five shelves rotating across 50 visits without repeating the same batch back to back", () => {
    let previousBatchByVibe: Record<string, string> = {};

    for (let visit = 0; visit < 50; visit += 1) {
      const seed = createRecommendationSessionSeed();
      const reservedIds = new Set<string>(getGlobalRecommendationIds());
      const feeds = Object.fromEntries(
        vibeOptions.map((vibe) => {
          const excludeIds = new Set([...reservedIds, ...getRecentRecommendationIds(vibe)]);
          const picks = getCuratedPicksForVibe(vibe, {
            limit: 5,
            seed,
            rotation: getRecommendationRotation(vibe),
            excludeIds
          });

          picks.forEach((pick) => reservedIds.add(pick.id));
          return [vibe, buildCuratedFeed(vibe, picks)];
        })
      );

      const uniqueFeeds = ensureUniqueFeeds(feeds, { seed });
      const allIds = vibeOptions.flatMap((vibe) => uniqueFeeds[vibe]?.picks.map((pick) => pick.id) ?? []);
      expect(new Set(allIds).size).toBe(25);

      for (const vibe of vibeOptions) {
        const signature = (uniqueFeeds[vibe]?.picks ?? []).map((pick) => pick.id).join("|");
        expect(uniqueFeeds[vibe]?.picks).toHaveLength(5);

        if (previousBatchByVibe[vibe]) {
          expect(signature).not.toBe(previousBatchByVibe[vibe]);
        }

        previousBatchByVibe[vibe] = signature;
      }

      rememberRecommendationBatch(uniqueFeeds);
    }
  });

  it("keeps replenishing shelves across 50 saved visits without resurfacing saved albums", () => {
    const savedIds = new Set<string>();

    for (let visit = 0; visit < 50; visit += 1) {
      const seed = createRecommendationSessionSeed();
      const globalRecentIds = new Set<string>(getGlobalRecommendationIds());
      const batchReservedIds = new Set<string>();
      const feeds = Object.fromEntries(
        vibeOptions.map((vibe) => {
          const softExcludeIds = new Set([...globalRecentIds, ...getRecentRecommendationIds(vibe)]);
          const picks = getCuratedPicksForVibe(vibe, {
            limit: 5,
            seed,
            rotation: getRecommendationRotation(vibe),
            hardExcludeIds: new Set([...savedIds, ...batchReservedIds]),
            softExcludeIds,
            avoidIds: getRecentRecommendationIds(vibe)
          });

          picks.forEach((pick) => batchReservedIds.add(pick.id));
          return [vibe, buildCuratedFeed(vibe, picks)];
        })
      );

      const uniqueFeeds = ensureUniqueFeeds(feeds, { seed, savedIds });
      const allIds = vibeOptions.flatMap((vibe) => uniqueFeeds[vibe]?.picks.map((pick) => pick.id) ?? []);

      expect(allIds).toHaveLength(25);
      expect(new Set(allIds).size).toBe(25);
      expect(allIds.every((id) => !savedIds.has(id))).toBe(true);

      const savedVibe = vibeOptions[visit % vibeOptions.length];
      const savedPick = uniqueFeeds[savedVibe]?.picks[0];
      expect(savedPick).toBeDefined();

      if (savedPick) {
        savedIds.add(savedPick.id);
      }

      rememberRecommendationBatch(uniqueFeeds);
    }
  });
});
