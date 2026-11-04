export type Genre =
  | "sci-fi"
  | "fantasy"
  | "horror"
  | "drama"
  | "comedy"
  | "action"
  | "romance"
  | "mystery"
  | "documentary";

export type Mood =
  | "tense"
  | "joyful"
  | "mysterious"
  | "epic"
  | "sad"
  | "romantic"
  | "comedic";

export interface Scene {
  id: string;
  heading: string;
  narration: string;
  caption: string;
  visualPrompt: string;
  mood: Mood;
  /** Scene / AI clip length in seconds (4-10). */
  duration: number;
  /** Generated AI media for the scene (object URL in the browser). */
  mediaUrl?: string;
  /** "image" = AI still animated on the canvas, "video" = real AI video clip. */
  mediaKind?: "image" | "video";
  clipStatus?: "idle" | "generating" | "ready" | "error";
  clipError?: string;
  /** Which provider produced the media. */
  clipProvider?: string;
}

export interface MovieIdea {
  title: string;
  genre: Genre;
  mood: Mood;
  plotIdea: string;
}

export interface Movie {
  title: string;
  genre: Genre;
  logline: string;
  scenes: Scene[];
}

export interface MovieRequest {
  title: string;
  genre: Genre;
  plotIdea: string;
  mood: Mood;
  numScenes: number;
}

export const GENRE_LABELS: Record<Genre, string> = {
  "sci-fi": "מדע בדיוני",
  fantasy: "פנטזיה",
  horror: "אימה",
  drama: "דרמה",
  comedy: "קומדיה",
  action: "אקשן והרפתקאות",
  romance: "רומנטיקה",
  mystery: "מסתורין ומתח",
  documentary: "תיעודי",
};

export const MOOD_LABELS: Record<Mood, string> = {
  tense: "מתח",
  joyful: "שמחה",
  mysterious: "מסתורין",
  epic: "אפי",
  sad: "עצוב",
  romantic: "רומנטי",
  comedic: "קומי",
};

export const GENRES = Object.keys(GENRE_LABELS) as Genre[];
export const MOODS = Object.keys(MOOD_LABELS) as Mood[];

export const MIN_CLIP_SECONDS = 4;
export const MAX_CLIP_SECONDS = 10;
export const DEFAULT_CLIP_SECONDS = 7;

export function clampClipSeconds(n: unknown): number {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return DEFAULT_CLIP_SECONDS;
  return Math.min(MAX_CLIP_SECONDS, Math.max(MIN_CLIP_SECONDS, v));
}
