import { describe, expect, it } from "vitest";
import { getCuratedPicksForVibe } from "@/data/jazz-picks";
import { ensureUniqueFeeds } from "@/lib/recommendation-feeds";
import { buildCuratedFeed } from "@/lib/spotify-recommendations";
import { vibeOptions } from "@/types/jazz";

describe("recommendation feeds", () => {
  it("ensures the same 25-slot batch does not repeat an album across flavors", () => {
    const feeds = Object.fromEntries(
      vibeOptions.map((vibe) => [
        vibe,
        buildCuratedFeed(vibe, getCuratedPicksForVibe(vibe, { limit: 5, seed: 9 }))
      ])
    );

    const uniqueFeeds = ensureUniqueFeeds(feeds, { seed: 9 });
    const allIds = vibeOptions.flatMap((vibe) => uniqueFeeds[vibe]?.picks.map((pick) => pick.id) ?? []);

    expect(allIds).toHaveLength(25);
    expect(new Set(allIds).size).toBe(25);
  });

  it("backfills a duplicated shelf with other albums from the same flavor", () => {
    const classicShelf = getCuratedPicksForVibe("Classic", { limit: 5, seed: 2 });
    const duplicateHead = classicShelf[0];
    const feeds = {
      Classic: buildCuratedFeed("Classic", classicShelf),
      Exploratory: buildCuratedFeed("Exploratory", [duplicateHead, ...getCuratedPicksForVibe("Exploratory", { limit: 4, seed: 2 })]),
      Fusion: buildCuratedFeed("Fusion", getCuratedPicksForVibe("Fusion", { limit: 5, seed: 2 })),
      "Late Night": buildCuratedFeed("Late Night", getCuratedPicksForVibe("Late Night", { limit: 5, seed: 2 })),
      Focus: buildCuratedFeed("Focus", getCuratedPicksForVibe("Focus", { limit: 5, seed: 2 }))
    };

    const uniqueFeeds = ensureUniqueFeeds(feeds, { seed: 2 });
    const exploratoryIds = uniqueFeeds.Exploratory?.picks.map((pick) => pick.id) ?? [];

    expect(exploratoryIds).not.toContain(duplicateHead.id);
    expect(uniqueFeeds.Exploratory?.picks).toHaveLength(5);
  });
});
