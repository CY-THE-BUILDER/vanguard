import { Vibe } from "@/types/jazz";

const HISTORY_KEY = "daily-jazz-history";
const SESSION_SEED_KEY = "daily-jazz-session-seed";
const GLOBAL_HISTORY_KEY = "daily-jazz-global-history";

type RecommendationHistoryEntry = {
  ids: string[];
  rotation: number;
  recentPool?: string[];
};

type RecommendationHistory = Partial<Record<Vibe, RecommendationHistoryEntry | string[]>>;

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

function normalizeEntry(entry: RecommendationHistory[Vibe]): RecommendationHistoryEntry {
  if (Array.isArray(entry)) {
    return {
      ids: entry.filter((value): value is string => typeof value === "string").slice(0, 20),
      rotation: 0,
      recentPool: entry.filter((value): value is string => typeof value === "string").slice(0, 40)
    };
  }

  if (entry && typeof entry === "object") {
    return {
      ids: Array.isArray(entry.ids)
        ? entry.ids.filter((value): value is string => typeof value === "string").slice(0, 20)
        : [],
      rotation: typeof entry.rotation === "number" ? entry.rotation : 0,
      recentPool: Array.isArray(entry.recentPool)
        ? entry.recentPool.filter((value): value is string => typeof value === "string").slice(0, 40)
        : Array.isArray(entry.ids)
          ? entry.ids.filter((value): value is string => typeof value === "string").slice(0, 40)
          : []
    };
  }

  return {
    ids: [],
    rotation: 0,
    recentPool: []
  };
}

export function getRecentRecommendationIds(vibe: Vibe) {
  const history = readHistory();
  const entry = normalizeEntry(history[vibe]);
  return (entry.recentPool && entry.recentPool.length > 0 ? entry.recentPool : entry.ids).slice(0, 40);
}

export function getRecommendationRotation(vibe: Vibe) {
  const history = readHistory();
  return normalizeEntry(history[vibe]).rotation;
}

export function getGlobalRecommendationIds() {
  if (!isBrowser()) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(GLOBAL_HISTORY_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === "string").slice(0, 96);
  } catch {
    return [];
  }
}

export function rememberRecommendationIds(vibe: Vibe, ids: string[]) {
  const history = readHistory();
  const entry = normalizeEntry(history[vibe]);
  const globalRecentPool = getGlobalRecommendationIds();
  const mergedRecentPool = Array.from(new Set([...ids, ...(entry.recentPool ?? []), ...entry.ids])).slice(0, 40);
  const mergedGlobalPool = Array.from(new Set([...ids, ...globalRecentPool])).slice(0, 96);

  writeHistory({
    ...history,
    [vibe]: {
      ids: Array.from(new Set(ids)).slice(0, 20),
      rotation: entry.rotation + 1,
      recentPool: mergedRecentPool
    }
  });

  if (isBrowser()) {
    window.localStorage.setItem(GLOBAL_HISTORY_KEY, JSON.stringify(mergedGlobalPool));
  }
}

export function createRecommendationSessionSeed() {
  if (!isBrowser()) {
    return Date.now();
  }

  const previousValue = Number.parseInt(window.localStorage.getItem(SESSION_SEED_KEY) ?? "0", 10) || 0;
  const nextValue = Date.now() + previousValue + Math.floor(Math.random() * 1000);
  window.localStorage.setItem(SESSION_SEED_KEY, String(nextValue));
  return nextValue;
}
