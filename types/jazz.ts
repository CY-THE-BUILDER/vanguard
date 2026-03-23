export const vibeOptions = [
  "Classic",
  "Exploratory",
  "Fusion",
  "Late Night",
  "Focus"
] as const;

export type Vibe = (typeof vibeOptions)[number];

export type JazzPick = {
  id: string;
  title: string;
  artist: string;
  type: "track" | "album";
  subgenre: string;
  vibeTags: Vibe[];
  recommendationReason: string;
  imageUrl: string;
  placeholderImageUrl?: string;
  spotifyUrl: string;
  shareUrl: string;
  artworkSourceUrl?: string;
  year: number;
  durationLabel: string;
  accentColor: string;
  source?: "curated" | "spotify";
  seedArtist?: string;
};

export type ToastMessage = {
  id: string;
  text: string;
};

export type SpotifySession = {
  configured: boolean;
  connected: boolean;
  displayName?: string;
  avatarUrl?: string | null;
  product?: string | null;
  profileUrl?: string | null;
  country?: string | null;
};

export type RecommendationFeed = {
  mode: "curated" | "personalized";
  headline: string;
  note: string;
  picks: JazzPick[];
};

export type RecommendationBatchRequest = {
  vibe: Vibe;
  excludeIds: string[];
  rotation: number;
  seed?: number;
  limit?: number;
};

export type RecommendationBatchResponse = {
  feeds: Partial<Record<Vibe, RecommendationFeed>>;
};
