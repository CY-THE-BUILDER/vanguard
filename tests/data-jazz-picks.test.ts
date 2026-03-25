import { describe, expect, it } from "vitest";
import { getCuratedPicksForVibe, jazzPicks } from "@/data/jazz-picks";
import { vibeOptions } from "@/types/jazz";

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

  it("never ship track links for album recommendations", () => {
    for (const pick of jazzPicks) {
      expect(pick.spotifyUrl.includes("open.spotify.com/track/")).toBe(false);
      expect(pick.shareUrl).toBe(pick.spotifyUrl);
    }
  });

  it("uses plain Spotify search queries for fallback urls so the search page stays resilient", () => {
    for (const pick of jazzPicks.filter((entry) => entry.spotifyUrl.includes("/search/"))) {
      expect(pick.spotifyUrl).not.toContain("album%3A");
      expect(pick.spotifyUrl).not.toContain("track%3A");
      expect(pick.spotifyUrl).not.toContain("artist%3A");
    }
  });

  it("keeps direct Spotify album links when the curated data already knows the album url", () => {
    const exactAlbumIds = [
      "kind-of-blue",
      "moanin",
      "time-out",
      "somethin-else",
      "saxophone-colossus",
      "night-dreamer",
      "speak-no-evil",
      "out-to-lunch",
      "head-hunters",
      "sextant",
      "bright-size-life",
      "undercurrent",
      "waltz-for-debby",
      "chet-baker-sings",
      "maiden-voyage",
      "journey-in-satchidananda",
      "idle-moments",
      "john-coltrane-and-johnny-hartman",
      "mysterious-traveller",
      "you-must-believe-in-spring",
      "black-focus"
    ];

    for (const id of exactAlbumIds) {
      const pick = jazzPicks.find((entry) => entry.id === id);
      expect(pick?.spotifyUrl.startsWith("https://open.spotify.com/album/")).toBe(true);
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
    const shelves = {
      Classic: classic,
      Exploratory: exploratory,
      Fusion: fusion,
      "Late Night": lateNight,
      Focus: focus
    };

    expect(classic).not.toEqual(exploratory);
    expect(exploratory).not.toEqual(fusion);
    expect(fusion).not.toEqual(lateNight);
    expect(lateNight).not.toEqual(focus);

    for (const [leftVibe, leftShelf] of Object.entries(shelves)) {
      for (const [rightVibe, rightShelf] of Object.entries(shelves)) {
        if (leftVibe >= rightVibe) {
          continue;
        }

        expect(countOverlap(leftShelf, rightShelf)).toBe(0);
      }
    }
  });

  it("normalizes every curated shelf to the requested primary flavor tag", () => {
    for (const vibe of vibeOptions) {
      const shelf = getCuratedPicksForVibe(vibe, { limit: 12 });
      expect(shelf.length).toBeGreaterThan(0);
      for (const pick of shelf) {
        expect(pick.vibeTags).toEqual([vibe]);
      }
    }
  });

  it("keeps a deeper curated pool behind every flavor so rotation has room to breathe", () => {
    for (const vibe of vibeOptions) {
      const pool = getCuratedPicksForVibe(vibe, { limit: 24 }).map((pick) => pick.id);
      expect(new Set(pool).size).toBeGreaterThanOrEqual(8);
    }
  });

  it("prefers unseen curated picks before falling back to the previous shelf", () => {
    const shelf = getCuratedPicksForVibe("Late Night", {
      excludeIds: new Set(["night-dreamer", "undercurrent", "waltz-for-debby", "chet-baker-sings", "kind-of-blue"]),
      limit: 3
    }).map((pick) => pick.id);

    expect(shelf[0]).not.toBe("night-dreamer");
    expect(shelf[0]).not.toBe("undercurrent");
  });

  it("can rotate every flavor shelf after excluding the first batch", () => {
    for (const vibe of vibeOptions) {
      const firstShelf = getCuratedPicksForVibe(vibe).map((pick) => pick.id);
      const rotatedShelf = getCuratedPicksForVibe(vibe, {
        excludeIds: new Set(firstShelf),
        limit: 5
      }).map((pick) => pick.id);

      expect(rotatedShelf).not.toEqual(firstShelf);
      expect(rotatedShelf[0]).not.toBe(firstShelf[0]);
      expect(rotatedShelf.some((id) => !firstShelf.includes(id))).toBe(true);
    }
  });

  it("uses rotation to surface a different starting shelf even before the exclusion list fills up", () => {
    for (const vibe of vibeOptions) {
      const defaultShelf = getCuratedPicksForVibe(vibe, { limit: 5 }).map((pick) => pick.id);
      const rotatedShelf = getCuratedPicksForVibe(vibe, {
        limit: 5,
        rotation: 1
      }).map((pick) => pick.id);

      expect(rotatedShelf).not.toEqual(defaultShelf);
      expect(rotatedShelf[0]).not.toBe(defaultShelf[0]);
    }
  });

  it("uses seeded variation to surface a different shelf on different visits", () => {
    for (const vibe of vibeOptions) {
      const firstVisit = getCuratedPicksForVibe(vibe, { limit: 5, seed: 1 }).map((pick) => pick.id);
      const secondVisit = getCuratedPicksForVibe(vibe, { limit: 5, seed: 2 }).map((pick) => pick.id);

      expect(secondVisit).not.toEqual(firstVisit);
      expect(countOverlap(firstVisit, secondVisit)).toBeLessThan(5);
    }
  });

  it("does not hand the same shelf back on consecutive seeded visits over 50 rounds", () => {
    for (const vibe of vibeOptions) {
      let previousSignature = "";

      for (let round = 0; round < 50; round += 1) {
        const shelf = getCuratedPicksForVibe(vibe, {
          limit: 5,
          seed: 100 + round,
          rotation: round
        }).map((pick) => pick.id);
        const signature = shelf.join("|");

        expect(signature).not.toBe(previousSignature);
        previousSignature = signature;
      }
    }
  });

  it("can build a full five-flavor pass without repeating albums across shelves", () => {
    const reservedIds = new Set<string>();
    const shelves = vibeOptions.map((vibe) => {
      const shelf = getCuratedPicksForVibe(vibe, {
        limit: 5,
        seed: 9,
        excludeIds: reservedIds
      }).map((pick) => pick.id);

      shelf.forEach((id) => {
        reservedIds.add(id);
      });

      return shelf;
    });

    const allIds = shelves.flat();
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it("respects a broader recent pool so the next visit avoids more than just the last shelf", () => {
    const shelf = getCuratedPicksForVibe("Classic", {
      excludeIds: new Set([
        "kind-of-blue",
        "blue-train",
        "somethin-else",
        "time-out",
        "sunday-at-the-village-vanguard",
        "moanin"
      ]),
      limit: 3,
      seed: 4
    }).map((pick) => pick.id);

    expect(shelf).not.toContain("kind-of-blue");
    expect(shelf).not.toContain("blue-train");
    expect(shelf[0]).toBeDefined();
  });

  it("never reuses hard-excluded saved albums when falling back to older shelves", () => {
    const savedIds = new Set([
      "kind-of-blue",
      "blue-train",
      "somethin-else",
      "moanin",
      "time-out"
    ]);
    const shelf = getCuratedPicksForVibe("Classic", {
      limit: 5,
      hardExcludeIds: savedIds,
      softExcludeIds: new Set([
        "sunday-at-the-village-vanguard",
        "saxophone-colossus",
        "mingus-ah-um",
        "the-sidewinder",
        "getz-gilberto"
      ])
    }).map((pick) => pick.id);

    expect(shelf).toHaveLength(5);
    expect(shelf.every((id) => !savedIds.has(id))).toBe(true);
  });
});
