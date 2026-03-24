import { getCuratedPicksForVibe } from "@/data/jazz-picks";
import { RecommendationFeed, Vibe, vibeOptions } from "@/types/jazz";

export function ensureUniqueFeeds(
  feeds: Partial<Record<Vibe, RecommendationFeed>>,
  options?: {
    seed?: number;
    savedIds?: Set<string>;
  }
) {
  const reservedIds = new Set<string>();
  const savedIds = options?.savedIds ?? new Set<string>();
  const seed = options?.seed ?? 0;
  const nextFeeds = {} as Partial<Record<Vibe, RecommendationFeed>>;

  for (const [index, vibe] of vibeOptions.entries()) {
    const feed = feeds[vibe];
    if (!feed) {
      continue;
    }

    const targetLength = Math.max(feed.picks.length, 1);
    const selected = feed.picks.filter((pick) => {
      if (reservedIds.has(pick.id)) {
        return false;
      }

      reservedIds.add(pick.id);
      return true;
    });

    if (selected.length < targetLength) {
      const fallback = getCuratedPicksForVibe(vibe, {
        limit: targetLength * 4,
        seed: seed + index,
        excludeIds: new Set([
          ...savedIds,
          ...reservedIds,
          ...selected.map((pick) => pick.id)
        ])
      });

      for (const pick of fallback) {
        if (selected.length >= targetLength) {
          break;
        }

        if (reservedIds.has(pick.id)) {
          continue;
        }

        selected.push(pick);
        reservedIds.add(pick.id);
      }
    }

    nextFeeds[vibe] = {
      ...feed,
      picks: selected
    };
  }

  return nextFeeds;
}
