import { getCuratedPicksForVibe } from "@/data/jazz-picks";
import { getRecentRecommendationIds } from "@/lib/recommendation-history";
import { RecommendationFeed, Vibe, vibeOptions } from "@/types/jazz";

export function ensureUniqueFeeds(
  feeds: Partial<Record<Vibe, RecommendationFeed>>,
  options?: {
    seed?: number;
    savedIds?: Set<string>;
    priorityVibe?: Vibe;
    recentIdsByVibe?: Partial<Record<Vibe, string[]>>;
  }
) {
  const reservedIds = new Set<string>();
  const savedIds = options?.savedIds ?? new Set<string>();
  const seed = options?.seed ?? 0;
  const nextFeeds = {} as Partial<Record<Vibe, RecommendationFeed>>;
  const vibesInOrder = vibeOptions
    .filter((vibe) => Boolean(feeds[vibe]))
    .sort((left, right) => {
      if (options?.priorityVibe === left) {
        return -1;
      }

      if (options?.priorityVibe === right) {
        return 1;
      }

      const leftFeed = feeds[left];
      const rightFeed = feeds[right];
      const leftOptions =
        (leftFeed?.picks.length ?? 0) + (leftFeed?.reservePicks?.length ?? 0);
      const rightOptions =
        (rightFeed?.picks.length ?? 0) + (rightFeed?.reservePicks?.length ?? 0);

      if (leftOptions !== rightOptions) {
        return leftOptions - rightOptions;
      }

      return vibeOptions.indexOf(left) - vibeOptions.indexOf(right);
    });

  for (const [index, vibe] of vibesInOrder.entries()) {
    const feed = feeds[vibe];
    if (!feed) {
      continue;
    }

    const targetLength = Math.max(feed.picks.length, 5);
    const selected = feed.picks.filter((pick) => {
      if (reservedIds.has(pick.id)) {
        return false;
      }

      reservedIds.add(pick.id);
      return true;
    });

    if (selected.length < targetLength) {
      const reservePicks = (feed.reservePicks ?? []).filter((pick) => !reservedIds.has(pick.id));

      for (const pick of reservePicks) {
        if (selected.length >= targetLength) {
          break;
        }

        if (reservedIds.has(pick.id)) {
          continue;
        }

        selected.push(pick);
        reservedIds.add(pick.id);
      }

      if (selected.length < targetLength) {
        const recentIds = options?.recentIdsByVibe?.[vibe] ?? getRecentRecommendationIds(vibe);
        const fallback = getCuratedPicksForVibe(vibe, {
          limit: targetLength * 4,
          seed: seed + index,
          avoidIds: recentIds,
          hardExcludeIds: new Set([
            ...savedIds,
            ...reservedIds,
            ...selected.map((pick) => pick.id)
          ]),
          softExcludeIds: new Set(recentIds)
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
    }

    const recentIds = (options?.recentIdsByVibe?.[vibe] ?? getRecentRecommendationIds(vibe)).slice(
      0,
      targetLength
    );
    const selectedSignature = selected.map((pick) => pick.id).join("|");
    const recentSignature = recentIds.join("|");

    if (recentIds.length >= targetLength && selectedSignature === recentSignature) {
      const alternatePicks = getCuratedPicksForVibe(vibe, {
        limit: targetLength * 4,
        seed: seed + index + 53,
        rotation: seed + index + 1,
        avoidIds: recentIds,
        hardExcludeIds: new Set([
          ...savedIds,
          ...reservedIds,
          ...selected.map((pick) => pick.id)
        ]),
        softExcludeIds: new Set(recentIds)
      });

      for (const alternate of alternatePicks) {
        if (selected.some((pick) => pick.id === alternate.id) || reservedIds.has(alternate.id)) {
          continue;
        }

        const replaced = selected[selected.length - 1];
        if (replaced) {
          reservedIds.delete(replaced.id);
          selected[selected.length - 1] = alternate;
          reservedIds.add(alternate.id);
        }
        break;
      }
    }

    nextFeeds[vibe] = {
      ...feed,
      picks: selected
    };
  }

  return nextFeeds;
}
