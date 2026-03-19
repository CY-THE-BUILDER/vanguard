import { Vibe } from "@/types/jazz";

const HISTORY_KEY = "daily-jazz-history";

type RecommendationHistory = Partial<Record<Vibe, string[]>>;

function isBrowser() {
  return typeof window !== "undefined";
}

function readHistory(): RecommendationHistory {
  if (!isBrowser()) {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(HISTORY_KEY);
    if (!rawValue) {
      return {};
    }

    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return parsed as RecommendationHistory;
  } catch {
    return {};
  }
}

function writeHistory(history: RecommendationHistory) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function getRecentRecommendationIds(vibe: Vibe) {
  const history = readHistory();
  return history[vibe] ?? [];
}

export function rememberRecommendationIds(vibe: Vibe, ids: string[]) {
  const history = readHistory();
  writeHistory({
    ...history,
    [vibe]: Array.from(new Set(ids)).slice(0, 8)
  });
}
